import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

import { getAllRecords } from "@/lib/airtable-client"
import { buildIcpCohort } from "@/lib/build-icp-cohort"

export const dynamic = "force-dynamic"

const computeCohort = unstable_cache(
  async () => {
    const records = await getAllRecords()
    return buildIcpCohort(records)
  },
  ["cohort"],
  { revalidate: 600 }
)

export async function GET() {
  try {
    const data = await computeCohort()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[cohort]", err)
    return NextResponse.json({ error: "Failed to compute cohort" }, { status: 500 })
  }
}
