import { Timestamp } from "firebase/firestore";
import { OrderStatus } from "@/lib/store";

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  branch: "norte" | "sur";
  active: boolean;
  createdAt: Timestamp;
}

export interface AdminOrder {
  id: string;
  dailyOrderId?: string; // ID corto diario (#001, #002)
  branch: string;
  customerName: string;
  phone: string;
  address: string;
  status: OrderStatus;
  total: number;
  deliveryFee?: number; // Tarifa de domicilio
  original_total?: number; // Ventas brutas antes de descuentos
  discount_applied?: number; // Descuentos aplicados
  createdAt: Timestamp;
  paymentMethod: string;
  deliveryPersonId?: string; // ID del domiciliario asignado
  dispatchedAt?: Timestamp; // Fecha de despacho
  items?: any[]; // New dynamic order structure
  // Legacy support
  item?: {
    size: string;
    specialty: string;
    drink: string;
    quantity: number;
    notes?: string;
    condiments?: string[];
  };
}
