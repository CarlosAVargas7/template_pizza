"use client"

import { Insight } from "@/types/accounting"

interface InsightCardsProps {
  insights: Insight[]
}

const INSIGHT_STYLES = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    title: "text-green-900",
    text: "text-green-700",
  },
  warning: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    title: "text-orange-900",
    text: "text-orange-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    title: "text-blue-900",
    text: "text-blue-700",
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    title: "text-red-900",
    text: "text-red-700",
  },
}

export default function InsightCards({ insights }: InsightCardsProps) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="font-bold text-gray-900">Insights del Período</h4>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {insights.length} hallazgos
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, index) => {
          const style = INSIGHT_STYLES[insight.type as keyof typeof INSIGHT_STYLES]
            ?? INSIGHT_STYLES.info
          return (
            <div
              key={index}
              className={`${style.bg} ${style.border} border rounded-xl p-4 flex items-start gap-3`}
            >
              <div className={`${style.iconBg} rounded-lg w-9 h-9 flex items-center justify-center shrink-0 text-lg`}>
                {insight.icon}
              </div>
              <div>
                <p className={`font-semibold text-sm ${style.title}`}>
                  {insight.title}
                </p>
                <p className={`text-sm mt-0.5 ${style.text}`}>
                  {insight.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
