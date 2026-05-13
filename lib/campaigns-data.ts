export type Campaign = {
  id: string
  name: string
  entryPaths: string[]
  thankYouPath: string
  coupons: string[]
  landingPage: "instructor" | "integration" | "non-icp"
  startDate: string
  endDate: string | null
  iconName: string
  iconBg: string
  iconColor: string
}

export const campaigns: Campaign[] = [
  {
    id: "legado26",
    name: "Mês do Legado 2026",
    entryPaths: ["/legado", "/legacy"],
    thankYouPath: "/obrigado-pci",
    coupons: ["LEGADO", "LEGACY", "F40"],
    landingPage: "instructor",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    iconName: "star",
    iconBg: "#EEF2FF",
    iconColor: "#6366F1",
  },
]
