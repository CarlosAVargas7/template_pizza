"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Clock, Tag, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import OrderModal from "@/components/OrderModal";
import { useStore } from "@/lib/store";

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  emoji: string;
  content: string;
}

export default function BlogPostClient({ post }: { post: Post }) {
  const { setOrderModalOpen } = useStore();

  // Render markdown-like content
  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-2xl font-black text-gray-900 mt-8 mb-3">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 text-gray-600 text-base leading-relaxed list-disc">
            <span dangerouslySetInnerHTML={{ __html: line.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </li>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p
          key={i}
          className="text-gray-600 text-base leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
          }}
        />
      );
    });
  };

  return (
    <>
      <Navbar />
      <OrderModal />
      <CookieBanner />

      <article className="min-h-screen">
        {/* Hero */}
        <div className="hero-bg pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Blog
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-white/20 text-white rounded-full backdrop-blur-sm">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {post.category}
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
                <span className="text-xs text-white/60">{post.date}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-white/80 text-lg">{post.description}</p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl text-center mb-8"
            >
              {post.emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-red max-w-none space-y-4"
            >
              {renderContent(post.content)}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-6 pizza-gradient rounded-3xl text-center"
            >
              <p className="text-white font-black text-xl mb-2">¿Te dio hambre? 🍕</p>
              <p className="text-white/80 text-sm mb-4">Pide tu pizza artesanal ahora mismo</p>
              <button
                onClick={() => setOrderModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-black rounded-2xl hover:scale-105 transition-transform shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Ordenar Ahora
              </button>
            </motion.div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
