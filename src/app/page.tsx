"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  Star,
  ChevronDown,
  Clock,
  Truck,
  Shield,
  Leaf,
  ChevronRight,
  Phone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";
import { useSchedules } from "@/hooks/useSchedules";
import { useState } from "react";

// Pizza SVG Illustration
function PizzaIllustration() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Plate */}
      <circle cx="150" cy="155" r="130" fill="#f5e6d3" opacity="0.3" />
      {/* Pizza base */}
      <circle cx="150" cy="150" r="120" fill="#f4a460" />
      {/* Crust */}
      <circle cx="150" cy="150" r="120" fill="none" stroke="#c8834a" strokeWidth="15" />
      {/* Sauce */}
      <circle cx="150" cy="150" r="104" fill="#c0392b" />
      {/* Cheese */}
      <circle cx="150" cy="150" r="100" fill="#f9d56e" opacity="0.9" />
      {/* Toppings */}
      <circle cx="150" cy="110" r="10" fill="#c0392b" />
      <circle cx="180" cy="130" r="8" fill="#27ae60" />
      <circle cx="120" cy="140" r="9" fill="#c0392b" />
      <circle cx="165" cy="165" r="10" fill="#8b4513" />
      <circle cx="135" cy="170" r="8" fill="#c0392b" />
      <circle cx="155" cy="185" r="7" fill="#27ae60" />
      <circle cx="175" cy="150" r="6" fill="#8b4513" />
      <circle cx="130" cy="155" r="7" fill="#c0392b" />
      {/* Slice lines */}
      <line x1="150" y1="30" x2="150" y2="270" stroke="#c8834a" strokeWidth="2" opacity="0.5" />
      <line x1="37" y1="93" x2="263" y2="207" stroke="#c8834a" strokeWidth="2" opacity="0.5" />
      <line x1="37" y1="207" x2="263" y2="93" stroke="#c8834a" strokeWidth="2" opacity="0.5" />
      {/* Steam */}
      <path d="M130 20 Q135 10 130 0" stroke="white" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M150 15 Q155 5 150 -5" stroke="white" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M170 20 Q175 10 170 0" stroke="white" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

const blogPosts = [
  {
    slug: "pizza-artesanal-medellin",
    title: "Por qué la pizza artesanal de Medellín es diferente",
    excerpt: "La masa de pizza en Antioquia tiene un toque especial: el agua de montaña y la harina seleccionada hacen la diferencia.",
    date: "2024-11-15",
    readTime: "5 min",
    category: "Cultura",
  },
  {
    slug: "mejores-pizzas-laureles",
    title: "Las mejores pizzas de Laureles y El Estadio",
    excerpt: "Un recorrido por los mejores sabores de pizza disponibles en el barrio más popular de Medellín.",
    date: "2024-11-08",
    readTime: "4 min",
    category: "Guías",
  },
  {
    slug: "maridaje-pizza-bebidas",
    title: "Maridaje perfecto: pizza y bebidas",
    excerpt: "¿Coca-Cola o Quatro? Descubre cuál bebida complementa mejor cada especialidad de nuestra carta.",
    date: "2024-10-30",
    readTime: "3 min",
    category: "Tips",
  },
];

