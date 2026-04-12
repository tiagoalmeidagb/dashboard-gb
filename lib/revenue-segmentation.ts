type AirtableRow = {
  email: string
  date: string
  value: number
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
  let newSales = 0
  let returningSales = 0

  for (const row of filteredData) {
    if (!row.email || row.value <= 0) continue

    const firstPurchase = firstPurchaseMap.get(row.email)
    if (!firstPurchase) continue

    if (firstPurchase >= startDate && firstPurchase <= endDate) {
      newRevenue += row.value
      newSales++
    } else if (firstPurchase < startDate) {
      returningRevenue += row.value
      returningSales++
    }
  }

  return {
    newRevenue,
    returningRevenue,
    newSales,
    returningSales,
  }
}