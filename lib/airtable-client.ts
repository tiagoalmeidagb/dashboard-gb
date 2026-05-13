export type Transaction = {
  date: string
  product: "instructor" | "integration" | "non-icp"
  rawProduct: string
  value: number
  email: string | null
}

/* ---------------------------------- */
/* HELPERS                             */
/* ---------------------------------- */

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function mapCategory(name: string): "instructor" | "integration" | "non-icp" {
  const n = normalize(name)
  if (
    n.includes("icp") ||
    n.includes("pci") ||
    n.includes("fundamentos") ||
    n.includes("foundations") ||
    n.includes("assistant instructor")
  )
    return "instructor"
  if (n.includes("integra")) return "integration"
  return "non-icp"
}

/* ---------------------------------- */
/* FETCH                               */
/* ---------------------------------- */

async function fetchAirtable(filterFormula?: string): Promise<Transaction[]> {
  let allRecords: { fields: Record<string, unknown> }[] = []
  let offset: string | null = null

  const BASE_ID = process.env.AIRTABLE_BASE_ID
  const API_KEY = process.env.AIRTABLE_API_KEY

  if (!BASE_ID || !API_KEY) throw new Error("Missing Airtable env vars")

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/Base2`)
    url.searchParams.append("fields[]", "Data")
    url.searchParams.append("fields[]", "Produto")
    url.searchParams.append("fields[]", "Value")
    url.searchParams.append("fields[]", "E-mail")
    if (filterFormula) url.searchParams.append("filterByFormula", filterFormula)
    if (offset) url.searchParams.append("offset", offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    if (!res.ok) throw new Error(`Airtable error: ${res.status}`)

    const json = await res.json()
    if (!json.records) break

    allRecords.push(...json.records)
    offset = json.offset || null
  } while (offset)

  return allRecords.flatMap((record) => {
    const Data = record.fields["Data"]
    const Produto = record.fields["Produto"]
    const Value = record.fields["Value"]
    const Email = record.fields["E-mail"]
    const numericValue = Number(Value)

    if (!Data || !Produto || !Number.isFinite(numericValue)) return []

    return [
      {
        date: Data as string,
        product: mapCategory(Produto as string),
        rawProduct: Produto as string,
        value: numericValue,
        email: (Email as string) || null,
      },
    ]
  })
}

/* ---------------------------------- */
/* MODULE-LEVEL CACHE (warm instances) */
/* ---------------------------------- */

type CacheEntry = { data: Transaction[]; ts: number }

let _sinceCache: CacheEntry | null = null
let _fullCache: CacheEntry | null = null
const TTL = 5 * 60 * 1000

/**
 * Registros desde 2024-10-01 até hoje.
 * Usado para todas as métricas filtradas por data.
 */
export async function getRecordsSince2024(): Promise<Transaction[]> {
  if (_sinceCache && Date.now() - _sinceCache.ts < TTL) return _sinceCache.data

  const endDate = new Date().toISOString().slice(0, 10)
  const formula = `AND(
    {Data} >= DATETIME_PARSE('2024-10-01', 'YYYY-MM-DD'),
    {Data} <= DATETIME_PARSE('${endDate}', 'YYYY-MM-DD')
  )`

  const data = await fetchAirtable(formula)
  _sinceCache = { data, ts: Date.now() }
  return data
}

/**
 * Todos os registros históricos.
 * Usado para cohort ICP e cálculo new vs returning.
 */
export async function getAllRecords(): Promise<Transaction[]> {
  if (_fullCache && Date.now() - _fullCache.ts < TTL) return _fullCache.data

  const data = await fetchAirtable()
  _fullCache = { data, ts: Date.now() }
  return data
}
