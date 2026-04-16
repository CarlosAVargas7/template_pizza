import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminOrder } from "@/types/admin";
import { OrderStatus } from "@/lib/store";
import { getTodayDate, getDailyOrderCount } from "../_lib/firebase-helpers";
import { formatCOP } from "@/lib/menuData";

const STATUS_LABELS: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: {
    label: "Confirmado",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  preparacion: {
    label: "En Preparación",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  despachado: {
    label: "Despachado",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  "pre-orden": {
    label: "Pre-orden",
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
};
const STATUSES: OrderStatus[] = [
  "pendiente",
  "confirmado",
  "preparacion",
  "despachado",
  "pre-orden",
];

export const useOrders = (authed: boolean, forcedBranch?: "norte" | "sur") => {
  // Orders states
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredBranch, setFilteredBranch] = useState<"all" | "norte" | "sur">(
    forcedBranch ?? "all",
  );
  const [filteredStatus, setFilteredStatus] = useState<"all" | OrderStatus>(
    "all",
  );
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dailyOrderCountNorte, setDailyOrderCountNorte] = useState(0);
  const [dailyOrderCountSur, setDailyOrderCountSur] = useState(0);
  const [todayDate, setTodayDate] = useState(getTodayDate());
  const [branchMenus, setBranchMenus] = useState<Record<string, any>>({});

  useEffect(() => {
    if (forcedBranch) setFilteredBranch(forcedBranch);
  }, [forcedBranch]);

  // Load orders from Firebase
  useEffect(() => {
    if (!authed) return;
    setOrdersLoading(true);

    const startOfDay = new Date(selectedDate + "T00:00:00");
    const endOfDay = new Date(selectedDate + "T23:59:59");

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const allOrders = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as AdminOrder,
      );

      // Filter orders by selected date
      const filteredOrders = allOrders.filter((order) => {
        const orderDate = order.createdAt?.toDate?.();
        if (!orderDate) return false;

        return orderDate >= startOfDay && orderDate <= endOfDay;
      });

      setOrders(filteredOrders);
      setOrdersLoading(false);
    });

    return unsub;
  }, [authed, selectedDate]);

  // Load and update daily order counters
  useEffect(() => {
    if (!authed) return;

    const loadDailyCounters = async () => {
      try {
        const [countNorte, countSur] = await Promise.all([
          getDailyOrderCount("norte"),
          getDailyOrderCount("sur"),
        ]);
        setDailyOrderCountNorte(countNorte);
        setDailyOrderCountSur(countSur);
      } catch (error) {
        console.error("Error loading daily counters:", error);
      }
    };

    loadDailyCounters();

    // Check for day change every minute
    const interval = setInterval(() => {
      const currentDate = getTodayDate();
      if (currentDate !== todayDate) {
        setTodayDate(currentDate);
        loadDailyCounters(); // Reload counters for new day
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [authed, todayDate]);

  // Load branch menus for option name translation
  useEffect(() => {
    if (!authed) return;
    const loadMenus = async () => {
      try {
        const [norteSnap, surSnap] = await Promise.all([
          getDoc(doc(db, "menus", "norte")),
          getDoc(doc(db, "menus", "sur")),
        ]);

        const menus: Record<string, any> = {};
        if (norteSnap.exists()) menus.norte = norteSnap.data();
        if (surSnap.exists()) menus.sur = surSnap.data();

        setBranchMenus(menus);
      } catch (error) {
        console.error("Error loading branch menus:", error);
      }
    };

    loadMenus();
  }, [authed]);

  // Helper function to get option names from IDs
  const getOptionNames = (
    selectedOptions: Record<string, string[]>,
    branchMenu?: any,
  ): string[] => {
    if (!branchMenu || !selectedOptions) return [];

    const optionNames: string[] = [];

    branchMenu.categories?.forEach((category: any) => {
      category.products?.forEach((product: any) => {
        product.optionGroups?.forEach((group: any) => {
          if (selectedOptions[group.id]) {
            selectedOptions[group.id].forEach((optionId: string) => {
              const option = group.options.find(
                (opt: any) => opt.id === optionId,
              );
              if (option) {
                optionNames.push(option.name);
              }
            });
          }
        });
      });
    });

    return optionNames;
  };

  const filteredOrders = orders.filter((o) => {
    if (forcedBranch && o.branch !== forcedBranch) return false;
    if (filteredBranch !== "all" && o.branch !== filteredBranch) return false;
    if (filteredStatus !== "all" && o.status !== filteredStatus) return false;
    return true;
  });

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      // toast.success(`Estado actualizado: ${STATUS_LABELS[status as OrderStatus]?.label || STATUS_LABELS["pendiente"].label}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      // toast.error("Error al actualizar estado");
    }
  };

  const whatsappLink = (order: AdminOrder) => {
    const branch = order.branch === "norte" ? "+573145550101" : "+573145550202";
    const orderId =
      order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
    const msg = encodeURIComponent(
      `Hola ${order.customerName}, tu pedido ${orderId} está ${STATUS_LABELS[order.status as OrderStatus]?.label.toLowerCase() || STATUS_LABELS["pendiente"].label.toLowerCase()}. Total: ${formatCOP(order.total)}.`,
    );
    return `https://wa.me/${branch.replace("+", "")}?text=${msg}`;
  };

  // WhatsApp functions for automated communication
  const whatsappPreparationMessage = (order: AdminOrder) => {
    const orderId =
      order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
    const msg = encodeURIComponent(
      `¡Buenas noticias! Tu pedido ${orderId} ya entró al horno. Estará listo pronto. 🍕`,
    );
    return `https://wa.me/${order.phone.replace(/\D/g, "")}?text=${msg}`;
  };

  const whatsappDispatchClientMessage = (
    order: AdminOrder,
    deliveryPerson: any,
  ) => {
    const orderId =
      order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
    const msg = encodeURIComponent(
      `¡Tu pedido va en camino! 🛵 El repartidor ${deliveryPerson.name} te lo entrega pronto.`,
    );
    return `https://wa.me/${order.phone.replace(/\D/g, "")}?text=${msg}`;
  };

  const whatsappDispatchDeliveryMessage = (
    order: AdminOrder,
    deliveryPerson: any,
  ) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;
    const msg = encodeURIComponent(
      `Nuevo despacho:\n📍 Cliente: ${order.customerName}\n📞 Teléfono: ${order.phone}\n🏠 Dirección: ${order.address}\n🗺️ Maps: ${mapsUrl}\n💰 Total a cobrar: ${formatCOP(order.total)}\n💳 Método de pago: ${order.paymentMethod === "wompi" ? "Wompi" : "Efectivo"}`,
    );
    return `https://wa.me/${deliveryPerson.phone.replace(/\D/g, "")}?text=${msg}`;
  };

  return {
    orders,
    setOrders,
    filteredBranch,
    setFilteredBranch,
    filteredStatus,
    setFilteredStatus,
    selectedDate,
    setSelectedDate,
    ordersLoading,
    setOrdersLoading,
    dailyOrderCountNorte,
    setDailyOrderCountNorte,
    dailyOrderCountSur,
    setDailyOrderCountSur,
    todayDate,
    setTodayDate,
    branchMenus,
    setBranchMenus,
    filteredOrders,
    updateStatus,
    whatsappLink,
    whatsappPreparationMessage,
    whatsappDispatchClientMessage,
    whatsappDispatchDeliveryMessage,
  };
};
