import { toPhoenixDate, normalizePhoenixDate } from "@/lib/date"
import { mapProductToCategory } from "@/lib/product-map"

type Transaction = {
  date: string
  rawProduct: string
  value: number
  email: string | null
}

export type Transition = {
  from: string
  to: string
  count: number
  pct: number
}

export type ProductProgression = {
  transitions: Transition[]
  totalCustomers: number
}

export function buildProductProgression(
  data: Transaction[]
): ProductProgression {
  const byEmail = new Map<string, { date: Date; product: string }[]>()

  for (const t of data) {
    if (!t.email || t.value <= 0) continue

    const product = mapProductToCategory(t.rawProduct)
    if (product === "Unknown") continue

    const phoenixDate = normalizePhoenixDate(toPhoenixDate(t.date))
    const key = t.email.toLowerCase()

    if (!byEmail.has(key)) byEmail.set(key, [])
    byEmail.get(key)!.push({ date: phoenixDate, product })
  }

  const transitionCounts = new Map<string, number>()
  let totalCustomers = 0

  for (const [, purchases] of byEmail) {
    purchases.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Remove produtos consecutivos iguais (ex: parcelas do mesmo produto)
    const sequence: string[] = []
    for (const p of purchases) {
      if (sequence.at(-1) !== p.product) {
        sequence.push(p.product)
      }
    }

    if (sequence.length < 2) continue

    totalCustomers++

    // Registra cada par A→B único por cliente
    const seen = new Set<string>()
    for (let i = 0; i < sequence.length - 1; i++) {
      const key = `${sequence[i]}|||${sequence[i + 1]}`
      if (!seen.has(key)) {
        seen.add(key)
        transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1)
      }
    }
  }

  const transitions: Transition[] = Array.from(transitionCounts.entries())
    .map(([key, count]) => {
      const [from, to] = key.split("|||")
      return {
        from,
        to,
        count,
        pct:
          totalCustomers > 0
            ? Math.round((count / totalCustomers) * 100)
            : 0,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return { transitions, totalCustomers }
}
