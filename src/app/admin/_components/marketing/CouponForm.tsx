"use client"

import { useState, useEffect } from "react"
import { X, Clock, DollarSign, Percent, Truck, AlertCircle } from "lucide-react"
import { formatCOP } from "@/lib/menuData"
import type {
  CouponFormData,
  DiscountType,
  CouponStatus,
} from "@/types/marketing"

interface CouponFormProps {
  formData: CouponFormData
  onChange: (data: CouponFormData) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  isEditing: boolean
  availableBranches: string[]
  forcedBranch?: "norte" | "sur"
}

// Formatear nombre de sucursal
function formatBranchName(branch: string): string {
  return `Sucursal ${branch.charAt(0).toUpperCase() + branch.slice(1)}`
}

// Calcular precio final para el preview
function calcFinalPrice(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number,
  minOrderValue: number
): { discount: number; final: number; applies: boolean } {
  if (discountType === "PERCENTAGE") {
    const discount = Math.round((originalPrice * discountValue) / 100)
    return { discount, final: Math.max(0, originalPrice - discount), applies: true }
  }
  if (discountType === "FIXED_AMOUNT") {
    if (originalPrice < minOrderValue) {
      return { discount: 0, final: originalPrice, applies: false }
    }
    return {
      discount: discountValue,
      final: Math.max(0, originalPrice - discountValue),
      applies: true,
    }
  }
  return { discount: 0, final: originalPrice, applies: true }
}

export default function CouponForm({
  formData,
  onChange,
  onSave,
  onCancel,
  saving,
  isEditing,
  availableBranches,
  forcedBranch,
}: CouponFormProps) {
  const [codeInput, setCodeInput] = useState(formData.code)

  // Sync code input with formData
  useEffect(() => {
    setCodeInput(formData.code)
  }, [formData.code])

  const handleCodeChange = (value: string) => {
    const upper = value.toUpperCase()
    setCodeInput(upper)
    onChange({ ...formData, code: upper })
  }

  const handleBranchToggle = (branch: string) => {
    if (forcedBranch) return
    const newBranches = formData.branches.includes(branch)
      ? formData.branches.filter((b) => b !== branch)
      : [...formData.branches, branch]
    onChange({ ...formData, branches: newBranches })
  }

  const examplePrices = [20000, 35000, 50000, 70000, 100000]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Editar Cupón" : "Crear Nuevo Cupón"}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8">
          {/* SECCIÓN 1 — Información básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información básica</h3>
            <div className="space-y-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Código del cupón
                </label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Ej: PIZZA20"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Descripción (nota interna)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => onChange({ ...formData, description: e.target.value })}
                  placeholder="Notas internas sobre este cupón..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
                />
              </div>

              {/* Tipo de descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">
                  Tipo de descuento
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => onChange({ ...formData, discount_type: e.target.value as DiscountType })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                >
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED_AMOUNT">Monto fijo (COP)</option>
                  <option value="FREE_DELIVERY">Domicilio gratis</option>
                </select>
              </div>

              {/* Valor del descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">
                  {formData.discount_type === "PERCENTAGE" && "Porcentaje (%)"}
                  {formData.discount_type === "FIXED_AMOUNT" && "Monto fijo (COP)"}
                  {formData.discount_type === "FREE_DELIVERY" && "Valor del descuento"}
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => onChange({ ...formData, discount_value: Number(e.target.value) })}
                  min="0"
                  max={formData.discount_type === "PERCENTAGE" ? 100 : undefined}
                  disabled={formData.discount_type === "FREE_DELIVERY"}
                  placeholder={formData.discount_type === "FREE_DELIVERY" ? "0" : ""}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:bg-gray-50 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-gray-400 dark:text-white"
                />
                {formData.discount_type === "FREE_DELIVERY" && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    El descuento es el valor del domicilio
                  </p>
                )}
              </div>

              {/* Pedido mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">
                  Pedido mínimo (COP)
                </label>
                <input
                  type="number"
                  value={formData.min_order_value}
                  onChange={(e) => onChange({ ...formData, min_order_value: Number(e.target.value) })}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2 — Límites de uso */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Límites de uso</h3>
            <div className="space-y-4">
              {/* Límite total */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">
                  Límite total de usos
                </label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => onChange({ ...formData, usage_limit: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                />
              </div>

              {/* Usos por cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">
                  Usos por cliente (teléfono)
                </label>
                <input
                  type="number"
                  value={formData.usage_limit_per_phone}
                  onChange={(e) => onChange({ ...formData, usage_limit_per_phone: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                />
              </div>

              {/* Fecha de inicio de campaña */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  Fecha de inicio de campaña
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) =>
                    onChange({ ...formData, valid_from: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
               focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Opcional · El cupón no será válido antes de esta fecha
                </p>
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  Fecha de vencimiento de campaña
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => onChange({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Opcional · El cupón expira al final de este día
                </p>
              </div>

              {/* Horario específico */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.valid_hours_enabled}
                    onChange={(e) => onChange({ ...formData, valid_hours_enabled: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500/30"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Cupón de horario específico (Happy Hour)
                  </span>
                </label>

                {formData.valid_hours_enabled && (
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        value={formData.valid_hours_from}
                        onChange={(e) => onChange({ ...formData, valid_hours_from: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                        Hora fin
                      </label>
                      <input
                        type="time"
                        value={formData.valid_hours_to}
                        onChange={(e) => onChange({ ...formData, valid_hours_to: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 3 — Sucursales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sucursales</h3>
            {forcedBranch ? (
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500/30"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {formatBranchName(forcedBranch)}
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {availableBranches.map((branch) => (
                  <label key={branch} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.branches.includes(branch)}
                      onChange={() => handleBranchToggle(branch)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500/30"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {formatBranchName(branch)}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {!forcedBranch && formData.branches.length === 0 && (
              <p className="mt-2 text-sm text-red-500">Selecciona al menos una sucursal</p>
            )}
          </div>

          {/* SECCIÓN 4 — Estado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                Estado del cupón
              </label>
              <select
                value={formData.status}
                onChange={(e) => onChange({ ...formData, status: e.target.value as CouponStatus })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          {/* SECCIÓN 5 — Preview de descuento */}
          {formData.discount_type !== "FREE_DELIVERY" && formData.discount_value > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview de descuento</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-600">
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Precio original</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Descuento</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Precio final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examplePrices.map((price) => {
                      const { discount, final, applies } = calcFinalPrice(
                        price,
                        formData.discount_type,
                        formData.discount_value,
                        formData.min_order_value
                      )
                      return (
                        <tr key={price} className="border-b border-gray-100 dark:border-slate-700">
                          <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{formatCOP(price)}</td>
                          <td className="py-2 px-3">
                            {applies ? (
                              <span className="text-green-600">-{formatCOP(discount)}</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-400">No aplica</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">
                            {applies ? formatCOP(final) : formatCOP(price)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {formData.discount_type === "FIXED_AMOUNT" && formData.min_order_value > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  El descuento fijo solo aplica para pedidos de {formatCOP(formData.min_order_value)} o más
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isEditing ? "Actualizar cupón" : "Crear cupón"}
          </button>
        </div>
      </div>
    </div>
  )
}
