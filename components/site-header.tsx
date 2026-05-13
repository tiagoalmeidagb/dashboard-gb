"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => setMounted(true), [])

  return (
    <header
      className="flex shrink-0 items-center justify-end px-6 border-b border-[#E0E8F4] bg-white"
      style={{ height: "56px", minHeight: "56px" }}
    >
      <div className="flex items-center gap-3">

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "#F0F4FA", color: "#636466" }}
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark"
            ? <Sun  className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none"
          style={{ background: "#004B8D" }}
          title="User"
        >
          GB
        </div>

      </div>
    </header>
  )
}
