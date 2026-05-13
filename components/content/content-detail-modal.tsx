"use client"

import { useState } from "react"
import { X, Copy, Check } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { GeneratedContent, ContentFormat } from "@/types/content"

const FORMAT_LABELS: Record<ContentFormat, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  carousel: "Carrossel",
}

const FORMAT_BADGES = {
  email:    { bg: "#F3F4F6", text: "#374151" },
  whatsapp: { bg: "#DCFCE7", text: "#166534" },
  carousel: { bg: "#F3E8FF", text: "#6B21A8" },
}

const PRODUCT_LABELS: Record<string, string> = {
  instructor: "ICP",
  integration: "Integração",
  "non-icp": "Non-ICP",
}

const PRODUCT_COLORS: Record<string, { bg: string; text: string }> = {
  instructor: { bg: "#EFF6FF", text: "#1D4ED8" },
  integration: { bg: "#F3F4F6", text: "#374151" },
  "non-icp": { bg: "#FFFBEB", text: "#B45309" },
}

function parseSlides(text: string): { title: string; body: string; index: number }[] {
  const regex = /Slide\s+(\d+)[^:]*:\s*([\s\S]*?)(?=Slide\s+\d+|$)/gi
  const matches = [...text.matchAll(regex)]
  if (matches.length < 2) return []
  return matches.map(m => {
    const lines = m[2].trim().split("\n").filter(Boolean)
    return { index: parseInt(m[1]), title: lines[0] ?? "", body: lines.slice(1).join(" ") }
  })
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  )
}

type Props = {
  item: GeneratedContent
  onClose: () => void
}

export function ContentDetailModal({ item, onClose }: Props) {
  const [lang, setLang] = useState<"pt" | "en">("pt")

  const prod = item.themeSnapshot.product
  const prodStyle = PRODUCT_COLORS[prod] ?? { bg: "#F3F4F6", text: "#374151" }
  const prodLabel = PRODUCT_LABELS[prod] ?? prod

  const activeFormats = (["email", "whatsapp", "carousel"] as ContentFormat[]).filter(
    f => item.formats[f]
  )

  const hasAnyEN = activeFormats.some(f => item.formats[f]?.en?.translated)

  function getBlockText(format: ContentFormat): string {
    const block = item.formats[format]
    if (!block) return ""
    if (lang === "en" && block.en?.translated) return block.en.translated
    return block.pt.edited ?? block.pt.generated
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        style={{ border: "1px solid #E5E7EB" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg font-bold text-gray-900">{item.themeSnapshot.title}</h2>
              {item.themeSnapshot.description && (
                <p className="text-sm text-gray-500 mt-0.5">{item.themeSnapshot.description}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: prodStyle.bg, color: prodStyle.text }}
            >
              {prodLabel}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">
              Criado em {format(new Date(item.createdAt), "d/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
            <div className="flex-1" />
            {activeFormats.map(f => {
              const s = FORMAT_BADGES[f]
              return (
                <span key={f} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: s.bg, color: s.text }}>
                  {FORMAT_LABELS[f]}
                </span>
              )
            })}
          </div>

          {/* PT/EN toggle */}
          {hasAnyEN && (
            <div className="flex gap-6 mt-4 border-b border-gray-100 -mb-4">
              {(["pt", "en"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="pb-3 text-sm font-semibold transition-colors relative"
                  style={{ color: lang === l ? "#E2211C" : "#9CA3AF" }}
                >
                  {l.toUpperCase()}
                  {lang === l && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#E2211C" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeFormats.map(fmt => {
            const text = getBlockText(fmt)
            const slides = fmt === "carousel" ? parseSlides(text) : []
            const isCarousel = fmt === "carousel" && slides.length > 0
            const [slideIdx, setSlideIdx] = useState(0)

            return (
              <div key={fmt} className="rounded-xl border border-gray-200 overflow-hidden">
                {/* Section header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">
                    {FORMAT_LABELS[fmt]}
                    {isCarousel && (
                      <span className="text-xs font-normal text-gray-500 ml-1.5">({slides.length} slides)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    {isCarousel && (
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
                        Ver em grade
                      </button>
                    )}
                    <CopyButton text={text} />
                  </div>
                </div>

                {/* Section body */}
                <div className="px-4 py-3">
                  {isCarousel ? (
                    <div>
                      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                        {slides.map((slide, i) => (
                          <div
                            key={i}
                            onClick={() => setSlideIdx(i)}
                            className="flex-shrink-0 w-36 p-3 rounded-xl border cursor-pointer transition-colors snap-start"
                            style={{
                              border: slideIdx === i ? "1.5px solid #E2211C" : "1px solid #E5E7EB",
                              background: "#FAFAFA",
                            }}
                          >
                            <p className="text-xs text-gray-400 mb-1">Slide {slide.index}</p>
                            <p className="text-xs font-bold text-gray-800 line-clamp-2">{slide.title}</p>
                            {slide.body && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-3">{slide.body}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-1.5 mt-3">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSlideIdx(i)}
                            className="w-2 h-2 rounded-full transition-colors"
                            style={{ background: i === slideIdx ? "#E2211C" : "#E5E7EB" }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-sm px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors font-medium"
          >
            Fechar
          </button>
          <button
            className="text-sm text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            style={{ background: "#E2211C" }}
          >
            Editar e reutilizar
          </button>
        </div>
      </div>
    </div>
  )
}
