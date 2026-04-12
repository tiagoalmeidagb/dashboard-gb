"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts"

// 💰 formatter igual Tremor
const formatCurrency = (value: number) =>
  `$${Intl.NumberFormat("us").format(value)}`

// 🎯 tooltip estilo Tremor
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null

  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-gray-500 mb-2">{label}</p>

      <div className="space-y-1 text-sm">
        {payload.map((entry: any) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2 text-gray-600">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.dataKey === "current"
                ? "Current"
                : "Previous"}
            </div>

            <span className="font-medium text-gray-900">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SalesAreaChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-[320px]">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Sales per period
        </h2>

        <div className="flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Current
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Previous
          </div>
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>

          {/* grid leve */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          {/* eixo X clean */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* eixo Y com $ */}
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* gradients estilo Tremor */}
          <defs>
            <linearGradient id="current" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>

            <linearGradient id="previous" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <Tooltip content={<CustomTooltip />} />

          {/* linha previous (azul) */}
          <Area
            type="monotone"
            dataKey="previous"
            stroke="#3b82f6"
            fill="url(#previous)"
            strokeWidth={2}
            dot={false}
          />

          {/* linha current (verde) */}
          <Area
            type="monotone"
            dataKey="current"
            stroke="#10b981"
            fill="url(#current)"
            strokeWidth={2}
            dot={false}
          />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}