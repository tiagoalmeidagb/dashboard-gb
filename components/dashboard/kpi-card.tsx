type KpiCardProps = {
  title: string
  value: number
  growth: number
}

export function KpiCard({ title, value, growth }: KpiCardProps) {
  const isPositive = growth >= 0

  return (
    <div className="rounded-3xl border border-gray-200 bg-[#f8fafc] p-6">
      <p className="text-sm text-gray-600">{title}</p>

      <h2 className="mt-3 text-4xl font-semibold tracking-tight">
        ${value.toLocaleString()}
      </h2>

      <p
        className={`mt-4 text-sm ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        {isPositive ? "↑" : "↓"} {Math.abs(growth).toFixed(0)}%
      </p>
    </div>
  )
}