import { OrderStatus } from "@/lib/store";

export const STATUS_LABELS: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: {
    label: "Confirmado",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  preparacion: {
    label: "En Preparación",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  despachado: {
    label: "Despachado",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  "pre-orden": {
    label: "Pre-orden",
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
};

export const STATUSES: OrderStatus[] = [
  "pendiente",
  "confirmado",
  "preparacion",
  "despachado",
  "pre-orden",
];