export default function HomePage() {
  const { setOrderModalOpen } = useStore();
  const { tx, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Get schedules for both branches
  const norteSchedules = useSchedules("norte");
  const surSchedules = useSchedules("sur");

  const features = [
    { icon: Leaf, ...tx.features.items[0] },
    { icon: Truck, ...tx.features.items[1] },
    { icon: Clock, ...tx.features.items[2] },
    { icon: Shield, ...tx.features.items[3] },
  ];

  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      {/* ====== HERO ====== */}
      <section className="hero-bg min-h-screen flex items-center relative overflow-hidden" aria-label="Hero">
        {/* Background circles */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/30"
              >
                {tx.hero.badge}
              </motion.span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                {tx.hero.title.split(" ").slice(0, 2).join(" ")}{" "}
                <span className="text-yellow-300">{tx.hero.title.split(" ").slice(2, 4).join(" ")}</span>{" "}
                {tx.hero.title.split(" ").slice(4).join(" ")}
              </h1>

              <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
                {tx.hero.subtitle}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-white/80 text-sm">4.9 · +500 pedidos</span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 relative z-10 pointer-events-auto">
                <button
                  onClick={() => setOrderModalOpen(true)}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-2xl hover:scale-105 transition-transform pulse-ring text-lg"
                  aria-label="Hacer pedido de pizza"
                >
                  <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  {tx.hero.cta}
                </button>
                <Link
                  href="/rastrear"
                  className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  <MapPin className="w-5 h-5" />
                  {tx.hero.track}
                </Link>
              </div>

              {/* Branch phones */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a href="tel:+573145550101" className="flex items-center gap-2 text-white/70 text-sm hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-white/50" />
                  Norte: +57 314 555 0101
                </a>
                <a href="tel:+573145550202" className="flex items-center gap-2 text-white/70 text-sm hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-white/50" />
                  Sur: +57 314 555 0202
                </a>
              </div>
            </motion.div>

            {/* Pizza Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-96 h-96">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-300 rounded-full" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 drop-shadow-2xl"
                >
                  <PizzaIllustration />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll down */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-20 bg-white" id="features" aria-label="Características">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{tx.features.title}</h2>
            <div className="w-16 h-1.5 pizza-gradient rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="w-14 h-14 pizza-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MENU PREVIEW / SPECIALTIES ====== */}
      <section className="py-20 pizza-gradient-soft" id="menu" aria-label="Menú">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{tx.menu.title}</h2>
            <div className="w-16 h-1.5 pizza-gradient rounded-full mx-auto mb-4" />
            <p className="text-gray-500 max-w-xl mx-auto">
              {language === "es"
                ? "Pizza cubierta con masa especial artesanal, salsa casera y queso mozzarella premium."
                : "Pizza with special artisanal dough, homemade sauce, and premium mozzarella cheese."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              {
                name: language === "es" ? "Hawaiana Artesanal" : "Artisanal Hawaiian",
                desc: language === "es" ? "Jamón, piña, queso mozzarella y salsa especial" : "Ham, pineapple, mozzarella and special sauce",
                emoji: "🍍",
                badge: language === "es" ? "Más pedida" : "Best seller",
              },
              {
                name: language === "es" ? "Americana" : "American",
                desc: language === "es" ? "Carne molida, cebolla, pimentón y queso doble" : "Ground beef, onion, bell pepper and double cheese",
                emoji: "🧀",
                badge: null,
              },
              {
                name: "Carnis",
                desc: language === "es" ? "Salami, jamón, tocineta y queso mozzarella" : "Salami, ham, bacon and mozzarella",
                emoji: "🥩",
                badge: null,
              },
              {
                name: language === "es" ? "Pollo con Champiñón" : "Chicken & Mushroom",
                desc: language === "es" ? "Pollo al ajillo, champiñones y salsa bechamel" : "Garlic chicken, mushrooms and béchamel sauce",
                emoji: "🍄",
                badge: language === "es" ? "Chef recomienda" : "Chef's pick",
              },
              {
                name: language === "es" ? "Peperoni y Queso" : "Pepperoni & Cheese",
                desc: language === "es" ? "Doble peperoni, queso mozzarella y queso parmesano" : "Double pepperoni, mozzarella and parmesan",
                emoji: "🌶️",
                badge: null,
              },
              {
                name: language === "es" ? "Personaliza tu Pizza" : "Customize Your Pizza",
                desc: language === "es" ? "Elige tamaño, especialidad, condimentos y bebida a tu gusto" : "Choose size, specialty, condiments and drink to your liking",
                emoji: "✨",
                badge: null,
                isCta: true,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`card-hover p-6 rounded-2xl border ${(item as { isCta?: boolean }).isCta
                  ? "border-primary bg-primary/5 cursor-pointer"
                  : "border-white bg-white shadow-sm"
                  }`}
                onClick={(item as { isCta?: boolean }).isCta ? () => setOrderModalOpen(true) : undefined}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{item.emoji}</span>
                  {item.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 pizza-gradient text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
                {(item as { isCta?: boolean }).isCta && (
                  <button className="mt-4 flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all">
                    {language === "es" ? "Ordenar Ahora" : "Order Now"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Sizes pricing */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="font-black text-gray-900 text-lg mb-4 text-center">
              {language === "es" ? "Tamaños y Precios" : "Sizes & Prices"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl text-center">
                <div className="text-3xl mb-2">🍕</div>
                <p className="font-bold text-gray-900">{language === "es" ? "Mediana" : "Medium"}</p>
                <p className="text-xs text-gray-500 mb-2">{language === "es" ? "6 porciones" : "6 slices"}</p>
                <p className="text-xl font-black text-primary">$35.000</p>
              </div>
              <div className="p-4 pizza-gradient rounded-2xl text-center">
                <div className="text-3xl mb-2">🍕</div>
                <p className="font-bold text-white">{language === "es" ? "Grande" : "Large"}</p>
                <p className="text-xs text-white/80 mb-2">{language === "es" ? "8 porciones" : "8 slices"}</p>
                <p className="text-xl font-black text-white">$42.000</p>
              </div>
            </div>
            <button
              onClick={() => setOrderModalOpen(true)}
              className="w-full mt-6 py-4 pizza-gradient text-white font-black rounded-2xl hover:opacity-90 transition-opacity text-lg shadow-lg"
            >
              🍕 {tx.hero.cta}
            </button>
          </div>
        </div>
      </section>

      {/* ====== BRANCHES / GOOGLE MAPS ====== */}
      <section className="py-20 bg-white" id="sucursales" aria-label="Sucursales">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              {language === "es" ? "Nuestras Sucursales" : "Our Branches"}
            </h2>
            <div className="w-16 h-1.5 pizza-gradient rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Norte */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <div className="bg-gray-100 h-64 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3!2d-75.5936!3d6.2527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTUnMDkuNyJOIDc1wrAzNSczNy4wIlc!5e0!3m2!1ses!2sco!4v1699999999999!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sucursal Norte – Laureles"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full pizza-gradient flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900">
                    {tx.branches.norte.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-1">{tx.branches.norte.address}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-sm text-gray-500">
                    {norteSchedules.loading ? "Cargando horarios..." :
                      norteSchedules.isStoreOpen() ?
                        `Abierto ahora - Cierra a las ${norteSchedules.getCurrentDaySchedule()?.closeTime}` :
                        `Cerrado - ${norteSchedules.getNextOpeningTime()}`
                    }
                  </p>
                </div>
                <a href="tel:+573145550101" className="text-sm text-primary font-medium hover:underline">
                  {tx.branches.norte.phone}
                </a>
              </div>
            </motion.div>

            {/* Sur */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <div className="bg-gray-100 h-64 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.5!2d-75.5897!3d6.1726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTAnMjEuNCJOIDc1wrAzNScyMy4xIlc!5e0!3m2!1ses!2sco!4v1699999999999!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sucursal Sur – Envigado"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full pizza-gradient flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900">
                    {tx.branches.sur.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-1">{tx.branches.sur.address}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-sm text-gray-500">
                    {surSchedules.loading ? "Cargando horarios..." :
                      surSchedules.isStoreOpen() ?
                        `Abierto ahora - Cierra a las ${surSchedules.getCurrentDaySchedule()?.closeTime}` :
                        `Cerrado - ${surSchedules.getNextOpeningTime()}`
                    }
                  </p>
                </div>
                <a href="tel:+573145550202" className="text-sm text-primary font-medium hover:underline">
                  {tx.branches.sur.phone}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="py-20 bg-gray-50" aria-label="Testimonios">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{tx.testimonials.title}</h2>
            <div className="w-16 h-1.5 pizza-gradient rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tx.testimonials.items.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full pizza-gradient flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{t.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="py-20 bg-white" id="faq" aria-label="Preguntas frecuentes">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{tx.faq.title}</h2>
            <div className="w-16 h-1.5 pizza-gradient rounded-full mx-auto" />
          </motion.div>

          <div className="space-y-3">
            {tx.faq.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 ml-3 transition-transform ${openFaq === i ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-4"
                  >
                    <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== BLOG PREVIEW ====== */}
      <section className="py-20 bg-gray-50" aria-label="Blog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{tx.blog.title}</h2>
              <div className="w-16 h-1.5 pizza-gradient rounded-full" />
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all"
            >
              {language === "es" ? "Ver todos" : "See all"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="h-48 pizza-gradient flex items-center justify-center relative overflow-hidden">
                  <span className="text-6xl">🍕</span>
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold px-2 py-1 bg-white/90 text-primary rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-black text-gray-900 text-base mb-2 leading-tight">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all"
                  >
                    {tx.blog.readMore}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA Banner ====== */}
      <section className="hero-bg py-20 relative overflow-hidden" aria-label="CTA">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 text-9xl">🍕</div>
          <div className="absolute bottom-0 right-1/4 text-9xl">🍕</div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
              {language === "es" ? "¿Tienes hambre ahora?" : "Hungry right now?"}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {language === "es"
                ? "Haz tu pedido en menos de 2 minutos. Entregamos en tu puerta."
                : "Place your order in under 2 minutes. We deliver to your door."}
            </p>
            <button
              onClick={() => setOrderModalOpen(true)}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary font-black rounded-2xl shadow-2xl hover:scale-105 transition-transform text-xl pulse-ring"
            >
              <ShoppingBag className="w-7 h-7" />
              {tx.hero.cta}
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
