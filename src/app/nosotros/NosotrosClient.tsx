"use client";

import { motion } from "framer-motion";
import { Heart, Award, Users, MapPin, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/hooks/useLanguage";

export default function NosotrosClient() {
  const { setOrderModalOpen } = useStore();
  const { language } = useLanguage();

  const values = [
    { icon: Heart, title: language === "es" ? "Pasión" : "Passion", desc: language === "es" ? "Cada pizza es elaborada con amor y dedicación por nuestro equipo." : "Each pizza is made with love and dedication by our team." },
    { icon: Award, title: language === "es" ? "Calidad" : "Quality", desc: language === "es" ? "Solo ingredientes frescos y seleccionados para cada orden." : "Only fresh, selected ingredients for every order." },
    { icon: Users, title: language === "es" ? "Comunidad" : "Community", desc: language === "es" ? "Somos parte del tejido social de Medellín y Envigado." : "We are part of the social fabric of Medellín and Envigado." },
    { icon: MapPin, title: language === "es" ? "Local" : "Local", desc: language === "es" ? "Apoyamos proveedores locales y la economía antioqueña." : "We support local suppliers and the Antioquian economy." },
  ];

  const timeline = [
    { year: "2018", event: language === "es" ? "Fundación de la primera sucursal en Laureles" : "Founded first branch in Laureles" },
    { year: "2020", event: language === "es" ? "Lanzamiento de domicilios en línea" : "Launch of online delivery service" },
    { year: "2022", event: language === "es" ? "Apertura de la Sucursal Sur en Envigado" : "Opening of South Branch in Envigado" },
    { year: "2024", event: language === "es" ? "+10.000 pizzas entregadas y creciendo" : "+10,000 pizzas delivered and growing" },
  ];

  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      {/* Hero */}
      <div className="hero-bg pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              {language === "es" ? "Sobre Nosotros" : "About Us"}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              {language === "es"
                ? "La historia de una pizzería artesanal que nació en el corazón de Medellín con amor por los ingredientes y la comunidad."
                : "The story of an artisan pizzeria born in the heart of Medellín with love for ingredients and community."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                {language === "es" ? "Nuestra Historia" : "Our Story"}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {language === "es"
                    ? "Pizza Antioquia nació en 2018 en el barrio Laureles de Medellín, con una misión simple: ofrecer pizzas artesanales de primera calidad directamente a la puerta de los hogares antioqueños."
                    : "Pizza Antioquia was born in 2018 in the Laureles neighborhood of Medellín, with a simple mission: to offer top-quality artisanal pizzas directly to the doors of Antioquian homes."}
                </p>
                <p>
                  {language === "es"
                    ? "Comenzamos con una sola sucursal y un equipo de 5 personas apasionadas por la gastronomía italiana adaptada al paladar colombiano. Nuestra masa especial estofada, elaborada diariamente, se convirtió rápidamente en nuestra firma."
                    : "We started with a single branch and a team of 5 people passionate about Italian cuisine adapted to the Colombian palate. Our special braised dough, prepared daily, quickly became our signature."}
                </p>
                <p>
                  {language === "es"
                    ? "Hoy contamos con dos sucursales que cubren gran parte del Valle de Aburrá, y seguimos creciendo gracias a la confianza de miles de familias medellinenses que nos eligen cada semana."
                    : "Today we have two branches covering a large part of the Aburrá Valley, and we continue to grow thanks to the trust of thousands of Medellín families who choose us every week."}
                </p>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-red-100" />
              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-5 pl-12 relative"
                  >
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full pizza-gradient flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-black">🍕</span>
                    </div>
                    <div>
                      <p className="font-black text-primary text-sm">{item.year}</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 pizza-gradient-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              {language === "es" ? "Nuestros Valores" : "Our Values"}
            </h2>
            <div className="w-16 h-1.5 pizza-gradient rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-white card-hover"
              >
                <div className="w-12 h-12 pizza-gradient rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team stats */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { n: "+10K", label: language === "es" ? "Pizzas entregadas" : "Pizzas delivered" },
              { n: "2", label: language === "es" ? "Sucursales" : "Branches" },
              { n: "4.9★", label: language === "es" ? "Calificación promedio" : "Average rating" },
              { n: "+500", label: language === "es" ? "Clientes felices" : "Happy customers" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-4xl font-black text-gradient mb-1">{stat.n}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-bg py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            {language === "es" ? "¿Listo para probarla?" : "Ready to try it?"}
          </h2>
          <p className="text-white/80 mb-8">
            {language === "es"
              ? "Únete a miles de familias que ya disfrutan de nuestras pizzas cada semana."
              : "Join thousands of families already enjoying our pizzas every week."}
          </p>
          <button
            onClick={() => setOrderModalOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            <ShoppingBag className="w-6 h-6" />
            {language === "es" ? "Ordenar Ahora" : "Order Now"}
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}
