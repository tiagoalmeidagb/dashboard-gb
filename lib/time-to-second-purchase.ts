import { toPhoenixDate, normalizePhoenixDate } from "@/lib/date"
import { normalizeProductName } from "@/lib/normalize-product"

type Transaction = {
  date: string
  rawProduct: string
  value: number
  email: string | null
}

export type TimeToSecondPurchase = {
  medianDays: number
  customerCount: number
  medianDaysTo3rd: number
  customerCountTo3rd: number
}

/* ---------------------------------- */
/* HELPERS                             */
/* ---------------------------------- */

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

/* ---------------------------------- */
/* MAIN                                */
/* ---------------------------------- */

export function buildTimeToSecondPurchase(
  data: Transaction[]
): TimeToSecondPurchase {
  /**
   * Para cada email: Map<normalizedProduct, earliestDate>
   * - Parcelas do mesmo produto colapsam para a 1ª data
   * - Produtos diferentes ficam como entradas separadas
   */
  const byEmail = new Map<string, Map<string, Date>>()

  for (const t of data) {
    if (!t.email || t.value <= 0) continue

    const email = t.email.toLowerCase()
    const product = normalizeProductName(t.rawProduct)
    const phoenixDate = normalizePhoenixDate(toPhoenixDate(t.date))

    if (!byEmail.has(email)) byEmail.set(email, new Map())
    const products = byEmail.get(email)!

    // Guarda apenas a data mais antiga para cada produto
    const existing = products.get(product)
    if (!existing || phoenixDate < existing) {
      products.set(product, phoenixDate)
    }
  }

  const diffs1to2: number[] = []
  const diffs2to3: number[] = []

  for (const [, products] of byEmail) {
    // Ordena as datas das primeiras compras de cada produto (cronologicamente)
    const dates = Array.from(products.values()).sort(
      (a, b) => a.getTime() - b.getTime()
    )

    // 1ª → 2ª compra (requer ≥ 2 produtos distintos)
    if (dates.length >= 2) {
      diffs1to2.push(
        Math.round((dates[1].getTime() - dates[0].getTime()) / 86_400_000)
      )
    }

    // 2ª → 3ª compra (requer ≥ 3 produtos distintos)
    if (dates.length >= 3) {
      diffs2to3.push(
        Math.round((dates[2].getTime() - dates[1].getTime()) / 86_400_000)
      )
    }
  }

  return {
    medianDays:        median(diffs1to2),
    customerCount:     diffs1to2.length,
    medianDaysTo3rd:   median(diffs2to3),
    customerCountTo3rd: diffs2to3.length,
  }
}
