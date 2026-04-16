"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Clock, MessageCircle, ChevronDown } from "lucide-react";
import { AdminOrder, DeliveryPerson } from "@/types/admin";
import { OrderStatus } from "@/lib/store";
import { formatCOP } from "@/lib/menuData";
import { toast } from "sonner";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-gray-600", bg: "bg-gray-100" },
  confirmado: { label: "Confirmado", color: "text-green-700", bg: "bg-green-100" },
  preparacion: { label: "En Preparación", color: "text-orange-700", bg: "bg-orange-100" },
  despachado: { label: "Despachado", color: "text-blue-700", bg: "bg-blue-100" },
  "pre-orden": { label: "Pre-orden", color: "text-purple-700", bg: "bg-purple-100" },
};
const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "preparacion", "despachado"];

interface OrderCardProps {
  order: AdminOrder
  deliveryPersons: DeliveryPerson[]
  branchMenus: Record<string, any>
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onAssignDelivery: (orderId: string, deliveryPersonId: string) => void
}

// Helper function to get option names from IDs
const getOptionNames = (selectedOptions: Record<string, string[]>, branchMenu?: any): string[] => {
  if (!branchMenu || !selectedOptions) return [];

  const optionNames: string[] = [];

  branchMenu.categories?.forEach((category: any) => {
    category.products?.forEach((product: any) => {
      product.optionGroups?.forEach((group: any) => {
        if (selectedOptions[group.id]) {
          selectedOptions[group.id].forEach((optionId: string) => {
            const option = group.options.find((opt: any) => opt.id === optionId);
            if (option) {
              optionNames.push(option.name);
            }
          });
        }
      });
    });
  });

  return optionNames;
};

// WhatsApp functions
const whatsappLink = (order: AdminOrder) => {
  const branch = order.branch === "norte" ? "+573145550101" : "+573145550202";
  const orderId = order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
  const msg = encodeURIComponent(
    `Hola ${order.customerName}, tu pedido ${orderId} está ${STATUS_LABELS[order.status as OrderStatus]?.label.toLowerCase() || STATUS_LABELS["pendiente"].label.toLowerCase()}. Total: ${formatCOP(order.total)}.`
  );
  return `https://wa.me/${branch.replace("+", "")}?text=${msg}`;
};

const whatsappPreparationMessage = (order: AdminOrder) => {
  const orderId = order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
  const msg = encodeURIComponent(
    `¡Buenas noticias! Tu pedido ${orderId} ya entró al horno. Estará listo pronto. 🍕`
  );
  return `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${msg}`;
};

const whatsappDispatchClientMessage = (order: AdminOrder, deliveryPerson: DeliveryPerson) => {
  const orderId = order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`;
  const msg = encodeURIComponent(
    `¡Tu pedido va en camino! 🛵 El repartidor ${deliveryPerson.name} te lo entrega pronto.`
  );
  return `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${msg}`;
};

const whatsappDispatchDeliveryMessage = (order: AdminOrder, deliveryPerson: DeliveryPerson) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;
  const msg = encodeURIComponent(
    `Nuevo despacho:\n📍 Cliente: ${order.customerName}\n📞 Teléfono: ${order.phone}\n🏠 Dirección: ${order.address}\n🗺️ Maps: ${mapsUrl}\n💰 Total a cobrar: ${formatCOP(order.total)}\n💳 Método de pago: ${order.paymentMethod === "wompi" ? "Wompi" : "Efectivo"}`
  );
  return `https://wa.me/${deliveryPerson.phone.replace(/\D/g, '')}?text=${msg}`;
};

export default function OrderCard({
  order,
  deliveryPersons,
  branchMenus,
  onStatusChange,
  onAssignDelivery
}: OrderCardProps) {
  const sc = STATUS_LABELS[order.status as OrderStatus] ?? STATUS_LABELS["pendiente"];
  const createdDate = order.createdAt?.toDate?.();

  return (
    <motion.div
      key={order.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {order.dailyOrderId || `#${order.id.substring(0, 6).toUpperCase()}`}
              </span>
              <span className="font-mono text-xs text-gray-400">
                ID: {order.id.substring(0, 8).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                {order.branch === "norte" ? "Norte" : "Sur"}
              </span>
            </div>
            <h3 className="font-black text-gray-900">{order.customerName}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <a href={`tel:${order.phone}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
                <Phone className="w-3.5 h-3.5" />
                {order.phone}
              </a>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                {order.address}
              </span>
            </div>
            {createdDate && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3" />
                {createdDate.toLocaleString("es-CO")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-primary">{formatCOP(order.total)}</p>
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
          </div>
        </div>

        {/* Order details - Support both legacy and new format */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs">
          {order.items ? (
            // New dynamic format
            <div className="space-y-1">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="text-gray-700">
                  <span className="font-medium">{item.quantity}x {item.productName}</span>
                  {item.selectedOptions && (
                    <span className="text-gray-500 ml-1">
                      ({getOptionNames(item.selectedOptions, branchMenus[order.branch]).join(", ") || Object.values(item.selectedOptions || {}).flat().join(", ")})
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : order.item ? (
            // Legacy format
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <p className="text-gray-400">Especialidad</p>
                <p className="font-semibold text-gray-700 capitalize">{order.item?.specialty}</p>
              </div>
              <div>
                <p className="text-gray-400">Tamaño</p>
                <p className="font-semibold text-gray-700 capitalize">{order.item?.size}</p>
              </div>
              <div>
                <p className="text-gray-400">Bebida</p>
                <p className="font-semibold text-gray-700 capitalize">{order.item?.drink}</p>
              </div>
              <div>
                <p className="text-gray-400">Pago</p>
                <p className="font-semibold text-gray-700">
                  {order.paymentMethod === "wompi" ? "Wompi" : "Efectivo"}
                </p>
              </div>
              {order.item?.notes && (
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-gray-400">Notas</p>
                  <p className="font-medium text-gray-700 italic">{order.item.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No hay detalles del pedido</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Status selector */}
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className={`appearance-none pr-7 pl-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${sc.bg} ${sc.color} border-transparent`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]?.label || STATUS_LABELS["pendiente"].label}</option>
              ))}
              <option value="pre-orden" disabled>Pre-orden</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
          </div>

          {/* Automated WhatsApp buttons based on status */}
          {order.status === "preparacion" && (
            <button
              onClick={() => window.open(whatsappPreparationMessage(order), '_blank')}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Notificar Cliente
            </button>
          )}

          {order.status === "despachado" && (
            <>
              {/* WhatsApp Cliente */}
              <button
                onClick={() => {
                  const deliveryPerson = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
                  if (deliveryPerson) {
                    window.open(whatsappDispatchClientMessage(order, deliveryPerson), '_blank');
                  } else {
                    toast.error("Primero asigna un domiciliario");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-xl hover:bg-green-100 transition-colors border border-green-200"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Avisar Cliente
              </button>

              {/* WhatsApp Domiciliario */}
              <button
                onClick={() => {
                  const deliveryPerson = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
                  if (deliveryPerson) {
                    window.open(whatsappDispatchDeliveryMessage(order, deliveryPerson), '_blank');
                  } else {
                    toast.error("Primero asigna un domiciliario");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Enviar a Domiciliario
              </button>

              {/* Assign Delivery Person */}
              <select
                value={order.deliveryPersonId || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    onAssignDelivery(order.id, e.target.value);
                  }
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Asignar domiciliario</option>
                {deliveryPersons
                  .filter(dp => dp.branch === order.branch && dp.active)
                  .map((dp) => (
                    <option key={dp.id} value={dp.id}>{dp.name}</option>
                  ))}
              </select>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
