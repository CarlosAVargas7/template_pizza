"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";
import { useSchedules } from "@/hooks/useSchedules";
import { useAfterHoursSettings } from "@/hooks/useAfterHoursSettings";
import {
  BranchMenu,
  Product,
  calculateProductPrice,
  validateProductOptions,
  formatCOP,
} from "@/lib/menuData";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  arrayUnion,
  increment,
  Timestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  generateDailyOrderId,
  incrementDailyOrderCount,
} from "@/app/admin/_lib/firebase-helpers";
import type { CouponValidationResult } from "@/types/marketing";
import BranchStep from "./order-modal/steps/BranchStep";
import MenuStep from "./order-modal/steps/MenuStep";
import CartStep from "./order-modal/steps/CartStep";
import DeliveryStep from "./order-modal/steps/DeliveryStep";
import ConfirmationStep from "./order-modal/steps/ConfirmationStep";

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  payment: "wompi" | "cash";
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  totalPrice: number;
}

export default function OrderModal() {
  const {
    orderModalOpen,
    setOrderModalOpen,
    selectedBranch,
    setSelectedBranch,
    cookiesAccepted,
  } = useStore();
  const { tx, language } = useLanguage();

  const [step, setStep] = useState(0);
  const [branchMenu, setBranchMenu] = useState<BranchMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    payment: "wompi",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [dailyOrderId, setDailyOrderId] = useState<string | null>(null);

  // Email separado para el campo opcional
  const [email, setEmail] = useState<string>("");

  // Cupón
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponValidation, setCouponValidation] =
    useState<CouponValidationResult | null>(null);
  const [couponValidating, setCouponValidating] = useState<boolean>(false);

  // After-hours
  const [isStoreCurrentlyOpen, setIsStoreCurrentlyOpen] = useState(true);
  const [afterHoursMode, setAfterHoursMode] = useState<"pre-orders" | "blocked" | null>(null);
  const [nextOpeningTime, setNextOpeningTime] = useState<string>("");
  const [isPreOrder, setIsPreOrder] = useState(false);

  const scheduleData = useSchedules(selectedBranch || "norte");
  const afterHoursData = useAfterHoursSettings(selectedBranch || "norte");

  // Cargar menú
  useEffect(() => {
    if (!orderModalOpen || step < 1 || !selectedBranch) return;
    setLoadingMenu(true);
    const loadMenu = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 5000);
        });
        const snapPromise = getDoc(doc(db, "menus", selectedBranch));
        const snap = (await Promise.race([
          snapPromise,
          timeoutPromise,
        ])) as any;
        if (snap.exists()) {
          const menuData = snap.data() as BranchMenu;
          if (
            menuData?.categories &&
            Array.isArray(menuData.categories) &&
            menuData.categories.length > 0
          ) {
            const validCategories = menuData.categories.filter(
              (cat) =>
                cat?.products &&
                Array.isArray(cat.products) &&
                cat.products.length > 0
            );
            if (validCategories.length > 0) {
              setBranchMenu(menuData);
              return;
            }
          }
        }
        const { defaultDynamicMenuNorte, defaultDynamicMenuSur } =
          await import("@/lib/menuData");
        setBranchMenu(
          selectedBranch === "norte"
            ? defaultDynamicMenuNorte
            : defaultDynamicMenuSur
        );
      } catch {
        const { defaultDynamicMenuNorte, defaultDynamicMenuSur } =
          await import("@/lib/menuData");
        setBranchMenu(
          selectedBranch === "norte"
            ? defaultDynamicMenuNorte
            : defaultDynamicMenuSur
        );
      } finally {
        setLoadingMenu(false);
      }
    };
    loadMenu();
  }, [orderModalOpen, step, selectedBranch]);

  // Autocomplete localStorage
  useEffect(() => {
    if (cookiesAccepted) {
      const savedPhone = localStorage.getItem("pa_phone") || "";
      const savedAddress = localStorage.getItem("pa_address") || "";
      const savedName = localStorage.getItem("pa_name") || "";
      setForm((f) => ({
        ...f,
        phone: savedPhone,
        address: savedAddress,
        name: savedName,
      }));
    }
  }, [cookiesAccepted, orderModalOpen]);

  // Horarios
  useEffect(() => {
    if (!selectedBranch) return;
    if (scheduleData.loading || afterHoursData.loading) return;
    const scheduleKeys = Object.keys(scheduleData.schedules);
    if (scheduleKeys.length > 0) {
      const allMatch = scheduleKeys.every((key) =>
        key.startsWith(selectedBranch + "_")
      );
      if (!allMatch) return;
    }
    const storeOpen = scheduleData.isStoreOpen();
    const mode = afterHoursData.settings.mode;
    const nextTime = scheduleData.getNextOpeningTime();
    const effectiveMode = storeOpen ? null : mode;
    setIsStoreCurrentlyOpen(storeOpen);
    setAfterHoursMode(effectiveMode);
    setNextOpeningTime(nextTime);
    setIsPreOrder(!storeOpen && mode === "pre-orders");
  }, [
    selectedBranch,
    scheduleData.loading,
    afterHoursData.loading,
    scheduleData.schedules,
  ]);

  const handleClose = () => {
    setOrderModalOpen(false);
    setStep(0);
    setSelectedBranch(null);
    setCart([]);
    setOrderId(null);
    setDailyOrderId(null);
    setForm({ name: "", phone: "", email: "", address: "", payment: "wompi" });
    setEmail("");
    setCouponCode("");
    setCouponValidation(null);
    setCouponValidating(false);
  };

  const addToCart = (
    product: Product,
    selectedOptions: Record<string, string[]>,
    quantity: number = 1
  ) => {
    const validation = validateProductOptions(product, selectedOptions);
    if (!validation.valid) {
      toast.error(validation.errors.join(", "));
      return;
    }
    const totalPrice = calculateProductPrice(product, selectedOptions);
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity, selectedOptions, totalPrice }]);
    }
  };

  const updateCartQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) newCart.splice(index, 1);
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calcTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    );
    const deliveryFee = branchMenu?.deliveryFee || 0;
    return subtotal + deliveryFee;
  };

  // ─── VALIDACIÓN DE CUPÓN ──────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedBranch || !form.phone) return;
    setCouponValidating(true);
    try {
      const snap = await getDocs(collection(db, "coupons"));
      const coupon = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .find((c) => c.code === couponCode.toUpperCase().trim());

      if (!coupon) {
        setCouponValidation({ valid: false, error: "NOT_FOUND" });
        return;
      }
      if (coupon.status !== "ACTIVE") {
        setCouponValidation({ valid: false, error: "INACTIVE" });
        return;
      }
      if (coupon.expires_at) {
        const expDate = coupon.expires_at.toDate();
        if (expDate < new Date()) {
          setCouponValidation({ valid: false, error: "EXPIRED" });
          return;
        }
      }
      const totalUsed = Object.values(
        coupon.usage_by_branch as Record<string, any>
      ).reduce((sum: number, b: any) => sum + (b.used_count || 0), 0);
      if (totalUsed >= coupon.usage_limit) {
        setCouponValidation({ valid: false, error: "USAGE_LIMIT_REACHED" });
        return;
      }

      // Verificar que la campaña ya comenzó
      if (coupon.valid_from) {
        const startDate = coupon.valid_from.toDate()
        if (startDate > new Date()) {
          setCouponValidation({ valid: false, error: "CAMPAIGN_NOT_STARTED" })
          return
        }
      }

      const campaignId = coupon.valid_from
        ? coupon.valid_from.toDate().getTime().toString()
        : "no_campaign"
      const usageRef = doc(db, "coupon_usage", `${coupon.id}_${selectedBranch}_${form.phone}_${campaignId}`)
      const usageSnap = await getDoc(usageRef)
      if (usageSnap.exists()) {
        setCouponValidation({ valid: false, error: "PHONE_LIMIT_REACHED" })
        return
      }
      if (!coupon.branches.includes(selectedBranch)) {
        setCouponValidation({ valid: false, error: "BRANCH_NOT_ALLOWED" });
        return;
      }
      const subtotal = cart.reduce(
        (sum, item) => sum + item.totalPrice * item.quantity,
        0
      );
      if (subtotal < coupon.min_order_value) {
        setCouponValidation({ valid: false, error: "MIN_ORDER_NOT_MET", coupon });
        return;
      }
      if (coupon.valid_hours) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [fromH, fromM] = coupon.valid_hours.from.split(":").map(Number);
        const [toH, toM] = coupon.valid_hours.to.split(":").map(Number);
        if (
          currentMinutes < fromH * 60 + fromM ||
          currentMinutes > toH * 60 + toM
        ) {
          setCouponValidation({ valid: false, error: "OUTSIDE_VALID_HOURS" });
          return;
        }
      }
      const deliveryFee = branchMenu?.deliveryFee || 0;
      let discount_amount = 0;
      if (coupon.discount_type === "PERCENTAGE") {
        discount_amount = Math.round(
          (subtotal * coupon.discount_value) / 100
        );
      } else if (coupon.discount_type === "FIXED_AMOUNT") {
        discount_amount = coupon.discount_value;
      } else if (coupon.discount_type === "FREE_DELIVERY") {
        discount_amount = deliveryFee;
      }
      const final_total = Math.max(
        0,
        subtotal + deliveryFee - discount_amount
      );
      setCouponValidation({ valid: true, discount_amount, final_total, coupon });
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponValidation({ valid: false, error: "NOT_FOUND" });
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponValidation(null);
  };

  // ─── SUBMIT ORDER ─────────────────────────────────────────
  const handleSubmitOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error(
        language === "es"
          ? "Por favor completa todos los campos"
          : "Please complete all fields"
      );
      return;
    }
    if (cart.length === 0) {
      toast.error(
        language === "es" ? "El carrito está vacío" : "Cart is empty"
      );
      return;
    }
    const minOrderAmount = branchMenu?.minOrderAmount || 0;
    if (calcTotal() < minOrderAmount) {
      toast.error(
        language === "es"
          ? `El pedido mínimo es ${formatCOP(minOrderAmount)}`
          : `Minimum order is ${formatCOP(minOrderAmount)}`
      );
      return;
    }

    setSubmitting(true);
    try {
      if (cookiesAccepted) {
        localStorage.setItem("pa_name", form.name);
        localStorage.setItem("pa_phone", form.phone);
        localStorage.setItem("pa_address", form.address);
      }

      if (!selectedBranch) throw new Error("No branch selected");

      const dailyCount = await incrementDailyOrderCount(selectedBranch);
      const newDailyOrderId = generateDailyOrderId(dailyCount);

      // Calcular totales con cupón
      const subtotal = cart.reduce(
        (sum, item) => sum + item.totalPrice * item.quantity,
        0
      );
      const originalDeliveryFee = branchMenu?.deliveryFee || 0;
      const deliveryFee =
        couponValidation?.valid &&
          couponValidation.coupon?.discount_type === "FREE_DELIVERY"
          ? 0
          : originalDeliveryFee;
      const discountAmount = couponValidation?.valid
        ? couponValidation.discount_amount || 0
        : 0;
      const finalTotal = couponValidation?.valid
        ? couponValidation.final_total || subtotal + deliveryFee
        : subtotal + deliveryFee;

      const orderRef = doc(collection(db, "orders"));
      const customerRef = doc(db, "customers", form.phone);

      const orderData: Record<string, any> = {
        dailyOrderId: newDailyOrderId,
        branch: selectedBranch,
        customerName: form.name,
        phone: form.phone,
        ...(email ? { email } : {}),
        address: form.address,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          unitPrice: item.totalPrice,
          totalPrice: item.totalPrice * item.quantity,
        })),
        subtotal,
        deliveryFee,
        discount_applied: discountAmount,
        original_total: subtotal + originalDeliveryFee,
        total: finalTotal,
        ...(couponValidation?.valid && {
          coupon_code: couponValidation.coupon?.code,
        }),
        paymentMethod: form.payment,
        status: isPreOrder ? "pre-orden" : "pendiente",
        createdAt: new Date(),
        estimatedTime: branchMenu?.estimatedTime || "30-45 min",
        ...(isPreOrder && {
          isPreOrder: true,
          scheduledFor: nextOpeningTime,
        }),
      };

      // writeBatch: orden + customer atómicos
      const batch = writeBatch(db);
      batch.set(orderRef, orderData);
      batch.set(
        customerRef,
        {
          phone: form.phone,
          name: form.name,
          ...(email ? { email } : {}),
          total_orders: increment(1),
          total_spent: increment(finalTotal),
          last_order_date: new Date(),
          last_order_branch: selectedBranch,
          branches_used: arrayUnion(selectedBranch),
          first_order_date: new Date(),
          updated_at: new Date(),
        },
        { merge: true }
      );

      // Si hay cupón válido, registrar uso
      if (couponValidation?.valid && couponValidation.coupon) {
        const campaignId = couponValidation.coupon.valid_from
          ? couponValidation.coupon.valid_from.toDate().getTime().toString()
          : "no_campaign"
        const usageRef = doc(
          db,
          "coupon_usage",
          `${couponValidation.coupon.id}_${selectedBranch}_${form.phone}_${campaignId}`
        );
        batch.set(usageRef, {
          coupon_id: couponValidation.coupon.id,
          coupon_code: couponValidation.coupon.code,
          branch: selectedBranch,
          phone: form.phone,
          used_at: new Date(),
          order_id: orderRef.id,
          discount_applied: discountAmount,
          order_total_before: subtotal + originalDeliveryFee,
          order_total_after: finalTotal,
        });

        // Actualizar contadores del cupón
        const couponRef = doc(db, "coupons", couponValidation.coupon.id);
        batch.update(couponRef, {
          [`usage_by_branch.${selectedBranch}.used_count`]: increment(1),
          [`usage_by_branch.${selectedBranch}.total_revenue`]:
            increment(finalTotal),
          [`usage_by_branch.${selectedBranch}.discount_given`]:
            increment(discountAmount),
          updated_at: Timestamp.now(),
        });
      }

      await batch.commit();

      setOrderId(orderRef.id);
      setDailyOrderId(newDailyOrderId);

      if (form.payment === "wompi") {
        const wompiKey =
          process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_xxxxxxxx";
        const ref = `PA-${newDailyOrderId.replace("#", "")}`;
        const amountInCents = finalTotal * 100;
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiKey}&currency=COP&amount-in-cents=${amountInCents}&reference=${ref}`;
        window.location.href = wompiUrl;
      } else {
        setStep(4);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(
        language === "es" ? "Error al enviar pedido" : "Error submitting order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {step === 0 && "Selecciona tu Sucursal"}
                {step === 1 && tx.menu.title}
                {step === 2 && `${tx.cart.title} (${cart.length})`}
                {step === 3 && tx.delivery.title}
                {step === 4 && tx.confirmation.title}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {selectedBranch === "norte"
                  ? "Sucursal Norte"
                  : "Sucursal Sur"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {step === 0 && (
              <BranchStep
                selectedBranch={selectedBranch}
                onBranchSelect={(branch) => {
                  setSelectedBranch(branch);
                  setStep(1);
                }}
                language={language}
              />
            )}
            {step === 1 && (
              <MenuStep
                branchMenu={branchMenu}
                loadingMenu={loadingMenu}
                onAddToCart={addToCart}
                language={language}
                isStoreOpen={isStoreCurrentlyOpen}
                afterHoursMode={afterHoursMode}
                nextOpeningTime={nextOpeningTime}
                onAfterHoursConfirm={() => { }}
              />
            )}
            {step === 2 && (
              <CartStep
                cart={cart}
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeFromCart}
                onContinue={() => setStep(3)}
                onBack={() => setStep(1)}
                language={language}
                branchMenu={branchMenu || undefined}
              />
            )}
            {step === 3 && (
              <DeliveryStep
                form={form}
                setForm={setForm}
                cart={cart}
                branchMenu={branchMenu}
                onContinue={handleSubmitOrder}
                onBack={() => setStep(2)}
                language={language}
                isPreOrder={isPreOrder}
                nextOpeningTime={nextOpeningTime}
                afterHoursMode={afterHoursMode}
                email={email}
                onEmailChange={setEmail}
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                couponValidation={couponValidation}
                couponValidating={couponValidating}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            )}
            {step === 4 && (
              <ConfirmationStep
                orderId={orderId}
                dailyOrderId={dailyOrderId}
                form={form}
                cart={cart}
                branchMenu={branchMenu}
                isPreOrder={isPreOrder}
                scheduledFor={nextOpeningTime}
                onClose={handleClose}
                language={language}
              />
            )}
          </div>

          {/* Footer */}
          {step === 0 && (
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => selectedBranch && setStep(1)}
                disabled={!selectedBranch}
                className="w-full py-4 pizza-gradient text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedBranch
                  ? tx.branches.select
                  : language === "es"
                    ? "Selecciona una sucursal"
                    : "Select a branch"}
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setStep(2)}
                disabled={cart.length === 0}
                className="w-full py-4 pizza-gradient text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cart.length === 0
                  ? language === "es"
                    ? "Continuar (0)"
                    : "Continue (0)"
                  : language === "es"
                    ? `Continuar (${cart.length})`
                    : `Continue (${cart.length})`}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
