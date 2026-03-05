"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  LogOut,
  Package,
  Settings,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  RefreshCw,
  Store,
  ChevronDown,
  User,
  Power,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  Eye,
  EyeOff,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import {
  defaultDynamicMenuNorte,
  defaultDynamicMenuSur,
  BranchMenu,
  formatCOP,
} from "@/lib/menuData";
import { OrderStatus } from "@/lib/store";
import { toast } from "sonner";
import MenuManager from "@/components/admin/MenuManager";

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  branch: "norte" | "sur";
  active: boolean;
  createdAt: Timestamp;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
const ACCOUNTING_PASSWORD = process.env.NEXT_PUBLIC_ACCOUNTING_PASSWORD || "contabilidad2024";

// Función para obtener la fecha actual en formato YYYY-MM-DD
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Función para generar ID corto diario
const generateDailyOrderId = (dailyCount: number) => {
  return `#${String(dailyCount).padStart(3, '0')}`;
};

// Función para obtener o inicializar el contador diario por sucursal
const getDailyOrderCount = async (branch: "norte" | "sur") => {
  const today = getTodayDate();
  const counterRef = doc(db, 'dailyCounters', `${branch}_${today}`);
  const counterDoc = await getDoc(counterRef);

  if (!counterDoc.exists()) {
    await setDoc(counterRef, {
      date: today,
      branch,
      count: 0,
      lastReset: Timestamp.now()
    });
    return 0;
  }

  return counterDoc.data().count || 0;
};

// Función para incrementar el contador diario por sucursal
const incrementDailyOrderCount = async (branch: "norte" | "sur") => {
  const today = getTodayDate();
  const counterRef = doc(db, 'dailyCounters', `${branch}_${today}`);
  const counterDoc = await getDoc(counterRef);

  if (!counterDoc.exists()) {
    await setDoc(counterRef, {
      date: today,
      branch,
      count: 1,
      lastReset: Timestamp.now()
    });
    return 1;
  }

  const currentCount = counterDoc.data().count || 0;
  const newCount = currentCount + 1;

  await updateDoc(counterRef, {
    count: newCount,
    lastUpdated: Timestamp.now()
  });

  return newCount;
};

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: { label: "Confirmado", color: "text-green-700", bg: "bg-green-100" },
  preparacion: { label: "En Preparación", color: "text-orange-700", bg: "bg-orange-100" },
  despachado: { label: "Despachado", color: "text-blue-700", bg: "bg-blue-100" },
};
const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "preparacion", "despachado"];

interface AdminOrder {
  id: string;
  dailyOrderId?: string; // ID corto diario (#001, #002)
  branch: string;
  customerName: string;
  phone: string;
  address: string;
  status: OrderStatus;
  total: number;
  createdAt: Timestamp;
  paymentMethod: string;
  deliveryPersonId?: string; // ID del domiciliario asignado
  dispatchedAt?: Timestamp; // Fecha de despacho
  items?: any[]; // New dynamic order structure
  // Legacy support
  item?: {
    size: string;
    specialty: string;
    drink: string;
    quantity: number;
    notes?: string;
    condiments?: string[];
  };
}

