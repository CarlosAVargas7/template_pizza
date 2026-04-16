"use client";

import { RefreshCw, Package } from "lucide-react";
import { OrderStatus } from "@/lib/store";
import { AdminOrder, DeliveryPerson } from "@/types/admin";
import OrderFilters from "../orders/OrderFilters";
import OrderCard from "../orders/OrderCard";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: { label: "Confirmado", color: "text-green-700", bg: "bg-green-100" },
  preparacion: { label: "En Preparación", color: "text-orange-700", bg: "bg-orange-100" },
  despachado: { label: "Despachado", color: "text-blue-700", bg: "bg-blue-100" },
  "pre-orden": { label: "Pre-orden", color: "text-purple-700", bg: "bg-purple-100" },
};
const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "preparacion", "despachado", "pre-orden"];

interface OrdersTabProps {
  orders: AdminOrder[]
  deliveryPersons: DeliveryPerson[]
  branchMenus: Record<string, any>
  selectedDate: string
  filteredBranch: "all" | "norte" | "sur"
  filteredStatus: "all" | OrderStatus
  filteredOrders: AdminOrder[]
  ordersLoading: boolean
  setSelectedDate: (date: string) => void
  setFilteredBranch: (branch: "all" | "norte" | "sur") => void
  setFilteredStatus: (status: "all" | OrderStatus) => void
  updateStatus: (orderId: string, status: OrderStatus) => void
  assignDeliveryToOrder: (orderId: string, deliveryPersonId: string) => void
  getTodayDate: () => string
  forcedBranch?: "norte" | "sur"
}

export default function OrdersTab({
  orders,
  deliveryPersons,
  branchMenus,
  selectedDate,
  filteredBranch,
  filteredStatus,
  filteredOrders,
  ordersLoading,
  setSelectedDate,
  setFilteredBranch,
  setFilteredStatus,
  updateStatus,
  assignDeliveryToOrder,
  getTodayDate,
  forcedBranch
}: OrdersTabProps) {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {/* Total */}
        <div className="p-4 rounded-2xl bg-gray-100">
          <p className="text-2xl font-black text-gray-800">
            {filteredOrders.length}
          </p>
          <p className="text-xs font-medium text-gray-500">
            {filteredBranch === "all"
              ? "Total"
              : filteredBranch === "norte"
                ? "Total Norte"
                : "Total Sur"}
          </p>
        </div>

        {/* Por estado */}
        {STATUSES.map((s) => {
          const count = filteredOrders.filter((o) => o.status === s).length
          const sc = STATUS_LABELS[s] ?? STATUS_LABELS["pendiente"]
          return (
            <div key={s} className={`p-4 rounded-2xl ${sc.bg}`}>
              <p className={`text-2xl font-black ${sc.color}`}>{count}</p>
              <p className={`text-xs font-medium ${sc.color}`}>{sc.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <OrderFilters
        selectedDate={selectedDate}
        filteredBranch={filteredBranch}
        filteredStatus={filteredStatus}
        onDateChange={setSelectedDate}
        onBranchChange={setFilteredBranch}
        onStatusChange={setFilteredStatus}
        onClear={() => {
          setFilteredBranch("all");
          setFilteredStatus("all");
        }}
        forcedBranch={forcedBranch}
      />

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">
            {selectedDate === getTodayDate()
              ? "Pedidos de Hoy"
              : `Pedidos del ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}`
            }
          </h3>
          {ordersLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Cargando...
            </div>
          )}
        </div>
        {filteredOrders.length === 0 && !ordersLoading && (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>
              {selectedDate === getTodayDate()
                ? "No hay pedidos para hoy"
                : `No hay pedidos para el ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}`
              }
            </p>
          </div>
        )}
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            deliveryPersons={deliveryPersons}
            branchMenus={branchMenus}
            onStatusChange={updateStatus}
            onAssignDelivery={assignDeliveryToOrder}
          />
        ))}
      </div>
    </div>
  );
}
