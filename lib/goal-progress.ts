import { toPhoenixDate, normalizePhoenixDate } from "@/lib/date"

type Transaction = {
  date: string
  product: "instructor" | "integration" | "non-icp"
  value: number
}

type GoalEntry = {
  current: number
  goal: number
  pct: number
}

export type GoalProgress = {
  instructor: GoalEntry
  nonIcp: GoalEntry
}

const GOALS = {
  instructor: 303_000,
  nonIcp: 50_000,
}

export function buildGoalProgress(data: Transaction[]): GoalProgress {
  let instructorTotal = 0
  let nonIcpTotal = 0

  for (const t of data) {
    if (t.value <= 0) continue

    const year = normalizePhoenixDate(toPhoenixDate(t.date)).getFullYear()
    if (year !== 2026) continue

    if (t.product === "instructor") instructorTotal += t.value
    else if (t.product === "non-icp") nonIcpTotal += t.value
  }

  return {
    instructor: {
      current: instructorTotal,
      goal: GOALS.instructor,
      pct: Math.min(100, Math.round((instructorTotal / GOALS.instructor) * 100)),
    },
    nonIcp: {
      current: nonIcpTotal,
      goal: GOALS.nonIcp,
      pct: Math.min(100, Math.round((nonIcpTotal / GOALS.nonIcp) * 100)),
    },
  }
}
