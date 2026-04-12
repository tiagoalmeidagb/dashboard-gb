import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

export const dynamic = "force-dynamic"

/* ---------------------------------- */
/* HELPERS */
/* ---------------------------------- */

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function mapCategory(
  name: string
): "instructor" | "integration" | "non-icp" {
  const n = normalize(name)

  if (
    n.includes("icp") ||
    n.includes("pci") ||
    n.includes("fundamentos") ||
    n.includes("foundations")
  ) {
    return "instructor"
  }

  if (n.includes("integra")) return "integration"

  return "non-icp"
}

/* ---------------------------------- */
/* CACHE */
/* ---------------------------------- */

const getCachedData = unstable_cache(
  async () => {
    let allRecords: any[] = []
    let offset = ""

    const BASE_ID = process.env.AIRTABLE_BASE_ID
    const API_KEY = process.env.AIRTABLE_API_KEY
    const TABLE_NAME = "Base2"

    if (!BASE_ID || !API_KEY) {
      throw new Error("Missing Airtable env vars")
    }

    // 🔥 RANGE DEFINIDO
    const startDate = "2024-10-01"
    const endDate = "2026-04-02"

    do {
      const url = new URL(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`
      )

      // ✅ FILTRO CORRETO (INCLUSIVO)
      url.searchParams.append(
        "filterByFormula",
        `AND(
          {Data} >= DATETIME_PARSE('${startDate}', 'YYYY-MM-DD'),
          {Data} <= DATETIME_PARSE('${endDate}', 'YYYY-MM-DD')
        )`
      )

      if (offset) {
        url.searchParams.append("offset", offset)
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        next: { revalidate: 300 },
      })

      const data = await res.json()

      if (!data.records) break

      allRecords.push(...data.records)
      offset = data.offset
    } while (offset)

    const result: {
      date: string
      product: string
      rawProduct: string
      value: number
      email: string | null
    }[] = []

    allRecords.forEach((record) => {
      const Data = record.fields["Data"]
      const Produto = record.fields["Produto"]
      const Value = record.fields["Value"]
      const Email = record.fields["E-mail"]

      const numericValue = Number(Value)

      if (!Data || !Produto || !Number.isFinite(numericValue)) return

      result.push({
        date: Data, // 🔥 mantém ISO completo (melhor)
        product: mapCategory(Produto),
        rawProduct: Produto,
        value: numericValue,
        email: Email || null,
      })
    })

    return result
  },
  ["airtable-raw"],
  { revalidate: 300 }
)

/* ---------------------------------- */
/* ROUTE */
/* ---------------------------------- */

export async function GET() {
  try {
    const data = await getCachedData()
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch Airtable data" },
      { status: 500 }
    )
  }
}