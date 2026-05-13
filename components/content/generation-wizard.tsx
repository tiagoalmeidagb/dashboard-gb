"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Loader2, Languages, Check, Mail, MessageCircle, GalleryHorizontal } from "lucide-react"
import type { ContentTheme, ContentFormat, ContentBlock, GeneratedContent } from "@/types/content"

type Step = 1 | 2 | 3 | 4 | 5

const FORMAT_LABELS: Record<ContentFormat, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  carousel: "Carousel",
}

const FORMAT_ICONS: Record<ContentFormat, React.ReactNode> = {
  email: <Mail className="w-7 h-7 text-gray-500" />,
  whatsapp: <MessageCircle className="w-7 h-7 text-green-600" />,
  carousel: <GalleryHorizontal className="w-7 h-7 text-purple-600" />,
}

const FORMAT_DESCS: Record<ContentFormat, string> = {
  email: "Email marketing content.",
  whatsapp: "WhatsApp-optimized message.",
  carousel: "Slides for social media.",
}

type WizardState = {
  themeId: string
  product: string
  formats: { email: boolean; whatsapp: boolean; carousel: boolean }
  blocks: { email?: ContentBlock; whatsapp?: ContentBlock; carousel?: ContentBlock }
}

type Props = {
  themes: ContentTheme[]
  selectedTheme: ContentTheme | null
  onComplete: (item: Omit<GeneratedContent, "id" | "createdAt">) => Promise<void>
}

async function generateBlock(format: ContentFormat, theme: ContentTheme): Promise<string> {
  const res = await fetch("/api/content/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: format,
      theme: { title: theme.title, description: theme.description, angle: theme.angle, product: theme.product },
    }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.content as string
}

