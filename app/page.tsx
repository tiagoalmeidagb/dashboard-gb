"use client"

import { useEffect, useRef, useState } from "react"
import { startOfMonth } from "date-fns"
import { User, ShoppingCart, DollarSign, Globe, Users, MousePointerClick, FileText, CircleDollarSign, GraduationCap, Plug, Package } from "lucide-react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar, type PageId } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { DonutChart } from "@/components/donut-chart"
import { SalesAreaChart } from "@/components/sales-area-chart"
import { DatePresetDropdown } from "@/components/date-preset-dropdown"
import { DateRangePicker } from "@/components/date-range-picker"
import { TopTabs } from "@/components/top-tabs"
import RevenueByProductTable from "@/components/revenue-by-product-table"
import MiniKpiCard from "@/components/mini-kpi-card"
import IcpCohortCard from "@/components/icp-cohort-card"
import WorldMapWidget from "@/components/world-map-widget"
import IcpFunnelChart from "@/components/icp-funnel-chart"
import DeviceCard from "@/components/device-card"
import UpsellCard from "@/components/upsell-card"
import NewVsReturningCard from "@/components/new-vs-returning-card"
import TrafficSourceCard from "@/components/traffic-source-card"
import { Skeleton } from "@/components/skeleton"
import { CampaignsTab } from "@/components/campaigns-tab"
import { ContentTab } from "@/components/content/content-tab"
import type { AnalyticsData } from "@/app/api/analytics/route"
import type { CohortItem } from "@/lib/build-icp-cohort"
import type { TimeToSecondPurchase } from "@/lib/time-to-second-purchase"
import type { ProductProgression } from "@/lib/product-progression"
import type { GoalProgress } from "@/lib/goal-progress"

/* ---------------------------------- */
/* TYPES                               */
/* ---------------------------------- */

type KpiEntry = { value: number; growth: number }

type DashboardData = {
  metrics: {
    total: KpiEntry
    instructor: KpiEntry
    integration: KpiEntry
    "non-icp": KpiEntry
  }
  chartData: { date: string; current: number; previous: number }[]
  revenueData: {
    product: string
    y2025: number
    y2026: number
    quarter: number
    year: number
  }[]
  customerMetrics: {
    sales: number
    salesGrowth: number
    avgPurchaseRate: number
    avgLTV: number
  }
  revenueSplit: {
    newRevenue: number
    returningRevenue: number
    newSales: number
    returningSales: number
  }
}

/* ---------------------------------- */
/* HELPERS                             */
/* ---------------------------------- */

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

type ExtrasData = {
  timeToSecondPurchase: TimeToSecondPurchase
  productProgression: ProductProgression
  goalProgress: GoalProgress
}

type Tab = "sales" | "website" | "email" | "campanhas" | "conteudo"

