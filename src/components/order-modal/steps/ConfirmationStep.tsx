"use client"

import { Check, Clock } from "lucide-react"

interface ConfirmationStepProps {
  orderId: string | null
  dailyOrderId: string | null
  form: {
    name: string
    phone: string
    address: string
    payment: "wompi" | "cash"
  }
  cart: any[]
  branchMenu: any | null
  isPreOrder: boolean
  scheduledFor: string
  onClose: () => void
  language: string
}

export default function ConfirmationStep({
  orderId,
  dailyOrderId,
  form,
  branchMenu,
  isPreOrder,
  scheduledFor,
  onClose,
  language,
}: ConfirmationStepProps) {
  const displayId = dailyOrderId ||
    (orderId ? `#${orderId.substring(0, 6).toUpperCase()}` : "#000000")

  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center 
        justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>

      <h3 className="font-black text-gray-900 text-xl mb-2">
        {isPreOrder
          ? "¡Pre-orden Confirmada!"
          : language === "es" ? "¡Pedido Confirmado!" : "Order Confirmed!"}
      </h3>

      <p className="text-gray-600 mb-4">
        {isPreOrder
          ? `Tu pedido se preparará cuando abramos a las ${scheduledFor}`
          : language === "es"
            ? "Tu pedido ha sido recibido y está siendo preparado."
            : "Your order has been received and is being prepared."}
      </p>

      {isPreOrder && (
        <div className="inline-flex items-center gap-2 bg-orange-100 
          text-orange-700 px-4 py-2 rounded-full mb-4">
          <Clock className="w-4 h-4" />
          <span className="font-semibold text-sm">PRE-ORDEN · {scheduledFor}</span>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">Número de pedido:</p>
        <p className="font-mono font-bold text-primary text-lg">{displayId}</p>
      </div>

      <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Detalles de entrega:</h4>
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            <strong>Nombre:</strong> {form.name}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Teléfono:</strong> {form.phone}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Dirección:</strong> {form.address}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Tiempo estimado:</strong>{" "}
            {isPreOrder
              ? `Listo al abrir a las ${scheduledFor}`
              : branchMenu?.estimatedTime || "30-45 min"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            onClose()
            window.location.href = `/rastrear?phone=${encodeURIComponent(form.phone)}`
          }}
          className="flex-1 py-3 border border-primary text-primary 
            font-semibold rounded-xl hover:bg-primary/5 transition-colors"
        >
          {language === "es" ? "Rastrear Pedido" : "Track Order"}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 pizza-gradient text-white font-bold 
            rounded-xl hover:opacity-90 transition-opacity"
        >
          {language === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
    </div>
  )
}
