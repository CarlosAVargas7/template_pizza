"use client"

import { TrendingUp, ShoppingBag, Package, Truck, Tag, BarChart2 } from "lucide-react"
import { KPIStats } from "@/types/accounting"

interface KPICardsProps {
  kpis: KPIStats
}

function formatCOP(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) return "$ 0"
  return `$ ${value.toLocaleString("es-CO")}`
}

export default function KPICards({ kpis }: KPICardsProps) {
  const hasDiscountData = kpis.totalGrossSales > kpis.totalRevenue

  return (
    <div className="space-y-4">

      {/* Fila 1 — Métricas financieras principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Ingresos Netos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Ingresos Netos</span>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatCOP(kpis.totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Lo que realmente entró en caja
          </p>
        </div>

        {/* Ventas Brutas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Ventas Brutas</span>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatCOP(kpis.totalGrossSales)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Valor total antes de descuentos
          </p>
        </div>

        {/* Descuentos */}
        <div className={`bg-white rounded-2xl border shadow-sm p-5 ${kpis.totalDiscounts > 0
          ? "border-orange-200 bg-orange-50/30"
          : "border-gray-100"
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Descuentos Aplicados</span>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className={`text-2xl font-black ${kpis.totalDiscounts > 0 ? "text-orange-600" : "text-gray-900"
            }`}>
            {kpis.totalDiscounts > 0
              ? `- ${formatCOP(kpis.totalDiscounts)}`
              : formatCOP(0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {kpis.totalDiscounts > 0 && kpis.totalGrossSales > 0
              ? `${((kpis.totalDiscounts / kpis.totalGrossSales) * 100).toFixed(1)}% de las ventas brutas`
              : "Sin descuentos en este período"}
          </p>
        </div>
      </div>

      {/* Fila 2 — Métricas operativas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        {/* Pedidos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Pedidos</span>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {kpis.totalOrders ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Órdenes completadas
          </p>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Ticket Promedio</span>
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatCOP(Math.round(kpis.averageTicket))}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Por pedido
          </p>
        </div>

        {/* Unidades vendidas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Unidades Vendidas</span>
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {kpis.totalUnits ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Productos despachados
          </p>
        </div>

        {/* Domicilios */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Domicilios</span>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatCOP(kpis.totalDeliveryFees)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Cobrado por envíos
          </p>
        </div>
      </div>

      {/* Fila 3 — Ventas por sucursal */}
      {(kpis.revenueByBranch.norte > 0 || kpis.revenueByBranch.sur > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Ventas por Sucursal
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(kpis.revenueByBranch)
              .filter(([, value]) => value > 0)
              .map(([branch, revenue]) => {
                const percentage = kpis.totalRevenue > 0
                  ? (revenue / kpis.totalRevenue) * 100
                  : 0
                return (
                  <div key={branch}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {branch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCOP(revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="pizza-gradient h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {percentage.toFixed(1)}% del total
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
