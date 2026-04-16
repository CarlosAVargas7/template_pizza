"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import { useSchedules } from "@/hooks/useSchedules"
import { useAfterHoursSettings } from "@/hooks/useAfterHoursSettings"
import { MapPin, Phone, Clock } from "lucide-react"
import { toast } from "sonner"

interface BranchStepProps {
  selectedBranch: string | null
  onBranchSelect: (branch: "norte" | "sur") => void
  language: string
}

export default function BranchStep({
  selectedBranch,
  onBranchSelect,
  language,
}: BranchStepProps) {
  const { tx } = useLanguage()
  const [detecting, setDetecting] = useState(false)

  // Get schedules for both branches
  const norteSchedules = useSchedules("norte")
  const surSchedules = useSchedules("sur")

  // Get after-hours settings for both branches
  const norteAfterHours = useAfterHoursSettings("norte")
  const surAfterHours = useAfterHoursSettings("sur")

  const detectBranch = useCallback(async () => {
    if (!navigator.geolocation) return

    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // Medellín Norte approx center: 6.25, -75.57
        // If lat > 6.21 → Norte, else → Sur
        const branch = latitude > 6.21 ? "norte" : "sur"
        onBranchSelect(branch)
        setDetecting(false)
        toast.success(
          language === "es"
            ? `Sucursal ${branch === "norte" ? "Norte" : "Sur"} detectada automáticamente`
            : `Branch ${branch === "norte" ? "North" : "South"} detected automatically`
        )
      },
      () => {
        setDetecting(false)
        toast.error(language === "es" ? "No se pudo detectar tu ubicación" : "Could not detect your location")
      },
      { timeout: 10000 }
    )
  }, [onBranchSelect, language])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="font-black text-gray-900 mb-2">{tx.branches.title}</h3>
        <p className="text-gray-600 text-sm">{tx.branches.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["norte", "sur"] as const).map((branch) => {
          const data = tx.branches[branch]
          const isSelected = selectedBranch === branch
          return (
            <button
              key={branch}
              onClick={() => onBranchSelect(branch)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${isSelected
                ? "border-primary bg-red-50"
                : "border-white bg-white shadow-sm hover:shadow-md"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{data.name}</h4>
                  <p className="text-sm text-gray-600">{data.area}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {data.address}
                </p>
                <p className="text-gray-700">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {data.phone}
                </p>
                <p className="text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {branch === "norte" ?
                    (norteSchedules.loading || norteAfterHours.loading ? "Cargando horarios..." :
                      norteSchedules.isStoreOpen() ?
                        `Abierto ahora - Cierra a las ${norteSchedules.getCurrentDaySchedule()?.closeTime}` :
                        norteAfterHours.settings.mode === "pre-orders" ?
                          `Cerrado - Pre-órdenes disponibles (Abre: ${norteSchedules.getNextOpeningTime()})` :
                          `Cerrado - Pedidos bloqueados (Abre: ${norteSchedules.getNextOpeningTime()})`
                    ) :
                    (surSchedules.loading || surAfterHours.loading ? "Cargando horarios..." :
                      surSchedules.isStoreOpen() ?
                        `Abierto ahora - Cierra a las ${surSchedules.getCurrentDaySchedule()?.closeTime}` :
                        surAfterHours.settings.mode === "pre-orders" ?
                          `Cerrado - Pre-órdenes disponibles (Abre: ${surSchedules.getNextOpeningTime()})` :
                          `Cerrado - Pedidos bloqueados (Abre: ${surSchedules.getNextOpeningTime()})`
                    )
                  }
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={detectBranch}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {detecting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              {tx.branches.detecting}
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              {tx.branches.detect}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
