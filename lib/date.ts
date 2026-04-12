import { toZonedTime } from "date-fns-tz"

const AIRTABLE_TZ = "America/Sao_Paulo"
const TARGET_TZ = "America/Phoenix"

export function toPhoenixDate(dateStr: string) {
  // interpreta como São Paulo
  const date = new Date(dateStr)

  // converte para Phoenix
  return toZonedTime(date, TARGET_TZ)
}

export function normalizePhoenixDate(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
}