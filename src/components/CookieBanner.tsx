"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";

export default function CookieBanner() {
  const { cookiesAccepted, setCookiesAccepted, cookieBannerShown, setCookieBannerShown } = useStore();
  const { tx } = useLanguage();
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookies_accepted");
    if (stored !== null) {
      setCookiesAccepted(stored === "true");
      setCookieBannerShown(true);
    }
  }, [setCookiesAccepted, setCookieBannerShown]);

  const handleAccept = () => {
    localStorage.setItem("cookies_accepted", "true");
    setCookiesAccepted(true);
    setCookieBannerShown(true);
  };

  const handleReject = () => {
    localStorage.setItem("cookies_accepted", "false");
    setCookiesAccepted(false);
    setCookieBannerShown(true);
  };

  if (cookieBannerShown) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {!showConfig ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <p className="text-gray-700 text-sm flex-1 leading-relaxed">
                {tx.cookies.message}
              </p>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleReject}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {tx.cookies.reject}
                </button>
                <button
                  onClick={() => setShowConfig(true)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  {tx.cookies.configure}
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white pizza-gradient rounded-xl hover:opacity-90 transition-opacity"
                >
                  {tx.cookies.accept}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Configurar Cookies</h3>
                <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Cookies esenciales</p>
                    <p className="text-xs text-gray-500">Necesarias para el funcionamiento del sitio</p>
                  </div>
                  <div className="w-10 h-5 bg-green-500 rounded-full flex items-center justify-end px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Cookies de preferencias</p>
                    <p className="text-xs text-gray-500">Guardan tu dirección y pedidos favoritos</p>
                  </div>
                  <button
                    onClick={handleAccept}
                    className="w-10 h-5 bg-gray-300 rounded-full flex items-center px-0.5 hover:bg-primary transition-colors"
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Cookies analíticas</p>
                    <p className="text-xs text-gray-500">Ayudan a mejorar la experiencia (GA4)</p>
                  </div>
                  <button
                    onClick={handleAccept}
                    className="w-10 h-5 bg-gray-300 rounded-full flex items-center px-0.5 hover:bg-primary transition-colors"
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Rechazar todas
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2.5 text-sm font-bold text-white pizza-gradient rounded-xl hover:opacity-90 transition-opacity"
                >
                  Guardar preferencias
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
