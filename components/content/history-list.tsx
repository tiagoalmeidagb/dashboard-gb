"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { GeneratedContent } from "@/types/content"

const PRODUCT_LABELS: Record<string, string> = {
  instructor: "ICP",
  integration: "Integração",
  "non-icp": "Non-ICP",
}

const PRODUCT_COLORS: Record<string, string> = {
  instructor: "#0046AD",
  integration: "#1A1A1A",
  "non-icp": "#C8A800",
}

function formatIcons(formats: GeneratedContent["formats"]) {
  return [
    formats.email && "✉ Email",
    formats.whatsapp && "💬 WhatsApp",
    formats.carousel && "🖼 Carrossel",
  ]
    .filter(Boolean)
    .join("  ·  ")
}

type Props = {
  items: GeneratedContent[]
  selectedId: string | null
  onSelect: (item: GeneratedContent) => void
}

export function HistoryList({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-20">
        <p className="text-sm">Nenhum conteúdo gerado ainda.</p>
        <p className="text-xs mt-1">Use a aba Produção para gerar o primeiro.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(item => {
        const isSelected = selectedId === item.id
        const product = item.themeSnapshot.product
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            style={{ borderLeft: isSelected ? "3px solid #E2211C" : "3px solid transparent" }}
            className={`w-full text-left p-4 rounded-xl border border-gray-200 transition-colors ${
              isSelected ? "bg-red-50 border-red-200" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-800">{item.themeSnapshot.title}</p>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
                style={{
                  color: PRODUCT_COLORS[product] ?? "#636466",
                  background: (PRODUCT_COLORS[product] ?? "#636466") + "15",
                }}
              >
                {PRODUCT_LABELS[product] ?? product}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatIcons(item.formats)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {format(new Date(item.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
          </button>
        )
      })}
    </div>
  )
}