// Helper function to get option names from IDs
const getOptionNames = (selectedOptions: Record<string, string[]>, branchMenu?: any): string[] => {
  if (!branchMenu || !selectedOptions) return [];

  const optionNames: string[] = [];

  branchMenu.categories?.forEach((category: any) => {
    category.products?.forEach((product: any) => {
      product.optionGroups?.forEach((group: any) => {
        if (selectedOptions[group.id]) {
          selectedOptions[group.id].forEach((optionId: string) => {
            const option = group.options.find((opt: any) => opt.id === optionId);
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

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"orders" | "menu" | "delivery" | "accounting" | "schedule">("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredBranch, setFilteredBranch] = useState<"all" | "norte" | "sur">("all");
  const [filteredStatus, setFilteredStatus] = useState<"all" | OrderStatus>("all");
  const [menuNorte, setMenuNorte] = useState<BranchMenu>(defaultDynamicMenuNorte);
  const [menuSur, setMenuSur] = useState<BranchMenu>(defaultDynamicMenuSur);

  // Schedule management states
  const [schedules, setSchedules] = useState<Record<string, any>>({});
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [scheduleBranch, setScheduleBranch] = useState<"norte" | "sur">("norte");
  const [newSchedule, setNewSchedule] = useState({
    openTime: "",
    closeTime: "",
    days: [] as string[],
    isClosed: false
  });
  const [dailyOrderCountNorte, setDailyOrderCountNorte] = useState(0);
  const [dailyOrderCountSur, setDailyOrderCountSur] = useState(0);
  const [todayDate, setTodayDate] = useState(getTodayDate());
  const [menuBranch, setMenuBranch] = useState<"norte" | "sur">("norte");
  const [branchMenus, setBranchMenus] = useState<Record<string, any>>({});
  const [editingMenu, setEditingMenu] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Delivery management states
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>("");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<AdminOrder | null>(null);
  const [newDeliveryPerson, setNewDeliveryPerson] = useState({ name: "", phone: "", branch: "norte" as "norte" | "sur" });
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "norte" | "sur">("all");
  const [editingDeliveryPerson, setEditingDeliveryPerson] = useState<DeliveryPerson | null>(null);

  // Date filter states
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Accounting states
  const [showAccountingDetails, setShowAccountingDetails] = useState(false);
  const [accountingPassword, setAccountingPassword] = useState("");
  const [accountingAuthenticated, setAccountingAuthenticated] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "quarter" | "year" | "all">("day");

  // Load orders from Firebase
  useEffect(() => {
    if (!authed) return;
    setOrdersLoading(true);

    const startOfDay = new Date(selectedDate + 'T00:00:00');
    const endOfDay = new Date(selectedDate + 'T23:59:59');

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const allOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminOrder));

      // Filter orders by selected date
      const filteredOrders = allOrders.filter(order => {
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
          getDailyOrderCount("sur")
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
          getDoc(doc(db, "menus", "sur"))
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

  // Load delivery persons from Firebase
  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "deliveryPersons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setDeliveryPersons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DeliveryPerson)));
    });
    return unsub;
  }, [authed]);

  // Load menus from Firebase
  const loadMenus = useCallback(async () => {
    try {
      const nSnap = await getDoc(doc(db, "menus", "norte"));
      if (nSnap.exists()) {
        const menuData = nSnap.data() as BranchMenu;
        // Check if it's the new format or legacy format
        if (menuData.categories) {
          setMenuNorte(menuData);
        } else {
          // Migrate legacy format
          setMenuNorte(defaultDynamicMenuNorte);
        }
      } else {
        setMenuNorte(defaultDynamicMenuNorte);
      }

      const sSnap = await getDoc(doc(db, "menus", "sur"));
      if (sSnap.exists()) {
        const menuData = sSnap.data() as BranchMenu;
        if (menuData.categories) {
          setMenuSur(menuData);
        } else {
          // Migrate legacy format
          setMenuSur(defaultDynamicMenuSur);
        }
      } else {
        setMenuSur(defaultDynamicMenuSur);
      }
    } catch (error) {
      console.error("Error loading menus:", error);
      // Use defaults
      setMenuNorte(defaultDynamicMenuNorte);
      setMenuSur(defaultDynamicMenuSur);
    }
  }, []);

  useEffect(() => {
    if (authed) loadMenus();
  }, [authed, loadMenus]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      toast.success(`Estado actualizado: ${STATUS_LABELS[status].label}`);
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const saveMenu = async (updatedMenu: BranchMenu) => {
    setSavingMenu(true);
    try {
      await setDoc(doc(db, "menus", menuBranch), updatedMenu);
      if (menuBranch === "norte") {
        setMenuNorte(updatedMenu);
      } else {
        setMenuSur(updatedMenu);
      }
      toast.success(`Menú ${menuBranch === "norte" ? "Norte" : "Sur"} guardado`);
      setEditingMenu(false);
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Error al guardar menú. Verifica la conexión a Firebase.");
    } finally {
      setSavingMenu(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filteredBranch !== "all" && o.branch !== filteredBranch) return false;
    if (filteredStatus !== "all" && o.status !== filteredStatus) return false;
    return true;
  });

  const currentMenu = menuBranch === "norte" ? menuNorte : menuSur;

  const whatsappLink = (order: AdminOrder) => {
    const branch = order.branch === "norte" ? "+573145550101" : "+573145550202";
    const orderId = order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
    const msg = encodeURIComponent(
      `Hola ${order.customerName}, tu pedido ${orderId} está ${STATUS_LABELS[order.status].label.toLowerCase()}. Total: ${formatCOP(order.total)}.`
    );
    return `https://wa.me/${branch.replace("+", "")}?text=${msg}`;
  };

  // WhatsApp functions for automated communication
  const whatsappPreparationMessage = (order: AdminOrder) => {
    const orderId = order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
    const msg = encodeURIComponent(
      `¡Buenas noticias! Tu pedido ${orderId} ya entró al horno. Estará listo pronto. 🍕`
    );
    return `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${msg}`;
  };

  const whatsappDispatchClientMessage = (order: AdminOrder, deliveryPerson: DeliveryPerson) => {
    const orderId = order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
    const msg = encodeURIComponent(
      `¡Tu pedido va en camino! 🛵 El repartidor ${deliveryPerson.name} te lo entrega pronto.`
    );
    return `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${msg}`;
  };

  const whatsappDispatchDeliveryMessage = (order: AdminOrder, deliveryPerson: DeliveryPerson) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;
    const msg = encodeURIComponent(
      `Nuevo despacho:\n📍 Cliente: ${order.customerName}\n📞 Teléfono: ${order.phone}\n🏠 Dirección: ${order.address}\n🗺️ Maps: ${mapsUrl}\n💰 Total a cobrar: ${formatCOP(order.total)}\n💳 Método de pago: ${order.paymentMethod === "wompi" ? "Wompi" : "Efectivo"}`
    );
    return `https://wa.me/${deliveryPerson.phone.replace(/\D/g, '')}?text=${msg}`;
  };

  // Delivery management functions
  const addDeliveryPerson = async () => {
    if (!newDeliveryPerson.name || !newDeliveryPerson.phone) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      const deliveryData = {
        name: newDeliveryPerson.name,
        phone: newDeliveryPerson.phone,
        branch: newDeliveryPerson.branch,
        active: true,
        createdAt: Timestamp.now()
      };

      await setDoc(doc(collection(db, "deliveryPersons")), deliveryData);
      setNewDeliveryPerson({ name: "", phone: "", branch: "norte" });
      setEditingDeliveryPerson(null);
      toast.success("Domiciliario agregado exitosamente");
    } catch (error) {
      console.error("Error adding delivery person:", error);
      toast.error("Error al agregar domiciliario");
    }
  };

  const assignDeliveryToOrder = async (orderId: string, deliveryPersonId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        deliveryPersonId,
        dispatchedAt: Timestamp.now()
      });
      toast.success("Domiciliario asignado exitosamente");
    } catch (error) {
      console.error("Error assigning delivery person:", error);
      toast.error("Error al asignar domiciliario");
    }
  };

  const toggleDeliveryPersonStatus = async (deliveryPersonId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "deliveryPersons", deliveryPersonId), {
        active: !currentStatus
      });
      toast.success(`Domiciliario ${!currentStatus ? "activado" : "desactivado"} exitosamente`);
    } catch (error) {
      console.error("Error toggling delivery person status:", error);
      toast.error("Error al cambiar estado del domiciliario");
    }
  };

  const deleteDeliveryPerson = async (deliveryPersonId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este domiciliario?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "deliveryPersons", deliveryPersonId));
      toast.success("Domiciliario eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting delivery person:", error);
      toast.error("Error al eliminar domiciliario");
    }
  };

  const startEditingDeliveryPerson = (person: DeliveryPerson) => {
    setEditingDeliveryPerson(person);
    setNewDeliveryPerson({
      name: person.name,
      phone: person.phone,
      branch: person.branch
    });
  };

  const updateDeliveryPerson = async () => {
    if (!editingDeliveryPerson || !newDeliveryPerson.name || !newDeliveryPerson.phone) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await updateDoc(doc(db, "deliveryPersons", editingDeliveryPerson.id), {
        name: newDeliveryPerson.name,
        phone: newDeliveryPerson.phone,
        branch: newDeliveryPerson.branch
      });

      setEditingDeliveryPerson(null);
      setNewDeliveryPerson({ name: "", phone: "", branch: "norte" });
      toast.success("Domiciliario actualizado exitosamente");
    } catch (error) {
      console.error("Error updating delivery person:", error);
      toast.error("Error al actualizar domiciliario");
    }
  };

  const cancelEditing = () => {
    setEditingDeliveryPerson(null);
    setNewDeliveryPerson({ name: "", phone: "", branch: "norte" });
  };

  const filteredDeliveryPersons = deliveryPersons.filter(person => {
    if (deliveryFilter === "all") return true;
    return person.branch === deliveryFilter;
  });

  // Accounting calculations
  const calculateAccountingStats = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate?.();
      if (!orderDate) return false;

      const startOfDay = new Date(selectedDate + 'T00:00:00');
      const endOfDay = new Date(selectedDate + 'T23:59:59');

      return orderDate >= startOfDay && orderDate <= endOfDay;
    });

    // Calculate total sales
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate inventory sold
    const inventorySold: Record<string, number> = {};
    filteredOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const productName = item.productName || 'Unknown';
        inventorySold[productName] = (inventorySold[productName] || 0) + item.quantity;
      });
    });

    // Sort inventory by quantity (highest first)
    const sortedInventory = Object.entries(inventorySold)
      .sort(([, a], [, b]) => b - a)
      .map(([name, quantity]) => ({ name, quantity }));

    // Calculate payment methods
    const paymentMethods = filteredOrders.reduce((acc, order) => {
      const method = order.paymentMethod === "wompi" ? "Transferencia" : "Efectivo";
      acc[method] = (acc[method] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      inventorySold: sortedInventory,
      paymentMethods,
      orderCount: filteredOrders.length
    };
  };

  // Period filtering functions
  const getDateRangeForPeriod = (period: typeof selectedPeriod, baseDate: string) => {
    const date = new Date(baseDate + 'T00:00:00');

    switch (period) {
      case "day":
        return {
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
        };

      case "week":
        const dayOfWeek = date.getDay();
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
          start: startOfWeek,
          end: endOfWeek
        };

      case "month":
        return {
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, -1)
        };

      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3);
        const startOfQuarter = new Date(date.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(date.getFullYear(), (quarter + 1) * 3, 0, 0, 0, -1);

        return {
          start: startOfQuarter,
          end: endOfQuarter
        };

      case "year":
        return {
          start: new Date(date.getFullYear(), 0, 1),
          end: new Date(date.getFullYear(), 11, 31, 23, 59, 59)
        };

      case "all":
        return {
          start: new Date(2020, 0, 1), // First order date
          end: new Date()
        };

      default:
        return {
          start: date,
          end: date
        };
    }
  };

  // Calculate accounting stats with period filtering
  const calculateAccountingStatsWithPeriod = () => {
    const dateRange = getDateRangeForPeriod(selectedPeriod, selectedDate);
    const filteredOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate?.();
      if (!orderDate) return false;
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });

    // Calculate total sales
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate inventory sold
    const inventorySold: Record<string, number> = {};
    filteredOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const productName = item.productName || 'Unknown';
        inventorySold[productName] = (inventorySold[productName] || 0) + item.quantity;
      });
    });

    // Sort inventory by quantity (highest first)
    const sortedInventory = Object.entries(inventorySold)
      .sort(([, a], [, b]) => b - a)
      .map(([name, quantity]) => ({ name, quantity }));

    // Calculate payment methods
    const paymentMethods = filteredOrders.reduce((acc, order) => {
      const method = order.paymentMethod === "wompi" ? "Transferencia" : "Efectivo";
      acc[method] = (acc[method] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      inventorySold: sortedInventory,
      paymentMethods,
      orderCount: filteredOrders.length,
      period: selectedPeriod,
      dateRange
    };
  };

  // Authentication function
  const authenticateAccounting = () => {
    if (accountingPassword === ACCOUNTING_PASSWORD) {
      setAccountingAuthenticated(true);
      toast.success("Acceso a contabilidad concedido");
    } else {
      toast.error("Clave incorrecta");
    }
  };

  const accountingStats = accountingAuthenticated ? calculateAccountingStatsWithPeriod() : null;

  // Schedule management functions
  const addSchedule = async () => {
    if (!newSchedule.openTime || !newSchedule.closeTime || newSchedule.days.length === 0) {
      toast.error("Por favor completa todos los campos y selecciona al menos un día");
      return;
    }

    try {
      const scheduleId = `schedule_${Date.now()}`;
      const scheduleData = {
        ...newSchedule,
        id: scheduleId,
        branch: scheduleBranch,
        createdAt: new Date()
      };

      // Apply schedule to all selected days
      const updates: Promise<any>[] = [];
      newSchedule.days.forEach(day => {
        updates.push(setDoc(doc(db, "schedules", `${scheduleBranch}_${day}`), {
          openTime: newSchedule.openTime,
          closeTime: newSchedule.closeTime,
          isClosed: newSchedule.isClosed,
          blockId: scheduleId,
          branch: scheduleBranch,
          updatedAt: new Date()
        }));
      });

      await Promise.all(updates);

      // Update local state
      const updatedSchedules = { ...schedules };
      newSchedule.days.forEach(day => {
        updatedSchedules[`${scheduleBranch}_${day}`] = {
          openTime: newSchedule.openTime,
          closeTime: newSchedule.closeTime,
          isClosed: newSchedule.isClosed,
          blockId: scheduleId,
          branch: scheduleBranch
        };
      });
      setSchedules(updatedSchedules);

      // Reset form
      setNewSchedule({
        openTime: "",
        closeTime: "",
        days: [],
        isClosed: false
      });

      toast.success(`Horario aplicado a ${newSchedule.days.length} días para sucursal ${scheduleBranch}`);
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast.error("Error al agregar horario");
    }
  };

  const updateSchedule = async (day: string, scheduleData: any) => {
    try {
      await updateDoc(doc(db, "schedules", day), {
        ...scheduleData,
        updatedAt: new Date()
      });

      setSchedules(prev => ({ ...prev, [day]: scheduleData }));
      setEditingSchedule(null);
      toast.success("Horario actualizado exitosamente");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Error al actualizar horario");
    }
  };

  const deleteSchedule = async (day: string) => {
    try {
      await deleteDoc(doc(db, "schedules", day));

      setSchedules(prev => {
        const newSchedules = { ...prev };
        delete newSchedules[day];
        return newSchedules;
      });
      toast.success("Horario eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error al eliminar horario");
    }
  };

  const deleteScheduleBlock = async (blockSchedules: any[]) => {
    try {
      // Delete all days in this block
      const deletePromises = blockSchedules.map(({ day }) =>
        deleteDoc(doc(db, "schedules", day))
      );

      await Promise.all(deletePromises);

      setSchedules(prev => {
        const newSchedules = { ...prev };
        blockSchedules.forEach(({ day }) => {
          delete newSchedules[day];
        });
        return newSchedules;
      });

      toast.success(`Bloque eliminado (${blockSchedules.length} días)`);
    } catch (error) {
      console.error("Error deleting schedule block:", error);
      toast.error("Error al eliminar bloque de horarios");
    }
  };

  // Load schedules from Firebase
  useEffect(() => {
    if (!authed) return;

    const q = query(collection(db, "schedules"));
    const unsub = onSnapshot(q, (snap) => {
      const schedulesData: Record<string, any> = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        // Filter by current selected branch
        if (data.branch === scheduleBranch) {
          schedulesData[doc.id] = data;
        }
      });
      setSchedules(schedulesData);
    });

    return unsub;
  }, [authed, scheduleBranch]);

  if (!authed) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 pizza-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Panel Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Pizza Antioquia</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Contraseña"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 pizza-gradient text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
            >
              Ingresar
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Contraseña por defecto: admin123
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl pizza-gradient flex items-center justify-center">
              <span className="text-white text-sm font-black">PA</span>
            </div>
            <div>
              <h1 className="font-black text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Norte:</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{dailyOrderCountNorte}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Sur:</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{dailyOrderCountSur}</span>
                </div>
                <span className="text-gray-400">({todayDate})</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0">
          {(["orders", "menu", "schedule", "delivery", "accounting"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {t === "orders" ? <Package className="w-4 h-4" /> : t === "menu" ? <Settings className="w-4 h-4" /> : t === "schedule" ? <Clock className="w-4 h-4" /> : t === "delivery" ? <User className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
              {t === "orders" ? `Pedidos (${orders.length})` : t === "menu" ? "Gestión de Menú" : t === "schedule" ? "Gestión de Horarios" : t === "delivery" ? "Domiciliarios" : "Contabilidad"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ============ ORDERS TAB ============ */}
        {tab === "orders" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {STATUSES.map((s) => {
                const count = orders.filter((o) => o.status === s).length;
                const sc = STATUS_LABELS[s];
                return (
                  <div key={s} className={`p-4 rounded-2xl ${sc.bg}`}>
                    <p className={`text-2xl font-black ${sc.color}`}>{count}</p>
                    <p className={`text-xs font-medium ${sc.color}`}>{sc.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={getTodayDate()}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-400" />
                <select
                  value={filteredBranch}
                  onChange={(e) => setFilteredBranch(e.target.value as typeof filteredBranch)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="all">Todas las sucursales</option>
                  <option value="norte">Norte</option>
                  <option value="sur">Sur</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <select
                  value={filteredStatus}
                  onChange={(e) => setFilteredStatus(e.target.value as typeof filteredStatus)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="all">Todos los estados</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setFilteredBranch("all");
                  setFilteredStatus("all");
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  {selectedDate === getTodayDate()
                    ? "Pedidos de Hoy"
                    : `Pedidos del ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}`
                  }
                </h3>
                {ordersLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Cargando...
                  </div>
                )}
              </div>
              {filteredOrders.length === 0 && !ordersLoading && (
                <div className="text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {selectedDate === getTodayDate()
                      ? "No hay pedidos para hoy"
                      : `No hay pedidos para el ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}`
                    }
                  </p>
                </div>
              )}
              {filteredOrders.map((order) => {
                const sc = STATUS_LABELS[order.status as OrderStatus];
                const createdDate = order.createdAt?.toDate?.();
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                              {order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`}
                            </span>
                            <span className="font-mono text-xs text-gray-400">
                              ID: {order.id.substring(0, 8).toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                              {order.branch === "norte" ? "Norte" : "Sur"}
                            </span>
                          </div>
                          <h3 className="font-black text-gray-900">{order.customerName}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <a href={`tel:${order.phone}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
                              <Phone className="w-3.5 h-3.5" />
                              {order.phone}
                            </a>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />
                              {order.address}
                            </span>
                          </div>
                          {createdDate && (
                            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Clock className="w-3 h-3" />
                              {createdDate.toLocaleString("es-CO")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-primary">{formatCOP(order.total)}</p>
                          <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${sc.bg} ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Order details - Support both legacy and new format */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs">
                        {order.items ? (
                          // New dynamic format
                          <div className="space-y-1">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="text-gray-700">
                                <span className="font-medium">{item.quantity}x {item.productName}</span>
                                {item.selectedOptions && (
                                  <span className="text-gray-500 ml-1">
                                    ({getOptionNames(item.selectedOptions, branchMenus[order.branch]).join(", ") || Object.values(item.selectedOptions || {}).flat().join(", ")})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : order.item ? (
                          // Legacy format
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <p className="text-gray-400">Especialidad</p>
                              <p className="font-semibold text-gray-700 capitalize">{order.item?.specialty}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Tamaño</p>
                              <p className="font-semibold text-gray-700 capitalize">{order.item?.size}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Bebida</p>
                              <p className="font-semibold text-gray-700 capitalize">{order.item?.drink}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Pago</p>
                              <p className="font-semibold text-gray-700">
                                {order.paymentMethod === "wompi" ? "Wompi" : "Efectivo"}
                              </p>
                            </div>
                            {order.item?.notes && (
                              <div className="col-span-2 sm:col-span-4">
                                <p className="text-gray-400">Notas</p>
                                <p className="font-medium text-gray-700 italic">{order.item.notes}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">No hay detalles del pedido</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {/* Status selector */}
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                            className={`appearance-none pr-7 pl-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${sc.bg} ${sc.color} border-transparent`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>

                        {/* Automated WhatsApp buttons based on status */}
                        {order.status === "confirmado" && (
                          <button
                            onClick={() => window.open(whatsappPreparationMessage(order), '_blank')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Notificar Cliente
                          </button>
                        )}

                        {order.status === "despachado" && (
                          <>
                            {/* WhatsApp Cliente */}
                            <button
                              onClick={() => {
                                const deliveryPerson = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
                                if (deliveryPerson) {
                                  window.open(whatsappDispatchClientMessage(order, deliveryPerson), '_blank');
                                } else {
                                  toast.error("Primero asigna un domiciliario");
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-xl hover:bg-green-100 transition-colors border border-green-200"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Avisar Cliente
                            </button>

                            {/* WhatsApp Domiciliario */}
                            <button
                              onClick={() => {
                                const deliveryPerson = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
                                if (deliveryPerson) {
                                  window.open(whatsappDispatchDeliveryMessage(order, deliveryPerson), '_blank');
                                } else {
                                  toast.error("Primero asigna un domiciliario");
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Enviar a Domiciliario
                            </button>

                            {/* Assign Delivery Person */}
                            <select
                              value={order.deliveryPersonId || ""}
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignDeliveryToOrder(order.id, e.target.value);
                                }
                              }}
                              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">Asignar domiciliario</option>
                              {deliveryPersons
                                .filter(dp => dp.branch === order.branch && dp.active)
                                .map((dp) => (
                                  <option key={dp.id} value={dp.id}>{dp.name}</option>
                                ))}
                            </select>
                          </>
                        )}

                        {/* Default WhatsApp for other statuses */}
                        {order.status !== "confirmado" && order.status !== "despachado" && (
                          <a
                            href={whatsappLink(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-xl hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ MENU TAB ============ */}
        {tab === "menu" && (
          <div>
            {/* Branch selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {(["norte", "sur"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setMenuBranch(b)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${menuBranch === b ? "pizza-gradient text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                  >
                    {b === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {!editingMenu ? (
                  <button
                    onClick={() => setEditingMenu(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Editar Menú
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingMenu(false);
                      loadMenus();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {editingMenu ? (
              <MenuManager
                menu={currentMenu}
                onSave={saveMenu}
                onCancel={() => setEditingMenu(false)}
                saving={savingMenu}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-4">Vista Previa del Menú</h3>
                <div className="space-y-6">
                  {currentMenu.categories.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <h4 className="font-bold text-gray-900 mb-2">{category.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.products.map((product) => (
                          <div key={product.id} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">{product.name}</h5>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.status === "available"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                                }`}>
                                {product.status === "available" ? "Disponible" : "Agotado"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                            <p className="font-black text-primary">{formatCOP(product.basePrice)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {product.popular && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">Popular</span>}
                              {product.spicy && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">Picante</span>}
                              {product.vegetarian && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Veggie</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ DELIVERY TAB ============ */}
        {tab === "delivery" && (
          <div>
            {/* Add Delivery Person Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {editingDeliveryPerson ? "Editar Domiciliario" : "Agregar Domiciliario"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del domiciliario"
                  value={newDeliveryPerson.name}
                  onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, name: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={newDeliveryPerson.phone}
                  onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, phone: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <select
                  value={newDeliveryPerson.branch}
                  onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, branch: e.target.value as "norte" | "sur" })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="norte">Norte</option>
                  <option value="sur">Sur</option>
                </select>
                <div className="flex gap-2">
                  {editingDeliveryPerson ? (
                    <>
                      <button
                        onClick={updateDeliveryPerson}
                        className="flex-1 pizza-gradient text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                      >
                        Actualizar
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={addDeliveryPerson}
                      className="pizza-gradient text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                    >
                      Agregar Domiciliario
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Persons List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Todos los Domiciliarios</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Filtrar por:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      {[
                        { value: "all", label: "Todos" },
                        { value: "norte", label: "Norte" },
                        { value: "sur", label: "Sur" }
                      ].map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setDeliveryFilter(filter.value as any)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${deliveryFilter === filter.value
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredDeliveryPersons.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {deliveryFilter === "all"
                      ? "No hay domiciliarios registrados"
                      : `No hay domiciliarios en la sucursal ${deliveryFilter === "norte" ? "Norte" : "Sur"}`
                    }
                  </div>
                ) : (
                  filteredDeliveryPersons.map((person) => (
                    <div key={person.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 pizza-gradient rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {person.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{person.name}</p>
                          <p className="text-sm text-gray-500">{person.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.branch === "norte"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                          }`}>
                          {person.branch === "norte" ? "Norte" : "Sur"}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                          }`}>
                          {person.active ? "Activo" : "Inactivo"}
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditingDeliveryPerson(person)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleDeliveryPersonStatus(person.id, person.active)}
                            className={`p-1.5 rounded-lg transition-colors ${person.active
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            title={person.active ? "Desactivar" : "Activar"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteDeliveryPerson(person.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ ACCOUNTING TAB ============ */}
        {tab === "accounting" && (
          <div>
            {!accountingAuthenticated ? (
              /* Authentication Screen */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 pizza-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Módulo de Contabilidad</h3>
                    <p className="text-gray-600 mb-6">Este módulo contiene información financiera sensible. Por favor ingresa la clave de acceso.</p>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Clave de contabilidad"
                      value={accountingPassword}
                      onChange={(e) => setAccountingPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          authenticateAccounting();
                        }
                      }}
                    />
                    <button
                      onClick={authenticateAccounting}
                      className="w-full pizza-gradient text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                    >
                      Ingresar a Contabilidad
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {accountingStats && (
                  <>
                    {/* Header with period selector */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Estadísticas de Ventas</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedPeriod === "day" && selectedDate === getTodayDate()
                              ? "Resumen de hoy"
                              : selectedPeriod === "day"
                                ? `Resumen del ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                : `Resumen ${selectedPeriod === "week" ? "semanal" : selectedPeriod === "month" ? "mensual" : selectedPeriod === "quarter" ? "trimestral" : selectedPeriod === "year" ? "anual" : "general"}`
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Period Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Período:</span>
                            <select
                              value={selectedPeriod}
                              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
                              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                            >
                              <option value="day">Diario</option>
                              <option value="week">Semanal</option>
                              <option value="month">Mensual</option>
                              <option value="quarter">Trimestral</option>
                              <option value="year">Anual</option>
                              <option value="all">Todos los tiempos</option>
                            </select>
                          </div>

                          {/* Date Picker (only for day/week/month) */}
                          {(selectedPeriod === "day" || selectedPeriod === "week" || selectedPeriod === "month" || selectedPeriod === "quarter") && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={getTodayDate()}
                                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                              />
                            </div>
                          )}

                          {/* Logout Button */}
                          <button
                            onClick={() => {
                              setAccountingAuthenticated(false);
                              setAccountingPassword("");
                              setSelectedPeriod("day");
                            }}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>

                      {/* Period Info */}
                      {accountingStats.dateRange && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-sm text-blue-700">
                            <span className="font-semibold">Período:</span> {new Date(accountingStats.dateRange.start).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(accountingStats.dateRange.end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Total Sales */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-700">Ventas Totales</h4>
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{formatCOP(accountingStats.totalSales)}</p>
                        <p className="text-sm text-gray-500 mt-1">{accountingStats.orderCount} pedidos</p>
                      </div>

                      {/* Payment Methods */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">Métodos de Pago</h4>
                          <PieChart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="space-y-3">
                          {Object.entries(accountingStats.paymentMethods).map(([method, amount]) => (
                            <div key={method} className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">{method}</span>
                              <span className="text-sm font-bold text-gray-900">{formatCOP(amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h4 className="font-semibold text-gray-700 mb-4">Acciones Rápidas</h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowAccountingDetails(!showAccountingDetails)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {showAccountingDetails ? "Ocultar" : "Mostrar"} Inventario Vendido
                            </span>
                            {showAccountingDetails ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inventory Sold */}
                    {showAccountingDetails && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900">Inventario Vendido</h4>
                            <span className="text-sm text-gray-500">
                              {accountingStats.inventorySold.length} productos diferentes
                            </span>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {accountingStats.inventorySold.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                              <p>No hay ventas registradas para este período</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {accountingStats.inventorySold.map((item, index) => (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                      <span className="text-primary font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{item.name}</p>
                                      <p className="text-sm text-gray-500">Unidades vendidas</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============ SCHEDULE TAB ============ */}
        {tab === "schedule" && (
          <div>
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Gestión de Horarios</h3>
                  <p className="text-sm text-gray-500 mt-1">Configura los horarios de atención de la pizzería</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Branch Selector */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => setScheduleBranch("norte")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${scheduleBranch === "norte"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      Sucursal Norte
                    </button>
                    <button
                      onClick={() => setScheduleBranch("sur")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${scheduleBranch === "sur"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      Sucursal Sur
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-600">Horarios activos: {Object.keys(schedules).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add/Edit Schedule Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                {editingSchedule ? "Editar Horario" : `Crear Bloque de Horarios - Sucursal ${scheduleBranch === "norte" ? "Norte" : "Sur"}`}
              </h4>

              {/* Time Range */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">🕐 Definir Rango de Horas</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Apertura</label>
                    <input
                      type="time"
                      value={newSchedule.openTime}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, openTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Cierre</label>
                    <input
                      type="time"
                      value={newSchedule.closeTime}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, closeTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {newSchedule.openTime && newSchedule.closeTime && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      📅 Horario: {newSchedule.openTime} – {newSchedule.closeTime}
                    </p>
                  </div>
                )}
              </div>

              {/* Day Selection */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">📆 Seleccionar Días Aplicables</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'lunes', label: 'Lunes' },
                    { id: 'martes', label: 'Martes' },
                    { id: 'miércoles', label: 'Miércoles' },
                    { id: 'jueves', label: 'Jueves' },
                    { id: 'viernes', label: 'Viernes' },
                    { id: 'sábado', label: 'Sábado' },
                    { id: 'domingo', label: 'Domingo' },
                    { id: 'festivo', label: 'Festivo' }
                  ].map(day => (
                    <label key={day.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={newSchedule.days.includes(day.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewSchedule(prev => ({ ...prev, days: [...prev.days, day.id] }));
                          } else {
                            setNewSchedule(prev => ({ ...prev, days: prev.days.filter(d => d !== day.id) }));
                          }
                        }}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>

                {newSchedule.days.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      ✅ Se aplicará a {newSchedule.days.length} día(s): {newSchedule.days.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Closed Option */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSchedule.isClosed}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, isClosed: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Marcar como Cerrado</span>
                </label>
                {newSchedule.isClosed && (
                  <p className="text-xs text-gray-500 mt-1 ml-7">Los días seleccionados estarán cerrados</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={addSchedule}
                  disabled={!newSchedule.openTime || !newSchedule.closeTime || newSchedule.days.length === 0}
                  className="pizza-gradient text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Guardar Bloque de Horario
                </button>
                <button
                  onClick={() => setNewSchedule({
                    openTime: "",
                    closeTime: "",
                    days: [],
                    isClosed: false
                  })}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Schedules List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900">Horarios Configurados</h4>
                  <span className="text-sm text-gray-500">{Object.keys(schedules).length} días configurados</span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {Object.keys(schedules).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No hay horarios configurados</p>
                    <p className="text-sm text-gray-400">Crea bloques de horarios para mostrarlos en la página principal</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {/* Group schedules by block */}
                    {(() => {
                      const blocks: Record<string, any[]> = {};
                      Object.entries(schedules).forEach(([day, schedule]: [string, any]) => {
                        const blockId = schedule.blockId || 'individual';
                        if (!blocks[blockId]) blocks[blockId] = [];
                        blocks[blockId].push({ day, ...schedule });
                      });

                      return Object.entries(blocks).map(([blockId, blockSchedules]) => (
                        <div key={blockId} className="p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {blockSchedules[0].isClosed ? "Cerrado" : `${blockSchedules[0].openTime} – ${blockSchedules[0].closeTime}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  📅 {blockSchedules.map(s => s.day.replace(`${scheduleBranch}_`, '')).sort((a, b) => {
                                    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'festivo'];
                                    return days.indexOf(a) - days.indexOf(b);
                                  }).join(' • ')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteScheduleBlock(blockSchedules)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {blockSchedules.length} día(s) en este bloque
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
