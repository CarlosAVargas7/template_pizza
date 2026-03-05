// lib/menuData.ts - Default menu data (also seeded to Firebase)
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string;
}

export interface MenuSize {
  id: string;
  label: string;
  extraPrice: number;
}

export interface MenuSpecialty {
  id: string;
  label: string;
  extraPrice: number;
}

export interface MenuDrink {
  id: string;
  label: string;
  price: number;
}

export interface BranchMenu {
  basePrice: number;
  description: string;
  sizes: MenuSize[];
  specialties: MenuSpecialty[];
  drinks: MenuDrink[];
}

export const defaultMenuNorte: BranchMenu = {
  basePrice: 35000,
  description: "Pizza cubierta con masa especial artesanal, salsa de tomate casera y queso mozzarella premium.",
  sizes: [
    { id: "mediana", label: "Mediana Estofada (6 porciones)", extraPrice: 0 },
    { id: "grande", label: "Grande Estofada (8 porciones)", extraPrice: 7000 },
  ],
  specialties: [
    { id: "hawaiana", label: "Hawaiana Artesanal", extraPrice: 0 },
    { id: "americana", label: "Americana", extraPrice: 0 },
    { id: "carnis", label: "Carnis", extraPrice: 0 },
    { id: "polloChampinon", label: "Pollo con Champiñón", extraPrice: 3500 },
    { id: "peperoniQueso", label: "Peperoni y Queso", extraPrice: 3500 },
  ],
  drinks: [
    { id: "quatro", label: "Quatro", price: 6000 },
    { id: "cocaColaZero", label: "Coca Cola Zero", price: 6000 },
    { id: "premio", label: "Premio", price: 6000 },
    { id: "sprite", label: "Sprite", price: 6000 },
    { id: "cocaCola", label: "Coca Cola", price: 6000 },
    { id: "aguaManzana", label: "Agua Brisa Manzana", price: 6000 },
    { id: "aguaMaracuya", label: "Agua Brisa Maracuyá", price: 6000 },
    { id: "noDesea", label: "No desea", price: 0 },
  ],
};

export const defaultMenuSur: BranchMenu = {
  basePrice: 35000,
  description: "Pizza cubierta con masa especial artesanal, salsa de tomate casera y queso mozzarella premium.",
  sizes: [
    { id: "mediana", label: "Mediana Estofada (6 porciones)", extraPrice: 0 },
    { id: "grande", label: "Grande Estofada (8 porciones)", extraPrice: 7000 },
  ],
  specialties: [
    { id: "hawaiana", label: "Hawaiana Artesanal", extraPrice: 0 },
    { id: "americana", label: "Americana", extraPrice: 0 },
    { id: "carnis", label: "Carnis", extraPrice: 0 },
    { id: "polloChampinon", label: "Pollo con Champiñón", extraPrice: 3500 },
    { id: "peperoniQueso", label: "Peperoni y Queso", extraPrice: 3500 },
    { id: "vegana", label: "Vegana Especial", extraPrice: 4000 },
  ],
  drinks: [
    { id: "quatro", label: "Quatro", price: 6000 },
    { id: "cocaColaZero", label: "Coca Cola Zero", price: 6000 },
    { id: "premio", label: "Premio", price: 6000 },
    { id: "sprite", label: "Sprite", price: 6000 },
    { id: "cocaCola", label: "Coca Cola", price: 6000 },
    { id: "aguaManzana", label: "Agua Brisa Manzana", price: 6000 },
    { id: "aguaMaracuya", label: "Agua Brisa Maracuyá", price: 6000 },
    { id: "noDesea", label: "No desea", price: 0 },
  ],
};

export const condiments = [
  { id: "pimienta", label: "Pimienta" },
  { id: "oregano", label: "Orégano" },
  { id: "salAjo", label: "Sal de Ajo" },
];

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
