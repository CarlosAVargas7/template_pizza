import { AdminOrder } from "@/types/admin";
import { formatCOP } from "@/lib/menuData";
import {
  DateRange,
  KPIStats,
  ProductStat,
  HourlyStat,
  DailyStat,
  GroupedStat,
  PaymentMethodStat,
  Insight,
  AccountingStats,
  PeriodType,
} from "@/types/accounting";

export const getDateRangeForPeriod = (
  period: PeriodType,
  customStart?: Date,
  customEnd?: Date,
): DateRange => {
  const now = new Date();
  // Use local date methods to avoid timezone issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (period) {
    case "today":
      return {
        start: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
        ),
        end: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
        ),
        label: "Hoy",
      };

    case "yesterday":
      return {
        start: new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          0,
          0,
          0,
        ),
        end: new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59,
        ),
        label: "Ayer",
      };

    case "this_week": {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      // Convert Sunday (0) to 7, then calculate Monday as day 1
      const adjustedDay = day === 0 ? 7 : day;
      const diff = startOfWeek.getDate() - adjustedDay + 1;
      startOfWeek.setDate(diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        start: new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate(),
          0,
          0,
          0,
        ),
        end: endOfWeek,
        label: "Esta semana",
      };
    }

    case "last_week": {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      // Convert Sunday (0) to 7, then calculate Monday as day 1
      const adjustedDay = day === 0 ? 7 : day;
      const diff = startOfWeek.getDate() - adjustedDay + 1;
      startOfWeek.setDate(diff - 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        start: new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate(),
          0,
          0,
          0,
        ),
        end: endOfWeek,
        label: "Semana pasada",
      };
    }

    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      return { start: startOfMonth, end: endOfMonth, label: "Este mes" };
    }

    case "last_month": {
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const endOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
      );
      return {
        start: startOfLastMonth,
        end: endOfLastMonth,
        label: "Mes pasado",
      };
    }

    case "this_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(
        now.getFullYear(),
        (quarter + 1) * 3,
        0,
        23,
        59,
        59,
      );
      return {
        start: startOfQuarter,
        end: endOfQuarter,
        label: "Este trimestre",
      };
    }

    case "last_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const lastQuarter = quarter === 0 ? 3 : quarter - 1;
      const startOfLastQuarter = new Date(
        now.getFullYear(),
        lastQuarter * 3,
        1,
      );
      const endOfLastQuarter = new Date(
        now.getFullYear(),
        (lastQuarter + 1) * 3,
        0,
        23,
        59,
        59,
      );
      return {
        start: startOfLastQuarter,
        end: endOfLastQuarter,
        label: "Trimestre pasado",
      };
    }

    case "this_semester": {
      const semester = Math.floor(now.getMonth() / 6);
      const startOfSemester = new Date(now.getFullYear(), semester * 6, 1);
      const endOfSemester = new Date(
        now.getFullYear(),
        (semester + 1) * 6,
        0,
        23,
        59,
        59,
      );
      return {
        start: startOfSemester,
        end: endOfSemester,
        label: "Este semestre",
      };
    }

    case "last_semester": {
      const semester = Math.floor(now.getMonth() / 6);
      const lastSemester = semester === 0 ? 1 : semester - 1;
      const startOfLastSemester = new Date(
        now.getFullYear(),
        lastSemester * 6,
        1,
      );
      const endOfLastSemester = new Date(
        now.getFullYear(),
        (lastSemester + 1) * 6,
        0,
        23,
        59,
        59,
      );
      return {
        start: startOfLastSemester,
        end: endOfLastSemester,
        label: "Semestre pasado",
      };
    }

    case "this_year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { start: startOfYear, end: endOfYear, label: "Este año" };
    }

    case "last_year": {
      const lastYear = now.getFullYear() - 1;
      const startOfLastYear = new Date(lastYear, 0, 1);
      const endOfLastYear = new Date(lastYear, 11, 31, 23, 59, 59);
      return {
        start: startOfLastYear,
        end: endOfLastYear,
        label: "Año pasado",
      };
    }

    case "custom":
      if (!customStart || !customEnd) {
        throw new Error("Custom period requires both start and end dates");
      }
      return {
        start: new Date(
          customStart.getFullYear(),
          customStart.getMonth(),
          customStart.getDate(),
          0,
          0,
          0,
          0,
        ),
        end: new Date(
          customEnd.getFullYear(),
          customEnd.getMonth(),
          customEnd.getDate(),
          23,
          59,
          59,
          999,
        ),
        label: "Personalizado",
      };

    default:
      throw new Error(`Unknown period: ${period}`);
  }
};

