"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

type Device = {
  category: string
  sessions: number
  pct: number
}

type Props = {
  devices: Device[]
}

const DEVICE_ORDER = ["mobile", "desktop", "tablet"]

const DEVICE_COLORS: Record<string, string> = {
  mobile:  "#004B8D",
  desktop: "#7EB3E8",
  tablet:  "#C2D0E8",
}

const DEVICE_LABELS: Record<string, string> = {
  mobile:  "Mobile",
  desktop: "Desktop",
  tablet:  "Tablet",
}

export default function DeviceCard({ devices }: Props) {
  // Normalize and sort by our preferred order
  const normalized = DEVICE_ORDER.map((key) => {
    const found = devices.find((d) => d.category.toLowerCase() === key)
    return {
      key,
      label: DEVICE_LABELS[key],
      pct: found?.pct ?? 0,
      sessions: found?.sessions ?? 0,
      color: DEVICE_COLORS[key],
    }
  }).filter((d) => d.sessions > 0 || devices.length === 0)

  // Dominant device (highest pct)
  const dominant = normalized.reduce(
    (best, d) => (d.pct > best.pct ? d : best),
    normalized[0] ?? { label: "Mobile", pct: 0, color: "#004B8D", key: "mobile", sessions: 0 }
  )

  const hasData = normalized.some((d) => d.sessions > 0)

  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      {/* Header */}
      <div className="mb-1">
        <p className="text-sm font-semibold" style={{ color: "#141414" }}>
          Access by Device
        </p>
      </div>

      {!hasData && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: "#C2D0E8" }}>No data</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Donut chart */}
          <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: 160 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={normalized}
                  dataKey="pct"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {normalized.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold leading-none" style={{ color: "#141414" }}>
                {dominant.pct}%
              </span>
              <span className="text-xs mt-0.5" style={{ color: "#A7A9AC" }}>
                {dominant.label}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 space-y-2.5">
            {normalized.map((d) => (
              <div key={d.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm" style={{ color: "#636466" }}>
                    {d.label}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#141414" }}>
                  {d.pct}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
