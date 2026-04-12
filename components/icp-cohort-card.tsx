"use client"

type CohortItem = {
  year: number
  total: number
  newUsers: number
  returning: number
  repurchaseRate: number
  growth?: number
}

type Props = {
  data: CohortItem[]
}

export default function IcpCohortCard({ data }: Props) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl bg-white p-6 shadow-sm">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700">
          Instructor Certification Cohort
        </h2>
        <p className="text-xs text-gray-500">
          ICP / PCI yearly performance
        </p>
      </div>

      {/* 🔥 SCROLL CONTAINER CORRETO */}
      <div className="w-full overflow-x-auto">

        {/* 🔥 inline-flex NÃO quebra layout */}
        <div className="inline-flex gap-6">

          {data.map((item, index) => (
            <div key={item.year} className="flex items-center gap-6">

              {/* CARD */}
              <div className="w-[180px] flex-shrink-0 rounded-xl bg-gray-50 p-4 border">

                <div className="text-lg font-semibold mb-2">
                  {item.year}
                </div>

                <div className="text-sm space-y-1">

                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{item.total}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>New</span>
                    <span>{item.newUsers}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Returning</span>
                    <span>{item.returning}</span>
                  </div>

                </div>
              </div>

              {/* CONNECTOR */}
              {index < data.length - 1 && (
                <div className="flex flex-col items-center gap-2 flex-shrink-0">

                  <div className="text-xs border px-2 py-1 rounded">
                    {item.repurchaseRate.toFixed(1)}%
                  </div>

                  <div className="w-6 h-[2px] bg-gray-300" />
                </div>
              )}

            </div>
          ))}

        </div>
      </div>
    </div>
  )
}