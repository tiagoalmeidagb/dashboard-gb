"use client"

import { useCallback, useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MoreVertical,
  PauseCircle,
  Flag,
  X,
  Star,
  BarChart2,
  ArrowUpRight,
  FileText,
  TrendingUp,
  Monitor,
  Eye,
  Users,
  DollarSign,
  type LucideIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRangePicker } from "@/components/date-range-picker"
import type { Campaign } from "@/lib/campaigns-data"
import type { CampaignMetrics } from "@/app/api/ga4/campaign/[id]/route"

/* ---------------------------------- */
/* CONSTANTS                           */
/* ---------------------------------- */

const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "#6366F1",
  "Direct":         "#EC4899",
  "Social":         "#3B82F6",
  "Organic Social": "#3B82F6",
  "Email":          "#22C55E",
  "Referral":       "#F59E0B",
  "Paid Search":    "#F97316",
  "Organic Video":  "#14B8A6",
  "Other":          "#A7A9AC",
}
const FALLBACK_COLORS = [
  "#6366F1", "#EC4899", "#3B82F6", "#22C55E",
  "#F59E0B", "#F97316", "#14B8A6", "#A7A9AC",
]
function channelColor(name: string, idx: number): string {
  return CHANNEL_COLORS[name] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
}

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "overview",    label: "Overview",        icon: BarChart2    },
  { key: "sources",     label: "Traffic Sources", icon: ArrowUpRight },
  { key: "pages",       label: "Pages",           icon: FileText     },
  { key: "conversions", label: "Conversions",     icon: TrendingUp   },
  { key: "devices",     label: "Devices",         icon: Monitor      },
]

const iconMap: Record<string, LucideIcon> = { star: Star }
function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Star
}

/* ---------------------------------- */
/* HELPERS                             */
/* ---------------------------------- */

// Parse date-only strings as local time (avoids UTC midnight → previous day in negative-offset timezones)
function localDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00")
}

function isActive(c: Campaign) {
  return !c.endDate || localDate(c.endDate) >= new Date()
}

function formatPeriod(c: Campaign) {
  const start = format(localDate(c.startDate), "d MMM yyyy")
  if (!c.endDate) return `${start} → ongoing`
  return `${start} → ${format(localDate(c.endDate), "d MMM yyyy")}`
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return n.toLocaleString()
}

function fmtCurrency(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function aggregateWeekly(ts: { date: string; channels: Record<string, number> }[]) {
  const weeks: Record<string, Record<string, number>> = {}
  for (const { date, channels } of ts) {
    const d = parseISO(date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = {}
    for (const [ch, v] of Object.entries(channels)) {
      weeks[key][ch] = (weeks[key][ch] ?? 0) + v
    }
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, channels]) => ({ date, channels }))
}

function toChartData(
  ts: { date: string; channels: Record<string, number> }[],
  gran: "daily" | "weekly"
) {
  const rows = gran === "daily" ? ts : aggregateWeekly(ts)
  return rows.map(({ date, channels }) => ({
    date: format(parseISO(date), "d MMM"),
    ...channels,
  }))
}

