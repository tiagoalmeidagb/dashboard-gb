"use client"

import { Link2, Search, Mail, Share2, Play, Users, MessageCircle, LayoutGrid, Navigation, HelpCircle, CalendarDays } from "lucide-react"

type Source = {
  channel: string
  sessions: number
  pct: number
}

type Props = {
  sources: Source[]
  title?: string
}

function channelIcon(channel: string) {
  const c = channel.toLowerCase()
  if (c === "direct")             return <Link2 className="w-3.5 h-3.5" />
  if (c === "google" || c.includes("search")) return <Search className="w-3.5 h-3.5" />
  if (c === "email")              return <Mail className="w-3.5 h-3.5" />
  if (c === "instagram")          return <Share2 className="w-3.5 h-3.5" />
  if (c === "whatsapp")           return <MessageCircle className="w-3.5 h-3.5" />
  if (c === "facebook")           return <Users className="w-3.5 h-3.5" />
  if (c === "youtube")            return <Play className="w-3.5 h-3.5" />
  if (c === "referral")           return <Share2 className="w-3.5 h-3.5" />
  if (c === "site bar")           return <Navigation className="w-3.5 h-3.5" />
  if (c === "unknown")            return <HelpCircle className="w-3.5 h-3.5" />
  if (c === "summit 2026")        return <CalendarDays className="w-3.5 h-3.5" />
  return <LayoutGrid className="w-3.5 h-3.5" />
}

const BAR_COLORS = ["#003672", "#004B8D", "#1D6FBB", "#5A9FD4", "#93C5FD", "#B9CFE6", "#C2D0E8"]

export default function TrafficSourceCard({ sources, title = "Traffic Source" }: Props) {
  const topPct = sources[0]?.pct ?? 1

  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      <p className="text-sm font-semibold mb-4" style={{ color: "#141414" }}>
        {title}
      </p>

      <div className="flex-1 flex flex-col justify-between space-y-3">
        {sources.map((s, i) => (
          <div key={s.channel} className="flex items-start gap-3">
            {/* Icon box */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#F0F4FA", color: "#636466" }}
            >
              {channelIcon(s.channel)}
            </div>

            {/* Name + bar + % */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "#141414" }}>
                  {s.channel}
                </span>
                <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: "#141414" }}>
                  {s.pct}%
                </span>
              </div>
              {/* Bar proportional to top source */}
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${(s.pct / topPct) * 100}%`,
                  background: BAR_COLORS[i] ?? "#E0E8F4",
                }}
              />
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <p className="text-xs" style={{ color: "#C2D0E8" }}>No data</p>
        )}
      </div>
    </div>
  )
}
