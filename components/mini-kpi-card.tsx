"use client"

import { ReactNode } from "react"

type Props = {
  title: string
  value: string | number
  icon: ReactNode
  growth?: number
}

export default function MiniKpiCard({
  title,
  value,
  icon,
  growth,
}: Props) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#f3f6f8]">
      
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-lime-300">
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{title}</span>
          <span className="text-lg font-semibold text-gray-900">
            {value}
          </span>
        </div>
      </div>

      {/* GROWTH */}
      {growth !== undefined && (
        <div
          className={`text-xs font-medium px-2 py-1 rounded-md ${
            growth >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {growth >= 0 ? "↑" : "↓"} {Math.abs(growth).toFixed(1)}%
        </div>
      )}
    </div>
  )
}