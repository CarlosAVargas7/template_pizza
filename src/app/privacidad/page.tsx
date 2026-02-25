"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      <div className="hero-bg pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-black text-white">Política de Privacidad</h1>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose">
          <h2>1. Información que recopilamos</h2>
          <p>
            Pizza Antioquia recopila información personal como nombre, número de teléfono y dirección de entrega únicamente cuando realizas un pedido. Esta información es necesaria para procesar y entregar tu pedido.
          </p>

          <h2>2. Uso de cookies</h2>
          <p>
            Utilizamos cookies para guardar tu dirección de entrega y número de teléfono en tu dispositivo local (localStorage), únicamente si has aceptado el uso de cookies. Esto te permite agilizar futuros pedidos.
          </p>
          <p>
            También utilizamos cookies de Google Analytics 4 para entender cómo los usuarios interactúan con nuestro sitio web y mejorar la experiencia.
          </p>

          <h2>3. Compartición de datos</h2>
          <p>
            No vendemos ni compartimos tu información personal con terceros, excepto con las plataformas de pago (Wompi) necesarias para procesar transacciones.
          </p>

          <h2>4. Seguridad</h2>
          <p>
            Tus datos son almacenados de forma segura en Firebase (Google Cloud) y protegidos con encriptación en tránsito.
          </p>

          <h2>5. Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación de tus datos personales contactándonos en: privacidad@pizzaantioquia.com
          </p>

          <h2>6. Contacto</h2>
          <p>
            Para cualquier pregunta sobre privacidad, contáctanos en: privacidad@pizzaantioquia.com o al +57 314 555 0101.
          </p>

          <p className="text-sm text-gray-400 mt-8">
            Última actualización: Noviembre 2024
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
