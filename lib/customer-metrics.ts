type Transaction = {
  date: string
  rawProduct: string
  value: number
  email: string | null
}

// 🔥 DETECÇÃO REAL DE PARCELAS (BASEADO NO SEU DATASET)
function normalizeProductName(name: string) {
  return name
    .toLowerCase()

    // remove blocos de datas + pagamentos
    .replace(/\(.*?\)/g, "")

    // remove padrões de parcelas
    .replace(/\d+\s*\/\s*\d+/g, "") // 1/3
    .replace(/payments?.*/g, "")
    .replace(/pagamentos?.*/g, "")
    .replace(/\/month.*/g, "")
    .replace(/\/m[eê]s.*/g, "")

    // limpeza geral
    .replace(/\s+/g, " ")
    .trim()
}

// 🔥 filtra + ignora value 0
function filterValidTransactions(
  data: Transaction[],
  from?: Date,
  to?: Date
) {
  return data.filter((t) => {
    if (!t.email) return false
    if (!t.value || t.value <= 0) return false

    if (from && to) {
      const d = new Date(t.date)
      return d >= from && d <= to
    }

    return true
  })
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
  to: Date
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
  // ======================
  const validAll = filterValidTransactions(data)

  const customerProducts = new Map<string, Set<string>>()

  validAll.forEach((t) => {
    const product = normalizeProductName(t.rawProduct)

    if (!customerProducts.has(t.email!)) {
      customerProducts.set(t.email!, new Set())
    }

    customerProducts.get(t.email!)!.add(product)
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
    revenuePerCustomer.set(
      t.email!,
      (revenuePerCustomer.get(t.email!) || 0) + t.value
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