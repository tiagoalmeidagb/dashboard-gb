"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import type { GeneratedContent } from "@/types/content"

const PAGE_SIZE = 5

const PRODUCT_LABELS: Record<string, string> = {
  instructor: "ICP",
  integration: "Integration",
  "non-icp": "Non-ICP",
}

const PRODUCT_COLORS: Record<string, { bg: string; text: string }> = {
  instructor: { bg: "#EFF6FF", text: "#1D4ED8" },
  integration: { bg: "#F3F4F6", text: "#374151" },
  "non-icp": { bg: "#FFFBEB", text: "#B45309" },
}

const FORMAT_BADGES = {
  email:    { label: "Email",    bg: "#F3F4F6", text: "#374151" },
  whatsapp: { label: "WhatsApp", bg: "#DCFCE7", text: "#166534" },
  carousel: { label: "Carousel", bg: "#F3E8FF", text: "#6B21A8" },
}

function FormatBadge({ type }: { type: "email" | "whatsapp" | "carousel" }) {
  const s = FORMAT_BADGES[type]
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-md font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

type Props = {
  items: GeneratedContent[]
  onSelect: (item: GeneratedContent) => void
}

export function HistoryTab({ items, onSelect }: Props) {
  const [search, setSearch] = useState("")
  const [filterProduct, setFilterProduct] = useState<string>("all")
  const [filterFormat, setFilterFormat] = useState<string>("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch =
        !search ||
        item.themeSnapshot.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.themeSnapshot.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        item.themeSnapshot.product.toLowerCase().includes(search.toLowerCase())

      const matchProduct =
        filterProduct === "all" || item.themeSnapshot.product === filterProduct

      const matchFormat =
        filterFormat === "all" ||
        (filterFormat === "email" && item.formats.email) ||
        (filterFormat === "whatsapp" && item.formats.whatsapp) ||
        (filterFormat === "carousel" && item.formats.carousel)

      return matchSearch && matchProduct && matchFormat
    })
  }, [items, search, filterProduct, filterFormat])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function clearFilters() {
    setSearch("")
    setFilterProduct("all")
    setFilterFormat("all")
    setPage(1)
  }

  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }

  const SelectControl = ({
    value,
    onChange,
    label,
    children,
  }: {
    value: string
    onChange: (v: string) => void
    label: string
    children: React.ReactNode
  }) => (
    <div className="relative">
      <select
        className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
        value={value}
        onChange={e => { onChange(e.target.value); setPage(1) }}
      >
        <option value="all">{label}</option>
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Content history</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Browse and reuse content you&apos;ve already generated.</p>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-xl border border-gray-200 bg-white mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gray-400 transition-colors"
            placeholder="Search by theme or product..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <SelectControl value={filterProduct} onChange={setFilterProduct} label="Product">
          <option value="instructor">ICP</option>
          <option value="integration">Integration</option>
          <option value="non-icp">Non-ICP</option>
        </SelectControl>

        <SelectControl value={filterFormat} onChange={setFilterFormat} label="Formats">
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="carousel">Carousel</option>
        </SelectControl>

        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear filters
        </button>

        <div className="flex-1" />

        <div className="relative">
          <select className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none text-gray-700 cursor-pointer">
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No content found.</p>
          </div>
        ) : (
          paginated.map((item, i) => {
            const prod = item.themeSnapshot.product
            const prodStyle = PRODUCT_COLORS[prod] ?? { bg: "#F3F4F6", text: "#374151" }
            const prodLabel = PRODUCT_LABELS[prod] ?? prod

            return (
              <div key={item.id}>
                {i > 0 && <div className="border-t border-gray-100" />}
                <button
                  onClick={() => onSelect(item)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.themeSnapshot.title}</p>
                    {item.themeSnapshot.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.themeSnapshot.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: prodStyle.bg, color: prodStyle.text }}
                      >
                        {prodLabel}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.formats.email && <FormatBadge type="email" />}
                    {item.formats.whatsapp && <FormatBadge type="whatsapp" />}
                    {item.formats.carousel && <FormatBadge type="carousel" />}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number
              if (totalPages <= 5) {
                p = i + 1
              } else if (page <= 3) {
                p = i + 1
              } else if (page >= totalPages - 2) {
                p = totalPages - 4 + i
              } else {
                p = page - 2 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors"
                  style={
                    p === page
                      ? { border: "1px solid #E2211C", color: "#E2211C", background: "#FFF5F5" }
                      : { border: "1px solid #E5E7EB", color: "#374151" }
                  }
                >
                  {p}
                </button>
              )
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <span className="text-xs text-gray-400 px-1">...</span>
            )}
            {totalPages > 5 && page < totalPages - 2 && (
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-xs text-gray-600 transition-colors"
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
