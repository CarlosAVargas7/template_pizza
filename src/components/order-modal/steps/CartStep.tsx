"use client"

import { BranchMenu, Product, formatCOP } from "@/lib/menuData"
import { X, Plus, Minus } from "lucide-react"

interface CartStepProps {
  cart: CartItem[]
  onUpdateQuantity: (index: number, delta: number) => void
  onRemove: (index: number) => void
  onContinue: () => void
  onBack: () => void
  language: string
  branchMenu: BranchMenu | null | undefined
}

interface CartItem {
  product: Product
  quantity: number
  selectedOptions: Record<string, string[]>
  totalPrice: number
}

export default function CartStep({
  cart,
  onUpdateQuantity,
  onRemove,
  onContinue,
  onBack,
  language,
  branchMenu,
}: CartStepProps) {
  // Helper function to get option names from IDs
  const getOptionNames = (selectedOptions: Record<string, string[]>, menu?: BranchMenu): string[] => {
    if (!menu || !selectedOptions) return []

    const optionNames: string[] = []

    menu.categories?.forEach((category) => {
      category.products?.forEach((product) => {
        product.optionGroups?.forEach((group) => {
          if (selectedOptions[group.id]) {
            selectedOptions[group.id].forEach((optionId: string) => {
              const option = group.options.find((opt) => opt.id === optionId)
              if (option) {
                optionNames.push(option.name)
              }
            })
          }
        })
      })
    })

    return optionNames
  }
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)

  return (
    <div className="p-6">
      <h3 className="font-bold text-gray-900 mb-4">Tu Carrito</h3>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Tu carrito está vacío</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                  <p className="text-sm text-gray-600 mb-1">
                    {item.product.description || "Sin descripción"}
                  </p>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <p className="text-xs text-gray-500 mb-1">
                      {getOptionNames(item.selectedOptions, branchMenu || undefined).join(", ") || Object.values(item.selectedOptions).flat().join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{formatCOP(item.totalPrice)} c/u</p>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="font-bold text-primary">
                  {formatCOP(item.totalPrice * item.quantity)}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-900">Subtotal:</span>
              <span className="font-bold">{formatCOP(subtotal)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 
          text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
        >
          Volver al Menú
        </button>
        <button
          onClick={onContinue}
          disabled={cart.length === 0}
          className="flex-1 py-3 pizza-gradient text-white 
          font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Continuar ({cart.length})
        </button>
      </div>
    </div>
  )
}
