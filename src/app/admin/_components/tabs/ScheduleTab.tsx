"use client"

import { Clock, AlertCircle, Trash2 } from "lucide-react"

interface ScheduleTabProps {
  schedules: Record<string, any>
  editingSchedule: string | null
  scheduleBranch: "norte" | "sur"
  newSchedule: {
    openTime: string
    closeTime: string
    days: string[]
    isClosed: boolean
  }
  afterHoursNorte: "pre-orders" | "blocked"
  afterHoursSur: "pre-orders" | "blocked"
  setEditingSchedule: (v: string | null) => void
  setScheduleBranch: (v: "norte" | "sur") => void
  setNewSchedule: (v: any) => void
  addSchedule: () => void
  updateSchedule: (day: string, data: any) => void
  deleteSchedule: (day: string) => void
  deleteScheduleBlock: (schedules: any[]) => void
  saveAfterHoursSettings: (branch: "norte" | "sur", mode: "pre-orders" | "blocked") => void
  forcedBranch?: "norte" | "sur"
}

export default function ScheduleTab({
  schedules,
  editingSchedule,
  scheduleBranch,
  newSchedule,
  afterHoursNorte,
  afterHoursSur,
  setEditingSchedule,
  setScheduleBranch,
  setNewSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  deleteScheduleBlock,
  saveAfterHoursSettings,
  forcedBranch
}: ScheduleTabProps) {
  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Gestión de Horarios</h3>
            <p className="text-sm text-gray-500 mt-1">Configura los horarios de atención de la pizzería</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Branch Selector */}
            {!forcedBranch && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setScheduleBranch("norte")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${scheduleBranch === "norte"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Sucursal Norte
                </button>
                <button
                  onClick={() => setScheduleBranch("sur")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${scheduleBranch === "sur"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Sucursal Sur
                </button>
              </div>
            )}

            {forcedBranch && (
              <div className="text-sm font-medium text-gray-700">
                {forcedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-600">Horarios activos: {Object.keys(schedules).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* After-Hours Order Management */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">🕐 Gestión de Pedidos Fuera de Horario</h4>
        <p className="text-sm text-gray-600 mb-6">
          Configura cómo manejar los pedidos cuando la pizzería está cerrada
        </p>

        {/* Branch Selector for After-Hours */}
        <div className="mb-6">
          {!forcedBranch && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 w-fit">
              <button
                onClick={() => setScheduleBranch("norte")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${scheduleBranch === "norte"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Sucursal Norte
              </button>
              <button
                onClick={() => setScheduleBranch("sur")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${scheduleBranch === "sur"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Sucursal Sur
              </button>
            </div>
          )}

          {forcedBranch && (
            <div className="text-sm font-medium text-gray-700">
              {forcedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
            </div>
          )}
        </div>

        {/* After-Hours Options */}
        <div className="space-y-6">
          {/* Pre-Orders Option */}
          <div className="border border-gray-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="afterHoursMode"
                checked={(scheduleBranch === "norte" ? afterHoursNorte : afterHoursSur) === "pre-orders"}
                onChange={() => saveAfterHoursSettings(scheduleBranch, "pre-orders")}
                className="mt-1 w-4 h-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">Permitir Pre-órdenes</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Recomendado</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Los clientes pueden hacer pedidos fuera del horario de atención. Los pedidos se programan automáticamente para prepararse al abrir la tienda.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>El cliente ve:</strong> "Cerrado - Pre-órdenes disponibles (Abre: Mañana a las 10:00)"
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Cómo funciona:</strong> Si pide antes de abrir, se prepara ese día. Si pide después de cerrar, se programa para el día siguiente.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Blocked Orders Option */}
          <div className="border border-gray-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="afterHoursMode"
                checked={(scheduleBranch === "norte" ? afterHoursNorte : afterHoursSur) === "blocked"}
                onChange={() => saveAfterHoursSettings(scheduleBranch, "blocked")}
                className="mt-1 w-4 h-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">Bloquear Pedidos</span>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">Restricción</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Los pedidos fuera del horario de atención son completamente bloqueados. Los clientes solo pueden ordenar dentro del horario establecido.
                </p>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-700">
                    <strong>El cliente ve:</strong> "Cerrado - Pedidos bloqueados (Abre: Mañana a las 10:00)"
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    <strong>Cómo funciona:</strong> No se pueden hacer pedidos fuera del horario. Se muestra un mensaje claro de que la pizzería está cerrada.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-900">Estado Actual</span>
          </div>
          <p className="text-sm text-gray-600">
            Sucursal {scheduleBranch === "norte" ? "Norte" : "Sur"}:
            <span className={`font-semibold ml-1 ${(scheduleBranch === "norte" ? afterHoursNorte : afterHoursSur) === "pre-orders"
              ? "text-green-700"
              : "text-red-700"
              }`}>
              {(scheduleBranch === "norte" ? afterHoursNorte : afterHoursSur) === "pre-orders"
                ? "Pre-órdenes habilitadas"
                : "Pedidos bloqueados fuera de horario"
              }
            </span>
          </p>
        </div>
      </div>

      {/* Add/Edit Schedule Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          {editingSchedule ? "Editar Horario" : `Crear Bloque de Horarios - Sucursal ${scheduleBranch === "norte" ? "Norte" : "Sur"}`}
        </h4>

        {/* Time Range */}
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-3">🕐 Definir Rango de Horas</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Apertura</label>
              <input
                type="time"
                value={newSchedule.openTime}
                onChange={(e) => setNewSchedule((prev: any) => ({ ...prev, openTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Cierre</label>
              <input
                type="time"
                value={newSchedule.closeTime}
                onChange={(e) => setNewSchedule((prev: any) => ({ ...prev, closeTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {newSchedule.openTime && newSchedule.closeTime && (
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">
                📅 Horario: {newSchedule.openTime} – {newSchedule.closeTime}
              </p>
            </div>
          )}
        </div>

        {/* Day Selection */}
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-3">📆 Seleccionar Días Aplicables</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'lunes', label: 'Lunes' },
              { id: 'martes', label: 'Martes' },
              { id: 'miércoles', label: 'Miércoles' },
              { id: 'jueves', label: 'Jueves' },
              { id: 'viernes', label: 'Viernes' },
              { id: 'sábado', label: 'Sábado' },
              { id: 'domingo', label: 'Domingo' },
              { id: 'festivo', label: 'Festivo' }
            ].map(day => (
              <label key={day.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={newSchedule.days.includes(day.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewSchedule((prev: any) => ({ ...prev, days: [...prev.days, day.id] }));
                    } else {
                      setNewSchedule((prev: any) => ({ ...prev, days: prev.days.filter((d: any) => d !== day.id) }));
                    }
                  }}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>

          {newSchedule.days.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-700">
                ✅ Se aplicará a {newSchedule.days.length} día(s): {newSchedule.days.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Closed Option */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newSchedule.isClosed}
              onChange={(e) => setNewSchedule((prev: any) => ({ ...prev, isClosed: e.target.checked }))}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Marcar como Cerrado</span>
          </label>
          {newSchedule.isClosed && (
            <p className="text-xs text-gray-500 mt-1 ml-7">Los días seleccionados estarán cerrados</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={addSchedule}
            disabled={!newSchedule.openTime || !newSchedule.closeTime || newSchedule.days.length === 0}
            className="pizza-gradient text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Guardar Bloque de Horario
          </button>
          <button
            onClick={() => setNewSchedule({
              openTime: "",
              closeTime: "",
              days: [],
              isClosed: false
            })}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900">Horarios Configurados</h4>
            <span className="text-sm text-gray-500">{Object.keys(schedules).length} días configurados</span>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(schedules).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay horarios configurados</p>
              <p className="text-sm text-gray-400">Crea bloques de horarios para mostrarlos en la página principal</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {/* Group schedules by block */}
              {(() => {
                const blocks: Record<string, any[]> = {};
                Object.entries(schedules).forEach(([day, schedule]: [string, any]) => {
                  const blockId = schedule.blockId || 'individual';
                  if (!blocks[blockId]) blocks[blockId] = [];
                  blocks[blockId].push({ day, ...schedule });
                });

                return Object.entries(blocks).map(([blockId, blockSchedules]) => (
                  <div key={blockId} className="p-4 bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {blockSchedules[0].isClosed ? "Cerrado" : `${blockSchedules[0].openTime} – ${blockSchedules[0].closeTime}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            📅 {blockSchedules.map(s => s.day.replace(`${scheduleBranch}_`, '')).sort((a, b) => {
                              const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'festivo'];
                              return days.indexOf(a) - days.indexOf(b);
                            }).join(' • ')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteScheduleBlock(blockSchedules)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {blockSchedules.length} día(s) en este bloque
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
