import { mapProductToCategory } from "@/lib/product-map"
import { filterByDate } from "@/lib/metrics"
import { toPhoenixDate, normalizePhoenixDate } from "@/lib/date"

type Transaction = {
  date: string
  product: string
  rawProduct: string
  value: number
}

const PRODUCTS = [
  "ICP",
  "GB Foundations",
  "Raising Champions",
  "Public Speaking",
  "English for Instructors",
  "Retention Course",
  "MSCP",
  "Developing Leaders",
  "Personal Branding",
  "Habits of GB Leaders",
  "Women's Self-Defense",
  "Integration Monthly",
  "Integration Yearly",
]

function toDateOnly(dateStr: string) {
  return normalizePhoenixDate(toPhoenixDate(dateStr))
}

function startOfQuarter(date: Date) {
  const q = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), q * 3, 1)
}

function endOfQuarter(date: Date) {
  const q = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), q * 3 + 3, 0)
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1)
}

export function buildRevenueByProduct(
  data: Transaction[],
  from: Date,
  to: Date
) {
  const fromDate = normalizePhoenixDate(from)
  const toDate = normalizePhoenixDate(to)

  const currentYear = toDate.getFullYear()
  const previousYear = currentYear - 1

  const prevFrom = new Date(fromDate)
  prevFrom.setFullYear(previousYear)

  const prevTo = new Date(toDate)
  prevTo.setFullYear(previousYear)

  // ✅ alinhado com KPI
  const currentData = filterByDate(data, fromDate, toDate)
  const previousData = filterByDate(data, prevFrom, prevTo)

  // 🔥 pega última data REAL disponível
  let maxDate = new Date(0)

  data.forEach((t) => {
    const d = toDateOnly(t.date)
    if (d > maxDate) maxDate = d
  })

  // ✅ QUARTER baseado na última data real
  const quarterStart = startOfQuarter(maxDate)
  const quarterEnd = endOfQuarter(maxDate)

  // ✅ YEAR baseado no range selecionado (YTD)
  const yearStart = startOfYear(toDate)

  const result: Record<
    string,
    {
      product: string
      y2025: number
      y2026: number
      quarter: number
      year: number
    }
  > = {}

  PRODUCTS.forEach((p) => {
    result[p] = {
      product: p,
      y2025: 0,
      y2026: 0,
      quarter: 0,
      year: 0,
    }
  })

  // ✅ CURRENT (2026)
  currentData.forEach((t) => {
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) return

    result[mapped].y2026 += t.value
  })

  // ✅ PREVIOUS (2025)
  previousData.forEach((t) => {
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) return

    result[mapped].y2025 += t.value
  })

  // ✅ YEAR (YTD consistente com KPI)
  const yearData = filterByDate(data, yearStart, toDate)

  yearData.forEach((t) => {
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) return

    result[mapped].year += t.value
  })

  // ✅ QUARTER (baseado na última data disponível)
  data.forEach((t) => {
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) return

    const d = toDateOnly(t.date)
    const value = t.value || 0

    if (d >= quarterStart && d <= quarterEnd) {
      result[mapped].quarter += value
    }
  })

  return Object.values(result)
}