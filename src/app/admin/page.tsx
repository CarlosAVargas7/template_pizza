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
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  MessageCircle,
  RefreshCw,
  Store,
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
  getDoc,
  deleteDoc,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import {
  defaultMenuNorte,
  defaultMenuSur,
  BranchMenu,
  MenuSize,
  MenuSpecialty,
  MenuDrink,
  formatCOP,
} from "@/lib/menuData";
import { OrderStatus } from "@/lib/store";
import { toast } from "sonner";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: { label: "Confirmado", color: "text-green-700", bg: "bg-green-100" },
  preparacion: { label: "En Preparación", color: "text-orange-700", bg: "bg-orange-100" },
  despachado: { label: "Despachado", color: "text-blue-700", bg: "bg-blue-100" },
};
const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "preparacion", "despachado"];

interface Order {
  id: string;
  branch: string;
  customerName: string;
  phone: string;
  address: string;
  status: OrderStatus;
  total: number;
  createdAt: Timestamp;
  paymentMethod: string;
  item: {
    size: string;
    specialty: string;
    drink: string;
    quantity: number;
    notes?: string;
    condiments?: string[];
  };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"orders" | "menu">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredBranch, setFilteredBranch] = useState<"all" | "norte" | "sur">("all");
  const [filteredStatus, setFilteredStatus] = useState<"all" | OrderStatus>("all");
  const [menuNorte, setMenuNorte] = useState<BranchMenu>(defaultMenuNorte);
  const [menuSur, setMenuSur] = useState<BranchMenu>(defaultMenuSur);
  const [menuBranch, setMenuBranch] = useState<"norte" | "sur">("norte");
  const [editingMenu, setEditingMenu] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Load orders from Firebase
  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    });
    return () => unsub();
  }, [authed]);

  // Load menus from Firebase
  const loadMenus = useCallback(async () => {
    try {
      const nSnap = await getDoc(doc(db, "menus", "norte"));
      if (nSnap.exists()) setMenuNorte(nSnap.data() as BranchMenu);
      const sSnap = await getDoc(doc(db, "menus", "sur"));
      if (sSnap.exists()) setMenuSur(sSnap.data() as BranchMenu);
    } catch {
      // Use defaults
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

  const saveMenu = async () => {
    setSavingMenu(true);
    try {
      const menu = menuBranch === "norte" ? menuNorte : menuSur;
      await setDoc(doc(db, "menus", menuBranch), menu);
      toast.success(`Menú ${menuBranch === "norte" ? "Norte" : "Sur"} guardado`);
      setEditingMenu(false);
    } catch {
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
  const setCurrentMenu = menuBranch === "norte" ? setMenuNorte : setMenuSur;

  const whatsappLink = (order: Order) => {
    const branch = order.branch === "norte" ? "+573145550101" : "+573145550202";
    const msg = encodeURIComponent(
      `Hola ${order.customerName}, tu pedido #${order.id.substring(0, 6).toUpperCase()} está ${STATUS_LABELS[order.status].label.toLowerCase()}. Total: ${formatCOP(order.total)}.`
    );
    return `https://wa.me/${branch.replace("+", "")}?text=${msg}`;
  };

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
            <h1 className="font-black text-gray-900">Admin Dashboard</h1>
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
          {(["orders", "menu"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "orders" ? <Package className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              {t === "orders" ? `Pedidos (${orders.length})` : "Gestión de Menú"}
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
              {filteredOrders.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay pedidos</p>
                </div>
              )}
              {filteredOrders.map((order) => {
                const sc = STATUS_LABELS[order.status];
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
                            <span className="font-mono text-xs text-gray-400">#{order.id.substring(0, 8).toUpperCase()}</span>
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

                      {/* Order details */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
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

                        {/* WhatsApp */}
                        <a
                          href={whatsappLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-xl hover:bg-green-100 transition-colors border border-green-200"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
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
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      menuBranch === b ? "pizza-gradient text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"
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
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingMenu(false); loadMenus(); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={saveMenu}
                      disabled={savingMenu}
                      className="flex items-center gap-2 px-4 py-2.5 pizza-gradient text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      {savingMenu ? "Guardando..." : "Guardar"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Base Price */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  💰 Precio Base
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={currentMenu.basePrice}
                    disabled={!editingMenu}
                    onChange={(e) =>
                      setCurrentMenu({ ...currentMenu, basePrice: parseInt(e.target.value) || 0 })
                    }
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <span className="text-sm text-gray-400">COP</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-gray-900 mb-4">📝 Descripción</h3>
                <textarea
                  value={currentMenu.description}
                  disabled={!editingMenu}
                  onChange={(e) => setCurrentMenu({ ...currentMenu, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              {/* Sizes */}
              <MenuSection
                title="📏 Tamaños"
                items={currentMenu.sizes}
                editing={editingMenu}
                renderItem={(item: MenuSize, i: number) => (
                  <div className="flex gap-2 items-center">
                    <input
                      value={item.label}
                      disabled={!editingMenu}
                      onChange={(e) => {
                        const sizes = [...currentMenu.sizes];
                        sizes[i] = { ...sizes[i], label: e.target.value };
                        setCurrentMenu({ ...currentMenu, sizes });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">+$</span>
                      <input
                        type="number"
                        value={item.extraPrice}
                        disabled={!editingMenu}
                        onChange={(e) => {
                          const sizes = [...currentMenu.sizes];
                          sizes[i] = { ...sizes[i], extraPrice: parseInt(e.target.value) || 0 };
                          setCurrentMenu({ ...currentMenu, sizes });
                        }}
                        className="w-20 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    {editingMenu && (
                      <button
                        onClick={() => {
                          const sizes = currentMenu.sizes.filter((_, j) => j !== i);
                          setCurrentMenu({ ...currentMenu, sizes });
                        }}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                onAdd={
                  editingMenu
                    ? () =>
                        setCurrentMenu({
                          ...currentMenu,
                          sizes: [...currentMenu.sizes, { id: `size${Date.now()}`, label: "Nuevo tamaño", extraPrice: 0 }],
                        })
                    : undefined
                }
              />

              {/* Specialties */}
              <MenuSection
                title="🍕 Especialidades"
                items={currentMenu.specialties}
                editing={editingMenu}
                renderItem={(item: MenuSpecialty, i: number) => (
                  <div className="flex gap-2 items-center">
                    <input
                      value={item.label}
                      disabled={!editingMenu}
                      onChange={(e) => {
                        const sps = [...currentMenu.specialties];
                        sps[i] = { ...sps[i], label: e.target.value };
                        setCurrentMenu({ ...currentMenu, specialties: sps });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">+$</span>
                      <input
                        type="number"
                        value={item.extraPrice}
                        disabled={!editingMenu}
                        onChange={(e) => {
                          const sps = [...currentMenu.specialties];
                          sps[i] = { ...sps[i], extraPrice: parseInt(e.target.value) || 0 };
                          setCurrentMenu({ ...currentMenu, specialties: sps });
                        }}
                        className="w-20 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    {editingMenu && (
                      <button
                        onClick={() => {
                          const sps = currentMenu.specialties.filter((_, j) => j !== i);
                          setCurrentMenu({ ...currentMenu, specialties: sps });
                        }}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                onAdd={
                  editingMenu
                    ? () =>
                        setCurrentMenu({
                          ...currentMenu,
                          specialties: [
                            ...currentMenu.specialties,
                            { id: `spec${Date.now()}`, label: "Nueva especialidad", extraPrice: 0 },
                          ],
                        })
                    : undefined
                }
              />

              {/* Drinks */}
              <div className="lg:col-span-2">
                <MenuSection
                  title="🥤 Bebidas"
                  items={currentMenu.drinks}
                  editing={editingMenu}
                  renderItem={(item: MenuDrink, i: number) => (
                    <div className="flex gap-2 items-center">
                      <input
                        value={item.label}
                        disabled={!editingMenu}
                        onChange={(e) => {
                          const drinks = [...currentMenu.drinks];
                          drinks[i] = { ...drinks[i], label: e.target.value };
                          setCurrentMenu({ ...currentMenu, drinks });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          value={item.price}
                          disabled={!editingMenu}
                          onChange={(e) => {
                            const drinks = [...currentMenu.drinks];
                            drinks[i] = { ...drinks[i], price: parseInt(e.target.value) || 0 };
                            setCurrentMenu({ ...currentMenu, drinks });
                          }}
                          className="w-20 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                        />
                      </div>
                      {editingMenu && (
                        <button
                          onClick={() => {
                            const drinks = currentMenu.drinks.filter((_, j) => j !== i);
                            setCurrentMenu({ ...currentMenu, drinks });
                          }}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  onAdd={
                    editingMenu
                      ? () =>
                          setCurrentMenu({
                            ...currentMenu,
                            drinks: [
                              ...currentMenu.drinks,
                              { id: `drink${Date.now()}`, label: "Nueva bebida", price: 6000 },
                            ],
                          })
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuSection<T>({
  title,
  items,
  editing,
  renderItem,
  onAdd,
}: {
  title: string;
  items: T[];
  editing: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-gray-900">{title}</h3>
        {editing && onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-red-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i}>{renderItem(item, i)}</div>
        ))}
      </div>
    </div>
  );
}
