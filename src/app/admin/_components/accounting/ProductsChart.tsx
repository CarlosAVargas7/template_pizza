"use client"

import { KPIStats, ProductStat } from "@/types/accounting"
import { formatCOP } from "@/lib/menuData"

interface ProductsChartProps {
  productStats: ProductStat[]
  kpis: KPIStats
}

const MEDALS = ["🥇", "🥈", "🥉"]

export default function ProductsChart({ productStats, kpis }: ProductsChartProps) {
  if (!productStats || productStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-gray-900 mb-4">Ranking de Productos</h4>
        <p className="text-gray-400 text-sm text-center py-8">
          Sin datos de productos en este período
        </p>
      </div>
    )
  }

  // Ordenar por ingresos para el ranking financiero
  const byRevenue = [...productStats].sort((a, b) => b.revenue - a.revenue)
  // Top producto por unidades (buscar independientemente del ordenamiento)
  const topByUnits = [...productStats].sort((a, b) => b.unitsSold - a.unitsSold)[0]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-gray-900">Ranking de Productos</h4>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>💰 Por ingresos</span>
          <span>📦 Por unidades</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 font-semibold text-gray-500 w-8">#</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-500">Producto</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-500">Ingresos</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-500">Pedidos</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-500">Unidades</th>
            </tr>
          </thead>
          <tbody>
            {byRevenue.map((product, index) => {
              const isTopRevenue = index === 0
              const isTopUnits = product.productName === topByUnits.productName
              const revenueBar = byRevenue[0].revenue > 0
                ? (product.revenue / byRevenue[0].revenue) * 100
                : 0

              return (
                <tr
                  key={product.productId}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isTopRevenue ? "bg-green-50/30" : ""
                    }`}
                >
                  {/* Posición */}
                  <td className="py-3 px-3">
                    <span className="text-base">
                      {index < 3 ? MEDALS[index] : (
                        <span className="text-gray-400 font-medium">{index + 1}</span>
                      )}
                    </span>
                  </td>

                  {/* Producto */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {product.productName}
                        </span>
                        {isTopRevenue && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                            Mayor ingreso
                          </span>
                        )}
                        {isTopUnits && !isTopRevenue && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                            Más vendido
                          </span>
                        )}
                      </div>
                      {/* Barra de revenue relativo */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[200px]">
                        <div
                          className="pizza-gradient h-1.5 rounded-full transition-all"
                          style={{ width: `${revenueBar}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Ingresos */}
                  <td className="py-3 px-3 text-right">
                    <span className={`font-bold ${isTopRevenue ? "text-green-600" : "text-gray-900"
                      }`}>
                      {formatCOP(product.revenue)}
                    </span>
                  </td>

                  {/* Pedidos */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-gray-600 font-medium">
                      {product.ordersCount ?? 0}
                    </span>
                  </td>

                  {/* Unidades */}
                  <td className="py-3 px-3 text-right">
                    <span className={`font-medium ${isTopUnits ? "text-blue-600" : "text-gray-600"
                      }`}>
                      {product.unitsSold}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con totales */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {productStats.length} productos · {kpis.totalUnits ?? 0} unidades totales
        </span>
        <span className="font-semibold text-gray-700">
          Total: {formatCOP(productStats.reduce((s, p) => s + p.revenue, 0))}
        </span>
      </div>
    </div>
  )
}
