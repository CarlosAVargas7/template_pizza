"use client";

import { Calendar, Store, Package, RefreshCw } from "lucide-react";
import { OrderStatus } from "@/lib/store";
import { getTodayDate } from "../../_lib/firebase-helpers";

interface OrderFiltersProps {
  selectedDate: string
  filteredBranch: "all" | "norte" | "sur"
  filteredStatus: "all" | OrderStatus
  onDateChange: (date: string) => void
  onBranchChange: (branch: "all" | "norte" | "sur") => void
  onStatusChange: (status: "all" | OrderStatus) => void
  onClear: () => void
  forcedBranch?: "norte" | "sur"
}

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: { label: "Confirmado", color: "text-green-700", bg: "bg-green-100" },
  "pre-orden": { label: "Pre-orden", color: "text-purple-700", bg: "bg-purple-100" },
  preparacion: { label: "En Preparación", color: "text-orange-700", bg: "bg-orange-100" },
  despachado: { label: "Despachado", color: "text-blue-700", bg: "bg-blue-100" },
};
const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "pre-orden", "preparacion", "despachado"];

export default function OrderFilters({
  selectedDate,
  filteredBranch,
  filteredStatus,
  onDateChange,
  onBranchChange,
  onStatusChange,
  onClear,
  forcedBranch
}: OrderFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={getTodayDate()}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        />
      </div>
      {!forcedBranch && (
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-gray-400" />
          <select
            value={filteredBranch}
            onChange={(e) => onBranchChange(e.target.value as typeof filteredBranch)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="all">Todas las sucursales</option>
            <option value="norte">Norte</option>
            <option value="sur">Sur</option>
          </select>
        </div>
      )}

      {forcedBranch && (
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-gray-400" />
          <span className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700">
            {forcedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-400" />
        <select
          value={filteredStatus}
          onChange={(e) => onStatusChange(e.target.value as typeof filteredStatus)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="all">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Limpiar filtros
      </button>
    </div>
  );
}
