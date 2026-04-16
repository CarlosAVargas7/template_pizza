"use client"

import { useState, useEffect } from "react"
import {
  Users,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  Mail,
  UserX,
} from "lucide-react"
import { formatCOP } from "@/lib/menuData"
import { toast } from "sonner"
import type {
  CRMCustomer,
  CRMSegment,
} from "@/types/marketing"

interface CRMTableProps {
  customers: CRMCustomer[]
  filteredCustomers: CRMCustomer[]
  crmSegmentFilter: CRMSegment | "all"
  onSegmentFilterChange: (segment: CRMSegment | "all") => void
  onRefresh: () => void
  loading: boolean
  topCouponCode?: string
  generateWhatsAppUrl: (customer: CRMCustomer, topCouponCode?: string) => string
}

function formatLastOrderDate(timestamp: any): string {
  if (!timestamp) return "—"
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatBranch(branch: string): string {
  return branch.charAt(0).toUpperCase() + branch.slice(1)
}

export default function CRMTable({
  customers,
  filteredCustomers,
  crmSegmentFilter,
  onSegmentFilterChange,
  onRefresh,
  loading,
  topCouponCode,
  generateWhatsAppUrl,
}: CRMTableProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Reset copied states after 2 seconds
  useEffect(() => {
    if (copiedPhone) {
      const timer = setTimeout(() => setCopiedPhone(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedPhone])

  useEffect(() => {
    if (copiedEmail) {
      const timer = setTimeout(() => setCopiedEmail(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedEmail])

  // Calculate segment counts
  const segmentCounts = {
    active: customers.filter((c) => c.segment === "active").length,
    at_risk: customers.filter((c) => c.segment === "at_risk").length,
    inactive: customers.filter((c) => c.segment === "inactive").length,
  }

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedPhone(phone)
      toast.success("Teléfono copiado")
    } catch (error) {
      toast.error("Error al copiar teléfono")
    }
  }

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      toast.success("Email copiado")
    } catch (error) {
      toast.error("Error al copiar email")
    }
  }

  const handleWhatsApp = (customer: CRMCustomer) => {
    const url = generateWhatsAppUrl(customer, topCouponCode)
    window.open(url, "_blank")
  }

  const getSegmentBadgeColor = (segment: CRMSegment) => {
    switch (segment) {
      case "active":
        return "bg-green-100 text-green-700"
      case "at_risk":
        return "bg-yellow-100 text-yellow-700"
      case "inactive":
        return "bg-red-100 text-red-600"
    }
  }

  const getSegmentLabel = (segment: CRMSegment) => {
    switch (segment) {
      case "active":
        return "Activo"
      case "at_risk":
        return "En Riesgo"
      case "inactive":
        return "Inactivo"
    }
  }

  const getDaysColor = (days: number) => {
    if (days < 15) return "text-green-600"
    if (days <= 30) return "text-yellow-600"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">CRM — Clientes</h3>
          <span className="text-sm text-gray-500">({customers.length} clientes)</span>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 
           dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 
           hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors 
           text-sm text-gray-600 dark:text-gray-200"
        >
          <RefreshCw className="w-4 h-4 dark:text-gray-200" />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 mb-1">Activos</div>
              <div className="text-2xl font-bold text-green-700">{segmentCounts.active}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              &lt; 15 días
            </span>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-600 mb-1">En Riesgo</div>
              <div className="text-2xl font-bold text-yellow-700">{segmentCounts.at_risk}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
              15-30 días
            </span>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-red-600 mb-1">Inactivos</div>
              <div className="text-2xl font-bold text-red-700">{segmentCounts.inactive}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
              &gt; 30 días
            </span>
          </div>
        </div>
      </div>

      {/* Segment Filters */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Todos", count: customers.length },
            { key: "active", label: "Activos", count: segmentCounts.active },
            { key: "at_risk", label: "En Riesgo", count: segmentCounts.at_risk },
            { key: "inactive", label: "Inactivos", count: segmentCounts.inactive },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => onSegmentFilterChange(filter.key as CRMSegment | "all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${crmSegmentFilter === filter.key
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="p-12 text-center">
          <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {crmSegmentFilter === "all" && "Aún no hay clientes registrados."}
            {crmSegmentFilter === "active" && "No hay clientes activos en este período."}
            {crmSegmentFilter === "at_risk" && "No hay clientes en riesgo actualmente."}
            {crmSegmentFilter === "inactive" && "No hay clientes inactivos actualmente."}
          </h4>
          <p className="text-gray-500">
            {crmSegmentFilter === "all" && "Los clientes aparecerán aquí después de completar su primer pedido."}
            {crmSegmentFilter !== "all" && "Intenta cambiar el filtro de segmento o actualizar los datos."}
          </p>
        </div>
      )}

      {/* Table - Desktop */}
      {filteredCustomers.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-t border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Pedido
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Prom.
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursales
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.phone} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  {/* Cliente */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSegmentBadgeColor(
                          customer.segment
                        )}`}
                      >
                        {getSegmentLabel(customer.segment)}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {customer.total_orders} pedidos
                      </div>
                    </div>
                  </td>

                  {/* Teléfono */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{customer.phone}</span>
                      <button
                        onClick={() => handleCopyPhone(customer.phone)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copiar teléfono"
                      >
                        {copiedPhone === customer.phone ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    {customer.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{customer.email}</span>
                        <button
                          onClick={() => handleCopyEmail(customer.email!)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar email"
                        >
                          {copiedEmail === customer.email ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400" title="Sin email registrado">
                        —
                      </span>
                    )}
                  </td>

                  {/* Último Pedido */}
                  <td className="px-6 py-4">
                    <div>
                      <div className={`text-sm font-medium ${getDaysColor(customer.days_since_last_order)}`}>
                        Hace {customer.days_since_last_order} días
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatLastOrderDate(customer.last_order_date)}
                      </div>
                    </div>
                  </td>

                  {/* Ticket Promedio */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCOP(customer.avg_ticket)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: {formatCOP(customer.total_spent)}
                      </div>
                    </div>
                  </td>

                  {/* Sucursales */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {customer.branches_used.map((branch) => (
                        <span
                          key={branch}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          {formatBranch(branch)}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleWhatsApp(customer)}
                        className="p-1.5 text-green-500 hover:text-green-600 transition-colors"
                        title="Enviar mensaje WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      {customer.email && (
                        <button
                          onClick={() => handleCopyEmail(customer.email!)}
                          className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                          title="Copiar email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {filteredCustomers.length > 0 && (
        <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
          {filteredCustomers.map((customer) => (
            <div key={customer.phone} className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSegmentBadgeColor(
                      customer.segment
                    )}`}
                  >
                    {getSegmentLabel(customer.segment)}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    {customer.total_orders} pedidos
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWhatsApp(customer)}
                    className="p-1.5 text-green-500 hover:text-green-600 transition-colors"
                    title="Enviar mensaje WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  {customer.email && (
                    <button
                      onClick={() => handleCopyEmail(customer.email!)}
                      className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                      title="Copiar email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{customer.phone}</span>
                  <button
                    onClick={() => handleCopyPhone(customer.phone)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedPhone === customer.phone ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{customer.email}</span>
                    <button
                      onClick={() => handleCopyEmail(customer.email!)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedEmail === customer.email ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Last Order */}
              <div>
                <div className={`text-sm font-medium ${getDaysColor(customer.days_since_last_order)}`}>
                  Hace {customer.days_since_last_order} días
                </div>
                <div className="text-xs text-gray-500">
                  {formatLastOrderDate(customer.last_order_date)}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Ticket Promedio</div>
                  <div className="font-medium text-gray-900">
                    {formatCOP(customer.avg_ticket)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {formatCOP(customer.total_spent)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Sucursales</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {customer.branches_used.map((branch) => (
                      <span
                        key={branch}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                      >
                        {formatBranch(branch)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Segmentos: Activo &lt; 15 días · En Riesgo 15-30 días · Inactivo &gt; 30 días
          <br />
          Solo se muestran clientes con al menos un pedido completado.
        </p>
      </div>
    </div>
  )
}
