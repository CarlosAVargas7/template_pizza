// lib/store.ts - Zustand global store
import { create } from "zustand";

export type Language = "es" | "en";
export type Branch = "norte" | "sur" | null;
export type OrderStatus = "pendiente" | "confirmado" | "preparacion" | "despachado";

export interface OrderItem {
  size: string;
  specialty: string;
  condiments: string[];
  drink: string;
  quantity: number;
  notes: string;
  price: number;
}

export interface Order {
  id?: string;
  branch: Branch;
  item: OrderItem;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: Date;
  total: number;
}

interface AppStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  orderModalOpen: boolean;
  setOrderModalOpen: (open: boolean) => void;
  cookiesAccepted: boolean | null;
  setCookiesAccepted: (v: boolean | null) => void;
  cookieBannerShown: boolean;
  setCookieBannerShown: (v: boolean) => void;
  selectedBranch: Branch;
  setSelectedBranch: (b: Branch) => void;
}

export const useStore = create<AppStore>((set) => ({
  language: "es",
  setLanguage: (lang) => set({ language: lang }),
  orderModalOpen: false,
  setOrderModalOpen: (open) => set({ orderModalOpen: open }),
  cookiesAccepted: null,
  setCookiesAccepted: (v) => set({ cookiesAccepted: v }),
  cookieBannerShown: false,
  setCookieBannerShown: (v) => set({ cookieBannerShown: v }),
  selectedBranch: null,
  setSelectedBranch: (b) => set({ selectedBranch: b }),
}));
