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
    <div className="w-full max-w-full overflow-hidden rounded-2xl bg-white p-6" style={{ border: "1px solid #E0E8F4" }}>

      <div className="mb-6">
        <h2 className="text-sm font-medium" style={{ color: "#636466" }}>
          Instructor Certification Cohort
        </h2>
        <p className="text-xs" style={{ color: "#A7A9AC" }}>
          ICP / PCI yearly performance
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="inline-flex gap-6">
          {data.map((item, index) => (
            <div key={item.year} className="flex items-center gap-6">

              <div
                className="w-[180px] flex-shrink-0 rounded-xl p-4"
                style={{ background: "#F0F4FA", border: "1px solid #E0E8F4" }}
              >
                <div className="text-lg font-semibold mb-3" style={{ color: "#141414" }}>
                  {item.year}
                </div>

                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: "#A7A9AC" }}>Total</span>
                    <span className="font-medium" style={{ color: "#141414" }}>{item.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#A7A9AC" }}>New</span>
                    <span className="font-medium" style={{ color: "#004B8D" }}>{item.newUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#A7A9AC" }}>Returning</span>
                    <span className="font-medium" style={{ color: "#E2211C" }}>{item.returning}</span>
                  </div>
                </div>
              </div>

              {index < data.length - 1 && (
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      border: "1px solid #E0E8F4",
                      color: "#5A6B85",
                      background: "#F0F4FA",
                    }}
                  >
                    {item.repurchaseRate.toFixed(1)}%
                  </div>
                  <div className="w-6 h-[2px]" style={{ background: "#C2D0E8" }} />
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
