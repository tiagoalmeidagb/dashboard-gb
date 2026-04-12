"use client"

import { useState, useRef, useEffect } from "react"
import {
  startOfToday,
  subDays,
  startOfMonth,
  startOfYear,
  startOfQuarter,
  subMonths,
  subYears,
} from "date-fns"

type Range = {
  from: Date
  to: Date
}

export function DatePresetDropdown({
  onChange,
}: {
  onChange: (range: Range) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [label, setLabel] = useState("This month")

  const ref = useRef<HTMLDivElement>(null)
  const today = startOfToday()

  // fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setHover(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function apply(label: string, range: Range) {
    setLabel(label)
    onChange(range)
    setOpen(false)
    setHover(null)
  }

  return (
    <div ref={ref} className="relative">

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
      >
        {label}
        <span className="text-gray-400">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg text-sm z-50">

          {/* TODAY */}
          <button
            onClick={() =>
              apply("Today", {
                from: today,
                to: today,
              })
            }
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Today
          </button>

          {/* YESTERDAY */}
          <button
            onClick={() =>
              apply("Yesterday", {
                from: subDays(today, 1),
                to: subDays(today, 1),
              })
            }
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Yesterday
          </button>

          {/* THIS */}
          <div
            onMouseEnter={() => setHover("this")}
            className="flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            This <span>‹</span>
          </div>

          {/* LAST */}
          <div
            onMouseEnter={() => setHover("last")}
            className="flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Last <span>‹</span>
          </div>

          {/* SUBMENU THIS */}
          {hover === "this" && (
            <div className="absolute right-full top-0 mr-1 w-56 rounded-xl border bg-white shadow-lg">

              <button
                onClick={() =>
                  apply("This week", {
                    from: subDays(today, today.getDay()),
                    to: today,
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                This week
              </button>

              <button
                onClick={() =>
                  apply("This month", {
                    from: startOfMonth(today),
                    to: today,
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                This month
              </button>

              <button
                onClick={() =>
                  apply("This quarter", {
                    from: startOfQuarter(today),
                    to: today,
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                This quarter
              </button>

              <button
                onClick={() =>
                  apply("This year", {
                    from: startOfYear(today),
                    to: today,
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                This year
              </button>
            </div>
          )}

          {/* SUBMENU LAST */}
          {hover === "last" && (
            <div className="absolute right-full top-0 mr-1 w-56 rounded-xl border bg-white shadow-lg">

              <button
                onClick={() =>
                  apply("Last 7 days", {
                    from: subDays(today, 6),
                    to: today,
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Last 7 days
              </button>

              <button
                onClick={() =>
                  apply("Last 14 days", {
                    from: subDays(today, 13),
                    to: today,
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Last 14 days
              </button>

              <button
                onClick={() =>
                  apply("Last month", {
                    from: startOfMonth(subMonths(today, 1)),
                    to: startOfMonth(today),
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Last month
              </button>

              <button
                onClick={() =>
                  apply("Last year", {
                    from: startOfYear(subYears(today, 1)),
                    to: startOfYear(today),
                  })
                }
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Last year
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}