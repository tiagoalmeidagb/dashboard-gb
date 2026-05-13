import { NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

export const dynamic = "force-dynamic"

// Temporary debug endpoint — returns top 50 hostnames + pagePaths from GA4
// Hit: /api/ga4/debug  to see what paths are actually tracked
export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n")

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json({ error: "Missing GA4 env vars" }, { status: 500 })
  }

  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  })

  try {
    const [byHost, byPath] = await Promise.all([
      // Top hostnames — shows which domains are in this property
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "2025-01-01", endDate: "today" }],
        dimensions: [{ name: "hostName" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 20,
      }),
      // Paths containing "leg" — shows legado/legacy if they exist
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "2025-01-01", endDate: "today" }],
        dimensions: [{ name: "hostName" }, { name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "CONTAINS", value: "leg" },
          },
        },
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 50,
      }),
    ])

    const hostnames = (byHost[0].rows ?? []).map((r) => ({
      hostname: r.dimensionValues?.[0]?.value,
      pageviews: parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    }))

    const legPaths = (byPath[0].rows ?? []).map((r) => ({
      hostname: r.dimensionValues?.[0]?.value,
      pagePath: r.dimensionValues?.[1]?.value,
      pageviews: parseInt(r.metricValues?.[0]?.value ?? "0", 10),
    }))

    return NextResponse.json({ hostnames, legPaths })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
