import type { Metadata } from "next";
import NosotrosClient from "./NosotrosClient";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description:
    "Conoce la historia de Pizza Antioquia, nuestro compromiso con la pizza artesanal y la calidad en cada domicilio a Medellín, Laureles y Envigado.",
  keywords: ["pizza artesanal Medellín historia", "sobre Pizza Antioquia", "domicilios pizza Medellín"],
  openGraph: {
    title: "Sobre Nosotros | Pizza Antioquia",
    description: "La historia detrás de la mejor pizza artesanal a domicilio en Medellín.",
  },
};

export default function NosotrosPage() {
  return <NosotrosClient />;
}
