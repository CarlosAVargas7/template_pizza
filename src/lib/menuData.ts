// lib/menuData.ts - Dynamic menu system like GloriaFood
export interface Option {
  id: string;
  name: string;
  extraPrice: number;
  description?: string;
}

export interface OptionGroup {
  id: string;
  name: string;
  type: "radio" | "checkbox"; // radio = single selection, checkbox = multiple
  minSelections: number;
  maxSelections: number;
  required: boolean;
  options: Option[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string;
  status: "available" | "unavailable";
  optionGroups: OptionGroup[];
  category?: string; // Reference to parent category
  preparationTime?: number; // in minutes
  spicy?: boolean;
  vegetarian?: boolean;
  popular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  order: number; // For sorting categories
  products: Product[];
}

export interface BranchMenu {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  currency: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string; // "30-45 min"
}

// Helper functions
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateProductPrice(
  product: Product,
  selectedOptions: Record<string, string[]>,
): number {
  let total = product.basePrice;

  product.optionGroups.forEach((group) => {
    const selectedForGroup = selectedOptions[group.id] || [];
    selectedForGroup.forEach((optionId) => {
      const option = group.options.find((opt) => opt.id === optionId);
      if (option) {
        total += option.extraPrice;
      }
    });
  });

  return total;
}

export function validateProductOptions(
  product: Product,
  selectedOptions: Record<string, string[]>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  product.optionGroups.forEach((group) => {
    const selectedForGroup = selectedOptions[group.id] || [];
    const selectedCount = selectedForGroup.length;

    if (group.required && selectedCount === 0) {
      errors.push(`${group.name} es requerido`);
    }

    if (selectedCount < group.minSelections) {
      errors.push(
        `Debes seleccionar al menos ${group.minSelections} opción(es) en ${group.name}`,
      );
    }

    if (selectedCount > group.maxSelections) {
      errors.push(
        `Solo puedes seleccionar máximo ${group.maxSelections} opción(es) en ${group.name}`,
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Default menu structure for testing
export const defaultDynamicMenuNorte: BranchMenu = {
  id: "norte",
  name: "Pizza Antioquia - Norte",
  description: "Las mejores pizzas de Medellín con entrega a domicilio",
  currency: "COP",
  deliveryFee: 5000,
  minOrderAmount: 25000,
  estimatedTime: "30-45 min",
  categories: [
    {
      id: "pizzas",
      name: "Pizzas Artesanales",
      description: "Nuestras pizzas especiales con masa artesanal",
      image: "/images/pizzas-category.jpg",
      order: 1,
      products: [
        {
          id: "hawaiana",
          name: "Hawaiana Clásica",
          description: "Jamón, piña, queso mozzarella y salsa de tomate casera",
          basePrice: 35000,
          status: "available",
          popular: true,
          preparationTime: 25,
          optionGroups: [
            {
              id: "size",
              name: "Tamaño",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "mediana", name: "Mediana (6 porciones)", extraPrice: 0 },
                {
                  id: "grande",
                  name: "Grande (8 porciones)",
                  extraPrice: 7000,
                },
                {
                  id: "familiar",
                  name: "Familiar (12 porciones)",
                  extraPrice: 14000,
                },
              ],
            },
            {
              id: "crust",
              name: "Tipo de Masa",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "thin", name: "Delgada", extraPrice: 0 },
                { id: "thick", name: "Gruesa", extraPrice: 2000 },
                { id: "stuffed", name: "Rellena de Queso", extraPrice: 4000 },
              ],
            },
            {
              id: "extras",
              name: "Adiciones Extra",
              type: "checkbox",
              minSelections: 0,
              maxSelections: 5,
              required: false,
              options: [
                {
                  id: "extra-cheese",
                  name: "Queso Extra",
                  extraPrice: 5000,
                  description: "Doble porción de mozzarella",
                },
                { id: "pepperoni", name: "Pepperoni Extra", extraPrice: 4000 },
                { id: "mushrooms", name: "Champiñones", extraPrice: 3000 },
                { id: "olives", name: "Aceitunas", extraPrice: 2500 },
                { id: "bell-peppers", name: "Pimentón", extraPrice: 2000 },
              ],
            },
          ],
        },
        {
          id: "pepperoni",
          name: "Pepperoni Lovers",
          description: "Doble pepperoni, queso mozzarella y salsa especial",
          basePrice: 38000,
          status: "available",
          popular: true,
          spicy: true,
          preparationTime: 25,
          optionGroups: [
            {
              id: "size",
              name: "Tamaño",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "mediana", name: "Mediana (6 porciones)", extraPrice: 0 },
                {
                  id: "grande",
                  name: "Grande (8 porciones)",
                  extraPrice: 7000,
                },
                {
                  id: "familiar",
                  name: "Familiar (12 porciones)",
                  extraPrice: 14000,
                },
              ],
            },
            {
              id: "crust",
              name: "Tipo de Masa",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "thin", name: "Delgada", extraPrice: 0 },
                { id: "thick", name: "Gruesa", extraPrice: 2000 },
                { id: "stuffed", name: "Rellena de Queso", extraPrice: 4000 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "beverages",
      name: "Bebidas",
      description: "Acompaña tu pizza con nuestras bebidas",
      image: "/images/beverages-category.jpg",
      order: 2,
      products: [
        {
          id: "coca-cola",
          name: "Coca Cola",
          description: "La refrescante Coca Cola",
          basePrice: 6000,
          status: "available",
          optionGroups: [
            {
              id: "size",
              name: "Presentación",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "personal", name: "Personal 350ml", extraPrice: 0 },
                { id: "litro", name: "Litro", extraPrice: 4000 },
                { id: "dos-litros", name: "2 Litros", extraPrice: 8000 },
              ],
            },
          ],
        },
        {
          id: "agua",
          name: "Agua Brisa",
          description: "Agua mineral natural",
          basePrice: 5000,
          status: "available",
          vegetarian: true,
          optionGroups: [
            {
              id: "flavor",
              name: "Sabor",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "manzana", name: "Manzana", extraPrice: 0 },
                { id: "maracuya", name: "Maracuyá", extraPrice: 0 },
                { id: "natural", name: "Natural", extraPrice: 0 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "desserts",
      name: "Postres",
      description: "Dulce final para tu comida",
      image: "/images/desserts-category.jpg",
      order: 3,
      products: [
        {
          id: "brownie",
          name: "Brownie de Chocolate",
          description: "Brownie caliente con helado de vainilla",
          basePrice: 12000,
          status: "available",
          vegetarian: true,
          preparationTime: 10,
          optionGroups: [
            {
              id: "ice-cream",
              name: "Tipo de Helado",
              type: "radio",
              minSelections: 1,
              maxSelections: 1,
              required: true,
              options: [
                { id: "vainilla", name: "Vainilla", extraPrice: 0 },
                { id: "chocolate", name: "Chocolate", extraPrice: 2000 },
                { id: "fresa", name: "Fresa", extraPrice: 2000 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const defaultDynamicMenuSur: BranchMenu = {
  ...defaultDynamicMenuNorte,
  id: "sur",
  name: "Pizza Antioquia - Sur",
  categories: defaultDynamicMenuNorte.categories.map((cat) => ({
    ...cat,
    products: cat.products.map((product) => ({
      ...product,
      basePrice: product.basePrice + 2000, // Sur has slightly higher prices
    })),
  })),
};

export const condiments = [
  { id: "pimienta", label: "Pimienta" },
  { id: "oregano", label: "Orégano" },
  { id: "salAjo", label: "Sal de Ajo" },
];
