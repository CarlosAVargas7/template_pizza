export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface KPIStats {
  totalRevenue: number; // Ingresos netos (lo que entró)
  averageTicket: number; // Ticket promedio
  totalOrders: number; // Total pedidos
  totalDeliveryFees: number; // Total domicilios
  totalGrossSales: number; // Ventas brutas (antes de descuentos)
  totalDiscounts: number; // Total descuentos aplicados
  totalUnits: number; // Total unidades vendidas
  uniqueOrdersPerProduct: Record<string, number>; // Pedidos por producto
  revenueByBranch: Record<string, number>;
  ordersByBranch: Record<string, number>;
}

export interface ProductStat {
  productId: string;
  productName: string;
  unitsSold: number;
  ordersCount: number;
  revenue: number;
  percentageOfTotal: number;
  peakHour: string;
  branch: string;
}

export interface HourlyStat {
  hour: string; // "10:00", "11:00", etc
  ordersCount: number;
  revenue: number;
}

export interface DailyStat {
  date: string; // "2024-01-15"
  dayName: string; // "Lunes"
  ordersCount: number;
  revenue: number;
}

export interface PaymentMethodStat {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface GroupedStat {
  label: string; // "10:00", "Lun 15 ene", "Sem 3", "Ene 2024"
  ordersCount: number;
  revenue: number;
  date: string; // key for sorting
}

export interface Insight {
  type: "success" | "warning" | "info" | "danger";
  icon: string; // emoji
  title: string;
  description: string;
}

export interface AccountingStats {
  kpis: KPIStats;
  productStats: ProductStat[];
  hourlyStats: HourlyStat[];
  dailyStats: DailyStat[];
  groupedStats: GroupedStat[];
  paymentMethodStats: PaymentMethodStat[];
  insights: Insight[];
  dateRange: DateRange;
  period: PeriodType;
}

export type PeriodType =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_semester"
  | "last_semester"
  | "this_year"
  | "last_year"
  | "custom";

export interface CSVExportOptions {
  includeOrders: boolean;
  includeProducts: boolean;
  includeHourly: boolean;
  dateRange: DateRange;
}
