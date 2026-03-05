"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  Star,
  Flame,
  Leaf,
  DollarSign,
  Check,
  AlertCircle,
} from "lucide-react";
import { useStore, Branch } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";
import { useSchedules } from "@/hooks/useSchedules";
import {
  BranchMenu,
  Product,
  OptionGroup,
  Option,
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
  updateDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";

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

interface FormData {
  name: string;
  phone: string;
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
  const { orderModalOpen, setOrderModalOpen, selectedBranch, setSelectedBranch, cookiesAccepted } = useStore();
  const { tx, language } = useLanguage();

  const [step, setStep] = useState(0); // 0: Branch, 1: Menu, 2: Cart, 3: Delivery, 4: Confirmation
  const [branchMenu, setBranchMenu] = useState<BranchMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true); // Start with true to show loading immediately
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
    payment: "wompi",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Helper function to get option names from IDs
  const getOptionNames = (selectedOptions: Record<string, string[]>, menu?: BranchMenu): string[] => {
    if (!menu || !selectedOptions) return [];

    const optionNames: string[] = [];

    menu.categories?.forEach((category) => {
      category.products?.forEach((product) => {
        product.optionGroups?.forEach((group) => {
          if (selectedOptions[group.id]) {
            selectedOptions[group.id].forEach((optionId: string) => {
              const option = group.options.find((opt) => opt.id === optionId);
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

  // Load menu from Firebase
  useEffect(() => {
    if (!orderModalOpen || step < 1 || !selectedBranch) return;
    setLoadingMenu(true);
    const loadMenu = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout loading menu")), 5000);
        });

        const snapPromise = getDoc(doc(db, "menus", selectedBranch));
        const snap = await Promise.race([snapPromise, timeoutPromise]) as any;

        if (snap.exists()) {
          const menuData = snap.data() as BranchMenu;

          // Check if it has new structure with categories
          if (menuData && menuData.categories && Array.isArray(menuData.categories) && menuData.categories.length > 0) {
            // Validate that each category has products
            const validCategories = menuData.categories.filter((cat) =>
              cat && cat.products && Array.isArray(cat.products) && cat.products.length > 0
            );

            if (validCategories.length > 0) {
              setBranchMenu(menuData);
            } else {
              // No valid categories with products, using default
              const { defaultDynamicMenuNorte, defaultDynamicMenuSur } = await import("@/lib/menuData");
              setBranchMenu(selectedBranch === "norte" ? defaultDynamicMenuNorte : defaultDynamicMenuSur);
            }
          } else {
            // Menu has no valid categories, using default
            // Fallback to default if legacy format or empty
            const { defaultDynamicMenuNorte, defaultDynamicMenuSur } = await import("@/lib/menuData");
            setBranchMenu(selectedBranch === "norte" ? defaultDynamicMenuNorte : defaultDynamicMenuSur);
          }
        } else {
          // No menu found in Firebase, using default
          const { defaultDynamicMenuNorte, defaultDynamicMenuSur } = await import("@/lib/menuData");
          setBranchMenu(selectedBranch === "norte" ? defaultDynamicMenuNorte : defaultDynamicMenuSur);
        }
      } catch (error) {
        console.error("Error loading menu:", error);
        // Use defaults
        const { defaultDynamicMenuNorte, defaultDynamicMenuSur } = await import("@/lib/menuData");
        setBranchMenu(selectedBranch === "norte" ? defaultDynamicMenuNorte : defaultDynamicMenuSur);
      } finally {
        setLoadingMenu(false);
      }
    };
    loadMenu();
  }, [orderModalOpen, step, selectedBranch]);

  // Autocomplete from localStorage if cookies accepted
  useEffect(() => {
    if (cookiesAccepted) {
      const savedPhone = localStorage.getItem("pa_phone") || "";
      const savedAddress = localStorage.getItem("pa_address") || "";
      const savedName = localStorage.getItem("pa_name") || "";
      setForm((f) => ({ ...f, phone: savedPhone, address: savedAddress, name: savedName }));
    }
  }, [cookiesAccepted, orderModalOpen]);

  const handleClose = () => {
    setOrderModalOpen(false);
    setStep(0);
    setSelectedBranch(null);
    setCart([]);
    setOrderId(null);
    setForm({ name: "", phone: "", address: "", payment: "wompi" });
  };

  const addToCart = (product: Product, selectedOptions: Record<string, string[]>, quantity: number = 1) => {
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
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calcTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
    const deliveryFee = branchMenu?.deliveryFee || 0;
    return subtotal + deliveryFee;
  };

  const handleSubmitOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error(language === "es" ? "Por favor completa todos los campos" : "Please complete all fields");
      return;
    }

    if (cart.length === 0) {
      toast.error(language === "es" ? "El carrito está vacío" : "Cart is empty");
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
      // Save to localStorage if cookies accepted
      if (cookiesAccepted) {
        localStorage.setItem("pa_name", form.name);
        localStorage.setItem("pa_phone", form.phone);
        localStorage.setItem("pa_address", form.address);
      }

      // Get daily order ID
      if (!selectedBranch) {
        throw new Error("No branch selected");
      }
      const dailyCount = await incrementDailyOrderCount(selectedBranch);
      const dailyOrderId = generateDailyOrderId(dailyCount);

      // Create order in Firebase
      const orderData = {
        dailyOrderId,
        branch: selectedBranch,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          unitPrice: item.totalPrice,
          totalPrice: item.totalPrice * item.quantity,
        })),
        subtotal: cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),
        deliveryFee: branchMenu?.deliveryFee || 0,
        total: calcTotal(),
        paymentMethod: form.payment,
        status: "pendiente",
        createdAt: new Date(),
        estimatedTime: branchMenu?.estimatedTime || "30-45 min",
      };

      const docRef = doc(collection(db, "orders"));
      await setDoc(docRef, orderData);
      setOrderId(docRef.id);

      // If Wompi payment, open Wompi widget
      if (form.payment === "wompi") {
        const wompiKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_xxxxxxxx";
        const ref = `PA-${dailyOrderId.replace('#', '')}`;
        const amountInCents = calcTotal() * 100;
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiKey}&currency=COP&amount-in-cents=${amountInCents}&reference=${ref}`;
        window.location.href = wompiUrl;
      } else {
        setStep(4);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(language === "es" ? "Error al enviar pedido" : "Error submitting order");
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
                {selectedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
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
              />
            )}
            {step === 4 && (
              <ConfirmationStep
                orderId={orderId}
                form={form}
                cart={cart}
                branchMenu={branchMenu}
                onClose={handleClose}
                language={language}
              />
            )}
          </div>

          {/* Footer with action buttons */}
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

// Branch Step Component
function BranchStep({
  selectedBranch,
  onBranchSelect,
  language,
}: {
  selectedBranch: string | null;
  onBranchSelect: (branch: "norte" | "sur") => void;
  language: string;
}) {
  const { tx } = useLanguage();
  const [detecting, setDetecting] = useState(false);

  // Get schedules for both branches
  const norteSchedules = useSchedules("norte");
  const surSchedules = useSchedules("sur");

  const detectBranch = useCallback(async () => {
    if (!navigator.geolocation) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Medellín Norte approx center: 6.25, -75.57
        // If lat > 6.21 → Norte, else → Sur
        const branch = latitude > 6.21 ? "norte" : "sur";
        onBranchSelect(branch);
        setDetecting(false);
        toast.success(
          language === "es"
            ? `Sucursal ${branch === "norte" ? "Norte" : "Sur"} detectada automáticamente`
            : `Branch ${branch === "norte" ? "North" : "South"} detected automatically`
        );
      },
      () => {
        setDetecting(false);
        toast.error(language === "es" ? "No se pudo detectar tu ubicación" : "Could not detect your location");
      },
      { timeout: 10000 }
    );
  }, [onBranchSelect, language]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="font-black text-gray-900 mb-2">{tx.branches.title}</h3>
        <p className="text-gray-600 text-sm">{tx.branches.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["norte", "sur"] as const).map((branch) => {
          const data = tx.branches[branch];
          const isSelected = selectedBranch === branch;
          return (
            <button
              key={branch}
              onClick={() => onBranchSelect(branch)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${isSelected
                ? "border-primary bg-red-50"
                : "border-white bg-white shadow-sm hover:shadow-md"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{data.name}</h4>
                  <p className="text-sm text-gray-600">{data.area}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {data.address}
                </p>
                <p className="text-gray-700">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {data.phone}
                </p>
                <p className="text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {branch === "norte" ?
                    (norteSchedules.loading ? "Cargando horarios..." :
                      norteSchedules.isStoreOpen() ?
                        `Abierto ahora - Cierra a las ${norteSchedules.getCurrentDaySchedule()?.closeTime}` :
                        `Cerrado - ${norteSchedules.getNextOpeningTime()}`
                    ) :
                    (surSchedules.loading ? "Cargando horarios..." :
                      surSchedules.isStoreOpen() ?
                        `Abierto ahora - Cierra a las ${surSchedules.getCurrentDaySchedule()?.closeTime}` :
                        `Cerrado - ${surSchedules.getNextOpeningTime()}`
                    )
                  }
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={detectBranch}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {detecting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              {tx.branches.detecting}
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              {tx.branches.detect}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Menu Step Component
function MenuStep({
  branchMenu,
  loadingMenu,
  onAddToCart,
  language,
}: {
  branchMenu: BranchMenu | null;
  loadingMenu: boolean;
  onAddToCart: (product: Product, selectedOptions: Record<string, string[]>) => void;
  language: string;
}) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  if (loadingMenu) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando menú...</p>
      </div>
    );
  }

  if (!branchMenu) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No se pudo cargar el menú</p>
      </div>
    );
  }

  if (!branchMenu.categories || !Array.isArray(branchMenu.categories)) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">El menú no tiene categorías válidas</p>
      </div>
    );
  }

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="font-black text-gray-900 mb-2">{branchMenu.name}</h3>
        <p className="text-gray-600 text-sm">{branchMenu.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {branchMenu.estimatedTime}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Domicilio: {formatCOP(branchMenu.deliveryFee)}
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Mínimo: {formatCOP(branchMenu.minOrderAmount)}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {branchMenu.categories.map((category) => (
          <div key={category.id}>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">{category.name}</h4>
            <p className="text-gray-600 text-sm mb-4">{category.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.products
                .filter((product) => product.status === "available")
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isExpanded={expandedProducts.has(product.id)}
                    onToggle={() => toggleProduct(product.id)}
                    onAddToCart={onAddToCart}
                    language={language}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  isExpanded,
  onToggle,
  onAddToCart,
  language,
}: {
  product: Product;
  isExpanded: boolean;
  onToggle: () => void;
  onAddToCart: (product: Product, selectedOptions: Record<string, string[]>, quantity: number) => void;
  language: string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Initialize default selections
    const defaults: Record<string, string[]> = {};
    product.optionGroups.forEach((group) => {
      if (group.required && group.type === "radio") {
        defaults[group.id] = [group.options[0]?.id || ""];
      }
    });
    setSelectedOptions(defaults);
  }, [product]);

  const handleOptionChange = (groupId: string, optionId: string, type: "radio" | "checkbox") => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev };
      if (type === "radio") {
        newOptions[groupId] = [optionId];
      } else {
        const current = newOptions[groupId] || [];
        if (current.includes(optionId)) {
          newOptions[groupId] = current.filter((id) => id !== optionId);
        } else {
          newOptions[groupId] = [...current, optionId];
        }
      }
      return newOptions;
    });
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedOptions, quantity);
    setQuantity(1);
    onToggle(); // Close product card
  };

  const totalPrice = calculateProductPrice(product, selectedOptions) * quantity;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-bold text-gray-900">{product.name}</h5>
              <div className="flex items-center gap-1">
                {product.popular && <Star className="w-4 h-4 text-yellow-500" />}
                {product.spicy && <Flame className="w-4 h-4 text-red-500" />}
                {product.vegetarian && <Leaf className="w-4 h-4 text-green-500" />}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-black text-primary text-lg">{formatCOP(product.basePrice)}</span>
              {product.preparationTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {product.preparationTime}min
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="w-full py-2 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors text-sm"
        >
          {isExpanded ? "Ocultar opciones" : "Ver opciones"}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {product.optionGroups.map((group) => (
              <div key={group.id}>
                <h6 className="font-semibold text-gray-900 mb-2 text-sm">
                  {group.name}
                  {group.required && <span className="text-red-500 ml-1">*</span>}
                  {group.minSelections > 0 && (
                    <span className="text-gray-500 text-xs ml-1">
                      (Mín: {group.minSelections}, Máx: {group.maxSelections})
                    </span>
                  )}
                </h6>
                <div className="space-y-2">
                  {group.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type={group.type}
                          name={group.id}
                          checked={(selectedOptions[group.id] || []).includes(option.id)}
                          onChange={() => handleOptionChange(group.id, option.id, group.type)}
                          className="rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.name}</span>
                          {option.description && (
                            <p className="text-xs text-gray-500">{option.description}</p>
                          )}
                        </div>
                      </div>
                      {option.extraPrice > 0 && (
                        <span className="text-sm font-semibold text-primary">
                          +{formatCOP(option.extraPrice)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity selector */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total:</p>
                <p className="font-black text-primary text-lg">{formatCOP(totalPrice)}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 pizza-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Cart Step Component
function CartStep({
  cart,
  onUpdateQuantity,
  onRemove,
  onContinue,
  onBack,
  language,
  branchMenu,
}: {
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  language: string;
  branchMenu: BranchMenu | null | undefined;
}) {
  // Helper function to get option names from IDs
  const getOptionNames = (selectedOptions: Record<string, string[]>, menu?: BranchMenu): string[] => {
    if (!menu || !selectedOptions) return [];

    const optionNames: string[] = [];

    menu.categories?.forEach((category) => {
      category.products?.forEach((product) => {
        product.optionGroups?.forEach((group) => {
          if (selectedOptions[group.id]) {
            selectedOptions[group.id].forEach((optionId: string) => {
              const option = group.options.find((opt) => opt.id === optionId);
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
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  return (
    <div className="p-6">
      <h3 className="font-bold text-gray-900 mb-4">Tu Carrito</h3>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Tu carrito está vacío</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                  <p className="text-sm text-gray-600 mb-1">
                    {item.product.description || "Sin descripción"}
                  </p>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <p className="text-xs text-gray-500 mb-1">
                      {getOptionNames(item.selectedOptions, branchMenu || undefined).join(", ") || Object.values(item.selectedOptions).flat().join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{formatCOP(item.totalPrice)} c/u</p>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="font-bold text-primary">
                  {formatCOP(item.totalPrice * item.quantity)}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-900">Subtotal:</span>
              <span className="font-bold">{formatCOP(subtotal)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
        >
          Volver al Menú
        </button>
        <button
          onClick={onContinue}
          disabled={cart.length === 0}
          className="flex-1 py-3 pizza-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// Delivery Step Component
function DeliveryStep({
  form,
  setForm,
  cart,
  branchMenu,
  onContinue,
  onBack,
  language,
}: {
  form: FormData;
  setForm: (form: FormData) => void;
  cart: CartItem[];
  branchMenu: BranchMenu | null;
  onContinue: () => void;
  onBack: () => void;
  language: string;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  const deliveryFee = branchMenu?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="p-6">
      <h3 className="font-bold text-gray-900 mb-4">Datos de Entrega</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Nombre completo *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            <Phone className="w-4 h-4 inline mr-1" />
            Teléfono *
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="300 000 0000"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            <MapPin className="w-4 h-4 inline mr-1" />
            Dirección de entrega *
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Calle, número, barrio, referencias..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            <CreditCard className="w-4 h-4 inline mr-1" />
            Forma de pago *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="wompi"
                checked={form.payment === "wompi"}
                onChange={(e) => setForm({ ...form, payment: e.target.value as "wompi" | "cash" })}
                className="rounded"
              />
              <div>
                <p className="font-medium text-sm">Pago en línea</p>
                <p className="text-xs text-gray-500">Tarjeta, PSE, Nequi</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={form.payment === "cash"}
                onChange={(e) => setForm({ ...form, payment: e.target.value as "wompi" | "cash" })}
                className="rounded"
              />
              <div>
                <p className="font-medium text-sm">Contra entrega</p>
                <p className="text-xs text-gray-500">Efectivo</p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Domicilio:</span>
              <span>{formatCOP(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">{formatCOP(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
        >
          Volver
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3 pizza-gradient text-white font-bold rounded-xl hover:opacity-90"
        >
          Confirmar Pedido
        </button>
      </div>
    </div>
  );
}

// Confirmation Step Component
function ConfirmationStep({
  orderId,
  form,
  cart,
  branchMenu,
  onClose,
  language,
}: {
  orderId: string | null;
  form: FormData;
  cart: CartItem[];
  branchMenu: BranchMenu | null;
  onClose: () => void;
  language: string;
}) {
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>

      <h3 className="font-black text-gray-900 text-xl mb-2">
        {language === "es" ? "¡Pedido Confirmado!" : "Order Confirmed!"}
      </h3>

      <p className="text-gray-600 mb-4">
        {language === "es"
          ? "Tu pedido ha sido recibido y está siendo preparado."
          : "Your order has been received and is being prepared."}
      </p>

      {orderId && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-500 mb-1">Número de pedido:</p>
          <p className="font-mono font-bold text-primary">#{orderId.substring(0, 8).toUpperCase()}</p>
        </div>
      )}

      <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Detalles de entrega:</h4>
        <p className="text-sm text-gray-700"><strong>Nombre:</strong> {form.name}</p>
        <p className="text-sm text-gray-700"><strong>Teléfono:</strong> {form.phone}</p>
        <p className="text-sm text-gray-700"><strong>Dirección:</strong> {form.address}</p>
        <p className="text-sm text-gray-700"><strong>Tiempo estimado:</strong> {branchMenu?.estimatedTime || "30-45 min"}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            onClose();
            window.location.href = `/rastrear?phone=${form.phone}`;
          }}
          className="flex-1 py-3 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5"
        >
          {language === "es" ? "Rastrear Pedido" : "Track Order"}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 pizza-gradient text-white font-bold rounded-xl hover:opacity-90"
        >
          {language === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
    </div>
  );
}
