"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Package,
  DollarSign,
  Clock,
  Flame,
  Leaf,
  Star,
} from "lucide-react";
import {
  BranchMenu,
  Category,
  Product,
  OptionGroup,
  Option,
  formatCOP,
} from "@/lib/menuData";
import { toast } from "sonner";

interface MenuManagerProps {
  menu: BranchMenu;
  onSave: (menu: BranchMenu) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function MenuManager({ menu, onSave, onCancel, saving }: MenuManagerProps) {
  const [editingMenu, setEditingMenu] = useState<BranchMenu>(JSON.parse(JSON.stringify(menu)));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const addCategory = () => {
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: "Nueva Categoría",
      description: "Descripción de la categoría",
      order: editingMenu.categories.length + 1,
      products: [],
    };
    setEditingMenu({
      ...editingMenu,
      categories: [...editingMenu.categories, newCategory],
    });
    toggleCategory(newCategory.id);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setEditingMenu({
      ...editingMenu,
      categories: editingMenu.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
    });
  };

  const deleteCategory = (categoryId: string) => {
    setEditingMenu({
      ...editingMenu,
      categories: editingMenu.categories.filter(cat => cat.id !== categoryId),
    });
    toast.success("Categoría eliminada");
  };

  const addProduct = (categoryId: string) => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: "Nuevo Producto",
      description: "Descripción del producto",
      basePrice: 30000,
      status: "available",
      optionGroups: [
        {
          id: `og_${Date.now()}`,
          name: "Opciones",
          type: "radio",
          minSelections: 1,
          maxSelections: 1,
          required: true,
          options: [
            { id: `opt_${Date.now()}`, name: "Opción 1", extraPrice: 0 },
          ],
        },
      ],
    };

    updateCategory(categoryId, {
      products: [...editingMenu.categories.find(cat => cat.id === categoryId)!.products, newProduct],
    });
    toggleProduct(newProduct.id);
  };

  const updateProduct = (categoryId: string, productId: string, updates: Partial<Product>) => {
    updateCategory(categoryId, {
      products: editingMenu.categories
        .find(cat => cat.id === categoryId)!
        .products.map(prod => (prod.id === productId ? { ...prod, ...updates } : prod)),
    });
  };

  const deleteProduct = (categoryId: string, productId: string) => {
    const category = editingMenu.categories.find(cat => cat.id === categoryId)!;
    updateCategory(categoryId, {
      products: category.products.filter(prod => prod.id !== productId),
    });
    toast.success("Producto eliminado");
  };

  const addOptionGroup = (categoryId: string, productId: string) => {
    const newOptionGroup: OptionGroup = {
      id: `og_${Date.now()}`,
      name: "Nuevo Grupo de Opciones",
      type: "radio",
      minSelections: 1,
      maxSelections: 1,
      required: true,
      options: [
        { id: `opt_${Date.now()}`, name: "Opción 1", extraPrice: 0 },
      ],
    };

    updateProduct(categoryId, productId, {
      optionGroups: [...editingMenu.categories
        .find(cat => cat.id === categoryId)!
        .products.find(prod => prod.id === productId)!.optionGroups, newOptionGroup],
    });
  };

  const updateOptionGroup = (categoryId: string, productId: string, optionGroupId: string, updates: Partial<OptionGroup>) => {
    const product = editingMenu.categories.find(cat => cat.id === categoryId)!.products.find(prod => prod.id === productId)!;
    updateProduct(categoryId, productId, {
      optionGroups: product.optionGroups.map(og =>
        og.id === optionGroupId ? { ...og, ...updates } : og
      ),
    });
  };

  const deleteOptionGroup = (categoryId: string, productId: string, optionGroupId: string) => {
    const product = editingMenu.categories.find(cat => cat.id === categoryId)!.products.find(prod => prod.id === productId)!;
    updateProduct(categoryId, productId, {
      optionGroups: product.optionGroups.filter(og => og.id !== optionGroupId),
    });
    toast.success("Grupo de opciones eliminado");
  };

  const addOption = (categoryId: string, productId: string, optionGroupId: string) => {
    const newOption: Option = {
      id: `opt_${Date.now()}`,
      name: "Nueva Opción",
      extraPrice: 0,
    };

    const optionGroup = editingMenu.categories
      .find(cat => cat.id === categoryId)!
      .products.find(prod => prod.id === productId)!
      .optionGroups.find(og => og.id === optionGroupId)!;

    updateOptionGroup(categoryId, productId, optionGroupId, {
      options: [...optionGroup.options, newOption],
    });
  };

  const updateOption = (categoryId: string, productId: string, optionGroupId: string, optionId: string, updates: Partial<Option>) => {
    const optionGroup = editingMenu.categories
      .find(cat => cat.id === categoryId)!
      .products.find(prod => prod.id === productId)!
      .optionGroups.find(og => og.id === optionGroupId)!;

    updateOptionGroup(categoryId, productId, optionGroupId, {
      options: optionGroup.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const deleteOption = (categoryId: string, productId: string, optionGroupId: string, optionId: string) => {
    const optionGroup = editingMenu.categories
      .find(cat => cat.id === categoryId)!
      .products.find(prod => prod.id === productId)!
      .optionGroups.find(og => og.id === optionGroupId)!;

    updateOptionGroup(categoryId, productId, optionGroupId, {
      options: optionGroup.options.filter(opt => opt.id !== optionId),
    });
    toast.success("Opción eliminada");
  };

  return (
    <div className="space-y-6">
      {/* Menu Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Información del Menú
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre</label>
            <input
              type="text"
              value={editingMenu.name}
              onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tiempo Estimado</label>
            <input
              type="text"
              value={editingMenu.estimatedTime}
              onChange={(e) => setEditingMenu({ ...editingMenu, estimatedTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Costo de Domicilio</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={editingMenu.deliveryFee}
                onChange={(e) => setEditingMenu({ ...editingMenu, deliveryFee: parseInt(e.target.value) || 0 })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-sm text-gray-400">COP</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Pedido Mínimo</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={editingMenu.minOrderAmount}
                onChange={(e) => setEditingMenu({ ...editingMenu, minOrderAmount: parseInt(e.target.value) || 0 })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-sm text-gray-400">COP</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
          <textarea
            value={editingMenu.description}
            onChange={(e) => setEditingMenu({ ...editingMenu, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Categorías ({editingMenu.categories.length})
          </h3>
          <button
            onClick={addCategory}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Agregar Categoría
          </button>
        </div>

        {editingMenu.categories.map((category, categoryIndex) => (
          <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Category Header */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                      className="font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-1"
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={category.description}
                onChange={(e) => updateCategory(category.id, { description: e.target.value })}
                placeholder="Descripción de la categoría..."
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <AnimatePresence>
              {expandedCategories.has(category.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {/* Products */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-700 text-sm">Productos ({category.products.length})</h4>
                      <button
                        onClick={() => addProduct(category.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-red-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar Producto
                      </button>
                    </div>

                    {category.products.map((product) => (
                      <div key={product.id} className="border border-gray-100 rounded-xl overflow-hidden">
                        {/* Product Header */}
                        <div className="p-3 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleProduct(product.id)}
                                className="flex items-center gap-2"
                              >
                                {expandedProducts.has(product.id) ? (
                                  <ChevronUp className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                )}
                                <input
                                  type="text"
                                  value={product.name}
                                  onChange={(e) => updateProduct(category.id, product.id, { name: e.target.value })}
                                  className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-1 text-sm"
                                />
                              </button>
                              <div className="flex items-center gap-1">
                                {product.popular && <Star className="w-3 h-3 text-yellow-500" />}
                                {product.spicy && <Flame className="w-3 h-3 text-red-500" />}
                                {product.vegetarian && <Leaf className="w-3 h-3 text-green-500" />}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={product.status}
                                onChange={(e) => updateProduct(category.id, product.id, { status: e.target.value as "available" | "unavailable" })}
                                className={`text-xs font-semibold px-2 py-1 rounded-full border ${product.status === "available"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                  }`}
                              >
                                <option value="available">Disponible</option>
                                <option value="unavailable">Agotado</option>
                              </select>
                              <button
                                onClick={() => deleteProduct(category.id, product.id)}
                                className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-gray-400" />
                              <input
                                type="number"
                                value={product.basePrice}
                                onChange={(e) => updateProduct(category.id, product.id, { basePrice: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <input
                                type="number"
                                value={product.preparationTime || 25}
                                onChange={(e) => updateProduct(category.id, product.id, { preparationTime: parseInt(e.target.value) || 25 })}
                                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="min"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={product.popular || false}
                                  onChange={(e) => updateProduct(category.id, product.id, { popular: e.target.checked })}
                                  className="rounded"
                                />
                                Popular
                              </label>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={product.spicy || false}
                                  onChange={(e) => updateProduct(category.id, product.id, { spicy: e.target.checked })}
                                  className="rounded"
                                />
                                Picante
                              </label>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={product.vegetarian || false}
                                  onChange={(e) => updateProduct(category.id, product.id, { vegetarian: e.target.checked })}
                                  className="rounded"
                                />
                                Veggie
                              </label>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={product.description}
                            onChange={(e) => updateProduct(category.id, product.id, { description: e.target.value })}
                            placeholder="Descripción del producto..."
                            className="w-full mt-2 px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>

                        <AnimatePresence>
                          {expandedProducts.has(product.id) && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              {/* Option Groups */}
                              <div className="p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-700 text-xs">Grupos de Opciones ({product.optionGroups.length})</h5>
                                  <button
                                    onClick={() => addOptionGroup(category.id, product.id)}
                                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-red-700 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Agregar Grupo
                                  </button>
                                </div>

                                {product.optionGroups.map((optionGroup) => (
                                  <div key={optionGroup.id} className="border border-gray-100 rounded-lg p-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <input
                                        type="text"
                                        value={optionGroup.name}
                                        onChange={(e) => updateOptionGroup(category.id, product.id, optionGroup.id, { name: e.target.value })}
                                        className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-1 text-xs"
                                      />
                                      <div className="flex items-center gap-1">
                                        <select
                                          value={optionGroup.type}
                                          onChange={(e) => updateOptionGroup(category.id, product.id, optionGroup.id, { type: e.target.value as "radio" | "checkbox" })}
                                          className="text-xs border border-gray-200 rounded px-1 py-0.5"
                                        >
                                          <option value="radio">Radio</option>
                                          <option value="checkbox">Checkbox</option>
                                        </select>
                                        <button
                                          onClick={() => deleteOptionGroup(category.id, product.id, optionGroup.id)}
                                          className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <label className="flex items-center gap-1 text-xs">
                                        <input
                                          type="checkbox"
                                          checked={optionGroup.required}
                                          onChange={(e) => updateOptionGroup(category.id, product.id, optionGroup.id, { required: e.target.checked })}
                                          className="rounded"
                                        />
                                        Requerido
                                      </label>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Min:</span>
                                        <input
                                          type="number"
                                          value={optionGroup.minSelections}
                                          onChange={(e) => updateOptionGroup(category.id, product.id, optionGroup.id, { minSelections: parseInt(e.target.value) || 0 })}
                                          className="w-8 px-1 py-0.5 border border-gray-200 rounded text-xs"
                                          min="0"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Max:</span>
                                        <input
                                          type="number"
                                          value={optionGroup.maxSelections}
                                          onChange={(e) => updateOptionGroup(category.id, product.id, optionGroup.id, { maxSelections: parseInt(e.target.value) || 1 })}
                                          className="w-8 px-1 py-0.5 border border-gray-200 rounded text-xs"
                                          min="1"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-600">Opciones ({optionGroup.options.length})</span>
                                        <button
                                          onClick={() => addOption(category.id, product.id, optionGroup.id)}
                                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-red-700 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                          Opción
                                        </button>
                                      </div>
                                      {optionGroup.options.map((option) => (
                                        <div key={option.id} className="flex items-center gap-2 bg-gray-50 rounded p-1">
                                          <input
                                            type="text"
                                            value={option.name}
                                            onChange={(e) => updateOption(category.id, product.id, optionGroup.id, option.id, { name: e.target.value })}
                                            className="flex-1 px-2 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                                          />
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-400">+$</span>
                                            <input
                                              type="number"
                                              value={option.extraPrice}
                                              onChange={(e) => updateOption(category.id, product.id, optionGroup.id, option.id, { extraPrice: parseInt(e.target.value) || 0 })}
                                              className="w-12 px-1 py-0.5 border border-gray-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                          </div>
                                          <button
                                            onClick={() => deleteOption(category.id, product.id, optionGroup.id, option.id)}
                                            className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          onClick={() => onSave(editingMenu)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar Menú"}
        </button>
      </div>
    </div>
  );
}
