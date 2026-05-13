export type ProductCategory =
  | "ICP"
  | "GB Foundations"
  | "Raising Champions"
  | "Public Speaking"
  | "English for Instructors"
  | "Retention Course"
  | "MSCP"
  | "Developing Leaders"
  | "Personal Branding"
  | "Habits of GB Leaders"
  | "Women's Self-Defense"
  | "Integration Monthly"
  | "Integration Yearly"
  | "Unknown"

function normalize(text?: string) {
  if (!text || typeof text !== "string") return ""
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function mapProductToCategory(name?: string): ProductCategory {
  const n = normalize(name)

  // ── ICP / Instructor ──────────────────────────────────────────────
  if (n.includes("icp") || n.includes("pci")) return "ICP"
  if (n.includes("assistant instructor"))       return "ICP"

  // ── GB Foundations (EN + FR) ──────────────────────────────────────
  if (
    n.includes("fundamentos gb") ||
    n.includes("gb foundations") ||
    n.includes("gb fondations") ||    // French spelling
    n.includes("fondations gb")
  ) return "GB Foundations"

  // ── Other instructor courses ──────────────────────────────────────
  if (n.includes("raising champions") || n.includes("criando campeoes"))
    return "Raising Champions"

  if (n.includes("public speaking") || n.includes("oratoria"))
    return "Public Speaking"

  if (n.includes("ingles para instrutores"))
    return "English for Instructors"

  if (n.includes("retencao") || n.includes("retention"))
    return "Retention Course"

  if (n.includes("mscp")) return "MSCP"

  if (n.includes("developing leaders") || n.includes("desenvolvendo lideres"))
    return "Developing Leaders"

  if (n.includes("personal branding") || n.includes("branding pessoal"))
    return "Personal Branding"

  if (n.includes("habits of gb leaders") || n.includes("habitos dos lideres"))
    return "Habits of GB Leaders"

  // ── Integration ───────────────────────────────────────────────────
  // Matches: "integration", "integracao" (Portuguese, after NFD normalization)
  // Also handles: GBI Integration, Integração IGB, Integração GBI, etc.
  const isIntegration =
    n.includes("integration") ||
    n.includes("integracao") ||
    n.includes("integra igb") ||
    n.includes("integra gbi")

  if (isIntegration) {
    // Explicitly yearly if "year" or "anual" in the name
    if (n.includes("year") || n.includes("anual")) return "Integration Yearly"
    // Everything else (monthly instalments, GBI variants, etc.) → Monthly
    return "Integration Monthly"
  }

  // ── Women's Self-Defense + Non-ICP catch-all ──────────────────────
  // Covers: Women's Self-Defense product, Leading Women's Self-Defense,
  // Blue Belt Certificate, GBK Certification, Pro Shop, School Owner,
  // Masterclass, and any remaining non-ICP products.
  return "Women's Self-Defense"
}
