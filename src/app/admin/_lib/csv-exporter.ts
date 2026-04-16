import {
  DateRange,
  ProductStat,
  HourlyStat,
  AccountingStats,
} from "@/types/accounting";

function downloadCSV(content: string, filename: string): void {
  // Create Blob with UTF-8 BOM for proper Excel encoding
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });

  // Create temporary link and trigger download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVValue(value: string): string {
  // Escape values containing semicolons, quotes, or newlines
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatCurrencyCSV(amount: number): string {
  return amount.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const exportOrdersToCSV = (
  orders: any[],
  dateRange: DateRange,
): void => {
  console.log(
    "Exportando órdenes:",
    orders.length,
    "Primera orden:",
    orders[0],
  );

  const headers = [
    "Fecha",
    "Hora",
    "ID Pedido",
    "Sucursal",
    "Cliente",
    "Teléfono",
    "Dirección",
    "Productos",
    "Subtotal",
    "Domicilio",
    "Total",
    "Método Pago",
    "Estado",
  ];

  function escapeCSVField(value: string): string {
    const str = String(value ?? "");
    // Si contiene punto y coma, comillas o saltos de línea,
    // envuelve en comillas dobles y escapa comillas internas
    if (str.includes(";") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = orders
    .map((order) => {
      // Manejo de fecha y hora para ambos casos
      const date =
        order.createdAt?.toDate?.() ??
        (order.createdAt instanceof Date ? order.createdAt : new Date());

      if (!date || isNaN(date.getTime())) return null;

      // Manejo de productos en formato nuevo y legacy
      let productsList = "";
      if (order.items && Array.isArray(order.items)) {
        // Formato nuevo
        productsList = order.items
          .map(
            (item: any) =>
              `${item.productName || "Unknown"} x${item.quantity || 0}`,
          )
          .join(" | ");
      } else if (order.item) {
        // Formato legacy
        productsList = `${order.item.specialty || ""} ${order.item.size || ""} x${order.item.quantity ?? 1}`;
      }

      // Calcular subtotal (total menos 15% de domicilio)
      const subtotal = order.total || 0;
      const deliveryFee = subtotal * 0.15;
      const productTotal = subtotal - deliveryFee;

      // ID del pedido
      const orderId =
        order.dailyOrderId ||
        `#${order.id?.substring(0, 6).toUpperCase() ?? "000000"}`;

      // Método de pago
      const paymentLabel =
        order.paymentMethod === "wompi" ? "Transferencia/Tarjeta" : "Efectivo";

      // Estado capitalizado
      const statusLabel = order.status
        ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
        : "Pendiente";

      return [
        formatDate(date),
        formatTime(date),
        escapeCSVField(orderId),
        escapeCSVField(order.branch === "norte" ? "Norte" : "Sur"),
        escapeCSVField(order.customerName || ""),
        escapeCSVField(order.phone || ""),
        escapeCSVField(order.address || ""),
        escapeCSVField(productsList),
        formatCurrencyCSV(productTotal),
        formatCurrencyCSV(deliveryFee),
        formatCurrencyCSV(order.total || 0),
        escapeCSVField(paymentLabel),
        escapeCSVField(statusLabel),
      ];
    })
    .filter((row) => row !== null);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  const date = new Date().toISOString().split("T")[0];
  const filename = `ventas_${dateRange.label}_${date}.csv`;
  downloadCSV(csvContent, filename);
};

export const exportProductsToCSV = (
  productStats: ProductStat[],
  dateRange: DateRange,
): void => {
  const headers = [
    "Producto",
    "Unidades Vendidas",
    "Ingresos",
    "% del Total",
    "Hora Pico",
    "Ranking",
  ];

  const rows = productStats.map((product, index) => [
    escapeCSVValue(product.productName),
    product.unitsSold.toString(),
    formatCurrencyCSV(product.revenue),
    product.percentageOfTotal.toFixed(2),
    product.peakHour,
    (index + 1).toString(),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  const date = new Date().toISOString().split("T")[0];
  const filename = `productos_${dateRange.label}_${date}.csv`;
  downloadCSV(csvContent, filename);
};

export const exportHourlyToCSV = (
  hourlyStats: HourlyStat[],
  dateRange: DateRange,
): void => {
  const headers = ["Hora", "Pedidos", "Ingresos", "% del Total"];

  const totalRevenue = hourlyStats.reduce((sum, hour) => sum + hour.revenue, 0);

  const rows = hourlyStats.map((hour) => [
    hour.hour,
    hour.ordersCount.toString(),
    formatCurrencyCSV(hour.revenue),
    totalRevenue > 0
      ? ((hour.revenue / totalRevenue) * 100).toFixed(2)
      : "0.00",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  const date = new Date().toISOString().split("T")[0];
  const filename = `horarios_${dateRange.label}_${date}.csv`;
  downloadCSV(csvContent, filename);
};

export const exportFullReportToCSV = (
  stats: AccountingStats,
  orders: any[],
): void => {
  // Export all three reports
  exportOrdersToCSV(orders, stats.dateRange);
  exportProductsToCSV(stats.productStats, stats.dateRange);
  exportHourlyToCSV(stats.hourlyStats, stats.dateRange);
};
