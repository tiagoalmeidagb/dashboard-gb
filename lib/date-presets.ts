import {
  startOfToday,
  endOfToday,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"

export type DateRange = {
  from: Date
  to: Date
}

function startOfQuarter(date: Date) {
  const q = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), q * 3, 1)
}

function endOfQuarter(date: Date) {
  const q = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), q * 3 + 3, 0)
}

export function getPresetRange(preset: string): DateRange {
  const today = new Date()

  switch (preset) {
    case "today":
      return {
        from: today,
        to: today,
      }

    case "yesterday":
      const yesterday = subDays(today, 1)
      return {
        from: yesterday,
        to: yesterday,
      }

    case "last_7_days":
      return {
        from: subDays(today, 6),
        to: today,
      }

    case "last_30_days":
      return {
        from: subDays(today, 29),
        to: today,
      }

    case "this_week":
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: today,
      }

    case "this_month":
      return {
        from: startOfMonth(today),
        to: today,
      }

    case "last_month":
      const lastMonth = subMonths(today, 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }

    // 🔥 NOVO
    case "this_quarter":
      return {
        from: startOfQuarter(today),
        to: today,
      }

    default:
      return {
        from: subDays(today, 6),
        to: today,
      }
  }
}