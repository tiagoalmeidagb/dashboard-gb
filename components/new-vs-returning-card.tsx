"use client"

type Props = {
  newUsers: number
  returningUsers: number
  users: number
}

export default function NewVsReturningCard({ newUsers, returningUsers, users }: Props) {
  const total = Math.max(users, 1)
  const newPct = Math.round((newUsers / total) * 100)
  const retPct = 100 - newPct

  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col gap-4"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      {/* ROW 1 — big % + label */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold leading-none" style={{ color: "#141414" }}>
          {newPct}%
        </span>
        <span className="text-sm font-medium leading-tight" style={{ color: "#141414" }}>
          New users
        </span>
      </div>

      {/* ROW 2 — bar with 50% marker */}
      <div>
        {/* 50% marker above bar */}
        <div className="relative h-4 mb-1">
          <span
            className="absolute text-xs"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              color: "#A7A9AC",
              top: 0,
            }}
          >
            50%
          </span>
        </div>

        {/* Bar */}
        <div
          className="w-full flex rounded-full overflow-hidden"
          style={{ height: 14 }}
        >
          <div
            style={{
              width: `${newPct}%`,
              background: "linear-gradient(90deg, #004B8D 0%, #1D6FBB 100%)",
              borderRadius: "9999px 0 0 9999px",
            }}
          />
          <div
            style={{
              flex: 1,
              background: "#B9CFE6",
              borderRadius: "0 9999px 9999px 0",
            }}
          />
        </div>

        {/* Percentages below bar */}
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: "#636466" }}>{newPct}%</span>
          <span className="text-xs" style={{ color: "#636466" }}>{retPct}%</span>
        </div>
      </div>

      {/* ROW 3 — big counts */}
      <div className="flex justify-between items-start">
        {/* New */}
        <div>
          <p className="text-3xl font-bold leading-none" style={{ color: "#141414" }}>
            {newUsers.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <span style={{ color: "#004B8D", fontSize: 10 }}>●</span>
            <span className="text-xs font-medium" style={{ color: "#004B8D" }}>New</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#A7A9AC" }}>{newPct}%</p>
        </div>

        {/* Returning */}
        <div className="text-right">
          <p className="text-3xl font-bold leading-none" style={{ color: "#141414" }}>
            {returningUsers.toLocaleString()}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <span style={{ color: "#B9CFE6", fontSize: 10 }}>●</span>
            <span className="text-xs font-medium" style={{ color: "#B9CFE6" }}>Returning</span>
          </div>
          <p className="text-xs mt-0.5 text-right" style={{ color: "#A7A9AC" }}>{retPct}%</p>
        </div>
      </div>
    </div>
  )
}
