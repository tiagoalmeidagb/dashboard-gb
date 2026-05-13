"use client"

import { useState } from "react"
import { ArrowLeft, GripVertical, Pencil, Trash2, Info, Mail, MessageCircle, GalleryHorizontal } from "lucide-react"
import type { ContentTheme, ContentProduct } from "@/types/content"

const PRODUCT_OPTIONS: { value: ContentProduct; label: string }[] = [
  { value: "instructor", label: "Instructor Certification (ICP)" },
  { value: "integration", label: "Integration Programs" },
  { value: "non-icp", label: "Non-ICP Products" },
]

const PRODUCT_COLORS: Record<ContentProduct, { bg: string; text: string; label: string }> = {
  instructor: { bg: "#EFF6FF", text: "#1D4ED8", label: "ICP" },
  integration: { bg: "#F3F4F6", text: "#374151", label: "Integration" },
  "non-icp": { bg: "#FFFBEB", text: "#B45309", label: "Non-ICP" },
}

const FORMAT_OPTIONS = [
  {
    key: "email" as const,
    icon: <Mail className="w-6 h-6 text-gray-600" />,
    label: "Email",
    desc: "Email marketing content.",
  },
  {
    key: "whatsapp" as const,
    icon: <MessageCircle className="w-6 h-6 text-green-600" />,
    label: "WhatsApp",
    desc: "WhatsApp-optimized message.",
  },
  {
    key: "carousel" as const,
    icon: <GalleryHorizontal className="w-6 h-6 text-purple-600" />,
    label: "Carousel",
    desc: "Slides for social media.",
  },
]

const EMPTY = {
  title: "",
  angle: "",
  product: "" as ContentProduct | "",
  formats: { email: false, whatsapp: false, carousel: false },
  description: "",
}

type Props = {
  onBack: () => void
  onSave: (theme: Omit<ContentTheme, "id" | "order" | "createdAt">) => Promise<void>
  editTheme?: ContentTheme
}

export function CreateThemeForm({ onBack, onSave, editTheme }: Props) {
  const [form, setForm] = useState(
    editTheme
      ? {
          title: editTheme.title,
          angle: editTheme.angle,
          product: editTheme.product as ContentProduct | "",
          formats: { ...editTheme.formats },
          description: editTheme.description ?? "",
        }
      : EMPTY
  )
  const [saving, setSaving] = useState(false)

  const canSave =
    form.title.trim().length > 0 &&
    form.angle.trim().length > 0 &&
    form.product !== "" &&
    (form.formats.email || form.formats.whatsapp || form.formats.carousel)

  const previewProd = form.product ? PRODUCT_COLORS[form.product] : null

  async function handleSave() {
    if (!canSave || !form.product) return
    setSaving(true)
    try {
      if (editTheme) {
        await fetch(`/api/content/themes/${editTheme.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            angle: form.angle,
            product: form.product,
            formats: form.formats,
            description: form.description || undefined,
          }),
        })
      } else {
        await onSave({
          title: form.title,
          angle: form.angle,
          product: form.product,
          formats: form.formats,
          description: form.description || undefined,
        })
      }
      onBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{editTheme ? "Edit theme" : "New theme"}</h1>
          <p className="text-xs text-gray-500">
            {editTheme ? "Update the theme information." : "Create a new theme to add to your production queue."}
          </p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* LEFT — Form */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* 1. Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">1. Theme name</p>
                <p className="text-xs text-gray-500">Give this theme a clear, descriptive name.</p>
              </div>
              <span className="text-xs text-gray-400">{form.title.length}/80</span>
            </div>
            <input
              maxLength={80}
              placeholder="Ex: Reduce CAC 30% with automation"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 transition-colors"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* 2. Angle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">2. Angle / Approach</p>
                <p className="text-xs text-gray-500">What&apos;s the main perspective or approach for this theme?</p>
              </div>
              <span className="text-xs text-gray-400">{form.angle.length}/200</span>
            </div>
            <textarea
              maxLength={200}
              rows={3}
              placeholder="Ex: Practical strategies to optimize your acquisition cost..."
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 transition-colors resize-none"
              value={form.angle}
              onChange={e => setForm(f => ({ ...f, angle: e.target.value }))}
            />
          </div>

          {/* 3. Product */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">3. Product</p>
            <p className="text-xs text-gray-500 mb-2">Select the product related to this theme.</p>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 bg-white appearance-none transition-colors"
              value={form.product}
              onChange={e => setForm(f => ({ ...f, product: e.target.value as ContentProduct }))}
            >
              <option value="">Select a product</option>
              {PRODUCT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* 4. Formats */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">4. Content formats</p>
            <p className="text-xs text-gray-500 mb-3">Choose the formats you want to generate for this theme.</p>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map(opt => {
                const checked = form.formats[opt.key]
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setForm(f => ({ ...f, formats: { ...f.formats, [opt.key]: !f.formats[opt.key] } }))
                    }
                    className="relative text-left p-4 rounded-xl border transition-all"
                    style={{
                      border: checked ? "1.5px solid #E2211C" : "1px solid #E5E7EB",
                      background: "#FFFFFF",
                    }}
                  >
                    <div className="absolute top-3 right-3">
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          background: checked ? "#E2211C" : "#FFFFFF",
                          borderColor: checked ? "#E2211C" : "#D1D5DB",
                        }}
                      >
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="mb-2">{opt.icon}</div>
                    <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  5. Notes <span className="text-xs font-normal text-gray-400">(optional)</span>
                </p>
                <p className="text-xs text-gray-500">Additional context to guide content generation.</p>
              </div>
              <span className="text-xs text-gray-400">{(form.description || "").length}/300</span>
            </div>
            <textarea
              maxLength={300}
              rows={3}
              placeholder="Ex: Target audience, tone of voice, references, links..."
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 transition-colors resize-none"
              value={form.description || ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Theme preview</p>
            <p className="text-xs text-gray-500">See how your theme will appear in the queue.</p>
          </div>

          {/* Preview card */}
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-gray-300">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {form.title || "Theme title"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.angle || "Theme angle will appear here..."}
                </p>
                <div className="mt-2">
                  {previewProd ? (
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: previewProd.bg, color: previewProd.text }}
                    >
                      {previewProd.label}
                    </span>
                  ) : (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                      Product
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {form.formats.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </span>
                  )}
                  {form.formats.whatsapp && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </span>
                  )}
                  {form.formats.carousel && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <GalleryHorizontal className="w-3.5 h-3.5" /> Carousel
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Pencil className="w-3.5 h-3.5 text-gray-300" />
                <Trash2 className="w-3.5 h-3.5 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              The theme will be added to the end of your queue.<br />
              You can reorder themes by dragging them.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex items-center gap-2 text-sm text-white px-5 py-2 rounded-lg font-medium disabled:opacity-40 transition-colors"
          style={{ background: "#E2211C" }}
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <GalleryHorizontal className="w-4 h-4" />
          )}
          Save theme
        </button>
      </div>
    </div>
  )
}
