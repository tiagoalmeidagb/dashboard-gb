"use client"

import { useMemo } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { flagEmoji, ISO_A3_TO_A2 } from "@/lib/country-codes"

// This GeoJSON has ISO alpha-3 codes as feature `id` — reliable country matching
const GEO_URL =
  "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson"

type CountryData = {
  country: string
  code: string   // ISO alpha-2, e.g. "BR"
  sessions: number
}

type Props = {
  countries: CountryData[]
}

function formatSessions(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function WorldMapWidget({ countries }: Props) {
  const maxSessions = countries[0]?.sessions ?? 1

  // Build lookup by ISO alpha-2
  const sessionsByA2 = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of countries) {
      map[c.code] = c.sessions
    }
    return map
  }, [countries])

  // Red color scale: very light pink → Gracie Barra red #E2211C
  const colorScale = scaleLinear<string>()
    .domain([0, maxSessions])
    .range(["#FECACA", "#E2211C"])
    .clamp(true)

  return (
    <div
      className="rounded-3xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid #E0E8F4" }}
    >
      <p className="text-sm font-medium mb-4" style={{ color: "#636466" }}>
        Sessions por País
      </p>

      <div className="flex gap-6 items-start">

        {/* MAP */}
        <div className="flex-1 min-w-0">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 105, center: [10, 20] }}
            style={{ width: "100%", height: "auto" }}
            height={200}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // geo.id is ISO alpha-3 ("BRA", "USA", etc.)
                  const a3 = String(geo.id ?? "")
                  const a2 = ISO_A3_TO_A2[a3]
                  const sessions = a2 ? (sessionsByA2[a2] ?? 0) : 0
                  const fill = sessions > 0 ? colorScale(sessions) : "#F0F4FA"

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#FFFFFF"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: sessions > 0 ? "#B91C1C" : "#E0E8F4",
                          outline: "none",
                          cursor: sessions > 0 ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* COUNTRY LIST */}
        <div className="flex-shrink-0 w-52 space-y-2">
          {countries.map((c) => {
            const barPct = maxSessions > 0 ? (c.sessions / maxSessions) * 100 : 0
            return (
              <div key={c.code} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                  <span className="text-base leading-none">{flagEmoji(c.code)}</span>
                  <span className="text-xs font-semibold" style={{ color: "#141414" }}>
                    {c.code}
                  </span>
                </div>
                <span className="text-xs w-10 text-right flex-shrink-0" style={{ color: "#636466" }}>
                  {formatSessions(c.sessions)}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F0F4FA" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${barPct}%`, background: "#E2211C" }}
                  />
                </div>
              </div>
            )
          })}
          {countries.length === 0 && (
            <p className="text-xs" style={{ color: "#C2D0E8" }}>Sem dados</p>
          )}
        </div>

      </div>
    </div>
  )
}
