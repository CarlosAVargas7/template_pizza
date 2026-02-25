"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";

export default function FaqClient() {
  const { setOrderModalOpen } = useStore();
  const { tx, language } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      <div className="hero-bg pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{tx.faq.title}</h1>
            <p className="text-white/80 text-lg">
              {language === "es"
                ? "Todo lo que necesitas saber sobre nuestro servicio"
                : "Everything you need to know about our service"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            {tx.faq.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 ml-3 transition-transform ${
                      open === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-5 pb-5 pt-1"
                  >
                    <p className="text-gray-500 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">
              {language === "es" ? "¿Tienes más preguntas? ¡Pide tu pizza ya!" : "Have more questions? Order your pizza now!"}
            </p>
            <button
              onClick={() => setOrderModalOpen(true)}
              className="inline-flex items-center gap-3 px-8 py-4 pizza-gradient text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-6 h-6" />
              {language === "es" ? "Ordenar Ahora" : "Order Now"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
