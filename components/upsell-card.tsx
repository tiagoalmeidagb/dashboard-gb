"use client"

import { ShoppingBag, Monitor, Mail } from "lucide-react"

type UpsellProduct = {
  page: number
  email: number
}

type Props = {
  pciSales: number
  gbFoundations: UpsellProduct
  pcra: UpsellProduct
}

export default function UpsellCard({ pciSales, gbFoundations, pcra }: Props) {
  const totalGb    = gbFoundations.page + gbFoundations.email
  const totalPcra  = pcra.page + pcra.email
  const totalUpsell = totalGb + totalPcra

  const gbPct   = totalUpsell > 0 ? Math.round((totalGb   / totalUpsell) * 100) : 0
  const pcraPct = totalUpsell > 0 ? Math.round((totalPcra / totalUpsell) * 100) : 0

  const totalPage  = gbFoundations.page + pcra.page
  const totalEmail = gbFoundations.email + pcra.email
  const pagePct    = totalUpsell > 0 ? Math.round((totalPage  / totalUpsell) * 100) : 0
  const emailPct   = totalUpsell > 0 ? Math.round((totalEmail / totalUpsell) * 100) : 0

  const conversionPct = pciSales > 0 ? Math.round((totalUpsell / pciSales) * 100) : 0

  const topPct = Math.max(gbPct, pcraPct, 1)

  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      <p className="text-sm font-semibold mb-5" style={{ color: "#141414" }}>
        Upsell PCI
      </p>

      <div className="flex-1 grid grid-cols-[1fr_2fr_1.4fr] gap-6 min-h-0">

        {/* ── Secção A: Vendas PCI ── */}
        <div className="flex flex-col justify-between" style={{ borderRight: "1px solid #E0E8F4", paddingRight: "1.5rem" }}>
          <div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "#F0F4FA", color: "#003672" }}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <p className="text-3xl font-bold leading-none mb-1" style={{ color: "#141414" }}>
              {pciSales.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: "#A7A9AC" }}>vendas PCI</p>
          </div>

          <div
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 self-start"
            style={{ background: "#EEF4FF" }}
          >
            <span className="text-xs font-semibold" style={{ color: "#003672" }}>
              {conversionPct}%
            </span>
            <span className="text-xs" style={{ color: "#636466" }}>clicaram em upsell</span>
          </div>
        </div>

        {/* ── Secção B: Cliques nos Upsells ── */}
        <div className="flex flex-col justify-between" style={{ borderRight: "1px solid #E0E8F4", paddingRight: "1.5rem" }}>
          <div>
            <p className="text-xs font-semibold mb-4" style={{ color: "#A7A9AC", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Cliques nos Upsells
            </p>

            {/* Fundamentos GB */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#003672" }} />
                  <span className="text-xs font-medium" style={{ color: "#141414" }}>Fundamentos GB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: "#141414" }}>{totalGb.toLocaleString()}</span>
                  <span className="text-xs" style={{ color: "#A7A9AC" }}>({gbPct}%)</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#F0F4FA" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(gbPct / topPct) * 100}%`, background: "#003672" }}
                />
              </div>
            </div>

            {/* Curso de Retenção */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#1D6FBB" }} />
                  <span className="text-xs font-medium" style={{ color: "#141414" }}>Curso de Retenção</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: "#141414" }}>{totalPcra.toLocaleString()}</span>
                  <span className="text-xs" style={{ color: "#A7A9AC" }}>({pcraPct}%)</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#F0F4FA" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(pcraPct / topPct) * 100}%`, background: "#1D6FBB" }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs mt-4" style={{ color: "#636466" }}>
            Total: <span className="font-semibold" style={{ color: "#141414" }}>{totalUpsell.toLocaleString()} cliques</span>
          </p>
        </div>

        {/* ── Secção C: Origem dos Cliques ── */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold mb-4" style={{ color: "#A7A9AC", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Origem
            </p>

            {/* Página de obrigado */}
            <div className="flex items-start gap-2.5 mb-4">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                style={{ background: "#F0F4FA", color: "#636466" }}
              >
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs" style={{ color: "#636466" }}>Pág. obrigado</p>
                <p className="text-sm font-bold" style={{ color: "#141414" }}>{totalPage.toLocaleString()}</p>
                <p className="text-xs" style={{ color: "#A7A9AC" }}>{pagePct}% dos cliques</p>
              </div>
            </div>

            {/* E-mail */}
            <div className="flex items-start gap-2.5">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                style={{ background: "#F0F4FA", color: "#636466" }}
              >
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs" style={{ color: "#636466" }}>E-mail</p>
                <p className="text-sm font-bold" style={{ color: "#141414" }}>{totalEmail.toLocaleString()}</p>
                <p className="text-xs" style={{ color: "#A7A9AC" }}>{emailPct}% dos cliques</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
