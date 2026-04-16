"use client";

import { useState, useEffect } from "react"
import {
  Package, Settings, Clock, User, DollarSign,
  LogOut, Tag, Moon, Sun
} from "lucide-react"

interface AdminLayoutProps {
  tab: "orders" | "menu" | "delivery" | "accounting" | "schedule" | "marketing"
  setTab: (tab: AdminLayoutProps["tab"]) => void
  ordersCount: number
  todayDate: string
  onLogout: () => void
  userRole?: string
  userBranch?: string
  children: React.ReactNode
}

export default function AdminLayout({
  tab,
  setTab,
  ordersCount,
  todayDate,
  onLogout,
  userRole,
  userBranch,
  children
}: AdminLayoutProps) {
  // Estado interno de hora y modo noche
  const [darkMode, setDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Reloj en tiempo real
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Aplicar dark mode al html root
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
      // Aplicar estilos directamente al admin container
      root.style.setProperty("--admin-bg", "#0f172a")
      root.style.setProperty("--admin-surface", "#1e293b")
      root.style.setProperty("--admin-border", "#334155")
      root.style.setProperty("--admin-text", "#f1f5f9")
      root.style.setProperty("--admin-text-muted", "#94a3b8")
    } else {
      root.classList.remove("dark")
      root.style.removeProperty("--admin-bg")
      root.style.removeProperty("--admin-surface")
      root.style.removeProperty("--admin-border")
      root.style.removeProperty("--admin-text")
      root.style.removeProperty("--admin-text-muted")
    }
  }, [darkMode])

  // Formatear fecha larga
  const formattedDate = currentTime.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).replace(/^\w/, (c) => c.toUpperCase())

  // Formatear hora
  const formattedTime = currentTime.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
  return (
    <>
      {/* Topbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          {/* Logo + contadores */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl pizza-gradient flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-black">PA</span>
            </div>
            <div>
              <h1 className="font-black text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              {userRole && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {userRole === "general" ? "Gerente General" :
                      userRole === "branch" ? `Gerente ${userBranch === "norte" ? "Norte" : "Sur"}` :
                        `Empleado ${userBranch === "norte" ? "Norte" : "Sur"}`}
                  </span>
                  {userBranch && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {userBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fecha + hora + acciones */}
          <div className="flex items-center gap-3">

            {/* Fecha y hora */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {formattedDate}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {formattedTime}
              </span>
            </div>

            {/* Separador */}
            <div className="hidden sm:block w-px h-8 bg-gray-200" />

            {/* Botón modo noche */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Modo claro" : "Modo noche"}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                 flex items-center justify-center transition-colors text-gray-500"
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-yellow-500" />
                : <Moon className="w-4 h-4" />
              }
            </button>

            {/* Separador */}
            <div className="w-px h-8 bg-gray-200" />

            {/* Botón salir */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700
                 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-0 pb-0 overflow-x-auto scrollbar-none">
          {(
            userRole === "employee"
              ? (["orders"] as const)
              : (["orders", "menu", "schedule", "delivery", "marketing", "accounting"] as const)
          ).map((t) => {
            const tabConfig: Record<string, { icon: React.ReactNode; label: string; shortLabel: string }> = {
              orders: {
                icon: (
                  <div className="relative">
                    <Package className="w-4 h-4" />
                    {ordersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5
                        bg-primary text-white text-[9px] font-bold rounded-full
                        flex items-center justify-center leading-none">
                        {ordersCount > 9 ? "9+" : ordersCount}
                      </span>
                    )}
                  </div>
                ),
                label: `Pedidos (${ordersCount})`,
                shortLabel: "Pedidos",
              },
              menu: {
                icon: <Settings className="w-4 h-4" />,
                label: "Menú",
                shortLabel: "Menú",
              },
              schedule: {
                icon: <Clock className="w-4 h-4" />,
                label: "Horarios",
                shortLabel: "Horarios",
              },
              delivery: {
                icon: <User className="w-4 h-4" />,
                label: "Domiciliarios",
                shortLabel: "Domicilio",
              },
              marketing: {
                icon: <Tag className="w-4 h-4" />,
                label: "Marketing",
                shortLabel: "Marketing",
              },
              accounting: {
                icon: <DollarSign className="w-4 h-4" />,
                label: "Contabilidad",
                shortLabel: "Contab.",
              },
            }
            const config = tabConfig[t]
            const isActive = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold
                  border-b-2 transition-colors whitespace-nowrap shrink-0 ${isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                {config.icon}
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen dark:bg-slate-900">
        {children}
      </div>
    </>
  );
}
