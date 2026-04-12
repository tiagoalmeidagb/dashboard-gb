"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"

type Props = {
  data: {
    instructor: number
    integration: number
    "non-icp": number
  } | null
}

const COLORS = {
  instructor: "#22c55e",
  integration: "#3b82f6",
  "non-icp": "#a855f7",
}

// 💰 formatação profissional
function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}

export function DonutChart({ data }: Props) {
  const chartData = data
    ? [
        {
          key: "instructor",
          name: "Instructor",
          value: data.instructor,
          color: COLORS.instructor,
        },
        {
          key: "integration",
          name: "Integration",
          value: data.integration,
          color: COLORS.integration,
        },
        {
          key: "non-icp",
          name: "Non-ICP",
          value: data["non-icp"],
          color: COLORS["non-icp"],
        },
      ]
    : []

  const total = chartData.reduce((acc, item) => acc + item.value, 0)

  const chartDataWithPercent = chartData
    .map((item) => ({
      ...item,
      percentage:
        total > 0 ? Math.round((item.value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="w-full flex flex-col gap-4">

      {total === 0 && (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-sm text-gray-400">
            No data for selected period
          </p>
        </div>
      )}

      {total > 0 && (
        <>
          {/* 🔥 CHART MAIOR */}
          <div className="relative w-full h-[220px] flex items-end justify-center">

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataWithPercent}
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}   // 🔥 maior
                  outerRadius={120} // 🔥 maior
                  paddingAngle={4}
                  stroke="none"
                  cy="85%"
                >
                  {chartDataWithPercent.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* 🔥 CENTER FIX */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none max-w-[180px]">
              <span className="text-xs text-gray-500">
                Total Sales
              </span>

              <span className="text-xl font-semibold text-center leading-tight">
                {formatCurrency(total)}
              </span>
            </div>

          </div>

          {/* LEGENDA */}
          <div className="flex flex-col gap-3">

            {chartDataWithPercent.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1"
                    style={{ backgroundColor: item.color }}
                  />

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {item.name}
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-semibold text-gray-700">
                  {item.percentage}%
                </span>
              </div>
            ))}

          </div>
        </>
      )}

    </div>
  )
}