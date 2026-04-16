"use client"

import { useState } from "react"
import { BranchMenu, Product, formatCOP } from "@/lib/menuData"
import { Clock, DollarSign, AlertCircle } from "lucide-react"
import ProductCard from "../components/ProductCard"

interface MenuStepProps {
  branchMenu: BranchMenu | null
  loadingMenu: boolean
  onAddToCart: (product: Product, selectedOptions: Record<string, string[]>) => void
  language: string
  isStoreOpen: boolean
  afterHoursMode: "pre-orders" | "blocked" | null
  nextOpeningTime: string
  onAfterHoursConfirm: () => void
}

export default function MenuStep({
  branchMenu,
  loadingMenu,
  onAddToCart,
  language,
  isStoreOpen,
  afterHoursMode,
  nextOpeningTime,
  onAfterHoursConfirm,
}: MenuStepProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  if (loadingMenu) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando menú...</p>
      </div>
    )
  }

  return (
    <div>
      {/* After-hours banner */}
      {!isStoreOpen && afterHoursMode && (
        <div>
          {afterHoursMode === "pre-orders" ? (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-8 h-8 text-orange-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-900 text-lg mb-2">
                    Estamos cerrados en este momento
                  </h3>
                  <p className="text-orange-700">
                    Puedes hacer una pre-orden y la prepararemos cuando abramos a las <span className="font-bold">{nextOpeningTime}</span>
                  </p>
                  <div className="mt-3 inline-block">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      PRE-ORDEN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : afterHoursMode === "blocked" ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 text-lg mb-2">
                    Estamos cerrados
                  </h3>
                  <p className="text-red-700">
                    Los pedidos no están disponibles ahora. Volvemos a las <span className="font-bold">{nextOpeningTime}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Product list */}
      <div className={afterHoursMode === "blocked" ? "opacity-50" : ""}>
        {branchMenu && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-black text-gray-900 mb-2">{branchMenu.name}</h3>
              <p className="text-gray-600 text-sm">{branchMenu.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {branchMenu.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Domicilio: {formatCOP(branchMenu.deliveryFee)}
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Mínimo: {formatCOP(branchMenu.minOrderAmount)}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {branchMenu.categories.map((category) => (
                <div key={category.id}>
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">{category.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.products
                      .filter((product) => product.status === "available")
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isExpanded={expandedProducts.has(product.id)}
                          onToggle={() => toggleProduct(product.id)}
                          onAddToCart={onAddToCart}
                          language={language}
                          disabled={afterHoursMode === "blocked"}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
