"use client"

import { useState } from "react"
import { Tag, TrendingUp, Users, X } from "lucide-react"
import type {
  Coupon,
  CouponFormData,
  CRMCustomer,
  CRMSegment,
} from "@/types/marketing"
import CouponForm from "../marketing/CouponForm"
import CouponTable from "../marketing/CouponTable"
import CouponRanking from "../marketing/CouponRanking"
import CRMTable from "../marketing/CRMTable"

interface MarketingTabProps {
  // Del hook useMarketing — Cupones
  coupons: Coupon[]
  loadingCoupons: boolean
  savingCoupon: boolean
  editingCoupon: Coupon | null
  showCouponForm: boolean
  couponForm: CouponFormData
  setCouponForm: (data: CouponFormData) => void
  openCreateForm: () => void
  openEditForm: (coupon: Coupon) => void
  closeForm: () => void
  saveCoupon: () => void
  deleteCoupon: (coupon: Coupon) => void
  toggleCouponStatus: (coupon: Coupon) => void

  // Sucursal forzada por rol
  forcedBranch?: "norte" | "sur"

  // Relanzamiento
  openRelaunchForm: (coupon: Coupon) => void
  relaunchingCoupon: boolean
  showRelaunchForm: boolean
  relaunchTarget: Coupon | null
  relaunchForm: {
    valid_from: string
    expires_at: string
    usage_limit: number
  }
  setRelaunchForm: (data: { valid_from: string; expires_at: string; usage_limit: number }) => void
  closeRelaunchForm: () => void
  relaunchCoupon: () => void

  // Del hook useMarketing — CRM
  customers: CRMCustomer[]
  filteredCustomers: CRMCustomer[]
  loadingCRM: boolean
  crmSegmentFilter: CRMSegment | "all"
  setCrmSegmentFilter: (segment: CRMSegment | "all") => void
  generateWhatsAppUrl: (customer: CRMCustomer, topCouponCode?: string) => string
  topCoupon: Coupon | undefined
  loadCRM: () => void
}

const AVAILABLE_BRANCHES = ["norte", "sur"]

type Subtab = "coupons" | "ranking" | "crm"

export default function MarketingTab({
  // Cupones
  coupons,
  loadingCoupons,
  savingCoupon,
  editingCoupon,
  showCouponForm,
  couponForm,
  setCouponForm,
  openCreateForm,
  openEditForm,
  closeForm,
  saveCoupon,
  deleteCoupon,
  toggleCouponStatus,

  forcedBranch,

  openRelaunchForm,
  relaunchingCoupon,
  showRelaunchForm,
  relaunchTarget,
  relaunchForm,
  setRelaunchForm,
  closeRelaunchForm,
  relaunchCoupon,

  // CRM
  customers,
  filteredCustomers,
  loadingCRM,
  crmSegmentFilter,
  setCrmSegmentFilter,
  generateWhatsAppUrl,
  topCoupon,
  loadCRM,
}: MarketingTabProps) {
  const [activeSubtab, setActiveSubtab] = useState<Subtab>("coupons")

  const effectiveBranches = forcedBranch ? [forcedBranch] : AVAILABLE_BRANCHES

  const subtabs = [
    { key: "coupons" as Subtab, label: "Cupones", icon: Tag },
    { key: "ranking" as Subtab, label: "Rendimiento", icon: TrendingUp },
    { key: "crm" as Subtab, label: "Clientes CRM", icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Subtabs Navigation */}
      <div className="flex border-b border-gray-200">
        {subtabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSubtab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer transition-colors border-b-2 ${activeSubtab === key
                ? "border-orange-500 text-orange-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Subtab Content */}
      <div>
        {/* Cupones Subtab */}
        {activeSubtab === "coupons" && (
          <div>
            {showCouponForm ? (
              <div className="bg-white rounded-2xl shadow-sm">
                {/* Form Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCoupon ? "Editar Cupón" : "Nuevo Cupón"}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {/* Form Content */}
                <div className="p-6">
                  <CouponForm
                    formData={couponForm}
                    onChange={setCouponForm}
                    onSave={saveCoupon}
                    onCancel={closeForm}
                    saving={savingCoupon}
                    isEditing={editingCoupon !== null}
                    availableBranches={effectiveBranches}
                    forcedBranch={forcedBranch}
                  />
                </div>
              </div>
            ) : (
              <CouponTable
                coupons={coupons}
                loading={loadingCoupons}
                onEdit={openEditForm}
                onDelete={deleteCoupon}
                onToggleStatus={toggleCouponStatus}
                onNewCoupon={openCreateForm}
                onRelaunch={openRelaunchForm}
              />
            )}
          </div>
        )}

        {/* Rendimiento Subtab */}
        {activeSubtab === "ranking" && (
          <CouponRanking
            coupons={coupons}
            loading={loadingCoupons}
            availableBranches={effectiveBranches}
            forcedBranch={forcedBranch}
          />
        )}

        {/* Clientes CRM Subtab */}
        {activeSubtab === "crm" && (
          <CRMTable
            customers={customers}
            filteredCustomers={filteredCustomers}
            loading={loadingCRM}
            crmSegmentFilter={crmSegmentFilter}
            onSegmentFilterChange={setCrmSegmentFilter}
            onRefresh={loadCRM}
            topCouponCode={topCoupon?.code}
            generateWhatsAppUrl={generateWhatsAppUrl}
          />
        )}
      </div>
    </div>
  )
}
