import { normalizeProductName } from "@/lib/normalize-product"

type AirtableRow = {
  email: string | null
  date: string
  value: number
  rawProduct?: string
}

type RevenueSplit = {
  newRevenue: number
  returningRevenue: number
  newSales: number
  returningSales: number
}

export function calculateNewVsReturningRevenue({
  fullData,
  filteredData,
  startDate,
  endDate,
}: {
  fullData: AirtableRow[]
  filteredData: AirtableRow[]
  startDate: Date
  endDate: Date
}): RevenueSplit {
  const firstPurchaseMap = new Map<string, Date>()

  for (const row of fullData) {
    if (!row.email || row.value <= 0) continue

    const date = new Date(row.date)
    const existing = firstPurchaseMap.get(row.email)

    if (!existing || date < existing) {
      firstPurchaseMap.set(row.email, date)
    }
  }

  let newRevenue = 0
  let returningRevenue = 0
  const newSalesSet = new Set<string>()
  const returningSalesSet = new Set<string>()

  for (const row of filteredData) {
    if (!row.email || row.value <= 0) continue

    const firstPurchase = firstPurchaseMap.get(row.email)
    if (!firstPurchase) continue

    const key = `${row.email}-${normalizeProductName(row.rawProduct ?? "")}`

    if (firstPurchase >= startDate && firstPurchase <= endDate) {
      newRevenue += row.value
      newSalesSet.add(key)
    } else if (firstPurchase < startDate) {
      returningRevenue += row.value
      returningSalesSet.add(key)
    }
  }

  return {
    newRevenue,
    returningRevenue,
    newSales: newSalesSet.size,
    returningSales: returningSalesSet.size,
  }
}