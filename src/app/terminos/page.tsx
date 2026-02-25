"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";

export default function TerminosPage() {
  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      <div className="hero-bg pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-black text-white">Términos y Condiciones</h1>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose">
          <h2>1. Servicio de domicilios</h2>
          <p>
            Pizza Antioquia ofrece servicio de domicilios de pizzas y bebidas en las zonas de cobertura definidas para cada sucursal. Los tiempos de entrega son estimados y pueden variar según la demanda y condiciones climáticas.
          </p>

          <h2>2. Pedidos y cancelaciones</h2>
          <p>
            Una vez confirmado un pedido, no es posible cancelarlo. Si hay algún problema con tu pedido, comunícate inmediatamente al número de la sucursal correspondiente.
          </p>

          <h2>3. Pagos</h2>
          <p>
            Los pagos en línea se procesan a través de Wompi, una plataforma certificada y segura. Pizza Antioquia no almacena información de tarjetas de crédito.
          </p>

          <h2>4. Zona de cobertura</h2>
          <p>
            La Sucursal Norte cubre Laureles, Estadio, Belén y norte de Medellín. La Sucursal Sur cubre Envigado, El Poblado y sur de Medellín. Los límites exactos pueden variar.
          </p>

          <h2>5. Modificaciones al servicio</h2>
          <p>
            Pizza Antioquia se reserva el derecho de modificar el menú, precios y términos de servicio en cualquier momento, notificando con anticipación razonable.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Para cualquier consulta: info@pizzaantioquia.com o +57 314 555 0101.
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
