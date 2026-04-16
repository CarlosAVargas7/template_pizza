"use client"

import { useState, useMemo } from "react"
import { TrendingUp, BarChart2, Medal } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCOP } from "@/lib/menuData"
import type { Coupon } from "@/types/marketing"

interface CouponRankingProps {
  coupons: Coupon[]
  availableBranches: string[]
  loading: boolean
  forcedBranch?: "norte" | "sur"
}

// Obtener métricas de un cupón según filtro de sucursal
function getCouponMetrics(
  coupon: Coupon,
  branchFilter: string
): { used_count: number; total_revenue: number; discount_given: number } {
  if (branchFilter === "all") {
    return Object.values(coupon.usage_by_branch).reduce(
      (acc, b) => ({
        used_count: acc.used_count + b.used_count,
        total_revenue: acc.total_revenue + b.total_revenue,
        discount_given: acc.discount_given + b.discount_given,
      }),
      { used_count: 0, total_revenue: 0, discount_given: 0 }
    )
  }
  return coupon.usage_by_branch[branchFilter] ?? {
    used_count: 0,
    total_revenue: 0,
    discount_given: 0,
  }
}

// Datos para la gráfica recharts
function buildChartData(
  coupons: Coupon[],
  branchFilter: string,
  availableBranches: string[]
): object[] {
  return coupons
    .map((c) => {
      const entry: Record<string, any> = { code: c.code }
      if (branchFilter === "all") {
        availableBranches.forEach((b) => {
          entry[b] = c.usage_by_branch[b]?.total_revenue ?? 0
        })
      } else {
        entry[branchFilter] =
          c.usage_by_branch[branchFilter]?.total_revenue ?? 0
      }
      return entry
    })
    .sort((a, b) => {
      const sumA = availableBranches.reduce((s, br) => s + (a[br] ?? 0), 0)
      const sumB = availableBranches.reduce((s, br) => s + (b[br] ?? 0), 0)
      return sumB - sumA
    })
    .slice(0, 5)
}

export default function CouponRanking({
  coupons,
  availableBranches,
  loading,
  forcedBranch,
}: CouponRankingProps) {
  const [branchFilter, setBranchFilter] = useState<string>(forcedBranch ?? "all")

  if (forcedBranch && branchFilter !== forcedBranch) {
    setBranchFilter(forcedBranch)
  }

  // Calcular métricas globales
  const globalMetrics = useMemo(() => {
    const totalDiscountGiven = coupons.reduce(
      (sum, c) => sum + getCouponMetrics(c, "all").discount_given,
      0
    )
    const totalOrdersWithCoupon = coupons.reduce(
      (sum, c) => sum + getCouponMetrics(c, "all").used_count,
      0
    )
    const totalRevenueWithCoupon = coupons.reduce(
      (sum, c) => sum + getCouponMetrics(c, "all").total_revenue,
      0
    )

    return {
      totalDiscountGiven,
      totalOrdersWithCoupon,
      totalRevenueWithCoupon,
    }
  }, [coupons])

  // Calcular métricas filtradas
  const filteredMetrics = useMemo(() => {
    const totalDiscountGiven = coupons.reduce(
      (sum, c) => sum + getCouponMetrics(c, branchFilter).discount_given,
      0
    )
    const totalOrdersWithCoupon = coupons.reduce(
      (sum, c) => sum + getCouponMetrics(c, branchFilter).used_count,
      0
    )
    const totalRevenueWithCoupon = coupons.reduce(
      (sum, c) => sum + getCouponMetrics(c, branchFilter).total_revenue,
      0
    )

    return {
      totalDiscountGiven,
      totalOrdersWithCoupon,
      totalRevenueWithCoupon,
    }
  }, [coupons, branchFilter])

  // Datos para tabla y gráfica
  const tableData = useMemo(() => {
    return coupons
      .map((coupon) => {
        const metrics = getCouponMetrics(coupon, branchFilter)
        const globalUsage = getCouponMetrics(coupon, "all").used_count
        const totalGlobalOrders = coupons.reduce(
          (sum, c) => sum + getCouponMetrics(c, "all").used_count,
          0
        )
        const conversionRate = totalGlobalOrders > 0
          ? (globalUsage / totalGlobalOrders) * 100
          : 0

        return {
          coupon,
          ...metrics,
          conversionRate,
        }
      })
      .filter((item) => item.total_revenue > 0)
      .sort((a, b) => b.total_revenue - a.total_revenue)
  }, [coupons, branchFilter])

  const chartData = useMemo(
    () => buildChartData(coupons, branchFilter, availableBranches),
    [coupons, branchFilter, availableBranches]
  )

  // Colores para las barras
  const branchColors: Record<string, string> = {
    norte: "#f97316", // orange-500
    sur: "#fb923c", // orange-400
    // Colores adicionales si hay más sucursales
    centro: "#fdba74", // orange-300
    occidente: "#fed7aa", // orange-200
  }

  // Custom tooltip para la gráfica
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCOP(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Verificar si hay datos
  const hasData = coupons.some((c) => {
    const metrics = getCouponMetrics(c, branchFilter)
    return metrics.used_count > 0
  })

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos de uso</h3>
          <p className="text-gray-500">Aún no hay datos de uso de cupones.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Cupones</h3>
        </div>
        {!forcedBranch && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="all">Todas</option>
            {availableBranches.map((branch) => (
              <option key={branch} value={branch}>
                {branch.charAt(0).toUpperCase() + branch.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-600 mb-1">Total descuentos otorgados</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCOP(filteredMetrics.totalDiscountGiven)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-600 mb-1">Órdenes con cupón</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredMetrics.totalOrdersWithCoupon}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-600 mb-1">Revenue con cupón</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCOP(filteredMetrics.totalRevenueWithCoupon)}
          </div>
        </div>
      </div>

      {/* Gráfica */}
      {chartData.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Top 5 por Revenue</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="code"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {availableBranches.map((branch) => (
                <Bar
                  key={branch}
                  dataKey={branch}
                  fill={branchColors[branch] || "#f97316"}
                  name={branch.charAt(0).toUpperCase() + branch.slice(1)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de ranking */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-t border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                POS
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                CÓDIGO
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                USOS
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                REVENUE
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                DESCUENTO DADO
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                CONV. RATE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((item, index) => {
              const position = index + 1
              const getMedal = (pos: number) => {
                if (pos === 1) return "🥇"
                if (pos === 2) return "🥈"
                if (pos === 3) return "🥉"
                return pos.toString()
              }

              const getConversionBadgeColor = (rate: number) => {
                if (rate >= 10) return "bg-green-100 text-green-700"
                if (rate >= 5) return "bg-yellow-100 text-yellow-700"
                return "bg-gray-100 text-gray-600"
              }

              return (
                <tr key={item.coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {position <= 3 && <Medal className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm font-medium text-gray-900">
                        {getMedal(position)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-100 text-orange-700">
                      {item.coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.used_count}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCOP(item.total_revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    {formatCOP(item.discount_given)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getConversionBadgeColor(
                        item.conversionRate
                      )}`}
                    >
                      {item.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
