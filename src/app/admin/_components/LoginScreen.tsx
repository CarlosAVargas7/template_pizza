"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface LoginScreenProps {
  onLogin: (role: string, branch?: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("general")
  const [selectedBranch, setSelectedBranch] = useState("norte")

  const getPassword = () => {
    if (selectedRole === "general") {
      return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"
    } else if (selectedRole === "branch") {
      if (selectedBranch === "norte") {
        return process.env.NEXT_PUBLIC_NORTE_PASSWORD || "norte123"
      } else if (selectedBranch === "sur") {
        return process.env.NEXT_PUBLIC_SUR_PASSWORD || "sur123"
      }
    } else if (selectedRole === "employee") {
      if (selectedBranch === "norte") {
        return process.env.NEXT_PUBLIC_EMPLEADO_NORTE_PASSWORD || "empleado123"
      } else if (selectedBranch === "sur") {
        return process.env.NEXT_PUBLIC_EMPLEADO_SUR_PASSWORD || "empleado123"
      }
    }
    return ""
  }

  const handleLogin = () => {
    const correctPassword = getPassword()
    if (password === correctPassword) {
      onLogin(selectedRole, (selectedRole === "branch" || selectedRole === "employee") ? selectedBranch : undefined)
    } else {
      toast.error("Contraseña incorrecta")
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 pizza-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Panel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Pizza Antioquia</p>
        </div>
        <div className="space-y-4">
          {/* Role Selector */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer pr-10"
            >
              <option value="general">Gerente General</option>
              <option value="branch">Gerente de Sucursal</option>
              <option value="employee">Empleado</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
          </div>

          {/* Branch Selector (show for branch manager and employee) */}
          {(selectedRole === "branch" || selectedRole === "employee") && (
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer pr-10"
              >
                <option value="norte">Sucursal Norte</option>
                <option value="sur">Sucursal Sur</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
            </div>
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Contraseña"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 pizza-gradient text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
          >
            Ingresar
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          <div className="space-y-1">
            <p>Gerente General: admin123</p>
            <p>Gerente Norte: norte123</p>
            <p>Gerente Sur: sur123</p>
            <p>Empleado Norte: empleado123</p>
            <p>Empleado Sur: empleado123</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
