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

// 🔥 SAFE NORMALIZE (NUNCA MAIS QUEBRA)
function normalize(text?: string) {
  if (!text || typeof text !== "string") return ""

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function mapProductToCategory(name?: string): ProductCategory {
  const n = normalize(name)

  if (n.includes("icp") || n.includes("pci")) return "ICP"

  if (n.includes("fundamentos gb") || n.includes("gb foundations"))
    return "GB Foundations"

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

  if (n.includes("self defense") || n.includes("defesa pessoal"))
    return "Women's Self-Defense"

  if (n.includes("integration") && n.includes("year"))
    return "Integration Yearly"

  if (n.includes("integration") && n.includes("month"))
    return "Integration Monthly"

  return "Unknown"
}