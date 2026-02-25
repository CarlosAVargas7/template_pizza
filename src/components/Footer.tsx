"use client";

import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

// TikTok icon as SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.72a8.18 8.18 0 0 0 4.78 1.52V6.78a4.84 4.84 0 0 1-1.01-.09z" />
    </svg>
  );
}

export default function Footer() {
  const { language } = useStore();
  const tx = t(language);

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full pizza-gradient flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-black">PA</span>
              </div>
              <div>
                <p className="font-black text-xl text-white">Pizza Antioquia</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{tx.footer.tagline}</p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/pizzaantioquia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Pizza Antioquia"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/pizzaantioquia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Pizza Antioquia"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@pizzaantioquia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Pizza Antioquia"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">{tx.footer.links}</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: tx.nav.home },
                { href: "/#menu", label: tx.nav.menu },
                { href: "/nosotros", label: tx.nav.about },
                { href: "/blog", label: tx.nav.blog },
                { href: "/faq", label: tx.nav.faq },
                { href: "/rastrear", label: tx.nav.track },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sucursal Norte */}
          <div>
            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
              {language === "es" ? "Sucursal Norte" : "North Branch"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Cra. 70 #44-10, Laureles, Medellín</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+573145550101" className="hover:text-white transition-colors">
                  +57 314 555 0101
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Lun–Dom: 11am – 10pm</span>
              </li>
            </ul>
          </div>

          {/* Sucursal Sur */}
          <div>
            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
              {language === "es" ? "Sucursal Sur" : "South Branch"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Cll. 37 Sur #43A-15, Envigado</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+573145550202" className="hover:text-white transition-colors">
                  +57 314 555 0202
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Lun–Dom: 11am – 10pm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Pizza Antioquia. {tx.footer.rights}
          </p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="text-gray-500 text-xs hover:text-white transition-colors">
              {tx.footer.privacy}
            </Link>
            <Link href="/terminos" className="text-gray-500 text-xs hover:text-white transition-colors">
              {tx.footer.terms}
            </Link>
            <Link href="/admin" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
