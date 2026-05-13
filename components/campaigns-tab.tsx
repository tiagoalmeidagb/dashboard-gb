"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Eye,
  Users,
  TrendingUp,
  CircleDollarSign,
  Megaphone,
  Play,
  Clock,
  Flag,
  Star,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  PauseCircle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { campaigns, type Campaign } from "@/lib/campaigns-data"
import { CampaignModal } from "@/components/campaign-modal"
import { Skeleton } from "@/components/ui/skeleton"
import type { CampaignMetrics } from "@/app/api/ga4/campaign/[id]/route"

/* ---------------------------------- */
/* HELPERS                             */
/* ---------------------------------- */

const iconMap: Record<string, LucideIcon> = { star: Star }

function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Star
}

// Parse date-only strings as local time (avoids UTC midnight → previous day in negative-offset timezones)
function localDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00")
}

function isActive(c: Campaign): boolean {
  if (!c.endDate) return true
  return localDate(c.endDate) >= new Date()
}

function isEnded(c: Campaign): boolean {
  return !!c.endDate && localDate(c.endDate) < new Date()
}

function formatPeriod(c: Campaign): string {
  const start = format(localDate(c.startDate), "d MMM yyyy")
  if (!c.endDate) return `${start} → ongoing`
  return `${start} → ${format(localDate(c.endDate), "d MMM yyyy")}`
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}

function fmtCurrency(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

type StatusFilter = "all" | "active" | "ended"
type ViewMode = "grid" | "list"

/* ---------------------------------- */
/* SUB-COMPONENTS                      */
/* ---------------------------------- */

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={
        active
          ? { background: "#DCFCE7", color: "#16a34a" }
          : { background: "#F3F4F6", color: "#6B7280" }
      }
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: active ? "#16a34a" : "#9CA3AF" }}
      />
      {active ? "Active" : "Ended"}
    </span>
  )
}

function SummaryCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  sub,
}: {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  value: number
  label: string
  sub: string
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-5"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-xs mb-0.5" style={{ color: "#A7A9AC" }}>{label}</p>
        <p className="text-3xl font-bold leading-tight" style={{ color: "#141414" }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: "#A7A9AC" }}>{sub}</p>
      </div>
    </div>
  )
}

function MetricGroup({
  icon: Icon,
  value,
  label,
  loading,
}: {
  icon: LucideIcon
  value: string
  label: string
  loading: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#A7A9AC" }} />
      <div>
        {loading ? (
          <Skeleton className="h-4 w-10 mb-0.5" />
        ) : (
          <p className="text-sm font-semibold leading-tight" style={{ color: "#141414" }}>{value}</p>
        )}
        <p className="text-xs" style={{ color: "#A7A9AC" }}>{label}</p>
      </div>
    </div>
  )
}

