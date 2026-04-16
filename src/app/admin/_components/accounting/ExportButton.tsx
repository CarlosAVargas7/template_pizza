"use client"

import { useState, useEffect, useRef } from "react"
import { Download, FileText, BarChart2, Clock, ChevronDown } from "lucide-react"
import { AccountingStats } from "@/types/accounting"
import { 
  exportFullReportToCSV, 
  exportOrdersToCSV, 
  exportProductsToCSV, 
  exportHourlyToCSV 
} from "@/app/admin/_lib/csv-exporter"

interface ExportButtonProps {
  stats: AccountingStats
  orders: any[]
}

export default function ExportButton({ stats, orders }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleExport = (exportFunction: () => void) => {
    exportFunction()
    setIsOpen(false)
  }

  const exportOptions = [
    {
      icon: <Download className="w-4 h-4" />,
      label: "Exportar todo",
      description: "3 archivos CSV (ventas, productos, horarios)",
      action: () => handleExport(() => exportFullReportToCSV(stats, orders))
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Solo ventas",
      description: "Archivo CSV con todos los pedidos",
      action: () => handleExport(() => exportOrdersToCSV(orders, stats.dateRange))
    },
    {
      icon: <BarChart2 className="w-4 h-4" />,
      label: "Solo productos",
      description: "Archivo CSV con estadísticas de productos",
      action: () => handleExport(() => exportProductsToCSV(stats.productStats, stats.dateRange))
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Solo horarios",
      description: "Archivo CSV con datos por hora",
      action: () => handleExport(() => exportHourlyToCSV(stats.hourlyStats, stats.dateRange))
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        <Download className="w-4 h-4" />
        Exportar CSV
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2">
            {exportOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
