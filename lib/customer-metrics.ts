import { filterByDate } from "@/lib/metrics"
import { normalizeProductName } from "@/lib/normalize-product"

type Transaction = {
  date: string
  rawProduct: string
  value: number
  email: string | null
}

// filtra por email/value + timezone-safe date range (Phoenix, alinhado com o resto do codebase)
function filterValidTransactions(
  data: Transaction[],
  from?: Date,
  to?: Date
) {
  const withEmail = data.filter((t) => !!t.email && t.value > 0)
  if (from && to) return filterByDate(withEmail, from, to)
  return withEmail
}

function getPreviousPeriod(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime()

  return {
    from: new Date(from.getTime() - diff),
    to: new Date(to.getTime() - diff),
  }
}

// 🔥 SALES (único)
function buildUniqueSales(data: Transaction[]) {
  const set = new Set<string>()

  data.forEach((t) => {
    const product = normalizeProductName(t.rawProduct)
    const key = `${t.email}-${product}`
    set.add(key)
  })

  return set.size
}

export function buildCustomerMetrics(
  data: Transaction[],
  from: Date,
  to: Date,
  allData?: Transaction[]
) {
  // 🔥 CURRENT (filtrado + sem value 0)
  const current = filterValidTransactions(data, from, to)

  // 🔥 PREVIOUS
  const prevRange = getPreviousPeriod(from, to)
  const previous = filterValidTransactions(
    data,
    prevRange.from,
    prevRange.to
  )

  // ======================
  // ✅ SALES
  // ======================
  const sales = buildUniqueSales(current)
  const prevSales = buildUniqueSales(previous)

  const salesGrowth =
    prevSales === 0 ? 0 : ((sales - prevSales) / prevSales) * 100

  // ======================
  // ✅ AVG PURCHASE (GLOBAL)
  // Usa allData (histórico completo) se disponível,
  // senão cai para data (janela filtrada).
  // ======================
  const validAll = filterValidTransactions(allData ?? data)

  const customerProducts = new Map<string, Set<string>>()

  validAll.forEach((t) => {
    const product = normalizeProductName(t.rawProduct)
    const email = t.email!.toLowerCase()

    if (!customerProducts.has(email)) {
      customerProducts.set(email, new Set())
    }

    customerProducts.get(email)!.add(product)
  })

  const totalProducts = Array.from(customerProducts.values()).reduce(
    (acc, set) => acc + set.size,
    0
  )

  const avgPurchaseRate =
    customerProducts.size > 0
      ? totalProducts / customerProducts.size
      : 0

  // ======================
  // ✅ LTV (GLOBAL)
  // ======================
  const revenuePerCustomer = new Map<string, number>()

  validAll.forEach((t) => {
    const email = t.email!.toLowerCase()
    revenuePerCustomer.set(
      email,
      (revenuePerCustomer.get(email) || 0) + t.value
    )
  })

  const totalRevenue = Array.from(revenuePerCustomer.values()).reduce(
    (acc, v) => acc + v,
    0
  )

  const avgLTV =
    revenuePerCustomer.size > 0
      ? totalRevenue / revenuePerCustomer.size
      : 0

  return {
    sales,
    salesGrowth,
    avgPurchaseRate,
    avgLTV,
  }
}