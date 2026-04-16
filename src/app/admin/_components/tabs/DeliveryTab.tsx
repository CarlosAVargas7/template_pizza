"use client"

import { DeliveryPerson } from "@/types/admin"
import { Edit, Power, Trash2 } from "lucide-react"

interface DeliveryTabProps {
  deliveryPersons: DeliveryPerson[]
  filteredDeliveryPersons: DeliveryPerson[]
  newDeliveryPerson: { name: string; phone: string; branch: "norte" | "sur" }
  deliveryFilter: "all" | "norte" | "sur"
  editingDeliveryPerson: DeliveryPerson | null
  setNewDeliveryPerson: (value: { name: string; phone: string; branch: "norte" | "sur" }) => void
  setDeliveryFilter: (filter: "all" | "norte" | "sur") => void
  addDeliveryPerson: () => void
  updateDeliveryPerson: () => void
  deleteDeliveryPerson: (id: string) => void
  toggleDeliveryPersonStatus: (id: string, active: boolean) => void
  startEditingDeliveryPerson: (person: DeliveryPerson) => void
  cancelEditing: () => void
  forcedBranch?: "norte" | "sur"
}

export default function DeliveryTab({
  deliveryPersons,
  filteredDeliveryPersons,
  newDeliveryPerson,
  deliveryFilter,
  editingDeliveryPerson,
  setNewDeliveryPerson,
  setDeliveryFilter,
  addDeliveryPerson,
  updateDeliveryPerson,
  deleteDeliveryPerson,
  toggleDeliveryPersonStatus,
  startEditingDeliveryPerson,
  cancelEditing,
  forcedBranch
}: DeliveryTabProps) {
  return (
    <div>
      {/* Add Delivery Person Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">
          {editingDeliveryPerson ? "Editar Domiciliario" : "Agregar Domiciliario"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre del domiciliario"
            value={newDeliveryPerson.name}
            onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, name: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="tel"
            placeholder="Número de teléfono"
            value={newDeliveryPerson.phone}
            onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, phone: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <select
            value={newDeliveryPerson.branch}
            onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, branch: e.target.value as "norte" | "sur" })}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="norte">Norte</option>
            <option value="sur">Sur</option>
          </select>
          <div className="flex gap-2">
            {editingDeliveryPerson ? (
              <>
                <button
                  onClick={updateDeliveryPerson}
                  className="flex-1 pizza-gradient text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  Actualizar
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={addDeliveryPerson}
                className="pizza-gradient text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                Agregar Domiciliario
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Persons List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Todos los Domiciliarios</h3>
            {!forcedBranch && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filtrar por:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { value: "all", label: "Todos" },
                    { value: "norte", label: "Norte" },
                    { value: "sur", label: "Sur" }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setDeliveryFilter(filter.value as any)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${deliveryFilter === filter.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {forcedBranch && (
              <div className="text-sm text-gray-600">
                {forcedBranch === "norte" ? "Sucursal Norte" : "Sucursal Sur"}
              </div>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {filteredDeliveryPersons.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {deliveryFilter === "all"
                ? "No hay domiciliarios registrados"
                : `No hay domiciliarios en la sucursal ${deliveryFilter === "norte" ? "Norte" : "Sur"}`
              }
            </div>
          ) : (
            filteredDeliveryPersons.map((person) => (
              <div key={person.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 pizza-gradient rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{person.name}</p>
                    <p className="text-sm text-gray-500">{person.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.branch === "norte"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                    }`}>
                    {person.branch === "norte" ? "Norte" : "Sur"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                    }`}>
                    {person.active ? "Activo" : "Inactivo"}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditingDeliveryPerson(person)}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleDeliveryPersonStatus(person.id, person.active)}
                      className={`p-1.5 rounded-lg transition-colors ${person.active
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      title={person.active ? "Desactivar" : "Activar"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDeliveryPerson(person.id)}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