/* ---------------------------------- */
/* PAGE                                */
/* ---------------------------------- */

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageId>("gb-institute")
  const [activeTab, setActiveTab] = useState<Tab>("sales")

  const [range, setRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [cohortData, setCohortData] = useState<CohortItem[]>([])
  const [extrasData, setExtrasData] = useState<ExtrasData | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadingCohort, setLoadingCohort] = useState(true)
  const [loadingExtras, setLoadingExtras] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)

  const [analyticsRange, setAnalyticsRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [isRefetchingAnalytics, setIsRefetchingAnalytics] = useState(false)
  const analyticsAbortRef = useRef<AbortController | null>(null)

  /* ---------------- FETCH DASHBOARD (por período) ---------------- */

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    async function fetchDashboard() {
      if (dashboardData) setIsRefetching(true)

      try {
        const from = formatDate(range.from)
        const to = formatDate(range.to)
        const res = await fetch(`/api/dashboard?from=${from}&to=${to}`, {
          signal: controller.signal,
        })
        const data: DashboardData = await res.json()
        setDashboardData(data)
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setIsRefetching(false)
        }
      }
    }

    fetchDashboard()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  /* ---------------- FETCH COHORT (uma vez) ---------------- */

  useEffect(() => {
    async function fetchCohort() {
      try {
        const res = await fetch("/api/cohort")
        const data: CohortItem[] = await res.json()
        setCohortData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingCohort(false)
      }
    }
    fetchCohort()
  }, [])

  /* ---------------- FETCH EXTRAS (uma vez) ---------------- */

  useEffect(() => {
    async function fetchExtras() {
      try {
        const res = await fetch("/api/extras")
        const data: ExtrasData = await res.json()
        setExtrasData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingExtras(false)
      }
    }
    fetchExtras()
  }, [])

  /* ---------------- FETCH ANALYTICS (por período) ---------------- */

  useEffect(() => {
    analyticsAbortRef.current?.abort()
    const controller = new AbortController()
    analyticsAbortRef.current = controller

    async function fetchAnalytics() {
      if (analyticsData) setIsRefetchingAnalytics(true)

      try {
        const from = formatDate(analyticsRange.from)
        const to = formatDate(analyticsRange.to)
        const res = await fetch(`/api/analytics?from=${from}&to=${to}`, {
          signal: controller.signal,
        })
        const data: AnalyticsData = await res.json()
        setAnalyticsData(data)
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err)
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAnalytics(false)
          setIsRefetchingAnalytics(false)
        }
      }
    }
    fetchAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsRange])

  /* ---------------------------------- */

  const metrics = dashboardData?.metrics
  const chartData = dashboardData?.chartData ?? []
  const revenueData = dashboardData?.revenueData ?? []
  const customerMetrics = dashboardData?.customerMetrics
  const revenueSplit = dashboardData?.revenueSplit

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: "#F7F8FA" }}>

        <AppSidebar activePage={activePage} onPageChange={setActivePage} />

        <div className="flex flex-1 flex-col min-w-0">

          <SiteHeader />

          <main className="flex-1 min-w-0">

            {activePage !== "gb-institute" && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-3 text-gray-400">
                <span className="text-5xl">🚧</span>
                <p className="text-lg font-medium text-gray-500">Em breve</p>
                <p className="text-sm">Esta página ainda está a ser construída.</p>
              </div>
            )}

            {activePage === "gb-institute" && (
              <div className={`space-y-6 p-6 transition-opacity duration-200 ${isRefetching ? "opacity-50" : "opacity-100"}`}>

            <TopTabs value={activeTab} onChange={setActiveTab} />

            {activeTab === "sales" && (
              <>
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold" style={{ color: "#141414" }}>Sales Report</h1>

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
                  {(
                    [
                      { label: "Total",                   key: "total",       icon: <CircleDollarSign className="w-5 h-5" />, iconColor: "#E2211C" },
                      { label: "Instructor Certification", key: "instructor",  icon: <GraduationCap    className="w-5 h-5" />, iconColor: "#0046AD" },
                      { label: "Integration",              key: "integration", icon: <Plug             className="w-5 h-5" />, iconColor: "#1A1A1A" },
                      { label: "Non-ICP",                  key: "non-icp",    icon: <Package          className="w-5 h-5" />, iconColor: "#C8A800" },
                    ] as { label: string; key: keyof NonNullable<typeof metrics>; icon: React.ReactNode; iconColor: string }[]
                  ).map((card) => {
                    const data = metrics?.[card.key]

                    return (
                      <div
                        key={card.key}
                        className="rounded-3xl p-6"
                        style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span style={{ color: card.iconColor }}>{card.icon}</span>
                          <p className="text-sm" style={{ color: "#A7A9AC" }}>{card.label}</p>
                        </div>

                        {loading ? (
                          <Skeleton className="h-10 w-24" />
                        ) : (
                          <h2 className="text-4xl font-semibold" style={{ color: "#141414" }}>
                            {data ? `$${data.value.toLocaleString()}` : "--"}
                          </h2>
                        )}

                        {!loading && data && (
                          <p
                            className="mt-3 text-sm font-medium"
                            style={{ color: data.growth >= 0 ? "#16a34a" : "#E2211C" }}
                          >
                            {data.growth >= 0 ? "↑" : "↓"}{" "}
                            {Math.abs(Math.round(data.growth))}%
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* AREA + DONUT */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                  <div className="md:col-span-3 rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <SalesAreaChart data={chartData} />
                    )}
                  </div>

                  <div className="md:col-span-1 rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    <h2 className="text-sm font-medium mb-4" style={{ color: "#636466" }}>
                      Sales by category
                    </h2>

                    {loading ? (
                      <Skeleton className="h-[200px] w-full" />
                    ) : (
                      <DonutChart
                        data={{
                          instructor: metrics?.instructor?.value || 0,
                          integration: metrics?.integration?.value || 0,
                          "non-icp": metrics?.["non-icp"]?.value || 0,
                        }}
                      />
                    )}
                  </div>

                </div>

                {/* THIRD ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                  <div className="md:col-span-1 rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    <div className="space-y-4">

                      <MiniKpiCard
                        title="Sales"
                        value={customerMetrics?.sales || 0}
                        growth={customerMetrics?.salesGrowth}
                        icon={<ShoppingCart className="w-5 h-5" />}
                      />

                      <MiniKpiCard
                        title="Average Purchase Rate"
                        value={
                          customerMetrics
                            ? customerMetrics.avgPurchaseRate.toFixed(2)
                            : "0"
                        }
                        icon={<User className="w-5 h-5" />}
                      />

                      <MiniKpiCard
                        title="Average LTV"
                        value={
                          customerMetrics
                            ? `$${customerMetrics.avgLTV.toFixed(2)}`
                            : "$0"
                        }
                        icon={<DollarSign className="w-5 h-5" />}
                      />

                    </div>
                  </div>

                  <div className="md:col-span-3 rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    {loading ? (
                      <Skeleton className="h-[400px] w-full" />
                    ) : (
                      <RevenueByProductTable data={revenueData} />
                    )}
                  </div>

                </div>

                {/* COHORT */}
                <div className="w-full max-w-full overflow-hidden">
                  {loadingCohort ? (
                    <Skeleton className="h-[220px] w-full" />
                  ) : (
                    <IcpCohortCard data={cohortData} />
                  )}
                </div>

                {/* NEW VS RETURNING */}
                <div className="grid gap-6 md:grid-cols-4">

                  {/* CARD 1 — New vs Returning */}
                  <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    <p className="text-sm" style={{ color: "#A7A9AC" }}>New vs Returning Revenue</p>

                    {loading || !revenueSplit ? (
                      <p className="mt-3 text-sm" style={{ color: "#C2D0E8" }}>--</p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "#8A9AB8" }}>New Clients</p>
                          <p className="text-lg font-semibold" style={{ color: "#141414" }}>{revenueSplit.newSales} sales</p>
                          <p className="text-sm" style={{ color: "#004B8D" }}>
                            ${revenueSplit.newRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "#8A9AB8" }}>Returning</p>
                          <p className="text-lg font-semibold" style={{ color: "#141414" }}>{revenueSplit.returningSales} sales</p>
                          <p className="text-sm" style={{ color: "#B9CFE6" }}>
                            ${revenueSplit.returningRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD 2 — Time to 2nd & 3rd Purchase */}
                  <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    <p className="text-sm" style={{ color: "#A7A9AC" }}>Purchase Intervals</p>

                    {loadingExtras ? (
                      <Skeleton className="h-24 w-full mt-3" />
                    ) : (
                      <div className="mt-3 space-y-4">
                        {/* 1ª → 2ª */}
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8A9AB8" }}>1st → 2nd purchase</p>
                          <h2 className="text-3xl font-semibold" style={{ color: "#141414" }}>
                            {extrasData?.timeToSecondPurchase.medianDays ?? "--"}{" "}
                            <span className="text-xl font-normal" style={{ color: "#A7A9AC" }}>days</span>
                          </h2>
                          <p className="mt-0.5 text-xs" style={{ color: "#8A9AB8" }}>
                            {extrasData?.timeToSecondPurchase.customerCount ?? 0} customers
                          </p>
                        </div>

                        <div style={{ borderTop: "1px solid #E0E8F4" }} />

                        {/* 2ª → 3ª */}
                        <div>
                          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8A9AB8" }}>2nd → 3rd purchase</p>
                          <h2 className="text-3xl font-semibold" style={{ color: "#141414" }}>
                            {extrasData?.timeToSecondPurchase.medianDaysTo3rd ?? "--"}{" "}
                            <span className="text-xl font-normal" style={{ color: "#A7A9AC" }}>days</span>
                          </h2>
                          <p className="mt-0.5 text-xs" style={{ color: "#8A9AB8" }}>
                            {extrasData?.timeToSecondPurchase.customerCountTo3rd ?? 0} customers
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD 3 — Product Progression */}
                  <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    <p className="text-sm" style={{ color: "#A7A9AC" }}>Product Progression</p>

                    {loadingExtras ? (
                      <Skeleton className="h-32 w-full mt-3" />
                    ) : (
                      <div className="mt-3 space-y-2">
                        {extrasData?.productProgression.transitions.length === 0 && (
                          <p className="text-sm" style={{ color: "#C2D0E8" }}>No data</p>
                        )}
                        {extrasData?.productProgression.transitions.map((t, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between mb-0.5">
                              <span className="truncate max-w-[80%]" style={{ color: "#636466" }}>{t.from} → {t.to}</span>
                              <span className="font-medium ml-2" style={{ color: "#141414" }}>{t.pct}%</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ background: "#E0E8F4" }}>
                              <div className="h-1 rounded-full transition-all" style={{ width: `${t.pct}%`, background: "#004B8D" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CARD 4 — 2026 Goal Progress */}
                  <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                    <p className="text-sm" style={{ color: "#A7A9AC" }}>2026 Goal Progress</p>

                    {loadingExtras ? (
                      <Skeleton className="h-32 w-full mt-3" />
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: "#636466" }}>Instructor Cert.</span>
                            <span className="font-medium" style={{ color: "#141414" }}>
                              {extrasData?.goalProgress.instructor.pct ?? 0}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: "#E0E8F4" }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${extrasData?.goalProgress.instructor.pct ?? 0}%`, background: "#E2211C" }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1" style={{ color: "#A7A9AC" }}>
                            <span>${(extrasData?.goalProgress.instructor.current ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            <span>$303k</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: "#636466" }}>Non-ICP</span>
                            <span className="font-medium" style={{ color: "#141414" }}>
                              {extrasData?.goalProgress.nonIcp.pct ?? 0}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: "#E0E8F4" }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${extrasData?.goalProgress.nonIcp.pct ?? 0}%`, background: "#004B8D" }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1" style={{ color: "#A7A9AC" }}>
                            <span>${(extrasData?.goalProgress.nonIcp.current ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            <span>$50k</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </>
            )}

            {activeTab === "campanhas" && (
              <CampaignsTab />
            )}

            {activeTab === "conteudo" && (
              <ContentTab />
            )}

            {activeTab === "website" && (
              <div className={`space-y-6 transition-opacity duration-200 ${isRefetchingAnalytics ? "opacity-50" : "opacity-100"}`}>

                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold">Website Report</h1>
                  <div className="flex items-center gap-3">
                    <DatePresetDropdown onChange={(r) => setAnalyticsRange(r)} />
                    <DateRangePicker
                      value={analyticsRange}
                      onChange={(r) => {
                        if (r?.from && r?.to) setAnalyticsRange(r)
                      }}
                    />
                  </div>
                </div>

                {/* ROW 1 — 4 KPI cards */}
                <div className="grid gap-6 md:grid-cols-4">
                  {[
                    {
                      label: "Sessions",
                      value: analyticsData?.sessions.toLocaleString() ?? "--",
                      icon: <Globe className="w-5 h-5" />,
                    },
                    {
                      label: "Users",
                      value: analyticsData?.users.toLocaleString() ?? "--",
                      icon: <Users className="w-5 h-5" />,
                    },
                    {
                      label: "Bounce Rate",
                      value: analyticsData
                        ? `${(analyticsData.bounceRate * 100).toFixed(1)}%`
                        : "--",
                      icon: <MousePointerClick className="w-5 h-5" />,
                    },
                    {
                      label: "Pageviews",
                      value: analyticsData?.pageviews.toLocaleString() ?? "--",
                      icon: <FileText className="w-5 h-5" />,
                    },
                  ].map((card) => (
                    <div key={card.label} className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}>
                      <div className="flex items-center gap-3 mb-3" style={{ color: "#A7A9AC" }}>
                        {card.icon}
                        <p className="text-sm">{card.label}</p>
                      </div>
                      {loadingAnalytics ? (
                        <Skeleton className="h-10 w-24" />
                      ) : (
                        <h2 className="text-4xl font-semibold" style={{ color: "#141414" }}>{card.value}</h2>
                      )}
                    </div>
                  ))}
                </div>

                {/* ROW 2 — 3 cols iguais (33% cada) */}
                <div className="grid gap-6 md:grid-cols-3">

                  {/* Col 1 — New vs Returning */}
                  <div className="flex flex-col">
                    {loadingAnalytics ? (
                      <Skeleton className="h-full w-full rounded-3xl" />
                    ) : (
                      <NewVsReturningCard
                        newUsers={analyticsData?.newUsers ?? 0}
                        returningUsers={analyticsData?.returningUsers ?? 0}
                        users={analyticsData?.users ?? 1}
                      />
                    )}
                  </div>

                  {/* Col 2 — Traffic Source */}
                  <div className="flex flex-col">
                    {loadingAnalytics ? (
                      <Skeleton className="h-full w-full rounded-3xl" />
                    ) : (
                      <TrafficSourceCard sources={analyticsData?.sources ?? []} />
                    )}
                  </div>

                  {/* Col 3 — PCI Sales Sources */}
                  <div className="flex flex-col">
                    {loadingAnalytics ? (
                      <Skeleton className="h-full w-full rounded-3xl" />
                    ) : (
                      <TrafficSourceCard
                        sources={analyticsData?.pciSources ?? []}
                        title="Origens das Vendas PCI"
                      />
                    )}
                  </div>

                </div>

                {/* ROW 3 — Funil ICP (75%) + By Device (25%) */}
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="md:col-span-3">
                    {loadingAnalytics ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <IcpFunnelChart
                        funnel={analyticsData?.funnel ?? { visita: 0, checkout: 0, finalizado: 0 }}
                      />
                    )}
                  </div>
                  <div className="md:col-span-1">
                    {loadingAnalytics ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <DeviceCard devices={analyticsData?.devices ?? []} />
                    )}
                  </div>
                </div>

                {/* ROW 4 — Upsell PCI */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    {loadingAnalytics ? (
                      <Skeleton className="h-48 w-full rounded-3xl" />
                    ) : (
                      <UpsellCard
                        pciSales={analyticsData?.funnel.finalizado ?? 0}
                        gbFoundations={analyticsData?.upsell.gbFoundations ?? { page: 0, email: 0 }}
                        pcra={analyticsData?.upsell.pcra ?? { page: 0, email: 0 }}
                      />
                    )}
                  </div>
                </div>

                {/* ROW 5 — World Map */}
                {loadingAnalytics ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <WorldMapWidget countries={analyticsData?.countries ?? []} />
                )}
              </div>
            )}

              </div>
            )}

          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
