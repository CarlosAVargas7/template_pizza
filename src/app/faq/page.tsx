import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes (FAQ)",
  description:
    "Resuelve tus dudas sobre Pizza Antioquia: tiempos de entrega, zonas de cobertura, métodos de pago, personalización y rastreo de pedidos.",
  keywords: ["FAQ pizza Medellín", "domicilio pizza preguntas", "pizza Antioquia ayuda"],
};

export default function FaqPage() {
  return <FaqClient />;
}