// Helper: calcular revenue real de un item
// Algunas órdenes antiguas tienen totalPrice = unitPrice (sin multiplicar)
// Órdenes nuevas tienen totalPrice = unitPrice * quantity
// Detectamos cuál es el caso comparando totalPrice con unitPrice * quantity
function getItemRevenue(item: any): number {
  const unitPrice = item.unitPrice || 0;
  const quantity = item.quantity || 1;
  const totalPrice = item.totalPrice || 0;
  const expectedTotal = unitPrice * quantity;

  // Si totalPrice es igual a unitPrice y quantity > 1,
  // significa que totalPrice no fue multiplicado → lo multiplicamos
  if (totalPrice === unitPrice && quantity > 1) {
    return unitPrice * quantity;
  }

  // Si totalPrice es aproximadamente igual a expectedTotal → usar totalPrice
  if (Math.abs(totalPrice - expectedTotal) < 1) {
    return totalPrice;
  }

  // En cualquier otro caso, usar unitPrice * quantity como fuente de verdad
  return expectedTotal > 0 ? expectedTotal : totalPrice;
}

export const calculateKPIs = (orders: AdminOrder[]): KPIStats => {
  if (orders.length === 0) {
    return {
      totalRevenue: 0,
      averageTicket: 0,
      totalOrders: 0,
      totalDeliveryFees: 0,
      totalGrossSales: 0,
      totalDiscounts: 0,
      totalUnits: 0,
      uniqueOrdersPerProduct: {},
      revenueByBranch: { norte: 0, sur: 0 },
      ordersByBranch: { norte: 0, sur: 0 },
    };
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0,
  );
  const totalDeliveryFees = orders.reduce(
    (sum, order) => sum + (order.deliveryFee || 0),
    0,
  );
  const totalGrossSales = orders.reduce(
    (sum, order) => sum + (order.original_total || order.total || 0),
    0,
  );
  const totalDiscounts = orders.reduce(
    (sum, order) => sum + (order.discount_applied || 0),
    0,
  );
  const totalUnits = orders.reduce(
    (sum, order) =>
      sum +
      (order.items?.reduce((s, item) => s + (item.quantity || 0), 0) || 0),
    0,
  );

  // Contar órdenes únicas por producto (una orden con 3 pepperoni cuenta como 1)
  const uniqueOrdersPerProduct: Record<string, number> = {};
  orders.forEach((order) => {
    const seenInOrder = new Set<string>();
    order.items?.forEach((item) => {
      const productName = item.productName || "Unknown";
      if (!seenInOrder.has(productName)) {
        seenInOrder.add(productName);
        uniqueOrdersPerProduct[productName] =
          (uniqueOrdersPerProduct[productName] || 0) + 1;
      }
    });
  });

  const revenueByBranch = orders.reduce(
    (acc, order) => {
      const branch = order.branch || "norte";
      acc[branch as "norte" | "sur"] =
        (acc[branch as "norte" | "sur"] || 0) + (order.total || 0);
      return acc;
    },
    { norte: 0, sur: 0 },
  );

  const ordersByBranch = orders.reduce(
    (acc, order) => {
      const branch = order.branch || "norte";
      acc[branch as "norte" | "sur"] =
        (acc[branch as "norte" | "sur"] || 0) + 1;
      return acc;
    },
    { norte: 0, sur: 0 },
  );

  return {
    totalRevenue,
    averageTicket: totalRevenue / orders.length,
    totalOrders: orders.length,
    totalDeliveryFees,
    totalGrossSales,
    totalDiscounts,
    totalUnits,
    uniqueOrdersPerProduct,
    revenueByBranch,
    ordersByBranch,
  };
};

