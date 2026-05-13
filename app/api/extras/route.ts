import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

import { getAllRecords, getRecordsSince2024 } from "@/lib/airtable-client"
import { buildTimeToSecondPurchase } from "@/lib/time-to-second-purchase"
import { buildProductProgression } from "@/lib/product-progression"
import { buildGoalProgress } from "@/lib/goal-progress"

export const dynamic = "force-dynamic"

const computeExtras = unstable_cache(
  async () => {
    const [fullRecords, sinceRecords] = await Promise.all([
      getAllRecords(),
      getRecordsSince2024(),
    ])

    return {
      timeToSecondPurchase: buildTimeToSecondPurchase(fullRecords),
      productProgression: buildProductProgression(fullRecords),
      goalProgress: buildGoalProgress(sinceRecords),
    }
  },
  ["extras"],
  { revalidate: 600 }
)

export async function GET() {
  try {
    const data = await computeExtras()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[extras]", err)
    return NextResponse.json({ error: "Failed to compute extras" }, { status: 500 })
  }
}
