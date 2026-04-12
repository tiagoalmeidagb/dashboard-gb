console.log("METRICS FILE LOADED")

import {
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns"

import { toPhoenixDate, normalizePhoenixDate } from "@/lib/date"

type Transaction = {
  date: string
  product: "instructor" | "integration" | "non-icp"
  value: number
}

/* ---------------------------------- */
/* HELPERS */
/* ---------------------------------- */

function toDateOnly(dateStr: string) {
  return normalizePhoenixDate(toPhoenixDate(dateStr))
}

/* ---------------------------------- */
/* FILTER */
/* ---------------------------------- */

export function filterByDate<T extends { date: string }>(
  data: T[],
  from: Date,
  to: Date
): T[] {
  const fromDate = normalizePhoenixDate(from)
  const toDate = normalizePhoenixDate(to)

  return data.filter((item) => {
    const d = toDateOnly(item.date)
    return d >= fromDate && d <= toDate
  })
}

/* ---------------------------------- */
/* PREVIOUS PERIOD */
/* ---------------------------------- */

export function getPreviousPeriod({
  from,
  to,
}: {
  from: Date
  to: Date
}) {
  const diff = to.getTime() - from.getTime()

  return {
    from: new Date(from.getTime() - diff),
    to: new Date(to.getTime() - diff),
  }
}

/* ---------------------------------- */
/* KPI */
/* ---------------------------------- */

function sumByProduct(data: Transaction[]) {
  return {
    total: data.reduce((acc, t) => acc + t.value, 0),

    instructor: data
      .filter((t) => t.product === "instructor")
      .reduce((acc, t) => acc + t.value, 0),

    integration: data
      .filter((t) => t.product === "integration")
      .reduce((acc, t) => acc + t.value, 0),

    nonIcp: data
      .filter((t) => t.product === "non-icp")
      .reduce((acc, t) => acc + t.value, 0),
  }
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/* ---------------------------------- */
/* METRICS */
/* ---------------------------------- */

export function buildDashboardMetrics(
  data: Transaction[],
  from: Date,
  to: Date
) {
  const current = filterByDate(data, from, to)

  const previousRange = getPreviousPeriod({ from, to })

  const previous = filterByDate(
    data,
    previousRange.from,
    previousRange.to
  )

  const currentSum = sumByProduct(current)
  const previousSum = sumByProduct(previous)

  return {
    total: {
      value: currentSum.total,
      growth: calculateGrowth(
        currentSum.total,
        previousSum.total
      ),
    },
    instructor: {
      value: currentSum.instructor,
      growth: calculateGrowth(
        currentSum.instructor,
        previousSum.instructor
      ),
    },
    integration: {
      value: currentSum.integration,
      growth: calculateGrowth(
        currentSum.integration,
        previousSum.integration
      ),
    },
    "non-icp": {
      value: currentSum.nonIcp,
      growth: calculateGrowth(
        currentSum.nonIcp,
        previousSum.nonIcp
      ),
    },
  }
}

/* ---------------------------------- */
/* CHART DATA */
/* ---------------------------------- */

export function buildChartData(
  data: Transaction[],
  from: Date,
  to: Date
) {
  const start = normalizePhoenixDate(from)
  const end = normalizePhoenixDate(to)

  if (start > end) return []

  const days = eachDayOfInterval({ start, end })
  const totalDays = days.length

  const valueMap = new Map<string, number>()

  data.forEach((item) => {
    const d = toDateOnly(item.date)
    const key = format(d, "yyyy-MM-dd")

    valueMap.set(key, (valueMap.get(key) || 0) + item.value)
  })

  return days.map((day) => {
    const currentKey = format(day, "yyyy-MM-dd")

    const previousDay = subDays(day, totalDays)
    const previousKey = format(previousDay, "yyyy-MM-dd")

    return {
      date: format(day, "MMM d"),
      current: valueMap.get(currentKey) || 0,
      previous: valueMap.get(previousKey) || 0,
    }
  })
}