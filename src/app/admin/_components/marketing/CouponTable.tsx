"use client"

import { useState } from "react"
import { Tag, Plus, Pencil, ToggleLeft, ToggleRight, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { formatCOP } from "@/lib/menuData"
import { Timestamp } from "firebase/firestore"
import type { Coupon } from "@/types/marketing"

interface CouponTableProps {
  coupons: Coupon[]
  onEdit: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => void
  onToggleStatus: (coupon: Coupon) => void
  onNewCoupon: () => void
  loading: boolean
  onRelaunch: (coupon: Coupon) => void
}

// Total de usos de un cupón sumando todas las sucursales
function getTotalUsed(coupon: Coupon): number {
  return Object.values(coupon.usage_by_branch).reduce(
    (sum, b) => sum + b.used_count, 0
  )
}

// Días hasta vencimiento
function daysUntilExpiry(coupon: Coupon): number | null {
  if (!coupon.expires_at) return null
  const diff = coupon.expires_at.toDate().getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Formato de fecha legible
function formatDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Formatear nombre de sucursal para chips
function formatBranch(branch: string): string {
  return branch.charAt(0).toUpperCase() + branch.slice(1)
}

export default function CouponTable({
  coupons,
  onEdit,
  onDelete,
  onToggleStatus,
  onNewCoupon,
  loading,
  onRelaunch,
}: CouponTableProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Tag className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Cupones</h3>
          <span className="text-sm text-gray-500">({coupons.length} cupones)</span>
        </div>
        <button
          onClick={onNewCoupon}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cupón
        </button>
      </div>

      {/* Empty State */}
      {coupons.length === 0 && (
        <div className="p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No hay cupones creados</h4>
          <p className="text-gray-500">Crea tu primer cupón para comenzar.</p>
        </div>
      )}

      {/* Table - Desktop */}
      {coupons.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursales
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usos
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => {
                const totalUsed = getTotalUsed(coupon)
                const usagePercentage = (totalUsed / coupon.usage_limit) * 100
                const daysUntil = daysUntilExpiry(coupon)
                const isExpiringSoon = daysUntil !== null && daysUntil <= 7 && daysUntil > 0
                const isExpired = daysUntil !== null && daysUntil < 0

                return (
                  <tr
                    key={coupon.id}
                    className="hover:bg-gray-50 transition-colors"
                    onMouseLeave={() => setConfirmingDelete(null)}
                  >
                    {/* Código */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-100 text-orange-700">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${coupon.discount_type === "PERCENTAGE"
                          ? "bg-blue-100 text-blue-700"
                          : coupon.discount_type === "FIXED_AMOUNT"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-teal-100 text-teal-700"
                          }`}
                      >
                        {coupon.discount_type === "PERCENTAGE" && "% Descuento"}
                        {coupon.discount_type === "FIXED_AMOUNT" && "Monto Fijo"}
                        {coupon.discount_type === "FREE_DELIVERY" && "Envío Gratis"}
                      </span>
                    </td>

                    {/* Valor */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {coupon.discount_type === "PERCENTAGE" && `${coupon.discount_value}%`}
                      {coupon.discount_type === "FIXED_AMOUNT" && formatCOP(coupon.discount_value)}
                      {coupon.discount_type === "FREE_DELIVERY" && "Gratis"}
                    </td>

                    {/* Mínimo */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {coupon.min_order_value > 0 ? formatCOP(coupon.min_order_value) : "Sin mínimo"}
                    </td>

                    {/* Sucursales */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {coupon.branches.map((branch) => (
                          <span
                            key={branch}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                          >
                            {formatBranch(branch)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Usos */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 mb-1">
                        {totalUsed} / {coupon.usage_limit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-colors ${totalUsed >= coupon.usage_limit
                            ? "bg-red-500"
                            : "bg-orange-500"
                            }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Vencimiento */}
                    <td className="px-6 py-4">
                      {coupon.expires_at ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-900"
                            }`}>
                            {formatDate(coupon.expires_at)}
                          </span>
                          {isExpired && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                              Vencido
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                              Próximo
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin vencimiento</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${coupon.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : coupon.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-100 text-red-600"
                          }`}
                      >
                        {coupon.status === "ACTIVE" && "Activo"}
                        {coupon.status === "INACTIVE" && "Inactivo"}
                        {coupon.status === "EXPIRED" && "Vencido"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Editar */}
                        <button
                          onClick={() => onEdit(coupon)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Editar cupón"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Activar/Desactivar */}
                        <button
                          onClick={() => onToggleStatus(coupon)}
                          className={`p-1.5 transition-colors ${coupon.status === "ACTIVE"
                            ? "text-green-500 hover:text-green-600"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                          title={coupon.status === "ACTIVE" ? "Desactivar cupón" : "Activar cupón"}
                        >
                          {coupon.status === "ACTIVE" ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>

                        {/* Eliminar */}
                        {confirmingDelete === coupon.id ? (
                          <button
                            onClick={() => {
                              onDelete(coupon)
                              setConfirmingDelete(null)
                            }}
                            className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                          >
                            ¿Confirmar?
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmingDelete(coupon.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                            title="Eliminar cupón"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {coupons.length > 0 && (
        <div className="md:hidden divide-y divide-gray-100">
          {coupons.map((coupon) => {
            const totalUsed = getTotalUsed(coupon)
            const usagePercentage = (totalUsed / coupon.usage_limit) * 100
            const daysUntil = daysUntilExpiry(coupon)
            const isExpiringSoon = daysUntil !== null && daysUntil <= 7 && daysUntil > 0
            const isExpired = daysUntil !== null && daysUntil < 0

            return (
              <div
                key={coupon.id}
                className="p-4 space-y-3"
                onMouseLeave={() => setConfirmingDelete(null)}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-100 text-orange-700">
                    {coupon.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(coupon)}
                      className={`p-1.5 transition-colors ${coupon.status === "ACTIVE"
                        ? "text-green-500 hover:text-green-600"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {coupon.status === "ACTIVE" ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    {confirmingDelete === coupon.id ? (
                      <button
                        onClick={() => {
                          onDelete(coupon)
                          setConfirmingDelete(null)
                        }}
                        className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                      >
                        ¿Confirmar?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(coupon.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tipo y Valor */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${coupon.discount_type === "PERCENTAGE"
                      ? "bg-blue-100 text-blue-700"
                      : coupon.discount_type === "FIXED_AMOUNT"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-teal-100 text-teal-700"
                      }`}
                  >
                    {coupon.discount_type === "PERCENTAGE" && "% Descuento"}
                    {coupon.discount_type === "FIXED_AMOUNT" && "Monto Fijo"}
                    {coupon.discount_type === "FREE_DELIVERY" && "Envío Gratis"}
                  </span>
                  <span className="text-sm text-gray-900">
                    {coupon.discount_type === "PERCENTAGE" && `${coupon.discount_value}%`}
                    {coupon.discount_type === "FIXED_AMOUNT" && formatCOP(coupon.discount_value)}
                    {coupon.discount_type === "FREE_DELIVERY" && "Gratis"}
                  </span>
                </div>

                {/* Mínimo */}
                <div className="text-sm text-gray-600">
                  Mínimo: {coupon.min_order_value > 0 ? formatCOP(coupon.min_order_value) : "Sin mínimo"}
                </div>

                {/* Sucursales */}
                <div className="flex flex-wrap gap-1">
                  {coupon.branches.map((branch) => (
                    <span
                      key={branch}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      {formatBranch(branch)}
                    </span>
                  ))}
                </div>

                {/* Usos */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-900">Usos: {totalUsed} / {coupon.usage_limit}</span>
                    <span
                      className={`text-xs font-medium ${totalUsed >= coupon.usage_limit ? "text-red-600" : "text-orange-600"
                        }`}
                    >
                      {Math.round(usagePercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${totalUsed >= coupon.usage_limit ? "bg-red-500" : "bg-orange-500"
                        }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Vencimiento y Estado */}
                <div className="flex items-center justify-between">
                  <div>
                    {coupon.expires_at ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-900"
                          }`}>
                          {formatDate(coupon.expires_at)}
                        </span>
                        {isExpired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                            Vencido
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                            Próximo
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin vencimiento</span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${coupon.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : coupon.status === "INACTIVE"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-600"
                      }`}
                  >
                    {coupon.status === "ACTIVE" && "Activo"}
                    {coupon.status === "INACTIVE" && "Inactivo"}
                    {coupon.status === "EXPIRED" && "Vencido"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
