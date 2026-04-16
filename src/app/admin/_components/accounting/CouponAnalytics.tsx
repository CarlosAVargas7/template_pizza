"use client"

import { useMemo } from "react"
import { Tag, TrendingDown, ShoppingBag } from "lucide-react"
import { formatCOP } from "@/lib/menuData"

interface CouponAnalyticsProps {
  rawOrders: any[]
}

interface CouponStat {
  code: string
  redemptions: number
  totalRevenue: number
  totalDiscount: number
  avgTicket: number
}

export default function CouponAnalytics({ rawOrders }: CouponAnalyticsProps) {
  const stats = useMemo(() => {
    // Filtrar órdenes que usaron cupón
    const ordersWithCoupon = rawOrders.filter(
      (o) => o.coupon_code && o.discount_applied > 0
    )

    if (ordersWithCoupon.length === 0) return null

    // Agrupar por código de cupón
    const couponMap = new Map<string, CouponStat>()
    ordersWithCoupon.forEach((order) => {
      const code = order.coupon_code as string
      const existing = couponMap.get(code) || {
        code,
        redemptions: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        avgTicket: 0,
      }
      existing.redemptions += 1
      existing.totalRevenue += order.total || 0
      existing.totalDiscount += order.discount_applied || 0
      couponMap.set(code, existing)
    })

    // Calcular avgTicket y ordenar por revenue
    const coupons = Array.from(couponMap.values()).map((c) => ({
      ...c,
      avgTicket: c.redemptions > 0 ? Math.round(c.totalRevenue / c.redemptions) : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Totales globales
    const totalDiscountGiven = ordersWithCoupon.reduce(
      (sum, o) => sum + (o.discount_applied || 0), 0
    )
    const totalRevenueWithCoupon = ordersWithCoupon.reduce(
      (sum, o) => sum + (o.total || 0), 0
    )
    const conversionRate = rawOrders.length > 0
      ? (ordersWithCoupon.length / rawOrders.length) * 100
      : 0

    return {
      coupons,
      totalDiscountGiven,
      totalRevenueWithCoupon,
      ordersWithCoupon: ordersWithCoupon.length,
      conversionRate,
    }
  }, [rawOrders])

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-orange-500" />
          <h4 className="font-bold text-gray-900">Análisis de Cupones</h4>
        </div>
        <p className="text-sm text-gray-400 py-4 text-center">
          No se usaron cupones en este período
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Tag className="w-5 h-5 text-orange-500" />
        <h4 className="font-bold text-gray-900">Análisis de Cupones</h4>
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full ml-1">
          {stats.ordersWithCoupon} usos
        </span>
      </div>

      {/* KPIs de cupones */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">
              Descuentos dados
            </span>
          </div>
          <p className="text-xl font-black text-red-600">
            -{formatCOP(stats.totalDiscountGiven)}
          </p>
          <p className="text-xs text-red-400 mt-0.5">
            en {stats.ordersWithCoupon} órdenes
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Revenue con cupón
            </span>
          </div>
          <p className="text-xl font-black text-green-700">
            {formatCOP(stats.totalRevenueWithCoupon)}
          </p>
          <p className="text-xs text-green-500 mt-0.5">
            ingresos netos
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Tasa de uso
            </span>
          </div>
          <p className="text-xl font-black text-blue-700">
            {stats.conversionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-blue-400 mt-0.5">
            de pedidos usaron cupón
          </p>
        </div>
      </div>

      {/* Tabla de cupones */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-2 font-semibold text-gray-500">
              Cupón
            </th>
            <th className="text-right py-2 px-2 font-semibold text-gray-500">
              Usos
            </th>
            <th className="text-right py-2 px-2 font-semibold text-gray-500">
              Revenue
            </th>
            <th className="text-right py-2 px-2 font-semibold text-gray-500">
              Descuento
            </th>
            <th className="text-right py-2 px-2 font-semibold text-gray-500">
              Ticket prom.
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.coupons.map((coupon, i) => (
            <tr
              key={coupon.code}
              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td className="py-2.5 px-2">
                <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">
                  {coupon.code}
                </span>
              </td>
              <td className="py-2.5 px-2 text-right text-gray-700 font-medium">
                {coupon.redemptions}
              </td>
              <td className="py-2.5 px-2 text-right font-bold text-gray-900">
                {formatCOP(coupon.totalRevenue)}
              </td>
              <td className="py-2.5 px-2 text-right text-red-500 font-medium">
                -{formatCOP(coupon.totalDiscount)}
              </td>
              <td className="py-2.5 px-2 text-right text-gray-600">
                {formatCOP(coupon.avgTicket)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nota */}
      <p className="text-xs text-gray-400 mt-3">
        Solo se muestran cupones con descuento aplicado en el período seleccionado
      </p>
    </div>
  )
}
