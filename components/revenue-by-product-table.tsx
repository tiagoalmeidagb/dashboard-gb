"use client"

import { useState } from "react"

type Row = {
  product: string
  y2025: number
  y2026: number
  quarter: number
  year: number
}

type Props = {
  data: Row[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getGrowth(current: number, previous: number) {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export default function RevenueByProductTable({ data }: Props) {
  const [expanded, setExpanded] = useState(false)

  const visibleData = expanded ? data : data.slice(0, 5)

  return (
    <div className="relative">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Product</th>
            <th>2025</th>
            <th>2026</th>
            <th>Quarter</th>
            <th>Year</th>
          </tr>
        </thead>

        <tbody>
          {visibleData.map((row) => {
            const growth = getGrowth(row.y2026, row.y2025)

            return (
              <tr key={row.product} className="border-t">
                <td className="py-3">{row.product}</td>

                <td>{formatCurrency(row.y2025)}</td>

                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {formatCurrency(row.y2026)}

                    {growth !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1
                        ${
                          growth >= 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {growth >= 0 ? "↑" : "↓"}
                        {Math.abs(growth).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </td>

                <td>{formatCurrency(row.quarter)}</td>
                <td>{formatCurrency(row.year)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Fade */}
      {!expanded && (
        <div className="absolute bottom-12 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}

      {/* Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-600 hover:text-black"
        >
          {expanded ? "View less" : "View all"}
        </button>
      </div>
    </div>
  )
}