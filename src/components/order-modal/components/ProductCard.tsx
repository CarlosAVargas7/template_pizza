"use client"

import { useState, useEffect } from "react"
import { Star, Flame, Leaf, Clock, Plus, Minus } from "lucide-react"
import { Product, calculateProductPrice, formatCOP } from "@/lib/menuData"

interface ProductCardProps {
  product: Product
  isExpanded: boolean
  onToggle: () => void
  onAddToCart: (product: Product, selectedOptions: Record<string, string[]>, quantity: number) => void
  language: string
  disabled?: boolean
}

export default function ProductCard({
  product,
  isExpanded,
  onToggle,
  onAddToCart,
  language,
}: ProductCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    // Initialize default selections
    const defaults: Record<string, string[]> = {}
    product.optionGroups.forEach((group) => {
      if (group.required && group.type === "radio") {
        defaults[group.id] = [group.options[0]?.id || ""]
      }
    })
    setSelectedOptions(defaults)
  }, [product])

  const handleOptionChange = (groupId: string, optionId: string, type: "radio" | "checkbox") => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev }
      if (type === "radio") {
        newOptions[groupId] = [optionId]
      } else {
        const current = newOptions[groupId] || []
        if (current.includes(optionId)) {
          newOptions[groupId] = current.filter((id) => id !== optionId)
        } else {
          newOptions[groupId] = [...current, optionId]
        }
      }
      return newOptions
    })
  }

  const handleAddToCart = () => {
    onAddToCart(product, selectedOptions, quantity)
    setQuantity(1)
    onToggle() // Close product card
  }

  const totalPrice = calculateProductPrice(product, selectedOptions) * quantity

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-bold text-gray-900">{product.name}</h5>
              <div className="flex items-center gap-1">
                {product.popular && <Star className="w-4 h-4 text-yellow-500" />}
                {product.spicy && <Flame className="w-4 h-4 text-red-500" />}
                {product.vegetarian && <Leaf className="w-4 h-4 text-green-500" />}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-black text-primary text-lg">{formatCOP(product.basePrice)}</span>
              {product.preparationTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {product.preparationTime}min
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="w-full py-2 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors text-sm"
        >
          {isExpanded ? "Ocultar opciones" : "Ver opciones"}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {product.optionGroups.map((group) => (
              <div key={group.id}>
                <h6 className="font-semibold text-gray-900 mb-2 text-sm">
                  {group.name}
                  {group.required && <span className="text-red-500 ml-1">*</span>}
                  {group.minSelections > 0 && (
                    <span className="text-gray-500 text-xs ml-1">
                      (Mín: {group.minSelections}, Máx: {group.maxSelections})
                    </span>
                  )}
                </h6>
                <div className="space-y-2">
                  {group.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type={group.type}
                          name={group.id}
                          checked={(selectedOptions[group.id] || []).includes(option.id)}
                          onChange={() => handleOptionChange(group.id, option.id, group.type)}
                          className="rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.name}</span>
                          {option.description && (
                            <p className="text-xs text-gray-500">{option.description}</p>
                          )}
                        </div>
                      </div>
                      {option.extraPrice > 0 && (
                        <span className="text-sm font-semibold text-primary">
                          +{formatCOP(option.extraPrice)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity selector */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total:</p>
                <p className="font-black text-primary text-lg">{formatCOP(totalPrice)}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 pizza-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
