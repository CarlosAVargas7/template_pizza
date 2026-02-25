"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";
import { useLanguage } from "@/hooks/useLanguage";

const posts = [
  {
    slug: "pizza-artesanal-medellin",
    title: "Por qué la pizza artesanal de Medellín es diferente",
    excerpt:
      "La masa de pizza en Antioquia tiene un toque especial: el agua de montaña y la harina seleccionada hacen la diferencia. Descubre por qué cada porción es única.",
    date: "2024-11-15",
    readTime: "5 min",
    category: "Cultura",
    emoji: "🏔️",
    content: `La pizza artesanal de Medellín se distingue por varios factores únicos que la hacen especial en el panorama gastronómico colombiano...`,
  },
  {
    slug: "mejores-pizzas-laureles",
    title: "Las mejores pizzas de Laureles y El Estadio",
    excerpt:
      "Un recorrido por los mejores sabores de pizza disponibles en el barrio más popular de Medellín. Dónde pedir, qué probar y por qué Pizza Antioquia lidera la lista.",
    date: "2024-11-08",
    readTime: "4 min",
    category: "Guías",
    emoji: "🗺️",
    content: `Laureles es uno de los barrios más vibrantes de Medellín, con una oferta gastronómica que no para de crecer...`,
  },
  {
    slug: "maridaje-pizza-bebidas",
    title: "Maridaje perfecto: pizza y bebidas",
    excerpt:
      "¿Coca-Cola o Quatro? ¿Sprite con hawaiana? Descubre cuál bebida complementa mejor cada especialidad de nuestra carta y por qué.",
    date: "2024-10-30",
    readTime: "3 min",
    category: "Tips",
    emoji: "🥤",
    content: `El maridaje de pizza con bebidas es un arte que pocos dominan. En Pizza Antioquia hemos experimentado durante años...`,
  },
  {
    slug: "historia-pizza-colombia",
    title: "La historia de la pizza en Colombia",
    excerpt:
      "Cómo llegó la pizza italiana a Colombia y cómo fue adaptándose al paladar local hasta convertirse en uno de los platos favoritos del país.",
    date: "2024-10-15",
    readTime: "6 min",
    category: "Historia",
    emoji: "📚",
    content: `La pizza llegó a Colombia en la segunda mitad del siglo XX, traída por inmigrantes italianos y adaptada con ingredientes locales...`,
  },
  {
    slug: "pizza-envigado-guide",
    title: "Guía de pizza en Envigado: dónde pedir el mejor domicilio",
    excerpt:
      "Envigado, el municipio más cercano a Medellín, tiene una escena de pizzas cada vez más sofisticada. Aquí nuestra guía completa.",
    date: "2024-10-01",
    readTime: "4 min",
    category: "Guías",
    emoji: "📍",
    content: `Envigado ha crecido exponencialmente en los últimos años, y con ello su oferta gastronómica. La Sucursal Sur de Pizza Antioquia...`,
  },
  {
    slug: "ingredientes-frescos-pizza",
    title: "Por qué los ingredientes frescos marcan la diferencia",
    excerpt:
      "La calidad de una pizza se mide por la calidad de sus ingredientes. Te contamos cómo seleccionamos cada uno de los componentes de nuestra carta.",
    date: "2024-09-20",
    readTime: "3 min",
    category: "Calidad",
    emoji: "🌿",
    content: `En Pizza Antioquia, cada ingrediente pasa por un riguroso proceso de selección antes de llegar a tu pizza...`,
  },
];

const categories = ["Todos", "Cultura", "Guías", "Tips", "Historia", "Calidad"];

export default function BlogClient() {
  const { language } = useLanguage();

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
              {language === "es" ? "Blog Pizzero 🍕" : "Pizza Blog 🍕"}
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              {language === "es"
                ? "Tips, historia y las mejores pizzas de Medellín"
                : "Tips, history and the best pizzas in Medellín"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="h-48 pizza-gradient flex items-center justify-center">
                  <span className="text-7xl">{post.emoji}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-red-50 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                  </div>
                  <h2 className="font-black text-gray-900 text-base mb-2 leading-tight">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-primary font-bold text-xs hover:gap-2 transition-all"
                    >
                      {language === "es" ? "Leer más" : "Read more"}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
