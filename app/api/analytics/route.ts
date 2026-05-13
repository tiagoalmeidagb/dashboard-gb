import { NextRequest, NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { countryCode } from "@/lib/country-codes"
import { classifySource } from "@/lib/classify-source"

export const dynamic = "force-dynamic"

/* ---------------------------------- */
/* TYPES                               */
/* ---------------------------------- */

export type AnalyticsData = {
  sessions: number
  users: number
  newUsers: number
  returningUsers: number
  bounceRate: number
  pageviews: number
  sources: { channel: string; sessions: number; pct: number }[]
  pciSources: { channel: string; sessions: number; pct: number }[]
  countries: { country: string; code: string; sessions: number }[]
  funnel: {
    visita: number
    checkout: number
    finalizado: number
  }
  devices: { category: string; sessions: number; pct: number }[]
  upsell: {
    gbFoundations: { page: number; email: number }
    pcra: { page: number; email: number }
  }
}

/* ---------------------------------- */
/* MODULE-LEVEL CACHE                  */
/* ---------------------------------- */

type CacheEntry = { data: AnalyticsData; ts: number }
const cache = new Map<string, CacheEntry>()
const TTL = 60 * 60 * 1000 // 1 hora

/* ---------------------------------- */
/* FETCH                               */
/* ---------------------------------- */

async function fetchAnalytics(from: string, to: string): Promise<AnalyticsData> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n")

  if (!propertyId || !clientEmail || !privateKey) {
    throw new Error("Missing GA4 env vars")
  }

  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  })

  const dateRange = { startDate: from, endDate: to }

  const [overview, sourcesReport, pciSourcesReport, countriesReport, funnelVisita, funnelCheckout, funnelFinalizado, devicesReport, upsellGbReport, upsellPcraReport] =
    await Promise.all([
      // Overview metrics
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "bounceRate" },
          { name: "screenPageViews" },
        ],
      }),
      // Sources — raw sessionSource + sessionMedium for accurate grouping
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 100,
      }),
      // PCI Sales Sources — sessionSource + sessionMedium filtered by /obrigado-pci pages
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "CONTAINS", value: "/obrigado-pci" },
          },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 100,
      }),
      // Countries — top 10 by sessions
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      // Funnel step 1 — Visita: /pci2026
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "EXACT", value: "/pci2026" },
          },
        },
      }),
      // Funnel step 2 — Checkout: /payment pages with pci-2026 in query string
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "pagePathPlusQueryString" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: "pagePathPlusQueryString",
                  stringFilter: { matchType: "CONTAINS", value: "/payment" },
                },
              },
              {
                filter: {
                  fieldName: "pagePathPlusQueryString",
                  stringFilter: { matchType: "CONTAINS", value: "pci-2026" },
                },
              },
            ],
          },
        },
        limit: 100,
      }),
      // Funnel step 3 — Finalizado: /obrigado-pci*
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "CONTAINS", value: "/obrigado-pci" },
          },
        },
        limit: 50,
      }),
      // Devices
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
      // Upsell — GB Foundations: page visits with step=upsell, broken by sessionMedium
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionMedium" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: "pagePath",
                  stringFilter: { matchType: "BEGINS_WITH", value: "/course/gb-foundations" },
                },
              },
              {
                filter: {
                  fieldName: "pagePathPlusQueryString",
                  stringFilter: { matchType: "CONTAINS", value: "step=upsell" },
                },
              },
            ],
          },
        },
        limit: 50,
      }),
      // Upsell — PCRA: page visits with step=upsell, broken by sessionMedium
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionMedium" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: "pagePath",
                  stringFilter: { matchType: "BEGINS_WITH", value: "/course/pcra" },
                },
              },
              {
                filter: {
                  fieldName: "pagePathPlusQueryString",
                  stringFilter: { matchType: "CONTAINS", value: "step=upsell" },
                },
              },
            ],
          },
        },
        limit: 50,
      }),
    ])

  // Overview
  const row = overview[0].rows?.[0]?.metricValues ?? []
  const sessions = parseInt(row[0]?.value ?? "0", 10)
  const users = parseInt(row[1]?.value ?? "0", 10)
  const newUsers = parseInt(row[2]?.value ?? "0", 10)
  const bounceRate = parseFloat(row[3]?.value ?? "0")
  const pageviews = parseInt(row[4]?.value ?? "0", 10)
  const returningUsers = Math.max(0, users - newUsers)

  const sourceRows = sourcesReport[0].rows ?? []
  const grouped: Record<string, number> = {}
  for (const r of sourceRows) {
    const src    = r.dimensionValues?.[0]?.value ?? "(none)"
    const medium = r.dimensionValues?.[1]?.value ?? "(none)"
    const s      = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
    const channel = classifySource(src, medium)
    if (channel === null) continue // ignored sources
    grouped[channel] = (grouped[channel] ?? 0) + s
  }

  const totalSourceSessions = Object.values(grouped).reduce((a, b) => a + b, 0)
  const sources = Object.entries(grouped)
    .map(([channel, s]) => ({
      channel,
      sessions: s,
      pct: totalSourceSessions > 0 ? Math.round((s / totalSourceSessions) * 100) : 0,
    }))
    .filter((s) => s.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 7)

  // PCI Sales Sources — same grouping logic as general sources
  const pciSourceRows = pciSourcesReport[0].rows ?? []
  const pciGrouped: Record<string, number> = {}
  for (const r of pciSourceRows) {
    const src    = r.dimensionValues?.[0]?.value ?? "(none)"
    const medium = r.dimensionValues?.[1]?.value ?? "(none)"
    const s      = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
    const channel = classifySource(src, medium)
    if (channel === null) continue
    pciGrouped[channel] = (pciGrouped[channel] ?? 0) + s
  }
  const totalPciSessions = Object.values(pciGrouped).reduce((a, b) => a + b, 0)
  const pciSources = Object.entries(pciGrouped)
    .map(([channel, s]) => ({
      channel,
      sessions: s,
      pct: totalPciSessions > 0 ? Math.round((s / totalPciSessions) * 100) : 0,
    }))
    .filter((s) => s.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 7)

  // Countries
  const countries = (countriesReport[0].rows ?? []).map((r) => {
    const name = r.dimensionValues?.[0]?.value ?? "Unknown"
    const s = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
    return { country: name, code: countryCode(name), sessions: s }
  })

  // Funnel
  const visita = (funnelVisita[0].rows ?? []).reduce(
    (sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    0
  )
  const checkout = (funnelCheckout[0].rows ?? []).reduce(
    (sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    0
  )
  const finalizado = (funnelFinalizado[0].rows ?? []).reduce(
    (sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    0
  )

  // Devices
  const deviceRows = devicesReport[0].rows ?? []
  const totalDeviceSessions = deviceRows.reduce(
    (sum, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    0
  )
  const devices = deviceRows.map((r) => {
    const s = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
    return {
      category: r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: s,
      pct: totalDeviceSessions > 0 ? Math.round((s / totalDeviceSessions) * 100) : 0,
    }
  })

  // Upsell — split by sessionMedium: post_purchase = email, everything else = page
  function sumUpsell(rows: typeof upsellGbReport[0]["rows"]): { page: number; email: number } {
    let page = 0
    let email = 0
    for (const r of rows ?? []) {
      const medium = r.dimensionValues?.[0]?.value ?? ""
      const views  = parseInt(r.metricValues?.[0]?.value ?? "0", 10)
      if (medium === "post_purchase") email += views
      else page += views
    }
    return { page, email }
  }

  const upsell = {
    gbFoundations: sumUpsell(upsellGbReport[0].rows),
    pcra:          sumUpsell(upsellPcraReport[0].rows),
  }

  return {
    sessions,
    users,
    newUsers,
    returningUsers,
    bounceRate,
    pageviews,
    sources,
    pciSources,
    countries,
    funnel: { visita, checkout, finalizado },
    devices,
    upsell,
  }
}

/* ---------------------------------- */
/* ROUTE                               */
/* ---------------------------------- */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from") ?? "30daysAgo"
  const to = searchParams.get("to") ?? "today"
  const key = `${from}_${to}`

  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const data = await fetchAnalytics(from, to)
    cache.set(key, { data, ts: Date.now() })
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch GA4 data" },
      { status: 500 }
    )
  }
}
