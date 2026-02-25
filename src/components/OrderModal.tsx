"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Navigation,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Phone,
  User,
  Home,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";
import { useStore, Branch } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";
import {
  defaultMenuNorte,
  defaultMenuSur,
  condiments,
  BranchMenu,
  formatCOP,
} from "@/lib/menuData";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";

type ModalStep = "branch" | "menu" | "delivery" | "confirmation";

interface FormData {
  name: string;
  phone: string;
  address: string;
  payment: "wompi" | "cash";
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

  const [step, setStep] = useState<ModalStep>("branch");
  const [detecting, setDetecting] = useState(false);
  const [branchMenu, setBranchMenu] = useState<BranchMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Order state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedCondiments, setSelectedCondiments] = useState<string[]>([]);
  const [selectedDrink, setSelectedDrink] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Delivery form
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
    payment: "wompi",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Autocomplete from localStorage if cookies accepted
  useEffect(() => {
    if (cookiesAccepted) {
      const savedPhone = localStorage.getItem("pa_phone") || "";
      const savedAddress = localStorage.getItem("pa_address") || "";
      const savedName = localStorage.getItem("pa_name") || "";
      setForm((f) => ({ ...f, phone: savedPhone, address: savedAddress, name: savedName }));
    }
  }, [cookiesAccepted, orderModalOpen]);

  // Load menu from Firebase when branch selected
  useEffect(() => {
    if (!selectedBranch) return;
    setLoadingMenu(true);

    const fetchMenu = async () => {
      try {
        const docRef = doc(db, "menus", selectedBranch);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setBranchMenu(snap.data() as BranchMenu);
        } else {
          setBranchMenu(selectedBranch === "norte" ? defaultMenuNorte : defaultMenuSur);
        }
      } catch {
        setBranchMenu(selectedBranch === "norte" ? defaultMenuNorte : defaultMenuSur);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [selectedBranch]);

  const detectBranch = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Medellín Norte approx center: 6.25, -75.57
        // Envigado approx center: 6.17, -75.57
        // If lat > 6.21 → Norte, else → Sur
        const branch: Branch = latitude > 6.21 ? "norte" : "sur";
        setSelectedBranch(branch);
        setDetecting(false);
        toast.success(
          language === "es"
            ? `Sucursal ${branch === "norte" ? "Norte" : "Sur"} seleccionada automáticamente`
            : `${branch === "norte" ? "North" : "South"} Branch auto-selected`
        );
      },
      () => {
        setDetecting(false);
        toast.error(language === "es" ? "No se pudo detectar la ubicación" : "Location detection failed");
      },
      { timeout: 10000 }
    );
  }, [setSelectedBranch, language]);

  const calcTotal = () => {
    if (!branchMenu || !selectedSize || !selectedSpecialty) return 0;
    const size = branchMenu.sizes.find((s) => s.id === selectedSize);
    const specialty = branchMenu.specialties.find((s) => s.id === selectedSpecialty);
    const drink = branchMenu.drinks.find((d) => d.id === selectedDrink);
    const base = branchMenu.basePrice;
    const sizeExtra = size?.extraPrice ?? 0;
    const specialtyExtra = specialty?.extraPrice ?? 0;
    const drinkPrice = drink?.price ?? 0;
    return (base + sizeExtra + specialtyExtra + drinkPrice) * quantity;
  };

  const handleSubmitOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error(language === "es" ? "Por favor completa todos los campos" : "Please complete all fields");
      return;
    }

    setSubmitting(true);

    try {
      // Save to localStorage if cookies accepted
      if (cookiesAccepted) {
        localStorage.setItem("pa_name", form.name);
        localStorage.setItem("pa_phone", form.phone);
        localStorage.setItem("pa_address", form.address);
      }

      const orderData = {
        branch: selectedBranch,
        item: {
          size: selectedSize,
          specialty: selectedSpecialty,
          condiments: selectedCondiments,
          drink: selectedDrink,
          quantity,
          notes,
          price: calcTotal(),
        },
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        paymentMethod: form.payment,
        status: "pendiente",
        total: calcTotal(),
        createdAt: serverTimestamp(),
        language,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderId(docRef.id);

      // If Wompi payment, open Wompi widget
      if (form.payment === "wompi") {
        const wompiKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_xxxxxxxx";
        const ref = `PA-${docRef.id.substring(0, 8).toUpperCase()}`;
        const amountInCents = calcTotal() * 100;
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiKey}&currency=COP&amount-in-cents=${amountInCents}&reference=${ref}`;
        window.open(wompiUrl, "_blank");
      }

      setStep("confirmation");
      toast.success(
        language === "es" ? "¡Pedido recibido! Pronto lo confirmaremos." : "Order received! We'll confirm it soon."
      );
    } catch (err) {
      console.error(err);
      toast.error(language === "es" ? "Error al procesar el pedido. Intenta nuevamente." : "Error processing order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep("branch");
    setSelectedBranch(null);
    setSelectedSize("");
    setSelectedSpecialty("");
    setSelectedCondiments([]);
    setSelectedDrink("");
    setQuantity(1);
    setNotes("");
    setOrderId("");
    setBranchMenu(null);
  };

  const handleClose = () => {
    setOrderModalOpen(false);
    setTimeout(resetModal, 300);
  };

  const canGoToMenu = selectedBranch !== null;
  const canGoToDelivery = selectedSize && selectedSpecialty && selectedDrink;

  if (!orderModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full pizza-gradient flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-black text-gray-900 text-lg">{tx.order.modalTitle}</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Progress Steps */}
          {step !== "confirmation" && (
            <div className="flex items-center px-5 pt-4 pb-2 gap-2">
              {(["branch", "menu", "delivery"] as const).map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s
                        ? "bg-primary text-white"
                        : ["menu", "delivery"].indexOf(step) > i
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {["menu", "delivery"].indexOf(step) > i ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <div className="ml-1.5 hidden sm:block">
                    <p className={`text-xs font-medium ${step === s ? "text-primary" : "text-gray-400"}`}>
                      {[tx.order.step1, tx.order.step2, tx.order.step3][i]}
                    </p>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${["menu", "delivery"].indexOf(step) > i ? "bg-green-500" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* STEP 1: Branch Selection */}
            {step === "branch" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{tx.branches.title}</h3>
                  <p className="text-sm text-gray-500">{tx.branches.subtitle}</p>
                </div>

                {/* Auto-detect */}
                <button
                  onClick={detectBranch}
                  disabled={detecting}
                  className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary hover:bg-red-50 transition-all group"
                >
                  {detecting ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  )}
                  <span className="text-sm font-medium text-gray-600 group-hover:text-primary">
                    {detecting ? tx.branches.detecting : tx.branches.detect}
                  </span>
                </button>

                {/* Branch Cards */}
                {(["norte", "sur"] as Branch[]).map((branch) => {
                  const data = tx.branches[branch!];
                  const isSelected = selectedBranch === branch;
                  return (
                    <button
                      key={branch}
                      onClick={() => setSelectedBranch(branch)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-red-50"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 ${
                              isSelected ? "pizza-gradient" : "bg-gray-100"
                            }`}
                          >
                            <MapPin className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isSelected ? "text-primary" : "text-gray-900"}`}>
                              {data.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{data.area}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{data.address}</p>
                            <p className="text-xs text-gray-400">{data.hours}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: Menu */}
            {step === "menu" && (
              <div className="space-y-5">
                {loadingMenu ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : branchMenu ? (
                  <>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-xs text-gray-600">{branchMenu.description}</p>
                      <p className="text-xs font-bold text-primary mt-1">{tx.order.basePrice}: {formatCOP(branchMenu.basePrice)}</p>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        {tx.menu.size} <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {branchMenu.sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                              selectedSize === size.id
                                ? "border-primary bg-red-50 text-primary font-semibold"
                                : "border-gray-100 hover:border-gray-200 text-gray-700"
                            }`}
                          >
                            {size.label}
                            {size.extraPrice > 0 && (
                              <span className="text-xs ml-1 text-gray-400">+{formatCOP(size.extraPrice)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        {tx.menu.specialty} <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {branchMenu.specialties.map((spec) => (
                          <button
                            key={spec.id}
                            onClick={() => setSelectedSpecialty(spec.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                              selectedSpecialty === spec.id
                                ? "border-primary bg-red-50 text-primary font-semibold"
                                : "border-gray-100 hover:border-gray-200 text-gray-700"
                            }`}
                          >
                            {spec.label}
                            {spec.extraPrice > 0 && (
                              <span className="text-xs ml-1 text-gray-400">+{formatCOP(spec.extraPrice)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Condiments */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">{tx.menu.condiments}</label>
                      <div className="flex flex-wrap gap-2">
                        {condiments.map((c) => (
                          <button
                            key={c.id}
                            onClick={() =>
                              setSelectedCondiments((prev) =>
                                prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                              )
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedCondiments.includes(c.id)
                                ? "bg-primary text-white border-primary"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Drink */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        {tx.menu.drink} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {branchMenu.drinks.map((drink) => (
                          <button
                            key={drink.id}
                            onClick={() => setSelectedDrink(drink.id)}
                            className={`text-left px-3 py-2.5 rounded-xl border-2 text-xs transition-all ${
                              selectedDrink === drink.id
                                ? "border-primary bg-red-50 text-primary font-semibold"
                                : "border-gray-100 hover:border-gray-200 text-gray-700"
                            }`}
                          >
                            {drink.label}
                            {drink.price > 0 && (
                              <span className="text-gray-400 ml-1">+{formatCOP(drink.price)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">{tx.menu.notes}</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: Sin cebolla, más salsa..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">{tx.menu.quantity}</label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-black text-gray-900 w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {calcTotal() > 0 && (
                          <div className="ml-auto">
                            <p className="text-xs text-gray-500">{tx.order.total}</p>
                            <p className="text-lg font-black text-primary">{formatCOP(calcTotal())}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* STEP 3: Delivery */}
            {step === "delivery" && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedBranch === "norte" ? tx.branches.norte.name : tx.branches.sur.name}
                    {" · "}
                    {formatCOP(calcTotal())}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    <User className="w-4 h-4 inline mr-1" />
                    {tx.delivery.name} *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {tx.delivery.phone} *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="300 000 0000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    <Home className="w-4 h-4 inline mr-1" />
                    {tx.delivery.address} *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Calle 50 #80-10, Apto 301"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Payment */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {tx.delivery.payment} *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setForm({ ...form, payment: "wompi" })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        form.payment === "wompi"
                          ? "border-primary bg-red-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 ${form.payment === "wompi" ? "text-primary" : "text-gray-400"}`} />
                      <span className={`text-xs font-semibold ${form.payment === "wompi" ? "text-primary" : "text-gray-600"}`}>
                        {tx.delivery.paymentOnline}
                      </span>
                    </button>
                    <button
                      onClick={() => setForm({ ...form, payment: "cash" })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        form.payment === "cash"
                          ? "border-primary bg-red-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Banknote className={`w-6 h-6 ${form.payment === "cash" ? "text-primary" : "text-gray-400"}`} />
                      <span className={`text-xs font-semibold ${form.payment === "cash" ? "text-primary" : "text-gray-600"}`}>
                        {tx.delivery.paymentCash}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Total summary */}
                <div className="p-4 bg-gray-900 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{tx.order.total}</span>
                    <span className="text-white font-black text-xl">{formatCOP(calcTotal())}</span>
                  </div>
                  {form.payment === "wompi" && (
                    <p className="text-gray-400 text-xs mt-1">
                      {language === "es"
                        ? "Se abrirá la página de pago Wompi al confirmar"
                        : "Wompi payment page will open on confirm"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Confirmation */}
            {step === "confirmation" && (
              <div className="flex flex-col items-center text-center py-6 gap-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center"
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {language === "es" ? "¡Pedido Recibido!" : "Order Received!"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {language === "es"
                      ? "Tu pedido ha sido enviado. Te contactaremos al"
                      : "Your order was sent. We'll contact you at"}
                  </p>
                  <p className="text-primary font-bold">{form.phone}</p>
                </div>

                {orderId && (
                  <div className="p-4 bg-gray-50 rounded-2xl w-full">
                    <p className="text-xs text-gray-500 mb-1">ID de pedido</p>
                    <p className="font-mono font-bold text-gray-900 text-sm">{orderId}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => {
                      handleClose();
                      window.location.href = `/rastrear?phone=${form.phone}`;
                    }}
                    className="w-full py-3 pizza-gradient text-white font-bold rounded-xl"
                  >
                    {language === "es" ? "Rastrear mi Pedido" : "Track My Order"}
                  </button>
                  <button
                    onClick={() => {
                      resetModal();
                      setStep("branch");
                    }}
                    className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {language === "es" ? "Hacer otro pedido" : "Place another order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {step !== "confirmation" && (
            <div className="p-5 border-t border-gray-100 flex gap-3">
              {step !== "branch" && (
                <button
                  onClick={() => {
                    if (step === "menu") setStep("branch");
                    if (step === "delivery") setStep("menu");
                  }}
                  className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {tx.order.back}
                </button>
              )}
              <button
                disabled={
                  (step === "branch" && !canGoToMenu) ||
                  (step === "menu" && !canGoToDelivery) ||
                  submitting
                }
                onClick={() => {
                  if (step === "branch") setStep("menu");
                  else if (step === "menu") setStep("delivery");
                  else if (step === "delivery") handleSubmitOrder();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 pizza-gradient text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tx.delivery.submitting}
                  </>
                ) : step === "delivery" ? (
                  <>{tx.delivery.submit}</>
                ) : (
                  <>
                    {tx.order.next}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