/* ---------------------------------- */
/* KPI CARD                            */
/* ---------------------------------- */

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sparkColor,
  sparkData,
  loading,
}: {
  label: string
  value: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  sparkColor: string
  sparkData?: { date: string; value: number }[]
  loading: boolean
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: "#FFFFFF", border: "1px solid #E8ECF4", minHeight: 160 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <span className="text-sm" style={{ color: "#6B7280" }}>{label}</span>
      </div>

      {loading ? (
        <Skeleton className="h-9 w-24 mb-2" />
      ) : (
        <p className="text-3xl font-bold leading-tight mb-2" style={{ color: "#141414" }}>
          {value}
        </p>
      )}

      <div className="flex-1 min-h-[44px]">
        {!loading && sparkData && sparkData.length > 2 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------- */
/* OVERVIEW TAB                        */
/* ---------------------------------- */

function CampaignSummaryPanel({
  campaign,
  metrics,
  loading,
}: {
  campaign: Campaign
  metrics: CampaignMetrics | null
  loading: boolean
}) {
  const active = isActive(campaign)
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}
    >
      <p className="text-base font-bold" style={{ color: "#141414" }}>
        Campaign Summary
      </p>

      <div className="space-y-3">
        {[
          {
            label: "Status",
            value: (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                style={active
                  ? { background: "#DCFCE7", color: "#16a34a" }
                  : { background: "#F3F4F6", color: "#6B7280" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#16a34a" : "#9CA3AF" }} />
                {active ? "Active" : "Ended"}
              </span>
            ),
          },
          {
            label: "Start date",
            value: <span className="text-sm font-medium" style={{ color: "#141414" }}>{format(localDate(campaign.startDate), "d MMM yyyy")}</span>,
          },
          {
            label: "End date",
            value: <span className="text-sm font-medium" style={{ color: "#141414" }}>{campaign.endDate ? format(localDate(campaign.endDate), "d MMM yyyy") : "Ongoing"}</span>,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#9CA3AF" }}>{label}</span>
            {value}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #E8ECF4" }} />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm" style={{ color: "#9CA3AF" }}>Coupons</span>
          <span className="text-sm font-medium text-right" style={{ color: "#141414" }}>
            {campaign.coupons.join(", ")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#9CA3AF" }}>Sales</span>
          {loading
            ? <Skeleton className="h-5 w-12" />
            : <span className="text-sm font-semibold" style={{ color: "#141414" }}>{metrics?.sales.count ?? 0}</span>
          }
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#9CA3AF" }}>Revenue</span>
          {loading
            ? <Skeleton className="h-5 w-20" />
            : <span className="text-base font-bold" style={{ color: "#141414" }}>{fmtCurrency(metrics?.sales.revenue ?? 0)}</span>
          }
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- */
/* SALES BY PERIOD                     */
/* ---------------------------------- */

function aggregateSalesWeekly(
  ts: { date: string; count: number; revenue: number }[]
): { date: string; count: number; revenue: number }[] {
  const weeks: Record<string, { count: number; revenue: number }> = {}
  for (const { date, count, revenue } of ts) {
    const d = parseISO(date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = { count: 0, revenue: 0 }
    weeks[key].count += count
    weeks[key].revenue += revenue
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))
}

function fillSalesGaps(
  ts: { date: string; count: number; revenue: number }[],
  from: Date,
  to: Date
): { date: string; count: number; revenue: number }[] {
  const map: Record<string, { count: number; revenue: number }> = {}
  for (const row of ts) map[row.date] = { count: row.count, revenue: row.revenue }

  const result: { date: string; count: number; revenue: number }[] = []
  const cur = new Date(from)
  cur.setHours(12, 0, 0, 0)
  const end = new Date(to)
  end.setHours(12, 0, 0, 0)

  while (cur <= end) {
    const d = format(cur, "yyyy-MM-dd")
    result.push({ date: d, count: map[d]?.count ?? 0, revenue: map[d]?.revenue ?? 0 })
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

function SalesByPeriod({
  salesTimeSeries,
  loading,
  granularity,
  dateRange,
}: {
  salesTimeSeries: CampaignMetrics["salesTimeSeries"] | undefined
  loading: boolean
  granularity: "daily" | "weekly"
  dateRange: { from: Date; to: Date }
}) {
  const rows = (() => {
    const filled = fillSalesGaps(salesTimeSeries ?? [], dateRange.from, dateRange.to)
    const src = granularity === "daily" ? filled : aggregateSalesWeekly(filled)
    return src.map((r) => ({
      date: format(parseISO(r.date), "d MMM"),
      revenue: r.revenue,
      count: r.count,
    }))
  })()

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold" style={{ color: "#141414" }}>
          Sales by Period
        </p>
        <div className="flex items-center gap-4 text-xs" style={{ color: "#9CA3AF" }}>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#6366F1", opacity: 0.85 }} />
            Revenue
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm inline-block" style={{ background: "#F59E0B" }} />
            Sales count
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={rows} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="revenue"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E8ECF4",
                borderRadius: 10,
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
              formatter={(value: unknown, name: unknown) => {
                const v = Number(value)
                return name === "revenue"
                  ? [`$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Revenue"]
                  : [String(v), "Sales"]
              }}
            />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              fill="#6366F1"
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              isAnimationActive={false}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="count"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: "#F59E0B", r: 3 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function OverviewTab({
  campaign,
  metrics,
  loading,
  granularity,
  setGranularity,
  dateRange,
}: {
  campaign: Campaign
  metrics: CampaignMetrics | null
  loading: boolean
  granularity: "daily" | "weekly"
  setGranularity: (g: "daily" | "weekly") => void
  dateRange: { from: Date; to: Date }
}) {
  const spark = metrics?.dailySessions
  const chartData = metrics?.timeSeries ? toChartData(metrics.timeSeries, granularity) : []
  const channelKeys = metrics?.channelKeys ?? []

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Pageviews"
          value={metrics ? fmtNum(metrics.entryPageviews) : "—"}
          icon={Eye}
          iconBg="#DBEAFE"
          iconColor="#3B82F6"
          sparkColor="#3B82F6"
          sparkData={spark}
          loading={loading}
        />
        <KpiCard
          label="Sales"
          value={metrics ? fmtNum(metrics.sales.count) : "—"}
          icon={Users}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          sparkColor="#16A34A"
          sparkData={spark}
          loading={loading}
        />
        <KpiCard
          label="Conversion Rate"
          value={metrics ? `${metrics.conversionRate}%` : "—"}
          icon={TrendingUp}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          sparkColor="#22C55E"
          sparkData={spark}
          loading={loading}
        />
        <KpiCard
          label="Attributed Revenue"
          value={metrics ? fmtCurrency(metrics.sales.revenue) : "—"}
          icon={DollarSign}
          iconBg="#FEF3C7"
          iconColor="#F59E0B"
          sparkColor="#F59E0B"
          sparkData={spark}
          loading={loading}
        />
      </div>

      {/* Area chart + Summary */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        {/* Chart */}
        <div
          className="col-span-2 rounded-2xl p-5"
          style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-base font-bold" style={{ color: "#141414" }}>
              Sessions by Source
            </p>
            <div
              className="flex rounded-lg overflow-hidden text-xs"
              style={{ border: "1px solid #E8ECF4" }}
            >
              {(["daily", "weekly"] as const).map((g, i) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className="px-3 py-1.5 capitalize transition-colors"
                  style={{
                    background: granularity === g ? "#EEF2FF" : "#FFFFFF",
                    color: granularity === g ? "#6366F1" : "#9CA3AF",
                    borderLeft: i > 0 ? "1px solid #E8ECF4" : undefined,
                  }}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          {!loading && channelKeys.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-3">
              {channelKeys.map((key, i) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: channelColor(key, i) }}
                  />
                  <span className="text-xs" style={{ color: "#6B7280" }}>{key}</span>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm" style={{ color: "#9CA3AF" }}>No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E8ECF4",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                />
                {channelKeys.map((key, i) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={channelColor(key, i)}
                    fill={channelColor(key, i)}
                    fillOpacity={0.75}
                    strokeWidth={0}
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Channel summary below chart */}
          {!loading && channelKeys.length > 0 && metrics && (
            <div
              className="flex flex-wrap gap-x-5 gap-y-2 mt-4 pt-4"
              style={{ borderTop: "1px solid #E8ECF4" }}
            >
              {metrics.sources.map((s, i) => (
                <div key={s.channel} className="flex items-start gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                    style={{ background: channelColor(s.channel, i) }}
                  />
                  <div>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{s.channel}</p>
                    <p className="text-sm font-semibold" style={{ color: "#141414" }}>
                      {fmtNum(s.sessions)}
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{s.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <CampaignSummaryPanel campaign={campaign} metrics={metrics} loading={loading} />
      </div>

      {/* Sales by Period */}
      <SalesByPeriod
        salesTimeSeries={metrics?.salesTimeSeries}
        loading={loading}
        granularity={granularity}
        dateRange={dateRange}
      />
    </div>
  )
}

/* ---------------------------------- */
/* TRAFFIC SOURCES TAB                 */
/* ---------------------------------- */

function TrafficSourcesTab({ metrics, loading }: { metrics: CampaignMetrics | null; loading: boolean }) {
  const sources = metrics?.sources ?? []
  return (
    <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}>
      <p className="text-base font-bold mb-5" style={{ color: "#141414" }}>Sessions by Channel</p>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-9 w-full" />)}</div>
      ) : sources.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: "#9CA3AF" }}>No traffic source data available.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={Math.max(180, sources.length * 48)}>
            <BarChart data={sources} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="channel" width={130} tick={{ fontSize: 12, fill: "#6B7280" }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#F5F7FF" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload as { channel: string; sessions: number; pct: number }
                  return (
                    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: "#fff", border: "1px solid #E8ECF4" }}>
                      <p className="font-semibold mb-0.5" style={{ color: "#141414" }}>{d.channel}</p>
                      <p style={{ color: "#6B7280" }}>{d.sessions.toLocaleString()} sessions · {d.pct}%</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="sessions" radius={[0, 8, 8, 0]} maxBarSize={32}>
                {sources.map((s, i) => <Cell key={i} fill={channelColor(s.channel, i)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-5 space-y-2.5" style={{ borderTop: "1px solid #E8ECF4", paddingTop: 16 }}>
            {sources.map((s, i) => (
              <div key={s.channel} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: channelColor(s.channel, i) }} />
                  <span style={{ color: "#4B5563" }}>{s.channel}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold" style={{ color: "#141414" }}>{s.sessions.toLocaleString()}</span>
                  <span className="w-10 text-right" style={{ color: "#9CA3AF" }}>{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------------------------- */
/* PAGES TAB                           */
/* ---------------------------------- */

function PagesTab({ metrics, loading }: { metrics: CampaignMetrics | null; loading: boolean }) {
  const pages = metrics?.pages ?? []
  const total = pages.reduce((s, p) => s + p.pageviews, 0)
  return (
    <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}>
      <p className="text-base font-bold mb-5" style={{ color: "#141414" }}>Page Performance</p>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : pages.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: "#9CA3AF" }}>No page data available.</p>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => {
            const pct = total > 0 ? Math.round((page.pageviews / total) * 100) : 0
            return (
              <div key={page.path}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-mono truncate max-w-[65%]" style={{ color: "#374151" }}>{page.path}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: "#141414" }}>{page.pageviews.toLocaleString()}</span>
                    <span className="w-8 text-right text-xs" style={{ color: "#9CA3AF" }}>{pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#F3F4F6" }}>
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: "#6366F1" }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- */
/* CONVERSIONS TAB                     */
/* ---------------------------------- */

function ConversionsTab({ metrics, loading }: { metrics: CampaignMetrics | null; loading: boolean }) {
  const entry = metrics?.entryPageviews ?? 0
  const steps = [
    { label: "Campaign Visits",    value: entry,                           color: "#6366F1", pct: 100 },
    { label: "Completed Sign-up",  value: metrics?.thankYouPageviews ?? 0, color: "#22C55E", pct: entry > 0 ? Math.round(((metrics?.thankYouPageviews ?? 0) / entry) * 100) : 0 },
    { label: "Actual Purchases",   value: metrics?.sales.count ?? 0,       color: "#F59E0B", pct: entry > 0 ? Math.round(((metrics?.sales.count ?? 0) / entry) * 100) : 0 },
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}>
        <p className="text-base font-bold mb-5" style={{ color: "#141414" }}>Conversion Funnel</p>
        {loading ? (
          <div className="space-y-5">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: step.color }} />
                    <span className="text-sm" style={{ color: "#4B5563" }}>{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: "#141414" }}>{step.value.toLocaleString()}</span>
                    <span className="text-sm font-bold w-12 text-right" style={{ color: step.color }}>{step.pct}%</span>
                  </div>
                </div>
                <div className="h-3 rounded-full" style={{ background: "#F3F4F6" }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${step.pct}%`, background: step.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Conversion Rate", value: metrics ? `${metrics.conversionRate}%` : "—",     sub: "visits → sign-up"        },
          { label: "Sales Count",     value: metrics ? String(metrics.sales.count) : "—",       sub: "via tracked coupons"     },
          { label: "Total Revenue",   value: metrics ? fmtCurrency(metrics.sales.revenue) : "—", sub: "attributed revenue"     },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}>
            <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>{card.label}</p>
            {loading ? <Skeleton className="h-8 w-20 my-1" /> : <p className="text-2xl font-bold" style={{ color: "#141414" }}>{card.value}</p>}
            <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------- */
/* DEVICES TAB                         */
/* ---------------------------------- */

function DevicesTab({ metrics, loading }: { metrics: CampaignMetrics | null; loading: boolean }) {
  const devices = metrics?.devices ?? []
  const DEV_COLORS: Record<string, string> = { desktop: "#6366F1", mobile: "#22C55E", tablet: "#F59E0B" }

  return (
    <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E8ECF4" }}>
      <p className="text-base font-bold mb-5" style={{ color: "#141414" }}>Device Breakdown</p>
      {loading ? (
        <div className="flex gap-8"><Skeleton className="w-52 h-52 rounded-full" /><div className="flex-1 space-y-4 pt-4">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div></div>
      ) : devices.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: "#9CA3AF" }}>No device data available.</p>
      ) : (
        <div className="flex items-center gap-10">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie data={devices} dataKey="sessions" nameKey="category" cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} isAnimationActive={false}>
                {devices.map((d, i) => <Cell key={d.category} fill={DEV_COLORS[d.category.toLowerCase()] ?? FALLBACK_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E8ECF4", borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-4">
            {devices.map((d, i) => (
              <div key={d.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: DEV_COLORS[d.category.toLowerCase()] ?? FALLBACK_COLORS[i] }} />
                    <span className="text-sm capitalize" style={{ color: "#4B5563" }}>{d.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold" style={{ color: "#141414" }}>{d.sessions.toLocaleString()}</span>
                    <span className="text-sm w-10 text-right" style={{ color: "#9CA3AF" }}>{d.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#F3F4F6" }}>
                  <div className="h-2 rounded-full" style={{ width: `${d.pct}%`, background: DEV_COLORS[d.category.toLowerCase()] ?? FALLBACK_COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- */
/* MAIN MODAL                          */
/* ---------------------------------- */

export function CampaignModal({
  campaign,
  open,
  onClose,
}: {
  campaign: Campaign
  open: boolean
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [granularity, setGranularity] = useState<"daily" | "weekly">("daily")
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [dateRange, setDateRange] = useState(() => ({
    from: localDate(campaign.startDate),
    to:   campaign.endDate ? localDate(campaign.endDate) : new Date(),
  }))

  const fetchData = useCallback(
    (from: Date, to: Date) => {
      setLoading(true)
      setError(false)
      const q = `from=${format(from, "yyyy-MM-dd")}&to=${format(to, "yyyy-MM-dd")}`
      fetch(`/api/ga4/campaign/${campaign.id}?${q}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<CampaignMetrics> })
        .then(data => setMetrics(data))
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    },
    [campaign.id]
  )

  useEffect(() => {
    if (!open) return
    setMetrics(null)
    setActiveTab("overview")
    const from = localDate(campaign.startDate)
    const to   = campaign.endDate ? localDate(campaign.endDate) : new Date()
    setDateRange({ from, to })
    fetchData(from, to)
  }, [open, campaign.id])

  function handleDateRange(range: { from: Date; to: Date }) {
    setDateRange(range)
    fetchData(range.from, range.to)
  }

  const active = isActive(campaign)
  const Icon   = getIcon(campaign.iconName)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl sm:max-w-5xl w-full h-[88vh] overflow-hidden flex flex-col p-0 gap-0"
        style={{ background: "#F9FAFB" }}
      >
        <DialogTitle className="sr-only">{campaign.name}</DialogTitle>

        {/* ── Header ── */}
        <div className="bg-white px-7 pt-6 pb-5 flex-shrink-0" style={{ borderBottom: "1px solid #E8ECF4" }}>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: campaign.iconBg }}
            >
              <Icon className="w-6 h-6" style={{ color: campaign.iconColor }} />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                {/* Name + badge */}
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <h2 className="text-xl font-bold leading-tight" style={{ color: "#141414" }}>
                    {campaign.name}
                  </h2>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={active
                      ? { background: "#DCFCE7", color: "#16a34a" }
                      : { background: "#F3F4F6", color: "#6B7280" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#16a34a" : "#9CA3AF" }} />
                    {active ? "Active" : "Ended"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg transition-colors hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <PauseCircle className="w-4 h-4" style={{ color: "#F97316" }} /> Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Flag className="w-4 h-4" style={{ color: "#E2211C" }} /> End Campaign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ background: "#FFF7ED", color: "#EA580C", border: "1px solid #FED7AA" }}
                  >
                    <PauseCircle className="w-4 h-4" />
                    Pause Campaign
                  </button>

                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-80"
                    style={{ background: "#E2211C" }}
                  >
                    <Flag className="w-4 h-4" />
                    End Campaign
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100 ml-1"
                  >
                    <X className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                  </button>
                </div>
              </div>

              {/* Date subtitle */}
              <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
                {formatPeriod(campaign)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="bg-white flex items-center px-7 flex-shrink-0"
          style={{ borderBottom: "1px solid #E8ECF4" }}
        >
          <div className="flex items-center flex-1">
            {TABS.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px"
                  style={{
                    color:       isActive ? "#6366F1" : "#9CA3AF",
                    borderColor: isActive ? "#6366F1" : "transparent",
                  }}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="flex-shrink-0 py-2">
            <DateRangePicker value={dateRange} onChange={handleDateRange} />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <p className="text-sm" style={{ color: "#6B7280" }}>Failed to load campaign data.</p>
              <button
                className="text-sm underline"
                style={{ color: "#6366F1" }}
                onClick={() => fetchData(dateRange.from, dateRange.to)}
              >
                Try again
              </button>
            </div>
          ) : activeTab === "overview" ? (
            <OverviewTab campaign={campaign} metrics={metrics} loading={loading} granularity={granularity} setGranularity={setGranularity} dateRange={dateRange} />
          ) : activeTab === "sources" ? (
            <TrafficSourcesTab metrics={metrics} loading={loading} />
          ) : activeTab === "pages" ? (
            <PagesTab metrics={metrics} loading={loading} />
          ) : activeTab === "conversions" ? (
            <ConversionsTab metrics={metrics} loading={loading} />
          ) : (
            <DevicesTab metrics={metrics} loading={loading} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
