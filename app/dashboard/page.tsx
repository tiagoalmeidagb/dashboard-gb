"use client"

import { useMemo, useState } from "react"
import { startOfMonth, endOfMonth } from "date-fns"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { DonutChart } from "@/components/donut-chart"
import { DateRangePicker } from "@/components/date-range-picker"

import { generateFakeData } from "@/lib/fake-data"
import {
  buildDashboardMetrics,
  buildChartData,
} from "@/lib/metrics"

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function DashboardPage() {
  const [range, setRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const transactions = useMemo(() => generateFakeData(1500), [])

  const metrics = useMemo(() => {
    return buildDashboardMetrics(
      transactions,
      range.from,
      range.to
    )
  }, [transactions, range])

  const chartData = useMemo(() => {
    return buildChartData(
      transactions,
      range.from,
      range.to
    )
  }, [transactions, range])

  // ✅ FIX: tipagem correta dos cards
  const cards: {
    label: string
    key: "total" | "instructor" | "integration" | "non-icp"
  }[] = [
    { label: "Total", key: "total" },
    { label: "Instructor Certification", key: "instructor" },
    { label: "Integration", key: "integration" },
    { label: "Non-ICP", key: "non-icp" },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">

        <AppSidebar />

        <div className="flex flex-1 flex-col">

          <SiteHeader />

          <main className="flex-1 space-y-6 p-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">
                Sales Report
              </h1>

              <DateRangePicker
                value={range}
                onChange={(r) => {
                  if (r?.from && r?.to) setRange(r)
                }}
              />
            </div>

            {/* KPI CARDS */}
            <div className="grid gap-6 md:grid-cols-4">

              {cards.map((card) => {
                const data = metrics?.[card.key]

                return (
                  <div
                    key={card.key}
                    className="rounded-3xl border bg-[#f8fafc] p-6"
                  >
                    <p className="text-sm text-gray-600">
                      {card.label}
                    </p>

                    <h2 className="mt-3 text-4xl font-semibold">
                      {data
                        ? `$${data.value.toLocaleString()}`
                        : "--"}
                    </h2>

                    {data && (
                      <p
                        className={`mt-3 text-sm ${
                          data.growth >= 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {data.growth >= 0 ? "↑" : "↓"}{" "}
                        {Math.abs(Math.round(data.growth))}%
                      </p>
                    )}
                  </div>
                )
              })}

            </div>

            {/* AREA CHART */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-gray-700">
                  Sales per period
                </h2>

                <div className="flex gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-[6px] rounded bg-green-500" />
                    Current
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-[6px] rounded bg-blue-500" />
                    Previous
                  </div>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>

                    <defs>
                      <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>

                      <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="previous"
                      stroke="#3b82f6"
                      fill="url(#blue)"
                      strokeWidth={2}
                    />

                    <Area
                      type="monotone"
                      dataKey="current"
                      stroke="#22c55e"
                      fill="url(#green)"
                      strokeWidth={2}
                    />

                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* DONUT */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <DonutChart />
              </div>
            </div>

          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}