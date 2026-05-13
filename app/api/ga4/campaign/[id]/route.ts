import { NextRequest, NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { campaigns } from "@/lib/campaigns-data"
import { classifySource } from "@/lib/classify-source"

export const dynamic = "force-dynamic"

/* ---------------------------------- */
/* TYPES                               */
/* ---------------------------------- */

export type CampaignMetrics = {
  entryPageviews: number
  entrySessions: number
  thankYouPageviews: number
  conversionRate: number
  sources: { channel: string; sessions: number; pct: number }[]
  sales: { count: number; revenue: number }
  salesTimeSeries: { date: string; count: number; revenue: number }[]
  timeSeries: { date: string; channels: Record<string, number> }[]
  channelKeys: string[]
  dailySessions: { date: string; value: number }[]
  devices: { category: string; sessions: number; pct: number }[]
  pages: { path: string; pageviews: number }[]
}

/* ---------------------------------- */
/* MODULE-LEVEL CACHE                  */
/* ---------------------------------- */

type CacheEntry = { data: CampaignMetrics; ts: number }
const cache = new Map<string, CacheEntry>()
const TTL = 60 * 60 * 1000

/* ---------------------------------- */
/* AIRTABLE                            */
/* ---------------------------------- */

async function fetchCouponSales(
  coupons: string[],
  startDate: string,
  endDate: string
): Promise<{ count: number; revenue: number; salesTimeSeries: { date: string; count: number; revenue: number }[] }> {
  const BASE_ID = process.env.AIRTABLE_BASE_ID
  const API_KEY = process.env.AIRTABLE_API_KEY
  if (!BASE_ID || !API_KEY) throw new Error("Missing Airtable env vars")

  const couponConditions = coupons
    .map((c) => `UPPER({Cupom})="${c.toUpperCase()}"`)
    .join(",")
  const filterByFormula = `AND(
    OR(${couponConditions}),
    NOT(IS_BEFORE({Data}, '${startDate}', 'day')),
    NOT(IS_AFTER({Data}, '${endDate}', 'day'))
  )`

  let count = 0
  let revenue = 0
  const byDate: Record<string, { count: number; revenue: number }> = {}
  let offset: string | null = null

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/Base2`)
    url.searchParams.append("fields[]", "Value")
    url.searchParams.append("fields[]", "Cupom")
    url.searchParams.append("fields[]", "Data")
    url.searchParams.append("filterByFormula", filterByFormula)
    if (offset) url.searchParams.append("offset", offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    if (!res.ok) {
      const body = await res.text()
      if (res.status === 422 || body.includes("Unknown field name")) {
        return { count: 0, revenue: 0, salesTimeSeries: [] }
      }
      throw new Error(`Airtable error: ${res.status} — ${body}`)
    }

    const json = await res.json()
    if (!json.records) break

    for (const record of json.records) {
      const coupon = String(record.fields["Cupom"] ?? "").toUpperCase().trim()
      if (!coupons.includes(coupon)) continue
      const value = Number(record.fields["Value"])
      if (!Number.isFinite(value)) continue

      count++
      revenue += value

      // Extract date portion from ISO datetime (e.g. "2026-04-30 10:16" → "2026-04-30")
      const rawDate = String(record.fields["Data"] ?? "")
      const date = rawDate.slice(0, 10)
      if (date.length === 10) {
        if (!byDate[date]) byDate[date] = { count: 0, revenue: 0 }
        byDate[date].count++
        byDate[date].revenue += value
      }
    }

    offset = json.offset || null
  } while (offset)

  const salesTimeSeries = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))

  return { count, revenue, salesTimeSeries }
}

/* ---------------------------------- */
/* GA4                                 */
/* ---------------------------------- */

async function fetchCampaignMetrics(
  campaignId: string,
  fromDate: string,
  toDate: string
): Promise<CampaignMetrics> {
  const campaign = campaigns.find((c) => c.id === campaignId)
  if (!campaign) throw new Error("Campaign not found")

  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n")
  if (!propertyId || !clientEmail || !privateKey) {
    throw new Error("Missing GA4 env vars")
  }

  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  })

  const dateRange = { startDate: fromDate, endDate: toDate }

  const exactFilter = (path: string) => ({
    filter: {
      fieldName: "pagePath",
      stringFilter: { matchType: "EXACT" as const, value: path },
    },
  })

  // 4 queries per path: [pv, src, timeSeries, devices]
  const perPathQueries = campaign.entryPaths.flatMap((p) => [
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: exactFilter(p),
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: exactFilter(p),
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 100,
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [
        { name: "date" },
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [{ name: "sessions" }],
      dimensionFilter: exactFilter(p),
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      limit: 5000,
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: exactFilter(p),
    }),
  ])

  const thankYouQuery = client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "CONTAINS" as const, value: campaign.thankYouPath },
      },
    },
    limit: 50,
  })

  const allResults = await Promise.all([...perPathQueries, thankYouQuery])

  const n = campaign.entryPaths.length
  const pvReports  = campaign.entryPaths.map((_, i) => allResults[i * 4])
  const srcReports = campaign.entryPaths.map((_, i) => allResults[i * 4 + 1])
  const tsReports  = campaign.entryPaths.map((_, i) => allResults[i * 4 + 2])
  const devReports = campaign.entryPaths.map((_, i) => allResults[i * 4 + 3])
  const tyReport   = allResults[n * 4]

  // --- entryPageviews ---
  const entryPageviews = pvReports.reduce(
    (total, r) =>
      total + (r[0].rows ?? []).reduce(
        (sum, row) => sum + parseInt(row.metricValues?.[0]?.value ?? "0", 10),
        0
      ),
    0
  )

  // --- thankYouPageviews ---
  const thankYouPageviews = (tyReport[0].rows ?? []).reduce(
    (sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    0
  )

  // --- sources ---
  const grouped: Record<string, number> = {}
  for (const report of srcReports) {
    for (const r of report[0].rows ?? []) {
      const src    = r.dimensionValues?.[0]?.value ?? "(none)"
      const medium = r.dimensionValues?.[1]?.value ?? "(none)"
      const s      = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
      const channel = classifySource(src, medium)
      if (channel === null) continue
      grouped[channel] = (grouped[channel] ?? 0) + s
    }
  }
  const totalSessions = Object.values(grouped).reduce((a, b) => a + b, 0)
  const sources = Object.entries(grouped)
    .map(([channel, s]) => ({
      channel,
      sessions: s,
      pct: totalSessions > 0 ? Math.round((s / totalSessions) * 100) : 0,
    }))
    .filter((s) => s.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 7)

  const entrySessions = totalSessions

  // --- timeSeries ---
  const tsGrouped: Record<string, Record<string, number>> = {}
  for (const report of tsReports) {
    for (const r of report[0].rows ?? []) {
      const rawDate = r.dimensionValues?.[0]?.value ?? ""
      const src     = r.dimensionValues?.[1]?.value ?? "(none)"
      const medium  = r.dimensionValues?.[2]?.value ?? "(none)"
      const s       = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
      if (!rawDate) continue
      const channel = classifySource(src, medium)
      if (channel === null) continue
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      if (!tsGrouped[date]) tsGrouped[date] = {}
      tsGrouped[date][channel] = (tsGrouped[date][channel] ?? 0) + s
    }
  }
  const timeSeries = Object.entries(tsGrouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, channels]) => ({ date, channels }))

  const channelTotals: Record<string, number> = {}
  for (const { channels } of timeSeries) {
    for (const [ch, v] of Object.entries(channels)) {
      channelTotals[ch] = (channelTotals[ch] ?? 0) + v
    }
  }
  const channelKeys = Object.entries(channelTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k)

  const dailySessions = timeSeries.map(({ date, channels }) => ({
    date,
    value: Object.values(channels).reduce((a, b) => a + b, 0),
  }))

  // --- devices ---
  const devGrouped: Record<string, number> = {}
  for (const report of devReports) {
    for (const r of report[0].rows ?? []) {
      const cat = r.dimensionValues?.[0]?.value ?? "(none)"
      const s   = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
      devGrouped[cat] = (devGrouped[cat] ?? 0) + s
    }
  }
  const totalDev = Object.values(devGrouped).reduce((a, b) => a + b, 0)
  const devices = Object.entries(devGrouped)
    .sort(([, a], [, b]) => b - a)
    .map(([category, sessions]) => ({
      category,
      sessions,
      pct: totalDev > 0 ? Math.round((sessions / totalDev) * 100) : 0,
    }))

  // --- pages ---
  const pages: { path: string; pageviews: number }[] = []
  for (let i = 0; i < campaign.entryPaths.length; i++) {
    const pv = (pvReports[i][0].rows ?? []).reduce(
      (sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0", 10),
      0
    )
    pages.push({ path: campaign.entryPaths[i], pageviews: pv })
  }
  pages.push({ path: `${campaign.thankYouPath} (thank-you)`, pageviews: thankYouPageviews })
  pages.sort((a, b) => b.pageviews - a.pageviews)

  const sales = await fetchCouponSales(campaign.coupons, fromDate, toDate)

  // Conversion rate = coupon sales / entry pageviews
  const conversionRate =
    entryPageviews > 0
      ? Math.round((sales.count / entryPageviews) * 1000) / 10
      : 0

  return {
    entryPageviews,
    entrySessions,
    thankYouPageviews,
    conversionRate,
    sources,
    sales,
    salesTimeSeries: sales.salesTimeSeries,
    timeSeries,
    channelKeys,
    dailySessions,
    devices,
    pages,
  }
}

/* ---------------------------------- */
/* ROUTE                               */
/* ---------------------------------- */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const bust      = searchParams.get("bust") === "1"
  const fromParam = searchParams.get("from")
  const toParam   = searchParams.get("to")

  const today    = new Date().toISOString().slice(0, 10)
  const fromDate = fromParam ?? campaign.startDate
  const toDate   = toParam   ?? (campaign.endDate ?? today)

  const cacheKey = `${id}_${fromDate}_${toDate}`
  const cached   = cache.get(cacheKey)
  if (!bust && cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const data = await fetchCampaignMetrics(id, fromDate, toDate)
    cache.set(cacheKey, { data, ts: Date.now() })
    return NextResponse.json(data)
  } catch (error) {
    console.error("[campaign route]", error)
    return NextResponse.json(
      { error: "Failed to fetch campaign data", details: String(error) },
      { status: 500 }
    )
  }
}
