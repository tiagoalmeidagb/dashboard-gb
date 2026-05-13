type Transaction = {
  date: string
  rawProduct: string
  value: number
  email: string | null
}

export type CohortItem = {
  year: number
  total: number
  newUsers: number
  returning: number
  repurchaseRate: number
  growth?: number
}

/* ---------------- HELPERS ---------------- */

function isIcp(name: string) {
  const n = name.toLowerCase()
  return n.includes("icp") || n.includes("pci")
}

function extractYear(name: string): number | null {
  const match = name.match(/20\d{2}/)
  return match ? Number(match[0]) : null
}

// 🔥 remove parcelas e ruído
function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove (1/3)
    .replace(/-.*$/g, "") // remove sufixos
    .trim()
}

/* ---------------- MAIN ---------------- */

export function buildIcpCohort(
  data: Transaction[]
): CohortItem[] {
  // 🔥 year -> emails únicos
  const buyersByYear = new Map<number, Set<string>>()

  // 🔥 histórico por email
  const historyByEmail = new Map<string, Set<number>>()

  data.forEach((t) => {
    if (!t.email) return
    if (t.value <= 0) return
    if (!isIcp(t.rawProduct)) return

    const year = extractYear(t.rawProduct)
    if (!year) return

    // buyers
    if (!buyersByYear.has(year)) {
      buyersByYear.set(year, new Set())
    }
    buyersByYear.get(year)!.add(t.email)

    // history
    if (!historyByEmail.has(t.email)) {
      historyByEmail.set(t.email, new Set())
    }
    historyByEmail.get(t.email)!.add(year)
  })

  const years = Array.from(buyersByYear.keys()).sort(
    (a, b) => a - b
  )

  const result: CohortItem[] = []

  years.forEach((year, index) => {
    const buyers = buyersByYear.get(year)!
    const total = buyers.size

    let newUsers = 0
    let returning = 0

    buyers.forEach((email) => {
      const history = historyByEmail.get(email)!

      const hasPrevious = Array.from(history).some(
        (y) => y < year
      )

      if (hasPrevious) returning++
      else newUsers++
    })

    // 🔥 repurchase = veio do ANO ANTERIOR
    let repurchaseRate = 0
    if (index > 0) {
      const prevYear = years[index - 1]
      const prevBuyers = buyersByYear.get(prevYear)!

      let retained = 0

      buyers.forEach((email) => {
        if (prevBuyers.has(email)) {
          retained++
        }
      })

      if (prevBuyers.size > 0) {
        repurchaseRate =
          (retained / prevBuyers.size) * 100
      }
    }

    // growth
    let growth: number | undefined
    if (index > 0) {
      const prev = result[index - 1].total
      if (prev > 0) {
        growth = ((total - prev) / prev) * 100
      }
    }

    result.push({
      year,
      total,
      newUsers,
      returning,
      repurchaseRate,
      growth,
    })
  })

  return result
}