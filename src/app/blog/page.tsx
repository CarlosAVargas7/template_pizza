import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog Pizzero | Pizza Antioquia",
  description:
    "Tips de pizza, recetas, la mejor pizza de Medellín y guías sobre domicilios de pizza en Laureles y Envigado. Blog de Pizza Antioquia.",
  keywords: ["blog pizza Medellín", "mejor pizza Medellín", "pizza artesanal recetas", "domicilios pizza Antioquia"],
  openGraph: {
    title: "Blog | Pizza Antioquia",
    description: "Tips, historia y las mejores pizzas de Medellín.",
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