export const calculateProductStats = (
  orders: AdminOrder[],
  totalRevenue: number,
): ProductStat[] => {
  if (orders.length === 0) return [];

  const productMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      unitsSold: number;
      ordersCount: number;
      revenue: number;
      hourlyData: Map<string, number>;
      branch: string;
    }
  >();

  // Calcular ordersCount correctamente (órdenes únicas por producto)
  const ordersPerProduct: Record<string, number> = {};
  orders.forEach((order) => {
    const seenInOrder = new Set<string>();
    order.items?.forEach((item) => {
      const key = item.productName || "Unknown";
      if (!seenInOrder.has(key)) {
        seenInOrder.add(key);
        ordersPerProduct[key] = (ordersPerProduct[key] || 0) + 1;
      }
    });
  });

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const key = item.productName || "Unknown";
      const existing = productMap.get(key) || {
        productId: item.productId || key,
        productName: key,
        unitsSold: 0,
        ordersCount: 0,
        revenue: 0,
        hourlyData: new Map(),
        branch: order.branch || "norte",
      };

      existing.unitsSold += item.quantity || 0;
      // Usar helper para calcular revenue correcto independientemente del formato
      existing.revenue += getItemRevenue(item);

      const orderDate = order.createdAt?.toDate?.();
      if (orderDate) {
        const hour = orderDate.getHours().toString().padStart(2, "0") + ":00";
        existing.hourlyData.set(
          hour,
          (existing.hourlyData.get(hour) || 0) + (item.quantity || 0),
        );
      }

      productMap.set(key, existing);
    });
  });

  // Calcular base real de ingresos de productos
  const totalProductRevenue = Array.from(productMap.values()).reduce(
    (sum, p) => sum + p.revenue,
    0,
  );
  const revenueBase =
    totalProductRevenue > 0 ? totalProductRevenue : totalRevenue;

  const stats = Array.from(productMap.values()).map((product) => {
    let peakHour = "00:00";
    let maxSales = 0;
    product.hourlyData.forEach((sales, hour) => {
      if (sales > maxSales) {
        maxSales = sales;
        peakHour = hour;
      }
    });

    return {
      productId: product.productId,
      productName: product.productName,
      unitsSold: product.unitsSold,
      ordersCount: ordersPerProduct[product.productName] || 0,
      revenue: product.revenue,
      percentageOfTotal:
        revenueBase > 0
          ? Math.round((product.revenue / revenueBase) * 1000) / 10
          : 0,
      peakHour,
      branch: product.branch,
    };
  });

  return stats.sort((a, b) => b.revenue - a.revenue);
};

export const calculateHourlyStats = (orders: AdminOrder[]): HourlyStat[] => {
  const hourlyMap = new Map<string, { ordersCount: number; revenue: number }>();

  orders.forEach((order) => {
    const orderDate = order.createdAt?.toDate?.();
    if (orderDate) {
      const hour = orderDate.getHours().toString().padStart(2, "0") + ":00";
      const existing = hourlyMap.get(hour) || { ordersCount: 0, revenue: 0 };
      existing.ordersCount += 1;
      existing.revenue += order.total || 0;
      hourlyMap.set(hour, existing);
    }
  });

  const stats: HourlyStat[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0") + ":00";
    const data = hourlyMap.get(hour) || { ordersCount: 0, revenue: 0 };
    stats.push({ hour, ordersCount: data.ordersCount, revenue: data.revenue });
  }

  return stats;
};

export const calculateDailyStats = (orders: AdminOrder[]): DailyStat[] => {
  const dailyMap = new Map<string, { ordersCount: number; revenue: number }>();

  orders.forEach((order) => {
    const orderDate = order.createdAt?.toDate?.();
    if (orderDate) {
      const date = orderDate.toISOString().split("T")[0];
      const existing = dailyMap.get(date) || { ordersCount: 0, revenue: 0 };
      existing.ordersCount += 1;
      existing.revenue += order.total || 0;
      dailyMap.set(date, existing);
    }
  });

  const stats = Array.from(dailyMap.entries()).map(([date, data]) => {
    const dateObj = new Date(date + "T00:00:00");
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return {
      date,
      dayName: dayNames[dateObj.getDay()],
      ordersCount: data.ordersCount,
      revenue: data.revenue,
    };
  });

  return stats.sort((a, b) => a.date.localeCompare(b.date));
};

