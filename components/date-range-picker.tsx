"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react" // ✅ ÍCONE REAL

export function DateRangePicker({
  value,
  onChange,
}: {
  value: { from: Date; to: Date }
  onChange: (range: { from: Date; to: Date }) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // ✅ FECHAR AO CLICAR FORA
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
      >
        <CalendarIcon className="h-4 w-4 text-gray-500" /> {/* ✅ FIX */}
        {format(value.from, "MMM d, yyyy")} -{" "}
        {format(value.to, "MMM d, yyyy")}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 rounded-xl border bg-white p-4 shadow-lg z-50">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range: any) => {
              if (range?.from && range?.to) {
                onChange(range)
                setOpen(false)
              }
            }}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  )
}