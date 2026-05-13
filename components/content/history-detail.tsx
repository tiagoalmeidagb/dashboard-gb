"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { X } from "lucide-react"
import type { GeneratedContent, ContentFormat } from "@/types/content"

const FORMAT_LABELS: Record<ContentFormat, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  carousel: "Carrossel",
}

const PRODUCT_LABELS: Record<string, string> = {
  instructor: "Instructor Certification",
  integration: "Integration",
  "non-icp": "Non-ICP",
}

type Props = {
  item: GeneratedContent
  onClose: () => void
}

export function HistoryDetail({ item, onClose }: Props) {
  const [langToggle, setLangToggle] = useState<Record<ContentFormat, "pt" | "en">>({
    email: "pt",
    whatsapp: "pt",
    carousel: "pt",
  })

  const activeFormats = (["email", "whatsapp", "carousel"] as ContentFormat[]).filter(
    f => item.formats[f]
  )

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{item.themeSnapshot.title}</h2>
          {item.themeSnapshot.description && (
            <p className="text-sm text-gray-500 mt-0.5">{item.themeSnapshot.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{PRODUCT_LABELS[item.themeSnapshot.product] ?? item.themeSnapshot.product}</span>
            <span>·</span>
            <span>{format(new Date(item.createdAt), "d 'de' MMMM yyyy", { locale: ptBR })}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {activeFormats.map(fmt => {
        const block = item.formats[fmt]
        if (!block) return null
        const lang = langToggle[fmt]
        const hasEN = !!block.en?.translated
        const displayText =
          lang === "en" && hasEN
            ? block.en!.translated
            : block.pt.edited ?? block.pt.generated

        return (
          <div key={fmt} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{FORMAT_LABELS[fmt]}</p>
              {hasEN && (
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button
                    onClick={() => setLangToggle(t => ({ ...t, [fmt]: "pt" }))}
                    className={`px-2.5 py-1 transition-colors ${
                      lang === "pt" ? "bg-gray-100 font-medium text-gray-800" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    PT
                  </button>
                  <button
                    onClick={() => setLangToggle(t => ({ ...t, [fmt]: "en" }))}
                    className={`px-2.5 py-1 transition-colors ${
                      lang === "en" ? "bg-gray-100 font-medium text-gray-800" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    EN
                  </button>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {displayText}
            </div>
          </div>
        )
      })}
    </div>
  )
}
