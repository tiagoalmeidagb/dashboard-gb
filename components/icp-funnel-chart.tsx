"use client"

type FunnelData = {
  visita: number
  checkout: number
  finalizado: number
}

type Props = {
  funnel: FunnelData
}

type Step = {
  label: string
  value: number
  gradientId: string
  colorTop: string
  colorBottom: string
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function WaveColumn({
  heightPct,
  gradientId,
  colorTop,
  colorBottom,
  label,
  value,
}: {
  heightPct: number
  gradientId: string
  colorTop: string
  colorBottom: string
  label: string
  value: number
}) {
  const H = 160
  const W = 100
  const filledH = Math.max(10, Math.round((heightPct / 100) * H))
  const emptyH = H - filledH

  const wavePath = `
    M 0 ${emptyH}
    L 0 ${H - 10}
    Q 25 ${H + 6} 50 ${H - 10}
    Q 75 ${H - 26} 100 ${H - 10}
    L 100 ${emptyH}
    Z
  `

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 160, display: "block" }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorTop} stopOpacity={1} />
              <stop offset="100%" stopColor={colorBottom} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <path d={wavePath} fill={`url(#${gradientId})`} />
        </svg>
      </div>

      <div className="text-center mt-2">
        <span className="block text-2xl font-bold" style={{ color: colorTop }}>
          {formatNum(value)}
        </span>
        <span className="block text-xs mt-0.5" style={{ color: "#636466" }}>
          {label}
        </span>
      </div>
    </div>
  )
}

export default function IcpFunnelChart({ funnel }: Props) {
  const { visita, checkout, finalizado } = funnel
  const maxVal = Math.max(visita, 1)

  const conversionRate =
    visita > 0 ? ((finalizado / visita) * 100).toFixed(1) : "0.0"

  // All blues — darkest for Visita (top of funnel), lighter towards Finalizado
  const steps: Step[] = [
    {
      label: "Visita",
      value: visita,
      gradientId: "funnel-grad-0",
      colorTop: "#003672",    // GB dark navy
      colorBottom: "#93C5FD",
    },
    {
      label: "Checkout",
      value: checkout,
      gradientId: "funnel-grad-1",
      colorTop: "#004B8D",    // GB blue
      colorBottom: "#BAE6FD",
    },
    {
      label: "Finalizado",
      value: finalizado,
      gradientId: "funnel-grad-2",
      colorTop: "#0EA5E9",    // sky blue
      colorBottom: "#E0F2FE",
    },
  ]

  return (
    <div
      className="rounded-3xl p-6 h-full"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: "#636466" }}>
          Funil ICP
        </p>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: "#004B8D" }}>
            {conversionRate}%
          </span>
          <p className="text-xs" style={{ color: "#A7A9AC" }}>
            Conversion rate
          </p>
        </div>
      </div>

      <div className="flex gap-1">
        {steps.map((step) => (
          <WaveColumn
            key={step.label}
            heightPct={maxVal > 0 ? (step.value / maxVal) * 100 : 0}
            gradientId={step.gradientId}
            colorTop={step.colorTop}
            colorBottom={step.colorBottom}
            label={step.label}
            value={step.value}
          />
        ))}
      </div>
    </div>
  )
}
