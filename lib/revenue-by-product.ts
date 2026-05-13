import { toZonedTime } from "date-fns-tz"
import { mapProductToCategory } from "@/lib/product-map"
import { filterByDate } from "@/lib/metrics"
import { normalizePhoenixDate } from "@/lib/date"

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

const PHOENIX_TZ = "America/Phoenix"

function startOfQuarter(date: Date): Date {
  const q = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), q * 3, 1)
}

function endOfQuarter(date: Date): Date {
  const q = Math.floor(date.getMonth() / 3)
  // day 0 of the first month of the next quarter = last day of this quarter
  return new Date(date.getFullYear(), q * 3 + 3, 0)
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

function warnUnmapped(rawProduct: string) {
  console.warn(`[revenue-by-product] Produto não mapeado: "${rawProduct}"`)
}

export function buildRevenueByProduct(
  data: Transaction[],
  from: Date,
  to: Date
) {
  const fromDate = normalizePhoenixDate(from)
  const toDate   = normalizePhoenixDate(to)

  // "Hoje" no timezone Arizona — referência para Quarter e Year
  const todayPhoenix = normalizePhoenixDate(toZonedTime(new Date(), PHOENIX_TZ))

  // ── 2026 / 2025 (alinhado ao date picker) ──────────────────────────
  const currentYear  = toDate.getFullYear()
  const previousYear = currentYear - 1

  const prevFrom = new Date(fromDate); prevFrom.setFullYear(previousYear)
  const prevTo   = new Date(toDate);   prevTo.setFullYear(previousYear)

  const currentData  = filterByDate(data, fromDate, toDate)
  const previousData = filterByDate(data, prevFrom, prevTo)

  // ── Quarter (independente do date picker) ──────────────────────────
  // Identifica o quarter pelo toDate, mas expande o range:
  // - Quarter completo → usa o período inteiro do quarter
  // - Quarter em andamento → QTD do início até hoje (Phoenix)
  const qStart = startOfQuarter(toDate)
  const qEnd   = endOfQuarter(toDate)
  const effectiveQuarterEnd = todayPhoenix <= qEnd ? todayPhoenix : qEnd
  const quarterData = filterByDate(data, qStart, effectiveQuarterEnd)

  // ── Year — YTD: Jan 1 até hoje (Phoenix) ──────────────────────────
  const yearStart = startOfYear(todayPhoenix)
  const yearData  = filterByDate(data, yearStart, todayPhoenix)

  // ── Resultado ─────────────────────────────────────────────────────
  const result: Record<
    string,
    { product: string; y2025: number; y2026: number; quarter: number; year: number }
  > = {}

  PRODUCTS.forEach((p) => {
    result[p] = { product: p, y2025: 0, y2026: 0, quarter: 0, year: 0 }
  })

  currentData.forEach((t) => {
    if (t.value <= 0) return
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) { warnUnmapped(t.rawProduct); return }
    result[mapped].y2026 += t.value
  })

  previousData.forEach((t) => {
    if (t.value <= 0) return
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) { warnUnmapped(t.rawProduct); return }
    result[mapped].y2025 += t.value
  })

  yearData.forEach((t) => {
    if (t.value <= 0) return
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) { warnUnmapped(t.rawProduct); return }
    result[mapped].year += t.value
  })

  quarterData.forEach((t) => {
    if (t.value <= 0) return
    const mapped = mapProductToCategory(t.rawProduct)
    if (!result[mapped]) { warnUnmapped(t.rawProduct); return }
    result[mapped].quarter += t.value
  })

  return Object.values(result)
}
