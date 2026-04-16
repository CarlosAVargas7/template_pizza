import { Timestamp } from "firebase/firestore";

// ─── CUPONES ────────────────────────────────────────────────

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY";

export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface ValidHours {
  from: string; // "16:00"
  to: string; // "18:00"
}

export interface BranchUsage {
  used_count: number;
  total_revenue: number; // suma de order.total de órdenes que usaron el cupón
  discount_given: number; // suma de descuentos otorgados
}

export interface CampaignHistory {
  campaign_id: string; // unix timestamp del valid_from como string
  valid_from: Timestamp;
  expires_at: Timestamp;
  usage_by_branch: Record<string, BranchUsage>;
  closed_at: Timestamp;
}

export interface Coupon {
  id: string; // Firestore document ID
  code: string; // "PIZZA20" — uppercase único
  description: string; // nota interna del admin
  discount_type: DiscountType;
  discount_value: number; // 20 (%) | 10000 (pesos) | 0 (free delivery)
  min_order_value: number; // mínimo del subtotal para aplicar
  usage_limit: number; // usos totales globales permitidos
  usage_limit_per_phone: number; // usos por número de teléfono (1 = único)
  expires_at: Timestamp | null; // null = sin vencimiento
  valid_from: Timestamp | null; // inicio de campaña activa
  campaign_history: CampaignHistory[]; // historial de campañas anteriores
  valid_hours: ValidHours | null; // null = todas las horas
  status: CouponStatus;
  branches: string[]; // ["norte", "sur"] donde aplica
  usage_by_branch: Record<string, BranchUsage>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Formulario de creación/edición (sin campos autogenerados)
export interface CouponFormData {
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  usage_limit: number;
  usage_limit_per_phone: number;
  expires_at: string; // string para input date, "" = sin vencimiento
  valid_from: string; // string para input date, "" = sin fecha de inicio
  valid_hours_enabled: boolean;
  valid_hours_from: string;
  valid_hours_to: string;
  status: CouponStatus;
  branches: string[];
}

// ─── USO DE CUPONES ─────────────────────────────────────────

export interface CouponUsage {
  coupon_id: string;
  coupon_code: string;
  branch: string;
  phone: string;
  used_at: Timestamp;
  order_id: string;
  discount_applied: number;
  order_total_before: number; // total antes del descuento
  order_total_after: number; // total después del descuento
}

// ─── RESULTADO DE VALIDACIÓN DE CUPÓN ───────────────────────

export type CouponValidationError =
  | "NOT_FOUND"
  | "INACTIVE"
  | "EXPIRED"
  | "USAGE_LIMIT_REACHED"
  | "PHONE_LIMIT_REACHED"
  | "MIN_ORDER_NOT_MET"
  | "BRANCH_NOT_ALLOWED"
  | "OUTSIDE_VALID_HOURS"
  | "CAMPAIGN_NOT_STARTED"; // válido desde fecha futura

export interface CouponValidationResult {
  valid: boolean;
  error?: CouponValidationError;
  discount_amount?: number; // monto calculado del descuento
  final_total?: number; // total después del descuento
  coupon?: Coupon; // el cupón si es válido
}

// ─── CLIENTES / CRM ─────────────────────────────────────────

export type CRMSegment = "active" | "at_risk" | "inactive";

export interface Customer {
  phone: string; // también es el document ID
  name: string;
  email: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: Timestamp;
  last_order_branch: string;
  branches_used: string[];
  first_order_date: Timestamp;
  updated_at: Timestamp;
}

// Customer enriquecido para el CRM (calculado en frontend)
export interface CRMCustomer extends Customer {
  days_since_last_order: number;
  avg_ticket: number; // total_spent / total_orders
  segment: CRMSegment;
}

// ─── ANALYTICS DE CUPONES (para AccountingTab) ───────────────

export interface CouponAnalyticsSummary {
  total_discount_given: number; // total descuentos otorgados en período
  orders_with_coupon: number; // órdenes que usaron cupón
  orders_without_coupon: number;
  revenue_with_coupon: number; // ingresos de órdenes con cupón
  revenue_without_coupon: number;
  top_coupons: CouponRankingItem[];
}

export interface CouponRankingItem {
  code: string;
  total_redemptions: number;
  total_revenue: number;
  total_discount_given: number;
  conversion_rate: number; // (usos / total órdenes) * 100
  branches: Record<string, BranchUsage>;
}

// ─── ESTADO DEL MÓDULO DE MARKETING ─────────────────────────

export interface MarketingSettings {
  enabled: boolean; // feature toggle global
  store_name: string; // usado en mensajes WhatsApp del CRM
}
