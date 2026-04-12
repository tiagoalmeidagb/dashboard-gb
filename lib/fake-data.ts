type Transaction = {
  date: string
  product: "instructor" | "integration" | "non-icp"
  value: number
}

const PRODUCTS = [
  { key: "instructor", base: 10, weight: 0.5 },
  { key: "integration", base: 20, weight: 0.3 },
  { key: "non-icp", base: 30, weight: 0.2 },
] as const

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function getSeasonalityFactor(date: Date) {
  const day = date.getDay()

  // fim de semana vende menos
  if (day === 0 || day === 6) return 0.7

  // meio da semana vende mais
  if (day === 2 || day === 3) return 1.2

  return 1
}

function getTrendFactor(index: number, totalDays: number) {
  // crescimento gradual ao longo do tempo
  return 1 + index / totalDays
}

function getRandomSpike() {
  // 10% chance de spike
  if (Math.random() < 0.1) {
    return randomBetween(1.5, 3)
  }
  return 1
}

export function generateFakeData(days = 120) {
  const data: Transaction[] = []
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)

    const seasonality = getSeasonalityFactor(date)
    const trend = getTrendFactor(days - i, days)
    const spike = getRandomSpike()

    PRODUCTS.forEach((product) => {
      // quantidade de vendas por produto no dia
      const salesCount = Math.floor(
        randomBetween(5, 25) * product.weight * trend
      )

      for (let j = 0; j < salesCount; j++) {
        const variation = randomBetween(0.8, 1.2)

        const value =
          product.base *
          variation *
          seasonality *
          spike

        data.push({
          date: date.toISOString(),
          product: product.key,
          value: Math.round(value),
        })
      }
    })
  }

  return data
}