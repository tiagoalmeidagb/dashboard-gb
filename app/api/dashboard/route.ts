import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

import { getRecordsSince2024, getAllRecords } from "@/lib/airtable-client"
import { buildDashboardMetrics, buildChartData, filterByDate } from "@/lib/metrics"
import { buildRevenueByProduct } from "@/lib/revenue-by-product"
import { buildCustomerMetrics } from "@/lib/customer-metrics"
import { calculateNewVsReturningRevenue } from "@/lib/revenue-segmentation"

export const dynamic = "force-dynamic"

/* ---------------------------------- */
/* CACHE DE RESULTADO (por período)   */
/* ---------------------------------- */

const computeDashboard = unstable_cache(
  async (from: string, to: string) => {
    const fromDate = new Date(from + "T00:00:00")
    const toDate = new Date(to + "T00:00:00")

    const [records, fullRecords] = await Promise.all([
      getRecordsSince2024(),
      getAllRecords(),
    ])

    const metrics = buildDashboardMetrics(records, fromDate, toDate)
    const chartData = buildChartData(records, fromDate, toDate)
    const revenueData = buildRevenueByProduct(records, fromDate, toDate)
    const customerMetrics = buildCustomerMetrics(records, fromDate, toDate, fullRecords)

    const filtered = filterByDate(records, fromDate, toDate)
    const revenueSplit = calculateNewVsReturningRevenue({
      fullData: fullRecords,
      filteredData: filtered,
      startDate: fromDate,
      endDate: toDate,
    })

    return { metrics, chartData, revenueData, customerMetrics, revenueSplit }
  },
  ["dashboard"],
  { revalidate: 300 }
)

/* ---------------------------------- */
/* ROUTE                               */
/* ---------------------------------- */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to params" }, { status: 400 })
  }

  try {
    const data = await computeDashboard(from, to)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[dashboard]", err)
    return NextResponse.json({ error: "Failed to compute metrics" }, { status: 500 })
  }
}
