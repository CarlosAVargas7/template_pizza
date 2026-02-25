"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { language, setLanguage, setOrderModalOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tx = t(language);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: tx.nav.home },
    { href: "/#menu", label: tx.nav.menu },
    { href: "/nosotros", label: tx.nav.about },
    { href: "/blog", label: tx.nav.blog },
    { href: "/faq", label: tx.nav.faq },
    { href: "/rastrear", label: tx.nav.track },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full pizza-gradient flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-white text-lg font-black">PA</span>
            </div>
            <div className="hidden sm:block">
              <span className={`font-black text-lg ${scrolled ? "text-gray-900" : "text-white"}`}>
                Pizza
              </span>
              <span className="font-black text-lg text-primary ml-1">Antioquia</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  scrolled ? "text-gray-700" : "text-white/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg transition-all hover:bg-white/20 ${
                scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white"
              }`}
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "es" ? "EN" : "ES"}</span>
            </button>

            {/* Order Button */}
            <Button
              onClick={() => setOrderModalOpen(true)}
              className="pizza-gradient text-white font-bold px-4 py-2 rounded-full shadow-lg hover:opacity-90 transition-all pulse-ring hidden sm:flex items-center gap-2"
              size="sm"
            >
              <ShoppingBag className="w-4 h-4" />
              {tx.hero.cta}
            </Button>

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-red-50 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setOrderModalOpen(true);
                }}
                className="w-full pizza-gradient text-white font-bold py-3 rounded-xl mt-2"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {tx.hero.cta}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