function CampaignCard({
  campaign,
  metrics,
  loadingMetrics,
  onClick,
}: {
  campaign: Campaign
  metrics: CampaignMetrics | null
  loadingMetrics: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = getIcon(campaign.iconName)

  return (
    <div
      className="rounded-2xl p-5 cursor-pointer transition-all"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${hovered ? "#E2211C" : "#E0E8F4"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0"
          style={{ background: campaign.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: campaign.iconColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm leading-tight truncate" style={{ color: "#141414" }}>
              {campaign.name}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge active={isActive(campaign)} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" style={{ color: "#A7A9AC" }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <PauseCircle className="w-4 h-4" style={{ color: "#F97316" }} />
                    Pause
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <CheckCircle className="w-4 h-4" style={{ color: "#6B7280" }} />
                    End
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#A7A9AC" }}>
            {formatPeriod(campaign)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4" style={{ borderTop: "1px solid #E0E8F4" }} />

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-2">
        <MetricGroup
          icon={Eye}
          value={metrics ? fmtNum(metrics.entryPageviews) : "—"}
          label="Pageviews"
          loading={loadingMetrics}
        />
        <MetricGroup
          icon={Users}
          value={metrics ? fmtNum(metrics.sales.count) : "—"}
          label="Sales"
          loading={loadingMetrics}
        />
        <MetricGroup
          icon={TrendingUp}
          value={metrics ? `${metrics.conversionRate}%` : "—"}
          label="Conversion"
          loading={loadingMetrics}
        />
        <MetricGroup
          icon={CircleDollarSign}
          value={metrics ? fmtCurrency(metrics.sales.revenue) : "—"}
          label="Revenue"
          loading={loadingMetrics}
        />
      </div>
    </div>
  )
}

/* ---------------------------------- */
/* MAIN                                */
/* ---------------------------------- */

export function CampaignsTab() {
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [metricsMap, setMetricsMap] = useState<Record<string, CampaignMetrics>>({})
  const [loadingMetrics, setLoadingMetrics] = useState<Record<string, boolean>>({})

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  useEffect(() => {
    const initial: Record<string, boolean> = {}
    campaigns.forEach((c) => { initial[c.id] = true })
    setLoadingMetrics(initial)

    campaigns.forEach((c) => {
      fetch(`/api/ga4/campaign/${c.id}`)
        .then((r) => r.ok ? r.json() as Promise<CampaignMetrics> : Promise.reject())
        .then((data) => setMetricsMap((prev) => ({ ...prev, [c.id]: data })))
        .catch(() => {})
        .finally(() => setLoadingMetrics((prev) => ({ ...prev, [c.id]: false })))
    })
  }, [])

  const totalCampaigns = campaigns.length
  const activeCount = campaigns.filter(isActive).length
  const endedCount = campaigns.filter(isEnded).length

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive(c)) ||
      (statusFilter === "ended" && isEnded(c))
    return matchesSearch && matchesStatus
  })

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#141414" }}>Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: "#A7A9AC" }}>
            Manage and track the performance of all your campaigns.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" }}
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={Megaphone}
          iconBg="#EEF2FF"
          iconColor="#6366F1"
          value={activeCount}
          label="Active Campaigns"
          sub={`of ${totalCampaigns} total`}
        />
        <SummaryCard
          icon={Play}
          iconBg="#DCFCE7"
          iconColor="#16a34a"
          value={activeCount}
          label="Running"
          sub="running now"
        />
        <SummaryCard
          icon={Clock}
          iconBg="#FFF7ED"
          iconColor="#F97316"
          value={0}
          label="Paused"
          sub="waiting for action"
        />
        <SummaryCard
          icon={Flag}
          iconBg="#F3F4F6"
          iconColor="#6B7280"
          value={endedCount}
          label="Ended"
          sub="completed"
        />
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div
          className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2.5"
          style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#A7A9AC" }} />
          <input
            type="text"
            placeholder="Search campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "#141414" }}
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none rounded-xl px-4 py-2.5 pr-8 text-sm font-medium cursor-pointer outline-none"
            style={{ background: "#FFFFFF", border: "1px solid #E0E8F4", color: "#141414" }}
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="ended">Status: Ended</option>
          </select>
          <ChevronDown
            className="w-4 h-4 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "#A7A9AC" }}
          />
        </div>

        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          style={{ background: "#FFFFFF", border: "1px solid #E0E8F4", color: "#141414" }}
        >
          Most recent
          <ChevronDown className="w-4 h-4" style={{ color: "#A7A9AC" }} />
        </div>

        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: "1px solid #E0E8F4" }}
        >
          <button
            className="px-3 py-2.5 transition-colors"
            style={{
              background: viewMode === "grid" ? "#EEF2FF" : "#FFFFFF",
              color: viewMode === "grid" ? "#6366F1" : "#A7A9AC",
            }}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            className="px-3 py-2.5 transition-colors"
            style={{
              background: viewMode === "list" ? "#EEF2FF" : "#FFFFFF",
              color: viewMode === "list" ? "#6366F1" : "#A7A9AC",
              borderLeft: "1px solid #E0E8F4",
            }}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Campaign cards ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center" style={{ color: "#A7A9AC" }}>
          <p className="text-sm">No campaigns found.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              metrics={metricsMap[campaign.id] ?? null}
              loadingMetrics={loadingMetrics[campaign.id] ?? false}
              onClick={() => setSelected(campaign)}
            />
          ))}
        </div>
      )}

      {selected && (
        <CampaignModal
          campaign={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
