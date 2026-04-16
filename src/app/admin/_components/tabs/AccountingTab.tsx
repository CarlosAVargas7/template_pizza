"use client"

import { LogOut, Calendar, Loader2 } from "lucide-react"
import { PeriodType } from "@/types/accounting"
import KPICards from "../accounting/KPICards"
import SalesChart from "../accounting/SalesChart"
import InsightCards from "../accounting/InsightCards"
import ExportButton from "../accounting/ExportButton"
import ProductsChart from "../accounting/ProductsChart"
import CouponAnalytics from "../accounting/CouponAnalytics"

interface AccountingTabProps {
  accountingAuthenticated: boolean
  accountingPassword: string
  selectedPeriod: PeriodType
  selectedBranch: "all" | "norte" | "sur"
  customDateRange: { start: string; end: string }
  accountingStats: any
  loadingStats: boolean
  showAccountingDetails: boolean
  rawOrders: any[]
  setAccountingPassword: (v: string) => void
  setSelectedPeriod: (v: PeriodType) => void
  setSelectedBranch: (v: "all" | "norte" | "sur") => void
  setCustomDateRange: (v: { start: string; end: string }) => void
  setShowAccountingDetails: (v: boolean) => void
  setAccountingAuthenticated: (v: boolean) => void
  authenticateAccounting: () => void
  logoutAccounting: () => void
  forcedBranch?: "norte" | "sur"
}

export default function AccountingTab({
  accountingAuthenticated,
  accountingPassword,
  selectedPeriod,
  selectedBranch,
  customDateRange,
  accountingStats,
  loadingStats,
  showAccountingDetails,
  rawOrders,
  setAccountingPassword,
  setSelectedPeriod,
  setSelectedBranch,
  setCustomDateRange,
  setShowAccountingDetails,
  setAccountingAuthenticated,
  authenticateAccounting,
  logoutAccounting,
  forcedBranch
}: AccountingTabProps) {

  function getRangeLabel(
    period: string,
    customRange: { start: string; end: string }
  ): string {
    const formatDate = (d: Date) =>
      d.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (period === "today") return `Hoy, ${formatDate(today)}`
    if (period === "yesterday") {
      const d = new Date(today)
      d.setDate(today.getDate() - 1)
      return `Ayer, ${formatDate(d)}`
    }
    if (period === "this_week") {
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const adjustedDay = day === 0 ? 7 : day
      const diff = startOfWeek.getDate() - adjustedDay + 1
      startOfWeek.setDate(diff)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${formatDate(startOfWeek)} — ${formatDate(endOfWeek)}`
    }
    if (period === "last_week") {
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const adjustedDay = day === 0 ? 7 : day
      const diff = startOfWeek.getDate() - adjustedDay + 1
      startOfWeek.setDate(diff - 7)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${formatDate(startOfWeek)} — ${formatDate(endOfWeek)}`
    }
    if (period === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "this_quarter") {
      const quarter = Math.floor(now.getMonth() / 3)
      const start = new Date(now.getFullYear(), quarter * 3, 1)
      const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "last_quarter") {
      const quarter = Math.floor(now.getMonth() / 3)
      const lastQuarter = quarter === 0 ? 3 : quarter - 1
      const start = new Date(now.getFullYear(), lastQuarter * 3, 1)
      const end = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "this_semester") {
      const semester = Math.floor(now.getMonth() / 6)
      const start = new Date(now.getFullYear(), semester * 6, 1)
      const end = new Date(now.getFullYear(), (semester + 1) * 6, 0)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "last_semester") {
      const semester = Math.floor(now.getMonth() / 6)
      const lastSemester = semester === 0 ? 1 : semester - 1
      const start = new Date(now.getFullYear(), lastSemester * 6, 1)
      const end = new Date(now.getFullYear(), (lastSemester + 1) * 6, 0)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "this_year") {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "last_year") {
      const lastYear = now.getFullYear() - 1
      const start = new Date(lastYear, 0, 1)
      const end = new Date(lastYear, 11, 31)
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    if (period === "custom" && customRange.start && customRange.end) {
      const start = new Date(customRange.start + "T00:00:00")
      const end = new Date(customRange.end + "T00:00:00")
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    return ""
  }

  if (!accountingAuthenticated) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 pizza-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Módulo de Contabilidad</h3>
            <p className="text-gray-600 mb-6">
              Este módulo contiene información financiera sensible. Por favor ingresa la clave de acceso.
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Clave de contabilidad"
              value={accountingPassword}
              onChange={(e) => setAccountingPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              onKeyPress={(e) => { if (e.key === "Enter") authenticateAccounting() }}
            />
            <button
              onClick={authenticateAccounting}
              className="w-full pizza-gradient text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Ingresar a Contabilidad
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header with controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Title + range label */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Contabilidad</h2>
              {accountingStats?.dateRange && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {accountingStats.dateRange.label}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
              {getRangeLabel(selectedPeriod, customDateRange)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">

            {/* Period selector + custom date pickers */}
            <div className="flex flex-col gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-sm"
              >
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="this_week">Esta semana</option>
                <option value="last_week">Semana pasada</option>
                <option value="this_month">Este mes</option>
                <option value="last_month">Mes pasado</option>
                <option value="this_quarter">Este trimestre</option>
                <option value="last_quarter">Trimestre pasado</option>
                <option value="this_semester">Este semestre</option>
                <option value="last_semester">Semestre pasado</option>
                <option value="this_year">Este año</option>
                <option value="last_year">Año pasado</option>
                <option value="custom">Personalizado</option>
              </select>

              {selectedPeriod === "custom" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Inicio
                    </label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) =>
                        setCustomDateRange({ ...customDateRange, start: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Fin
                    </label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) =>
                        setCustomDateRange({ ...customDateRange, end: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Branch selector */}
            {!forcedBranch && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value as "all" | "norte" | "sur")}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-sm"
              >
                <option value="all">Todas las sucursales</option>
                <option value="norte">Sucursal Norte</option>
                <option value="sur">Sucursal Sur</option>
              </select>
            )}

            {forcedBranch && (
              <span className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700">
                {forcedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
              </span>
            )}

            {/* Export */}
            {accountingStats && (
              <ExportButton stats={accountingStats} orders={rawOrders} />
            )}

            {/* Logout */}
            <button
              onClick={logoutAccounting}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors text-sm text-gray-500"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loadingStats && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {accountingStats && !loadingStats && (
        <>
          <KPICards kpis={accountingStats.kpis} />
          <InsightCards insights={accountingStats.insights} />
          <SalesChart
            groupedStats={accountingStats.groupedStats}
            period={selectedPeriod}
            dailyStats={accountingStats.dailyStats}
            hourlyStats={accountingStats.hourlyStats}
          />
          <ProductsChart
            productStats={accountingStats.productStats}
            kpis={accountingStats.kpis}
          />
          <CouponAnalytics rawOrders={rawOrders} />
        </>
      )}
    </div>
  )
}