export const calculatePaymentStats = (
  orders: AdminOrder[],
  totalRevenue: number,
): PaymentMethodStat[] => {
  if (orders.length === 0) return [];

  const paymentMap = new Map<string, { amount: number; count: number }>();

  orders.forEach((order) => {
    const method = order.paymentMethod || "cash";
    const label = method === "wompi" ? "Transferencia/Tarjeta" : "Efectivo";
    const existing = paymentMap.get(label) || { amount: 0, count: 0 };
    existing.amount += order.total || 0;
    existing.count += 1;
    paymentMap.set(label, existing);
  });

  return Array.from(paymentMap.entries()).map(([method, data]) => ({
    method,
    amount: data.amount,
    count: data.count,
    percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
  }));
};

export const generateInsights = (
  stats: Omit<AccountingStats, "insights" | "dateRange" | "period">,
): Insight[] => {
  const insights: Insight[] = [];

  if (stats.kpis.totalOrders < 3) return insights;

  // Productos
  if (stats.productStats.length > 0) {
    const topByUnits = stats.productStats[0];
    const topByRevenue = [...stats.productStats].sort(
      (a, b) => b.revenue - a.revenue,
    )[0];

    if (topByRevenue.productName === topByUnits.productName) {
      insights.push({
        type: "success",
        icon: "🏆",
        title: "Producto estrella",
        description: `${topByRevenue.productName} lidera en ventas con ${topByUnits.unitsSold} unidades y ${formatCOP(topByRevenue.revenue)} en ingresos`,
      });
    } else {
      insights.push({
        type: "success",
        icon: "🏆",
        title: "Producto más vendido",
        description: `${topByUnits.productName} lidera en unidades con ${topByUnits.unitsSold} vendidas`,
      });
      insights.push({
        type: "success",
        icon: "💰",
        title: "Mayor ingreso",
        description: `${topByRevenue.productName} es tu producto más rentable con ${formatCOP(topByRevenue.revenue)} este período`,
      });
    }

    if (stats.productStats.length > 1) {
      const bottomProduct = stats.productStats[stats.productStats.length - 1];
      if (bottomProduct.unitsSold < topByUnits.unitsSold * 0.3) {
        insights.push({
          type: "warning",
          icon: "⚠️",
          title: "Producto con baja rotación",
          description: `${bottomProduct.productName} vendió solo ${bottomProduct.unitsSold} unidades. Considera una promoción o revisar si vale la pena mantenerlo en el menú.`,
        });
      }
    }
  }

  // Hora pico
  const hourlyWithOrders = stats.hourlyStats.filter((h) => h.ordersCount > 0);
  if (hourlyWithOrders.length > 0) {
    const peakHour = hourlyWithOrders.reduce((max, hour) =>
      hour.ordersCount > max.ordersCount ? hour : max,
    );
    const peakPercentage =
      stats.kpis.totalOrders > 0
        ? (peakHour.ordersCount / stats.kpis.totalOrders) * 100
        : 0;

    insights.push({
      type: "info",
      icon: "⏰",
      title: "Hora pico de ventas",
      description: `Las ${peakHour.hour} es tu hora más activa con ${peakHour.ordersCount} pedidos (${peakPercentage.toFixed(1)}% del día). Considera reforzar personal en ese horario.`,
    });

    if (hourlyWithOrders.length > 1) {
      const valleyHour = hourlyWithOrders.reduce((min, hour) =>
        hour.ordersCount < min.ordersCount ? hour : min,
      );
      insights.push({
        type: "warning",
        icon: "📉",
        title: "Franja de baja demanda",
        description: `Las ${valleyHour.hour} tiene el menor movimiento del día. Es el momento ideal para hacer mantenimiento o lanzar promociones de Happy Hour.`,
      });
    }
  }

  // Método de pago dominante
  if (stats.paymentMethodStats.length > 0) {
    const dominantMethod = stats.paymentMethodStats.reduce((max, method) =>
      method.amount > max.amount ? method : max,
    );
    if (dominantMethod.percentage > 70) {
      insights.push({
        type: "info",
        icon: "💳",
        title: "Método de pago preferido",
        description: `El ${dominantMethod.percentage.toFixed(1)}% de tus pagos son con ${dominantMethod.method}`,
      });
    }
  }

  // Sucursal líder
  const { revenueByBranch } = stats.kpis;
  const totalRevenue = stats.kpis.totalRevenue;

  if (revenueByBranch.norte > 0 && revenueByBranch.sur > 0) {
    const leadingBranch =
      revenueByBranch.norte > revenueByBranch.sur ? "norte" : "sur";
    const branchPercentage =
      totalRevenue > 0
        ? (revenueByBranch[leadingBranch] / totalRevenue) * 100
        : 0;
    const trailingBranch = leadingBranch === "norte" ? "sur" : "norte";
    const gap =
      revenueByBranch[leadingBranch] - (revenueByBranch[trailingBranch] || 0);

    insights.push({
      type: "success",
      icon: "🏪",
      title: "Sucursal líder",
      description: `${leadingBranch === "norte" ? "Norte" : "Sur"} genera el ${branchPercentage.toFixed(1)}% de los ingresos, con una ventaja de ${formatCOP(gap)} sobre la otra sucursal.`,
    });
  }

  return insights;
};

