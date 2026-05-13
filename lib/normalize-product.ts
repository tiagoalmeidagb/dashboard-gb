/**
 * Normalizes a raw product name to a canonical form,
 * removing installment info (1/3, 2/3 …), payment blocks, etc.
 * Used for deduplicating "sales" (one sale per unique email-product pair).
 */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")          // remove parenthesised blocks
    .replace(/\d+\s*\/\s*\d+/g, "")  // remove 1/3 style fractions
    .replace(/payments?.*/g, "")
    .replace(/pagamentos?.*/g, "")
    .replace(/\/month.*/g, "")
    .replace(/\/m[eê]s.*/g, "")
    .replace(/[-–]+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}
