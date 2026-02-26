"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, ChefHat, Truck, Check, Phone, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";
import { useLanguage } from "@/hooks/useLanguage";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { formatCOP } from "@/lib/menuData";
import { OrderStatus } from "@/lib/store";

interface Order {
  id: string;
  branch: string;
  customerName: string;
  phone: string;
  address: string;
  status: OrderStatus;
  total: number;
  createdAt: Timestamp;
  item: {
    size: string;
    specialty: string;
    drink: string;
    quantity: number;
    notes: string;
  };
  paymentMethod: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; labelEn: string; color: string; step: number }
> = {
  pendiente: { label: "Pedido Recibido", labelEn: "Order Received", color: "bg-yellow-400", step: 0 },
  confirmado: { label: "Confirmado", labelEn: "Confirmed", color: "bg-green-500", step: 1 },
  preparacion: { label: "En Preparación", labelEn: "Preparing", color: "bg-orange-500", step: 2 },
  despachado: { label: "Despachado", labelEn: "Dispatched", color: "bg-blue-500", step: 3 },
};

function TrackingContent() {
  const params = useSearchParams();
  const { tx, language } = useLanguage();
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchOrders = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      // Limpiar el número de teléfono: remover espacios, guiones, paréntesis
      const cleanPhone = phone.trim().replace(/\s+/g, '').replace(/[-()]/g, '');

      console.log("🔍 Buscando con teléfono original:", phone);
      console.log("🔍 Buscando con teléfono limpio:", cleanPhone);

      // Primero intentar con el número exacto como lo guardó el usuario
      let q = query(
        collection(db, "orders"),
        where("phone", "==", phone.trim()),
        orderBy("createdAt", "desc")
      );

      let snap = await getDocs(q);

      // Si no encuentra, intentar con el número limpio
      if (snap.empty && cleanPhone !== phone.trim()) {
        console.log("🔄 Reintentando con teléfono limpio...");
        q = query(
          collection(db, "orders"),
          where("phone", "==", cleanPhone),
          orderBy("createdAt", "desc")
        );
        snap = await getDocs(q);
      }

      // Si todavía no encuentra, buscar todos y filtrar por similitud
      if (snap.empty) {
        console.log("🔄 Buscando todos los pedidos para filtrar manualmente...");
        const allQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const allSnap = await getDocs(allQuery);

        const filteredOrders = allSnap.docs.filter(doc => {
          const docPhone = doc.data().phone?.replace(/\s+/g, '').replace(/[-()]/g, '') || '';
          return docPhone.includes(cleanPhone) || cleanPhone.includes(docPhone);
        });

        console.log(`📊 Encontrados ${filteredOrders.length} pedidos por similitud`);
        setOrders(
          filteredOrders.map(doc => ({ id: doc.id, ...doc.data() } as Order))
        );
      } else {
        console.log(`📊 Encontrados ${snap.size} pedidos exactos`);
        setOrders(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
        );
      }
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
      // If Firebase not configured, show demo
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("phone")) searchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { icon: Package, label: tx.tracking.steps.received, color: "text-yellow-500 bg-yellow-50 border-yellow-200" },
    { icon: ChefHat, label: tx.tracking.steps.preparing, color: "text-orange-500 bg-orange-50 border-orange-200" },
    { icon: Truck, label: tx.tracking.steps.dispatched, color: "text-blue-500 bg-blue-50 border-blue-200" },
  ];

  const getStepForStatus = (status: OrderStatus) => STATUS_CONFIG[status]?.step ?? 0;

  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      {/* Hero */}
      <div className="hero-bg pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{tx.tracking.title}</h1>
            <p className="text-white/80 mb-8">{tx.tracking.subtitle}</p>

            {/* Search bar */}
            <div className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchOrders()}
                  placeholder="300 000 0000"
                  className="w-full pl-10 pr-4 py-3.5 bg-white rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
              <button
                onClick={searchOrders}
                disabled={loading}
                className="px-5 py-3.5 bg-white text-primary font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Search className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {searched && !loading && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🍕</div>
              <h3 className="font-black text-gray-900 text-xl mb-2">
                {language === "es" ? "No encontramos pedidos" : "No orders found"}
              </h3>
              <p className="text-gray-500 text-sm">
                {language === "es"
                  ? "Verifica que el número sea correcto o haz un nuevo pedido."
                  : "Check the number is correct or place a new order."}
              </p>
            </motion.div>
          )}

          {orders.map((order, idx) => {
            const step = getStepForStatus(order.status);
            const statusConfig = STATUS_CONFIG[order.status];
            const createdDate = order.createdAt?.toDate?.();

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm mb-6 overflow-hidden"
              >
                {/* Order header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-0.5">#{order.id.substring(0, 8).toUpperCase()}</p>
                      <h3 className="font-black text-gray-900">{order.customerName}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {language === "es"
                          ? order.branch === "norte" ? "Sucursal Norte" : "Sucursal Sur"
                          : order.branch === "norte" ? "North Branch" : "South Branch"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white ${statusConfig.color}`}
                      >
                        {language === "es" ? statusConfig.label : statusConfig.labelEn}
                      </span>
                      <p className="text-lg font-black text-primary mt-1">{formatCOP(order.total)}</p>
                    </div>
                  </div>
                  {createdDate && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {createdDate.toLocaleString("es-CO")}
                    </div>
                  )}
                </div>

                {/* Progress Steps */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-6 relative">
                    {/* Progress line */}
                    <div className="absolute left-8 right-8 top-5 h-1 bg-gray-100 rounded-full z-0">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((step / 2) * 100, 100)}%`,
                          background: step >= 3 ? "#3b82f6" : step >= 2 ? "#f97316" : "#eab308",
                        }}
                      />
                    </div>

                    {steps.map((s, i) => {
                      const done = step > i;
                      const active = step === i || (step >= 3 && i === 2);
                      return (
                        <div key={i} className="flex flex-col items-center gap-2 z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done
                                ? "bg-green-500 border-green-500 text-white"
                                : active
                                  ? `border-current text-current ${s.color}`
                                  : "bg-white border-gray-200 text-gray-300"
                              }`}
                          >
                            {done ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <s.icon className="w-5 h-5" />
                            )}
                          </div>
                          <p
                            className={`text-xs font-semibold text-center max-w-16 ${done ? "text-green-600" : active ? "text-gray-900" : "text-gray-400"
                              }`}
                          >
                            {s.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order details */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === "es" ? "Especialidad" : "Specialty"}:</span>
                      <span className="font-medium text-gray-900 capitalize">{order.item?.specialty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === "es" ? "Tamaño" : "Size"}:</span>
                      <span className="font-medium text-gray-900 capitalize">{order.item?.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === "es" ? "Cantidad" : "Qty"}:</span>
                      <span className="font-medium text-gray-900">{order.item?.quantity}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === "es" ? "Entrega" : "Delivery"}:</span>
                      <span className="font-medium text-gray-900 text-right max-w-48 truncate">{order.address}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === "es" ? "Pago" : "Payment"}:</span>
                      <span className="font-medium text-gray-900">
                        {order.paymentMethod === "wompi"
                          ? language === "es" ? "Pago en línea" : "Online payment"
                          : language === "es" ? "Contra entrega" : "Cash on delivery"}
                      </span>
                    </div>
                    {order.item?.notes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{language === "es" ? "Notas" : "Notes"}:</span>
                        <span className="font-medium text-gray-700 italic text-right max-w-48">{order.item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <TrackingContent />
    </Suspense>
  );
}
