"use client"

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts"
import { GroupedStat, PeriodType } from "@/types/accounting"

interface SalesChartProps {
  groupedStats: GroupedStat[]
  period: PeriodType
  dailyStats?: any[]
  hourlyStats?: any[]
}

function formatCOP(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
  return `$${value}`
}

const PERIOD_LABELS: Record<string, string> = {
  today: "Ventas por hora — Hoy",
  yesterday: "Ventas por hora — Ayer",
  this_week: "Ventas por día — Esta semana",
  last_week: "Ventas por día — Semana pasada",
  this_month: "Ventas por día — Este mes",
  last_month: "Ventas por día — Mes pasado",
  this_quarter: "Ventas por semana — Este trimestre",
  last_quarter: "Ventas por semana — Trimestre pasado",
  this_semester: "Ventas por semana — Este semestre",
  last_semester: "Ventas por semana — Semestre pasado",
  this_year: "Ventas por mes — Este año",
  last_year: "Ventas por mes — Año pasado",
  custom: "Ventas del período",
}

export default function SalesChart({
  groupedStats,
  period,
  dailyStats,
  hourlyStats,
}: SalesChartProps) {
  // Usar groupedStats si está disponible, sino fallback
  const data = groupedStats && groupedStats.length > 0
    ? groupedStats
    : []

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-gray-900 mb-4">
          {PERIOD_LABELS[period] || "Ventas del período"}
        </h4>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          Sin datos para este período
        </div>
      </div>
    )
  }

  // Calcular líneas guía
  const revenues = data.map((d) => d.revenue).filter((r) => r > 0)
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 0
  const minRevenue = revenues.length > 0 ? Math.min(...revenues) : 0
  const avgRevenue =
    revenues.length > 0
      ? Math.round(revenues.reduce((a, b) => a + b, 0) / revenues.length)
      : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const d = payload[0]?.payload as GroupedStat
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-2">{d.label}</p>
        <p className="text-orange-600 font-bold">
          {formatCOP(d.revenue)}
        </p>
        <p className="text-gray-500">
          {d.ordersCount} pedido{d.ordersCount !== 1 ? "s" : ""}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-900">
          {PERIOD_LABELS[period] || "Ventas del período"}
        </h4>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-green-400 inline-block" />
            Máx {formatCOP(maxRevenue)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-400 inline-block border-dashed" />
            Prom {formatCOP(avgRevenue)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-300 inline-block" />
            Mín {formatCOP(minRevenue)}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            tickFormatter={formatCOP}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={55}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Líneas guía */}
          {maxRevenue > 0 && (
            <ReferenceLine
              y={maxRevenue}
              stroke="#4ade80"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Máx`,
                position: "right",
                fontSize: 10,
                fill: "#4ade80",
              }}
            />
          )}
          {avgRevenue > 0 && (
            <ReferenceLine
              y={avgRevenue}
              stroke="#60a5fa"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Prom`,
                position: "right",
                fontSize: 10,
                fill: "#60a5fa",
              }}
            />
          )}
          {minRevenue > 0 && minRevenue !== maxRevenue && (
            <ReferenceLine
              y={minRevenue}
              stroke="#fca5a5"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Mín`,
                position: "right",
                fontSize: 10,
                fill: "#fca5a5",
              }}
            />
          )}

          {/* Barras de ingresos */}
          <Bar
            dataKey="revenue"
            name="Ingresos"
            fill="url(#salesGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />

          {/* Línea de pedidos en eje secundario */}
          <Line
            type="monotone"
            dataKey="ordersCount"
            name="Pedidos"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: "#f97316", r: 3 }}
            yAxisId={0}
          />

          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>

      {/* Footer con resumen */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>
          {data.length} {
            period === "today" || period === "yesterday"
              ? "horas con actividad"
              : period === "this_quarter" || period === "this_semester"
                ? "semanas"
                : period === "this_year"
                  ? "meses"
                  : "días"
          }
        </span>
        <span>
          Total: {formatCOP(revenues.reduce((a, b) => a + b, 0))}
        </span>
      </div>
    </div>
  )
}