async function translateText(text: string): Promise<string> {
  const res = await fetch("/api/content/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error("Translation failed")
  const data = await res.json()
  return data.translated as string
}

const STEP_LABELS: Record<Step, string> = {
  1: "Selection",
  2: "Email",
  3: "WhatsApp",
  4: "Carousel",
  5: "Final review",
}

function StepIndicator({ current, formats }: { current: Step; formats: WizardState["formats"] }) {
  const steps: Step[] = [1, 2, 3, 4, 5]

  const isRelevant = (s: Step) => {
    if (s === 2 && !formats.email) return false
    if (s === 3 && !formats.whatsapp) return false
    if (s === 4 && !formats.carousel) return false
    return true
  }

  return (
    <div className="flex items-start mb-6">
      {steps.map((s, i) => {
        const past = s < current
        const isCurrent = s === current
        const relevant = isRelevant(s)

        return (
          <div key={s} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors"
                style={{
                  background: isCurrent ? "#4F46E5" : past && relevant ? "#E0E7FF" : "#F3F4F6",
                  color: isCurrent ? "#FFFFFF" : past && relevant ? "#4F46E5" : relevant ? "#9CA3AF" : "#D1D5DB",
                }}
              >
                {past && relevant ? <Check className="w-4 h-4" /> : s}
              </div>
              <span
                className="text-xs mt-1.5 whitespace-nowrap font-medium text-center"
                style={{ color: isCurrent ? "#111827" : relevant ? "#9CA3AF" : "#D1D5DB" }}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mt-4 mx-2 transition-colors"
                style={{ background: s < current ? "#C7D2FE" : "#E5E7EB" }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function BlockEditor({
  format,
  block,
  onChange,
  onTranslate,
  isTranslating,
}: {
  format: ContentFormat
  block: ContentBlock
  onChange: (block: ContentBlock) => void
  onTranslate: () => void
  isTranslating: boolean
}) {
  const displayText = block.pt.edited ?? block.pt.generated

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{FORMAT_LABELS[format]}</h3>
        <div className="flex items-center gap-2">
          {block.en?.translated && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> EN translated
            </span>
          )}
          <button
            onClick={onTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 disabled:opacity-50 transition-colors"
          >
            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
            Translate EN
          </button>
        </div>
      </div>

      <textarea
        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 resize-none leading-relaxed transition-colors"
        rows={12}
        value={displayText}
        onChange={e => onChange({ ...block, pt: { ...block.pt, edited: e.target.value } })}
      />

      {block.en?.translated && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">English version</p>
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {block.en.translated}
          </div>
        </div>
      )}
    </div>
  )
}

export function GenerationWizard({ themes, selectedTheme, onComplete }: Props) {
  const [state, setState] = useState<WizardState>({
    themeId: selectedTheme?.id ?? "",
    product: selectedTheme?.product ?? "instructor",
    formats: selectedTheme?.formats ?? { email: true, whatsapp: true, carousel: true },
    blocks: {},
  })
  const [step, setStep] = useState<Step>(1)
  const [generating, setGenerating] = useState(false)
  const [translating, setTranslating] = useState<ContentFormat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const currentTheme = themes.find(t => t.id === state.themeId) ?? selectedTheme

  // Sync when selectedTheme changes externally
  if (selectedTheme && selectedTheme.id !== state.themeId) {
    setState({
      themeId: selectedTheme.id,
      product: selectedTheme.product,
      formats: { ...selectedTheme.formats },
      blocks: {},
    })
    setStep(1)
    setError(null)
    setDone(false)
  }

  const orderedFormats: ContentFormat[] = ["email", "whatsapp", "carousel"]
  const activeFormats = orderedFormats.filter(f => state.formats[f])

  const stepToFormat: Partial<Record<Step, ContentFormat>> = {
    2: "email",
    3: "whatsapp",
    4: "carousel",
  }

  function getNextStep(from: Step): Step | null {
    for (let s = (from + 1) as Step; s <= 5; s++) {
      const fmt = stepToFormat[s as Step]
      if (!fmt) return s as Step
      if (state.formats[fmt]) return s as Step
    }
    return null
  }

  function getPrevStep(from: Step): Step | null {
    for (let s = (from - 1) as Step; s >= 1; s--) {
      const fmt = stepToFormat[s as Step]
      if (!fmt) return s as Step
      if (state.formats[fmt]) return s as Step
    }
    return null
  }

  async function goNext() {
    if (step === 1) {
      const next = getNextStep(1)
      if (next) setStep(next)
      return
    }

    const nextStep = getNextStep(step)
    if (!nextStep) return

    const nextFmt = stepToFormat[nextStep]
    if (nextFmt && !state.blocks[nextFmt] && currentTheme) {
      setGenerating(true)
      setError(null)
      try {
        const generated = await generateBlock(nextFmt, currentTheme)
        setState(s => ({
          ...s,
          blocks: { ...s.blocks, [nextFmt]: { pt: { generated }, status: "draft" } satisfies ContentBlock },
        }))
      } catch {
        setError(`Failed to generate ${FORMAT_LABELS[nextFmt]}. Check your ANTHROPIC_API_KEY.`)
        setGenerating(false)
        return
      } finally {
        setGenerating(false)
      }
    }
    setStep(nextStep)
  }

  async function handleTranslate(format: ContentFormat) {
    const block = state.blocks[format]
    if (!block) return
    const text = block.pt.edited ?? block.pt.generated
    setTranslating(format)
    try {
      const translated = await translateText(text)
      setState(s => ({
        ...s,
        blocks: { ...s.blocks, [format]: { ...block, en: { translated } } },
      }))
    } catch {
      setError("Translation failed.")
    } finally {
      setTranslating(null)
    }
  }

  function updateBlock(format: ContentFormat, block: ContentBlock) {
    setState(s => ({ ...s, blocks: { ...s.blocks, [format]: block } }))
  }

  async function handleFinalize() {
    if (!currentTheme) return
    setSaving(true)
    try {
      await onComplete({
        themeSnapshot: {
          title: currentTheme.title,
          description: currentTheme.description,
          angle: currentTheme.angle,
          product: currentTheme.product,
        },
        formats: state.blocks,
        status: "completed",
      })
      setDone(true)
    } finally {
      setSaving(false)
    }
  }

  if (!currentTheme) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Content generation</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
          <p className="text-sm">Select a theme from the queue to get started.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">Content saved to history!</p>
          <p className="text-sm text-gray-400 mt-1">Check the History tab to view it.</p>
        </div>
        <button
          onClick={() => {
            setState({ themeId: "", product: "instructor", formats: { email: true, whatsapp: true, carousel: true }, blocks: {} })
            setStep(1)
            setDone(false)
          }}
          className="text-sm text-white px-5 py-2 rounded-lg font-medium mt-2"
          style={{ background: "#E2211C" }}
        >
          New production
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Content generation</h2>

      {/* Single white card: step indicator + content + nav footer */}
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>

        <StepIndicator current={step} formats={state.formats} />

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Step 1 — Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Selection</h3>
              <p className="text-sm text-gray-500 mt-0.5">Choose the theme, product and formats to start generation.</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Theme</p>
              <div className="relative">
                <select
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 bg-white appearance-none"
                  value={state.themeId}
                  onChange={e => {
                    const t = themes.find(x => x.id === e.target.value)
                    if (t) setState(s => ({ ...s, themeId: t.id, product: t.product, formats: { ...t.formats }, blocks: {} }))
                  }}
                >
                  <option value="">Select a theme</option>
                  {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Product</p>
              <div className="relative">
                <select
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 bg-white appearance-none text-gray-500"
                  value={state.product}
                  onChange={e => setState(s => ({ ...s, product: e.target.value }))}
                >
                  <option value="instructor">Instructor Certification (ICP)</option>
                  <option value="integration">Integration Programs</option>
                  <option value="non-icp">Non-ICP Products</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Formats</p>
              <p className="text-xs text-gray-500 mb-3">Select the content formats you want to generate.</p>
              <div className="grid grid-cols-3 gap-3">
                {(["email", "whatsapp", "carousel"] as ContentFormat[]).map(fmt => {
                  const checked = state.formats[fmt]
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setState(s => ({ ...s, formats: { ...s.formats, [fmt]: !s.formats[fmt] } }))}
                      className="text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: checked ? "#4F46E5" : "#FFFFFF", border: checked ? "none" : "1.5px solid #D1D5DB" }}
                        >
                          {checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {FORMAT_ICONS[fmt]}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{FORMAT_LABELS[fmt]}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{FORMAT_DESCS[fmt]}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Steps 2-4 — Block editors */}
        {([2, 3, 4] as Step[]).map(s => {
          const fmt = stepToFormat[s]!
          const block = state.blocks[fmt]
          if (step !== s || !fmt) return null
          if (!block) return (
            <div key={s} className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Generating {FORMAT_LABELS[fmt]}...
            </div>
          )
          return (
            <BlockEditor
              key={s}
              format={fmt}
              block={block}
              onChange={b => updateBlock(fmt, b)}
              onTranslate={() => handleTranslate(fmt)}
              isTranslating={translating === fmt}
            />
          )
        })}

        {/* Step 5 — Final review */}
        {step === 5 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-gray-900">Final review</h3>
              <p className="text-sm text-gray-500 mt-0.5">Review and edit the generated content before finishing.</p>
            </div>
            {activeFormats.map(fmt => {
              const block = state.blocks[fmt]
              if (!block) return null
              return (
                <BlockEditor
                  key={fmt}
                  format={fmt}
                  block={block}
                  onChange={b => updateBlock(fmt, b)}
                  onTranslate={() => handleTranslate(fmt)}
                  isTranslating={translating === fmt}
                />
              )
            })}
          </div>
        )}

        {/* Navigation footer */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(getPrevStep(step) ?? 1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          {step === 5 ? (
            <button
              onClick={handleFinalize}
              disabled={saving}
              className="flex items-center gap-2 text-sm text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              style={{ background: "#E2211C" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Finish
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={generating || (step === 1 && (!state.themeId || activeFormats.length === 0))}
              className="flex items-center gap-2 text-sm text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              style={{ background: "#E2211C" }}
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <>{step === 1 ? "Start generation" : "Next"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
