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

const GB_COBALT   = "#004B8D"
const GB_COBALT_3 = "#B9CFE6"

const formatCurrency = (value: number) =>
  `$${Intl.NumberFormat("us").format(value)}`

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      <p className="text-xs mb-2" style={{ color: "#A7A9AC" }}>{label}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2" style={{ color: "#636466" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.dataKey === "current" ? "Current" : "Previous"}
            </div>
            <span className="font-medium" style={{ color: "#141414" }}>
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: "#636466" }}>
          Sales per period
        </h2>
        <div className="flex gap-4 text-xs" style={{ color: "#A7A9AC" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GB_COBALT }} />
            Current
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GB_COBALT_3 }} />
            Previous
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E8F4" />

          <XAxis
            dataKey="date"
            tick={{ fill: "#A7A9AC", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: "#A7A9AC", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <defs>
            <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={GB_COBALT}   stopOpacity={0.25} />
              <stop offset="95%" stopColor={GB_COBALT}   stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPrevious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={GB_COBALT_3} stopOpacity={0.4} />
              <stop offset="95%" stopColor={GB_COBALT_3} stopOpacity={0} />
            </linearGradient>
          </defs>

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="previous"
            stroke={GB_COBALT_3}
            fill="url(#gradPrevious)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke={GB_COBALT}
            fill="url(#gradCurrent)"
            strokeWidth={2}
            dot={false}
          />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
