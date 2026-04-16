"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  increment,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import type {
  Coupon,
  CouponFormData,
  CouponUsage,
  CouponValidationResult,
  Customer,
  CRMCustomer,
  CRMSegment,
  MarketingSettings,
} from "@/types/marketing";

// ─── HELPERS ────────────────────────────────────────────────

const EMPTY_FORM: CouponFormData = {
  code: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: 0,
  min_order_value: 0,
  usage_limit: 100,
  usage_limit_per_phone: 1,
  expires_at: "",
  valid_from: "",
  valid_hours_enabled: false,
  valid_hours_from: "16:00",
  valid_hours_to: "18:00",
  status: "ACTIVE",
  branches: [],
};

// Convierte CouponFormData a objeto para guardar en Firestore
function formDataToCoupon(
  formData: CouponFormData,
  existingId?: string,
): Omit<Coupon, "id"> {
  return {
    code: formData.code.toUpperCase().trim(),
    description: formData.description,
    discount_type: formData.discount_type,
    discount_value: Number(formData.discount_value),
    min_order_value: Number(formData.min_order_value),
    usage_limit: Number(formData.usage_limit),
    usage_limit_per_phone: Number(formData.usage_limit_per_phone),
    expires_at: formData.expires_at
      ? Timestamp.fromDate(new Date(formData.expires_at))
      : null,
    valid_from: formData.valid_from
      ? Timestamp.fromDate(new Date(formData.valid_from))
      : null,
    campaign_history: [],
    valid_hours: formData.valid_hours_enabled
      ? { from: formData.valid_hours_from, to: formData.valid_hours_to }
      : null,
    status: formData.status,
    branches: formData.branches,
    usage_by_branch: {},
    created_at: existingId ? (null as any) : Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Convierte Coupon de Firestore a CouponFormData para editar
function couponToFormData(coupon: Coupon): CouponFormData {
  return {
    code: coupon.code,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_value: coupon.min_order_value,
    usage_limit: coupon.usage_limit,
    usage_limit_per_phone: coupon.usage_limit_per_phone,
    expires_at: coupon.expires_at
      ? coupon.expires_at.toDate().toISOString().split("T")[0]
      : "",
    valid_from: coupon.valid_from
      ? coupon.valid_from.toDate().toISOString().split("T")[0]
      : "",
    valid_hours_enabled: coupon.valid_hours !== null,
    valid_hours_from: coupon.valid_hours?.from ?? "16:00",
    valid_hours_to: coupon.valid_hours?.to ?? "18:00",
    status: coupon.status,
    branches: coupon.branches,
  };
}

// Calcula días desde una fecha
function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Determina segmento CRM
function getSegment(daysSinceLastOrder: number): CRMSegment {
  if (daysSinceLastOrder < 15) return "active";
  if (daysSinceLastOrder <= 30) return "at_risk";
  return "inactive";
}

// ─── HOOK ────────────────────────────────────────────────────

export function useMarketing(
  authed: boolean,
  forcedBranchArg?: "norte" | "sur",
) {
  // ── Cupones ──
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponFormData>(EMPTY_FORM);

  // ── Relanzamiento de campaña ──
  const [relaunchingCoupon, setRelaunchingCoupon] = useState(false);
  const [showRelaunchForm, setShowRelaunchForm] = useState(false);
  const [relaunchTarget, setRelaunchTarget] = useState<Coupon | null>(null);
  const [relaunchForm, setRelaunchForm] = useState({
    valid_from: "",
    expires_at: "",
    usage_limit: 100,
  });

  // ── CRM ──
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [loadingCRM, setLoadingCRM] = useState(true);
  const [crmSegmentFilter, setCrmSegmentFilter] = useState<CRMSegment | "all">(
    "all",
  );

  // ── Settings ──
  const [marketingSettings, setMarketingSettings] = useState<MarketingSettings>(
    {
      enabled: true,
      store_name: "Pizza Antioquia",
    },
  );

  // ─── CARGAR CUPONES ────────────────────────────────────────

  const loadCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const q = query(collection(db, "coupons"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data: Coupon[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Coupon, "id">),
      }));
      const filtered = forcedBranchArg
        ? data.filter(
            (c) =>
              Array.isArray(c.branches) && c.branches.includes(forcedBranchArg),
          )
        : data;
      setCoupons(filtered);
    } catch (error) {
      console.error("Error loading coupons:", error);
      toast.error("Error al cargar cupones");
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    loadCoupons();
  }, [authed, forcedBranchArg]);

  // ─── CARGAR CRM ────────────────────────────────────────────

  const loadCRM = async () => {
    try {
      setLoadingCRM(true);
      const snap = await getDocs(collection(db, "customers"));
      const data: CRMCustomer[] = snap.docs
        .map((d) => {
          const customer = d.data() as Customer;
          const lastOrderDate =
            customer.last_order_date?.toDate() ?? new Date();
          const days = daysSince(lastOrderDate);
          return {
            ...customer,
            phone: d.id,
            days_since_last_order: days,
            avg_ticket:
              customer.total_orders > 0
                ? Math.round(customer.total_spent / customer.total_orders)
                : 0,
            segment: getSegment(days),
          };
        })
        .filter((c) => c.total_orders > 0) // solo clientes reales
        .filter((c) => {
          if (!forcedBranchArg) return true;
          const last = (c as any).last_order_branch as string | undefined;
          const used = (c as any).branches_used as string[] | undefined;
          if (last === forcedBranchArg) return true;
          if (Array.isArray(used) && used.includes(forcedBranchArg))
            return true;
          return false;
        })
        .sort((a, b) => a.days_since_last_order - b.days_since_last_order);
      setCustomers(data);
    } catch (error) {
      console.error("Error loading CRM:", error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoadingCRM(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    loadCRM();
  }, [authed, forcedBranchArg]);

  // ─── CRUD CUPONES ──────────────────────────────────────────

  const openCreateForm = () => {
    setEditingCoupon(null);
    setCouponForm(
      forcedBranchArg
        ? {
            ...EMPTY_FORM,
            branches: [forcedBranchArg],
          }
        : EMPTY_FORM,
    );
    setShowCouponForm(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const base = couponToFormData(coupon);
    setCouponForm(
      forcedBranchArg
        ? {
            ...base,
            branches: [forcedBranchArg],
          }
        : base,
    );
    setShowCouponForm(true);
  };

  const closeForm = () => {
    setShowCouponForm(false);
    setEditingCoupon(null);
    setCouponForm(EMPTY_FORM);
  };

  const saveCoupon = async () => {
    const couponFormToSave: CouponFormData = forcedBranchArg
      ? {
          ...couponForm,
          branches: [forcedBranchArg],
        }
      : couponForm;

    // Validaciones básicas
    if (!couponFormToSave.code.trim()) {
      toast.error("El código del cupón es obligatorio");
      return;
    }
    if (couponFormToSave.discount_value <= 0) {
      toast.error("El valor del descuento debe ser mayor a 0");
      return;
    }
    if (couponFormToSave.branches.length === 0) {
      toast.error("Selecciona al menos una sucursal");
      return;
    }
    if (
      couponFormToSave.discount_type === "PERCENTAGE" &&
      couponFormToSave.discount_value > 100
    ) {
      toast.error("El porcentaje no puede ser mayor a 100");
      return;
    }

    // Verificar código único (solo al crear)
    if (!editingCoupon) {
      const codeExists = coupons.some(
        (c) => c.code === couponFormToSave.code.toUpperCase().trim(),
      );
      if (codeExists) {
        toast.error(
          `El código ${couponFormToSave.code.toUpperCase()} ya existe`,
        );
        return;
      }
    }

    setSavingCoupon(true);
    try {
      if (editingCoupon) {
        // Actualizar
        const couponRef = doc(db, "coupons", editingCoupon.id);
        const updates = formDataToCoupon(couponFormToSave, editingCoupon.id);
        // Preservar created_at y usage_by_branch existentes
        const { created_at, usage_by_branch, ...updatableFields } = updates;
        await updateDoc(couponRef, {
          ...updatableFields,
          updated_at: Timestamp.now(),
        });
        toast.success("Cupón actualizado");
      } else {
        // Crear
        const couponId = `coupon_${Date.now()}`;
        const couponRef = doc(db, "coupons", couponId);
        await setDoc(couponRef, formDataToCoupon(couponFormToSave));
        toast.success(`Cupón ${couponFormToSave.code.toUpperCase()} creado`);
      }
      await loadCoupons();
      closeForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Error al guardar cupón");
    } finally {
      setSavingCoupon(false);
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (
      !confirm(
        `¿Eliminar el cupón ${coupon.code}? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "coupons", coupon.id));
      toast.success(`Cupón ${coupon.code} eliminado`);
      await loadCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Error al eliminar cupón");
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    const newStatus = coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateDoc(doc(db, "coupons", coupon.id), {
        status: newStatus,
        updated_at: Timestamp.now(),
      });
      toast.success(
        `Cupón ${coupon.code} ${newStatus === "ACTIVE" ? "activado" : "desactivado"}`,
      );
      await loadCoupons();
    } catch (error) {
      console.error("Error toggling coupon:", error);
      toast.error("Error al cambiar estado del cupón");
    }
  };

  // ─── VALIDACIÓN DE CUPÓN (usado desde OrderModal) ──────────

  const validateCoupon = async (
    code: string,
    branch: string,
    phone: string,
    subtotal: number,
    deliveryFee: number,
  ): Promise<CouponValidationResult> => {
    try {
      // Buscar cupón por código
      const coupon = coupons.find((c) => c.code === code.toUpperCase().trim());

      if (!coupon) return { valid: false, error: "NOT_FOUND" };
      if (coupon.status !== "ACTIVE")
        return { valid: false, error: "INACTIVE" };

      // Verificar vencimiento
      if (coupon.expires_at) {
        const expDate = coupon.expires_at.toDate();
        if (expDate < new Date()) return { valid: false, error: "EXPIRED" };
      }

      // Verificar límite global
      const totalUsed = Object.values(coupon.usage_by_branch).reduce(
        (sum, b) => sum + b.used_count,
        0,
      );
      if (totalUsed >= coupon.usage_limit) {
        return { valid: false, error: "USAGE_LIMIT_REACHED" };
      }

      // Verificar límite por teléfono en esta sucursal
      const usageDocId = `${coupon.id}_${branch}_${phone}`;
      const usageSnap = await getDocs(query(collection(db, "coupon_usage")));
      const phoneUsageCount = usageSnap.docs.filter(
        (d) => d.id === usageDocId,
      ).length;
      if (phoneUsageCount >= coupon.usage_limit_per_phone) {
        return { valid: false, error: "PHONE_LIMIT_REACHED" };
      }

      // Verificar sucursal
      if (!coupon.branches.includes(branch)) {
        return { valid: false, error: "BRANCH_NOT_ALLOWED" };
      }

      // Verificar monto mínimo
      if (subtotal < coupon.min_order_value) {
        return { valid: false, error: "MIN_ORDER_NOT_MET" };
      }

      // Verificar horario válido
      if (coupon.valid_hours) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [fromH, fromM] = coupon.valid_hours.from.split(":").map(Number);
        const [toH, toM] = coupon.valid_hours.to.split(":").map(Number);
        const fromMinutes = fromH * 60 + fromM;
        const toMinutes = toH * 60 + toM;
        if (currentMinutes < fromMinutes || currentMinutes > toMinutes) {
          return { valid: false, error: "OUTSIDE_VALID_HOURS" };
        }
      }

      // Calcular descuento
      let discount_amount = 0;
      if (coupon.discount_type === "PERCENTAGE") {
        discount_amount = Math.round((subtotal * coupon.discount_value) / 100);
      } else if (coupon.discount_type === "FIXED_AMOUNT") {
        discount_amount = coupon.discount_value;
      } else if (coupon.discount_type === "FREE_DELIVERY") {
        discount_amount = deliveryFee;
      }

      // El total nunca puede ser menor a 0
      const total = subtotal + deliveryFee;
      const final_total = Math.max(0, total - discount_amount);

      return {
        valid: true,
        discount_amount,
        final_total,
        coupon,
      };
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { valid: false, error: "NOT_FOUND" };
    }
  };

  const openRelaunchForm = (coupon: Coupon) => {
    setRelaunchTarget(coupon);
    setRelaunchForm({
      valid_from: new Date().toISOString().split("T")[0],
      expires_at: "",
      usage_limit: coupon.usage_limit,
    });
    setShowRelaunchForm(true);
  };

  const closeRelaunchForm = () => {
    setShowRelaunchForm(false);
    setRelaunchTarget(null);
    setRelaunchForm({ valid_from: "", expires_at: "", usage_limit: 100 });
  };

  const relaunchCoupon = async () => {
    if (!relaunchTarget) return;
    if (!relaunchForm.valid_from || !relaunchForm.expires_at) {
      toast.error("Define las fechas de inicio y fin de la nueva campaña");
      return;
    }
    if (relaunchForm.usage_limit <= 0) {
      toast.error("El límite de usos debe ser mayor a 0");
      return;
    }

    const newValidFrom = Timestamp.fromDate(
      new Date(relaunchForm.valid_from + "T00:00:00"),
    );
    const newExpiresAt = Timestamp.fromDate(
      new Date(relaunchForm.expires_at + "T23:59:59"),
    );

    // Armar entrada del historial con la campaña actual
    const campaignEntry = {
      campaign_id: relaunchTarget.valid_from
        ? relaunchTarget.valid_from.toDate().getTime().toString()
        : "no_campaign",
      valid_from: relaunchTarget.valid_from ?? Timestamp.now(),
      expires_at: relaunchTarget.expires_at ?? Timestamp.now(),
      usage_by_branch: relaunchTarget.usage_by_branch ?? {},
      closed_at: Timestamp.now(),
    };

    // Resetear usage_by_branch para la nueva campaña
    const freshBranchUsage: Record<string, any> = {};
    Object.keys(relaunchTarget.usage_by_branch ?? {}).forEach((branch) => {
      freshBranchUsage[branch] = {
        used_count: 0,
        total_revenue: 0,
        discount_given: 0,
      };
    });

    setRelaunchingCoupon(true);
    try {
      const couponRef = doc(db, "coupons", relaunchTarget.id);
      await updateDoc(couponRef, {
        valid_from: newValidFrom,
        expires_at: newExpiresAt,
        usage_limit: relaunchForm.usage_limit,
        status: "ACTIVE",
        usage_by_branch: freshBranchUsage,
        campaign_history: arrayUnion(campaignEntry),
        updated_at: Timestamp.now(),
      });
      toast.success(`Campaña de ${relaunchTarget.code} relanzada exitosamente`);
      await loadCoupons();
      closeRelaunchForm();
    } catch (error) {
      console.error("Error relaunching coupon:", error);
      toast.error("Error al relanzar campaña");
    } finally {
      setRelaunchingCoupon(false);
    }
  };

  // ─── FILTRO CRM ────────────────────────────────────────────

  const filteredCustomers =
    crmSegmentFilter === "all"
      ? customers
      : customers.filter((c) => c.segment === crmSegmentFilter);

  useEffect(() => {
    if (!forcedBranchArg) return;
    if (!showCouponForm) return;
    if (
      couponForm.branches.length === 1 &&
      couponForm.branches[0] === forcedBranchArg
    )
      return;
    setCouponForm((prev) => ({ ...prev, branches: [forcedBranchArg] }));
  }, [forcedBranchArg, showCouponForm, couponForm.branches]);

  // ─── WHATSAPP URL GENERATOR ────────────────────────────────

  const generateWhatsAppUrl = (
    customer: CRMCustomer,
    topCouponCode?: string,
  ): string => {
    const days = customer.days_since_last_order;
    const couponText = topCouponCode
      ? ` Vuelve hoy y usa el cupón *${topCouponCode}* para un descuento especial.`
      : "";
    const message = `Hola ${customer.name}, hace ${days} días que no disfrutamos de tu compañía en ${marketingSettings.store_name}. ¡Te extrañamos!${couponText}`;
    return `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
  };

  // Obtener el cupón más usado (para sugerir en WhatsApp)
  const topCoupon = coupons
    .filter((c) => c.status === "ACTIVE")
    .sort((a, b) => {
      const totalA = Object.values(a.usage_by_branch).reduce(
        (s, b) => s + b.total_revenue,
        0,
      );
      const totalB = Object.values(b.usage_by_branch).reduce(
        (s, b) => s + b.total_revenue,
        0,
      );
      return totalB - totalA;
    })[0];

  return {
    // Cupones
    coupons,
    loadingCoupons,
    savingCoupon,
    editingCoupon,
    showCouponForm,
    couponForm,
    setCouponForm,
    openCreateForm,
    openEditForm,
    closeForm,
    saveCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    loadCoupons,

    // CRM
    customers,
    filteredCustomers,
    loadingCRM,
    crmSegmentFilter,
    setCrmSegmentFilter,
    generateWhatsAppUrl,
    topCoupon,
    loadCRM,

    // Relanzamiento de campaña
    relaunchingCoupon,
    showRelaunchForm,
    relaunchTarget,
    relaunchForm,
    setRelaunchForm,
    openRelaunchForm,
    closeRelaunchForm,
    relaunchCoupon,
  };
}
