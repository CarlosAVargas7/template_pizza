"use client"

import { BranchMenu, formatCOP } from "@/lib/menuData"
import { Phone, MapPin, CreditCard, Clock, XCircle, Tag, CheckCircle, Gift } from "lucide-react"
import type { CouponValidationResult } from "@/types/marketing"

interface FormData {
  name: string
  phone: string
  email: string
  address: string
  payment: "wompi" | "cash"
}

interface CartItem {
  product: any
  quantity: number
  selectedOptions: Record<string, string[]>
  totalPrice: number
}

interface DeliveryStepProps {
  form: FormData
  setForm: (form: FormData) => void
  cart: CartItem[]
  branchMenu: BranchMenu | null
  onContinue: () => void
  onBack: () => void
  language: string
  isPreOrder: boolean
  nextOpeningTime: string
  afterHoursMode: "pre-orders" | "blocked" | null
  email: string
  onEmailChange: (email: string) => void
  couponCode: string
  onCouponCodeChange: (code: string) => void
  couponValidation: CouponValidationResult | null
  couponValidating: boolean
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
}

export default function DeliveryStep({
  form,
  setForm,
  cart,
  branchMenu,
  onContinue,
  onBack,
  language,
  isPreOrder,
  nextOpeningTime,
  afterHoursMode,
  email = "",
  onEmailChange = () => { },
  couponCode = "",
  onCouponCodeChange = () => { },
  couponValidation = null,
  couponValidating = false,
  onApplyCoupon = () => { },
  onRemoveCoupon = () => { },
}: DeliveryStepProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
  const deliveryFee = couponValidation?.valid && couponValidation.coupon?.discount_type === "FREE_DELIVERY" ? 0 : (branchMenu?.deliveryFee || 0)
  const discountAmount = couponValidation?.valid ? (couponValidation.discount_amount || 0) : 0
  const total = couponValidation?.valid ? (couponValidation.final_total || subtotal + deliveryFee) : (subtotal + deliveryFee)

  return (
    <div className="p-6">
      {(isPreOrder || afterHoursMode === "pre-orders") ? (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-orange-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">
                Esta es una pre-orden
              </h4>
              <p className="text-orange-700">
                Tu pedido se preparará cuando abramos a las <span className="font-bold">{nextOpeningTime}</span>
              </p>
            </div>
          </div>
        </div>
      ) : afterHoursMode === "blocked" ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 text-lg mb-2">
                Lo sentimos, estamos cerrados
              </h4>
              <p className="text-red-700">
                Nuestro horario de atención es de <span className="font-bold">{nextOpeningTime}</span>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <h3 className="font-bold text-gray-900 mb-4">Datos de Entrega</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Nombre completo *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            <Phone className="w-4 h-4 inline mr-1" />
            Teléfono *
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="300 000 0000"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="tucorreo@ejemplo.com"
          />
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
            <Gift className="w-3 h-3" />
            <span>Opcional · Recibe tu resumen de pedido y acceso a promociones exclusivas</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            <MapPin className="w-4 h-4 inline mr-1" />
            Dirección de entrega *
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Calle, número, barrio, referencias..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            <CreditCard className="w-4 h-4 inline mr-1" />
            Método de pago *
          </label>
          <select
            value={form.payment}
            onChange={(e) => setForm({ ...form, payment: e.target.value as "wompi" | "cash" })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="wompi">Transferencia/Tarjeta</option>
            <option value="cash">Efectivo</option>
          </select>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="font-bold text-gray-900">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Domicilio:</span>
            <span className={`font-bold ${couponValidation?.valid && couponValidation.coupon?.discount_type === "FREE_DELIVERY" ? "text-green-600" : "text-gray-900"}`}>
              {couponValidation?.valid && couponValidation.coupon?.discount_type === "FREE_DELIVERY"
                ? "$0 (gratis)"
                : formatCOP(deliveryFee)
              }
            </span>
          </div>
          {couponValidation?.valid && discountAmount > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-green-600">Descuento ({couponValidation.coupon?.code}):</span>
              <span className="font-bold text-green-600">-{formatCOP(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-primary">{formatCOP(total)}</span>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-orange-900">¿Tienes un cupón?</span>
          </div>

          <div className="flex gap-2 w-full min-w-0">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
              placeholder="Código de cupón (ej: PIZZA20)"
              disabled={couponValidation?.valid === true}
              className="flex-1 min-w-0 border border-gray-200 rounded-xl 
                         px-3 py-2 text-sm focus:outline-none 
                         focus:ring-2 focus:ring-orange-300
                         disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={couponValidation?.valid ? onRemoveCoupon : onApplyCoupon}
              disabled={couponValidating || (!couponValidation?.valid && !couponCode?.trim())}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                         transition-colors disabled:opacity-50
                         bg-orange-500 hover:bg-orange-600 text-white"
            >
              {couponValidating ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  ...
                </span>
              ) : couponValidation?.valid ? "Quitar" : "Aplicar"}
            </button>
          </div>

          {/* Coupon Status Messages */}
          {couponValidating && (
            <div className="flex items-center gap-2 mt-3 text-sm text-orange-600">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span>Validando cupón...</span>
            </div>
          )}

          {couponValidation?.valid && (
            <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>
                {couponValidation.coupon?.discount_type === "PERCENTAGE" &&
                  `✓ Cupón aplicado — ${couponValidation.coupon.discount_value}% de descuento`
                }
                {couponValidation.coupon?.discount_type === "FIXED_AMOUNT" &&
                  `✓ Cupón aplicado — ${formatCOP(couponValidation.coupon.discount_value)} de descuento`
                }
                {couponValidation.coupon?.discount_type === "FREE_DELIVERY" &&
                  "✓ Cupón aplicado — ¡Domicilio gratis!"
                }
              </span>
            </div>
          )}

          {couponValidation?.error && (
            <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
              <XCircle className="w-4 h-4" />
              <span>
                {couponValidation.error === "NOT_FOUND" && "Cupón no encontrado"}
                {couponValidation.error === "INACTIVE" && "Este cupón no está activo"}
                {couponValidation.error === "EXPIRED" && "Este cupón ha vencido"}
                {couponValidation.error === "USAGE_LIMIT_REACHED" && "Este cupón ya alcanzó su límite de usos"}
                {couponValidation.error === "PHONE_LIMIT_REACHED" && "Ya usaste este cupón el máximo de veces permitido"}
                {couponValidation.error === "MIN_ORDER_NOT_MET" &&
                  `El pedido mínimo para este cupón es ${formatCOP(couponValidation.coupon?.min_order_value || 0)}`
                }
                {couponValidation.error === "BRANCH_NOT_ALLOWED" && "Este cupón no aplica en esta sucursal"}
                {couponValidation.error === "OUTSIDE_VALID_HOURS" && "Este cupón solo aplica en horario especial"}
                {couponValidation.error === "CAMPAIGN_NOT_STARTED" && "Este cupón aún no está activo"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Volver
        </button>
        <button
          onClick={onContinue}
          disabled={afterHoursMode === "blocked"}
          className={`flex-1 px-4 py-3 pizza-gradient text-white font-bold rounded-2xl hover:opacity-90 transition-colors text-sm ${afterHoursMode === "blocked" ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {language === "es" ? "Enviar Pedido" : "Send Order"}
        </button>
      </div>

      {/* Blocked mode warning */}
      {afterHoursMode === "blocked" && (
        <div className="mt-4 text-center">
          <p className="text-red-600 text-sm">
            Los pedidos están bloqueados fuera del horario de atención
          </p>
        </div>
      )}
    </div>
  )
}