// Agrupa los datos según el período para la gráfica
export const calculateGroupedStats = (
  orders: AdminOrder[],
  period: PeriodType,
): GroupedStat[] => {
  if (orders.length === 0) return [];

  // Determinar granularidad según período
  const granularity: "hour" | "day" | "week" | "month" =
    period === "today" || period === "yesterday"
      ? "hour"
      : period === "this_week" || period === "last_week"
        ? "day"
        : period === "this_month" || period === "last_month"
          ? "day"
          : period === "this_quarter" || period === "last_quarter"
            ? "week"
            : period === "this_semester" || period === "last_semester"
              ? "week"
              : "month"; // this_year, last_year, custom largo

  const groupMap = new Map<
    string,
    {
      label: string;
      ordersCount: number;
      revenue: number;
      date: string;
    }
  >();

  orders.forEach((order) => {
    const orderDate = order.createdAt?.toDate?.();
    if (!orderDate) return;

    let key: string;
    let label: string;

    if (granularity === "hour") {
      const hour = orderDate.getHours();
      key = hour.toString().padStart(2, "0") + ":00";
      label = key;
    } else if (granularity === "day") {
      key = orderDate.toISOString().split("T")[0];
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const dayName = dayNames[orderDate.getDay()];
      const day = orderDate.getDate();
      const month = orderDate
        .toLocaleDateString("es-CO", { month: "short" })
        .replace(".", "");
      label = `${dayName} ${day} ${month}`;
    } else if (granularity === "week") {
      // Agrupar por semana del año
      const startOfYear = new Date(orderDate.getFullYear(), 0, 1);
      const weekNum = Math.ceil(
        ((orderDate.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7,
      );
      key = `${orderDate.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
      // Calcular inicio de semana para el label
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay() + 1);
      label = `${weekStart.getDate()} ${weekStart.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}`;
    } else {
      // month
      key = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, "0")}`;
      label = orderDate
        .toLocaleDateString("es-CO", {
          month: "short",
          year: "numeric",
        })
        .replace(".", "");
    }

    const existing = groupMap.get(key) || {
      label,
      ordersCount: 0,
      revenue: 0,
      date: key,
    };
    existing.ordersCount += 1;
    existing.revenue += order.total || 0;
    groupMap.set(key, existing);
  });

  // Ordenar por key cronológicamente
  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);
};

export const calculateAllStats = (
  orders: AdminOrder[],
  period: PeriodType,
  dateRange: DateRange,
): AccountingStats => {
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.createdAt?.toDate?.();
    if (!orderDate) return false;
    return orderDate >= dateRange.start && orderDate <= dateRange.end;
  });

  const kpis = calculateKPIs(filteredOrders);
  const productStats = calculateProductStats(filteredOrders, kpis.totalRevenue);
  const hourlyStats = calculateHourlyStats(filteredOrders);
  const dailyStats = calculateDailyStats(filteredOrders);
  const paymentMethodStats = calculatePaymentStats(
    filteredOrders,
    kpis.totalRevenue,
  );
  const groupedStats = calculateGroupedStats(filteredOrders, period);

  const partialStats = {
    kpis,
    productStats,
    hourlyStats,
    dailyStats,
    paymentMethodStats,
    groupedStats,
  };
  const insights = generateInsights(partialStats);

  return { ...partialStats, insights, dateRange, period };
};
