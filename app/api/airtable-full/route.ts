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

const getAllData = unstable_cache(
  async () => {
    let allRecords: any[] = []
    let offset: string | null = null

    const BASE_ID = process.env.AIRTABLE_BASE_ID
    const API_KEY = process.env.AIRTABLE_API_KEY
    const TABLE_NAME = "Base2"

    if (!BASE_ID || !API_KEY) {
      throw new Error("Missing Airtable env vars")
    }

    try {
      do {
        const url = new URL(
          `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`
        )

        // 🔥 reduzir payload (ESSENCIAL)
        url.searchParams.append("fields[]", "Data")
        url.searchParams.append("fields[]", "Produto")
        url.searchParams.append("fields[]", "Value")
        url.searchParams.append("fields[]", "E-mail")

        if (offset) {
          url.searchParams.append("offset", offset)
        }

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Airtable error: ${text}`)
        }

        const data = await res.json()

        if (!data.records) break

        allRecords.push(...data.records)

        offset = data.offset || null

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
          date: Data,
          product: mapCategory(Produto),
          rawProduct: Produto,
          value: numericValue,
          email: Email || null,
        })
      })

      return result
    } catch (error) {
      console.error("FULL API ERROR:", error)

      // 🔥 NUNCA retorna vazio inválido
      return []
    }
  },
  ["airtable-full"],
  { revalidate: 600 }
)

/* ---------------------------------- */
/* ROUTE */
/* ---------------------------------- */

export async function GET() {
  try {
    const data = await getAllData()
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch Airtable FULL data" },
      { status: 500 }
    )
  }
}