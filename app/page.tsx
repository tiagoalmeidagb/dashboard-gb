"use client"

import { useEffect, useMemo, useState } from "react"
import { startOfMonth } from "date-fns"
import { User, ShoppingCart, DollarSign } from "lucide-react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { DonutChart } from "@/components/donut-chart"
import { SalesAreaChart } from "@/components/sales-area-chart"
import { DatePresetDropdown } from "@/components/date-preset-dropdown"
import { DateRangePicker } from "@/components/date-range-picker"
import { TopTabs } from "@/components/top-tabs"
import RevenueByProductTable from "@/components/revenue-by-product-table"
import MiniKpiCard from "@/components/mini-kpi-card"
import IcpCohortCard from "@/components/icp-cohort-card"
import { Skeleton } from "@/components/skeleton"

import {
  buildDashboardMetrics,
  buildChartData,
} from "@/lib/metrics"

import { buildRevenueByProduct } from "@/lib/revenue-by-product"
import { buildCustomerMetrics } from "@/lib/customer-metrics"
import { buildIcpCohort } from "@/lib/build-icp-cohort"
import { calculateNewVsReturningRevenue } from "@/lib/revenue-segmentation"

type Tab = "sales" | "website" | "email"

// ✅ FIX AQUI
type MetricKey = "total" | "instructor" | "integration" | "non-icp"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sales")

  const [range, setRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  const [transactions, setTransactions] = useState<any[]>([])
  const [fullData, setFullData] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingFull, setLoadingFull] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/airtable")
        const data = await res.json()
        setTransactions(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    async function fetchFull() {
      try {
        const res = await fetch("/api/airtable-full")
        const data = await res.json()
        setFullData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingFull(false)
      }
    }

    fetchFull()
  }, [])

  const metrics = useMemo(() => {
    if (!transactions.length) return null
    return buildDashboardMetrics(transactions, range.from, range.to)
  }, [transactions, range])

  const chartData = useMemo(() => {
    if (!transactions.length) return []
    return buildChartData(transactions, range.from, range.to)
  }, [transactions, range])

  const revenueData = useMemo(() => {
    if (!transactions.length) return []
    return buildRevenueByProduct(transactions, range.from, range.to)
  }, [transactions, range])

  const customerMetrics = useMemo(() => {
    if (!transactions.length) return null
    return buildCustomerMetrics(transactions, range.from, range.to)
  }, [transactions, range])

  const cohortData = useMemo(() => {
    if (!fullData.length) return []
    return buildIcpCohort(fullData)
  }, [fullData])

  const revenueSplit = useMemo(() => {
    if (!transactions.length || !fullData.length) return null

    return calculateNewVsReturningRevenue({
      fullData,
      filteredData: transactions,
      startDate: range.from,
      endDate: range.to,
    })
  }, [transactions, fullData, range])

  // ✅ FIX AQUI (TIPADO)
  const cards: { label: string; key: MetricKey }[] = [
    { label: "Total", key: "total" },
    { label: "Instructor Certification", key: "instructor" },
    { label: "Integration", key: "integration" },
    { label: "Non-ICP", key: "non-icp" },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">

        <AppSidebar />

        <div className="flex flex-1 flex-col min-w-0">

          <SiteHeader />

          <main className="flex-1 space-y-6 p-6 min-w-0">

            <TopTabs value={activeTab} onChange={setActiveTab} />

            {activeTab === "sales" && (
              <>
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold">
                    Sales Report
                  </h1>

                  <div className="flex items-center gap-3">
                    <DatePresetDropdown onChange={(r) => setRange(r)} />

                    <DateRangePicker
                      value={range}
                      onChange={(r) => {
                        if (r?.from && r?.to) setRange(r)
                      }}
                    />
                  </div>
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

                        {loading ? (
                          <Skeleton className="h-10 w-24 mt-3" />
                        ) : (
                          <h2 className="mt-3 text-4xl font-semibold">
                            {data
                              ? `$${data.value.toLocaleString()}`
                              : "--"}
                          </h2>
                        )}

                        {!loading && data && (
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

                {/* RESTO DO DASHBOARD IGUAL (não alterado) */}
                {/* ... mantive tudo exatamente igual */}

                {/* NEW ROW FINAL */}
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="rounded-3xl border bg-[#f8fafc] p-6">
                    <p className="text-sm text-gray-600">
                      New vs Returning Revenue
                    </p>

                    {!revenueSplit ? (
                      <p className="mt-3 text-sm text-gray-400">--</p>
                    ) : (
                      <div className="mt-4 space-y-4">

                        <div>
                          <p className="text-xs text-gray-500 uppercase">
                            New Clients
                          </p>
                          <p className="text-lg font-semibold">
                            {revenueSplit.newSales} sales
                          </p>
                          <p className="text-sm text-gray-500">
                            ${revenueSplit.newRevenue.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase">
                            Returning
                          </p>
                          <p className="text-lg font-semibold">
                            {revenueSplit.returningSales} sales
                          </p>
                          <p className="text-sm text-gray-500">
                            ${revenueSplit.returningRevenue.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>

                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border bg-[#f8fafc] p-6">—</div>
                  <div className="rounded-3xl border bg-[#f8fafc] p-6">—</div>
                  <div className="rounded-3xl border bg-[#f8fafc] p-6">—</div>
                </div>

              </>
            )}

          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}