"use client";

import { Settings, RefreshCw } from "lucide-react";
import { BranchMenu, formatCOP } from "@/lib/menuData";
import MenuManager from "@/components/admin/MenuManager";

interface MenuTabProps {
  menuBranch: "norte" | "sur"
  editingMenu: boolean
  savingMenu: boolean
  currentMenu: BranchMenu
  setMenuBranch: (branch: "norte" | "sur") => void
  setEditingMenu: (editing: boolean) => void
  loadMenus: () => void
  saveMenu: (updatedMenu: BranchMenu) => Promise<void>
  forcedBranch?: "norte" | "sur"
}

export default function MenuTab({
  menuBranch,
  editingMenu,
  savingMenu,
  currentMenu,
  setMenuBranch,
  setEditingMenu,
  loadMenus,
  saveMenu,
  forcedBranch
}: MenuTabProps) {
  return (
    <div>
      {/* Branch selector */}
      <div className="flex items-center justify-between mb-6">
        {!forcedBranch && (
          <div className="flex gap-2">
            {(["norte", "sur"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setMenuBranch(b)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${menuBranch === b ? "pizza-gradient text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"
                  }`}
              >
                {b === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
              </button>
            ))}
          </div>
        )}

        {forcedBranch && (
          <div className="text-sm font-semibold text-gray-700">
            {forcedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
          </div>
        )}

        <div className="flex gap-2">
          {!editingMenu ? (
            <button
              onClick={() => setEditingMenu(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Editar Menú
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingMenu(false);
                loadMenus();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Cancelar
            </button>
          )}
        </div>
      </div>

      {editingMenu ? (
        <MenuManager
          menu={currentMenu}
          onSave={saveMenu}
          onCancel={() => setEditingMenu(false)}
          saving={savingMenu}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-black text-gray-900 mb-4">Vista Previa del Menú</h3>
          <div className="space-y-6">
            {currentMenu.categories.map((category) => (
              <div key={category.id} className="border-b border-gray-100 pb-6 last:border-0">
                <h4 className="font-bold text-gray-900 mb-2">{category.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.products.map((product) => (
                    <div key={product.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{product.name}</h5>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.status === "available"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                          }`}>
                          {product.status === "available" ? "Disponible" : "Agotado"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <p className="font-black text-primary">{formatCOP(product.basePrice)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {product.popular && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">Popular</span>}
                        {product.spicy && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">Picante</span>}
                        {product.vegetarian && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Veggie</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
