"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import type { ContentInstructions, InstructionProduct, InstructionExample } from "@/types/content"

// ── Types ─────────────────────────────────────────────────────────────────────

type InnerTab = "geral" | "email" | "whatsapp" | "carrossel" | "produtos" | "exemplos"

const INNER_TABS: { key: InnerTab; label: string }[] = [
  { key: "geral", label: "Geral" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "carrossel", label: "Carrossel" },
  { key: "produtos", label: "Produtos" },
  { key: "exemplos", label: "Exemplos" },
]

const DEFAULT_INSTRUCTIONS: ContentInstructions = {
  general: { toneOfVoice: "", targetAudience: "", generalRules: "" },
  formats: { email: "", whatsapp: "", carousel: "" },
  products: [],
  examples: [],
  updatedAt: "",
}

// ── Shared SaveBar ────────────────────────────────────────────────────────────

function SaveBar({
  dirty,
  saving,
  saved,
  onSave,
}: {
  dirty: boolean
  saving: boolean
  saved: boolean
  onSave: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
      {saved && !dirty && (
        <span className="flex items-center gap-1.5 text-xs text-green-600">
          <Check className="w-3.5 h-3.5" /> Salvo
        </span>
      )}
      <button
        onClick={onSave}
        disabled={!dirty || saving}
        className="text-sm text-white px-5 py-2 rounded-lg font-medium disabled:opacity-40 transition-colors"
        style={{ background: "#E2211C" }}
      >
        {saving ? "Salvando…" : "Salvar alterações"}
      </button>
    </div>
  )
}

// ── TextSection ───────────────────────────────────────────────────────────────

function TextSection({
  label,
  hint,
  value,
  rows,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  rows?: number
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-0.5">{label}</p>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <textarea
        rows={rows ?? 4}
        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 transition-colors resize-none"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Deixe em branco para usar o padrão do sistema."
      />
    </div>
  )
}

// ── GeralTab ──────────────────────────────────────────────────────────────────

function GeralTab({
  data,
  onChange,
}: {
  data: ContentInstructions["general"]
  onChange: (d: ContentInstructions["general"]) => void
}) {
  return (
    <div className="space-y-6">
      <TextSection
        label="Tom de voz"
        hint="Descreva como a marca deve soar: profissional, amigável, motivacional, etc."
        value={data.toneOfVoice}
        onChange={v => onChange({ ...data, toneOfVoice: v })}
      />
      <TextSection
        label="Público-alvo"
        hint="Quem são os leitores ou destinatários deste conteúdo?"
        value={data.targetAudience}
        onChange={v => onChange({ ...data, targetAudience: v })}
      />
      <TextSection
        label="Regras gerais de escrita"
        hint="Restrições, preferências e boas práticas que se aplicam a todos os formatos."
        rows={6}
        value={data.generalRules}
        onChange={v => onChange({ ...data, generalRules: v })}
      />
    </div>
  )
}

// ── FormatTab ─────────────────────────────────────────────────────────────────

const FORMAT_META: Record<"email" | "whatsapp" | "carrossel", { label: string; hint: string; placeholder: string }> = {
  email: {
    label: "Instruções para Email",
    hint: "Estrutura esperada, estilo de escrita, o que evitar, extensão, etc.",
    placeholder: "Ex.: Sempre começar com uma pergunta. Usar um único CTA no final. Evitar jargões técnicos.",
  },
  whatsapp: {
    label: "Instruções para WhatsApp",
    hint: "Tom, extensão, uso de emojis, estrutura da mensagem.",
    placeholder: "Ex.: Mensagem curta, máximo 3 parágrafos. Começar pelo benefício principal.",
  },
  carrossel: {
    label: "Instruções para Carrossel",
    hint: "Número de slides, estilo de cada slide, call-to-action, etc.",
    placeholder: "Ex.: Slide 1 sempre com pergunta provocativa. Último slide sempre com link na bio.",
  },
}

function FormatTab({
  format,
  value,
  onChange,
}: {
  format: "email" | "whatsapp" | "carrossel"
  value: string
  onChange: (v: string) => void
}) {
  const meta = FORMAT_META[format]
  return (
    <div className="space-y-6">
      <TextSection
        label={meta.label}
        hint={meta.hint}
        rows={10}
        value={value}
        onChange={onChange}
      />
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
        <p className="text-xs text-amber-700 leading-relaxed">{meta.placeholder}</p>
      </div>
    </div>
  )
}

// ── ProductForm ───────────────────────────────────────────────────────────────

const EMPTY_PRODUCT: Omit<InstructionProduct, "id"> = {
  name: "",
  description: "",
  promise: "",
  audience: "",
  differential: "",
}

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: InstructionProduct
  onSave: (p: Omit<InstructionProduct, "id">) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Omit<InstructionProduct, "id">>(
    initial ? {
      name: initial.name,
      description: initial.description,
      promise: initial.promise,
      audience: initial.audience,
      differential: initial.differential,
    } : EMPTY_PRODUCT
  )

  const canSave = form.name.trim().length > 0

  function field(key: keyof typeof EMPTY_PRODUCT, label: string, hint: string) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-0.5">{label}</p>
        <p className="text-xs text-gray-400 mb-1">{hint}</p>
        <textarea
          rows={2}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors resize-none"
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-gray-50 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-0.5">Nome do produto *</p>
        <input
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors bg-white"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex.: Instructor Certification Program"
        />
      </div>
      {field("description", "Descrição", "O que é esse produto?")}
      {field("promise", "Promessa", "Qual transformação ou resultado o produto entrega?")}
      {field("audience", "Público", "Para quem é esse produto especificamente?")}
      {field("differential", "Diferencial", "O que torna esse produto único?")}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => canSave && onSave(form)}
          disabled={!canSave}
          className="text-sm text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-40"
          style={{ background: "#E2211C" }}
        >
          {initial ? "Atualizar" : "Adicionar"}
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 px-4 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── ProdutosTab ───────────────────────────────────────────────────────────────

function ProdutosTab({
  products,
  onChange,
}: {
  products: InstructionProduct[]
  onChange: (p: InstructionProduct[]) => void
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function addProduct(p: Omit<InstructionProduct, "id">) {
    onChange([...products, { ...p, id: crypto.randomUUID() }])
    setAdding(false)
  }

  function updateProduct(id: string, p: Omit<InstructionProduct, "id">) {
    onChange(products.map(x => x.id === id ? { ...p, id } : x))
    setEditingId(null)
  }

  function deleteProduct(id: string) {
    onChange(products.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-3">
      {products.length === 0 && !adding && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <p className="text-sm">Nenhum produto cadastrado.</p>
          <p className="text-xs mt-1">Os dados do produto são injetados automaticamente na geração.</p>
        </div>
      )}

      {products.map(product => (
        <div key={product.id}>
          {editingId === product.id ? (
            <ProductForm
              initial={product}
              onSave={p => updateProduct(product.id, p)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {product.promise && (
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-600">Promessa:</span> {product.promise}
                      </span>
                    )}
                    {product.differential && (
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-600">Diferencial:</span> {product.differential}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setEditingId(product.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <ProductForm onSave={addProduct} onCancel={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-gray-600 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Adicionar produto
        </button>
      )}
    </div>
  )
}

// ── ExampleForm ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "carousel", label: "Carrossel" },
] as const

const EMPTY_EXAMPLE: Omit<InstructionExample, "id"> = {
  type: "email",
  productId: undefined,
  content: "",
}

function ExampleForm({
  initial,
  products,
  onSave,
  onCancel,
}: {
  initial?: InstructionExample
  products: InstructionProduct[]
  onSave: (e: Omit<InstructionExample, "id">) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Omit<InstructionExample, "id">>(
    initial
      ? { type: initial.type, productId: initial.productId, content: initial.content }
      : EMPTY_EXAMPLE
  )

  const canSave = form.content.trim().length > 0

  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-gray-50 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Tipo *</p>
          <select
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as InstructionExample["type"] }))}
          >
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Produto (opcional)</p>
          <select
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white"
            value={form.productId ?? ""}
            onChange={e => setForm(f => ({ ...f, productId: e.target.value || undefined }))}
          >
            <option value="">Nenhum</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">Conteúdo do exemplo *</p>
        <textarea
          rows={8}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors resize-none bg-white font-mono"
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="Cole aqui um exemplo de copy de alta qualidade para este formato…"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => canSave && onSave(form)}
          disabled={!canSave}
          className="text-sm text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-40"
          style={{ background: "#E2211C" }}
        >
          {initial ? "Atualizar" : "Adicionar"}
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 px-4 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── ExemplosTab ───────────────────────────────────────────────────────────────

const FORMAT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  email: { bg: "#F3F4F6", text: "#374151", label: "Email" },
  whatsapp: { bg: "#DCFCE7", text: "#166534", label: "WhatsApp" },
  carousel: { bg: "#EDE9FE", text: "#6D28D9", label: "Carrossel" },
}

function ExemplosTab({
  examples,
  products,
  onChange,
}: {
  examples: InstructionExample[]
  products: InstructionProduct[]
  onChange: (e: InstructionExample[]) => void
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function addExample(e: Omit<InstructionExample, "id">) {
    onChange([...examples, { ...e, id: crypto.randomUUID() }])
    setAdding(false)
  }

  function updateExample(id: string, e: Omit<InstructionExample, "id">) {
    onChange(examples.map(x => x.id === id ? { ...e, id } : x))
    setEditingId(null)
  }

  function deleteExample(id: string) {
    onChange(examples.filter(x => x.id !== id))
  }

  function productName(id?: string) {
    if (!id) return null
    return products.find(p => p.id === id)?.name ?? null
  }

  return (
    <div className="space-y-3">
      {examples.length === 0 && !adding && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <p className="text-sm">Nenhum exemplo cadastrado.</p>
          <p className="text-xs mt-1">Exemplos são usados como few-shot na geração de conteúdo.</p>
        </div>
      )}

      {examples.map(ex => {
        const badge = FORMAT_BADGE[ex.type]
        const pName = productName(ex.productId)
        const isExpanded = expandedId === ex.id

        return (
          <div key={ex.id}>
            {editingId === ex.id ? (
              <ExampleForm
                initial={ex}
                products={products}
                onSave={e => updateExample(ex.id, e)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                >
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                  {pName && (
                    <span className="text-xs text-gray-500 flex-shrink-0">{pName}</span>
                  )}
                  <p className="text-xs text-gray-500 flex-1 truncate">
                    {ex.content.slice(0, 120)}
                  </p>
                  <div className="flex gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingId(ex.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteExample(ex.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {ex.content}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {adding ? (
        <ExampleForm products={products} onSave={addExample} onCancel={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-gray-600 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Adicionar exemplo
        </button>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function InstructionsTab() {
  const [innerTab, setInnerTab] = useState<InnerTab>("geral")
  const [data, setData] = useState<ContentInstructions>(DEFAULT_INSTRUCTIONS)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchInstructions = useCallback(async () => {
    try {
      const res = await fetch("/api/content/instructions")
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInstructions() }, [fetchInstructions])

  function update(patch: Partial<ContentInstructions>) {
    setData(d => ({ ...d, ...patch }))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/content/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const saved = await res.json()
      setData(saved)
      setDirty(false)
      setSaved(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Products and examples save immediately via the same save mechanism
  const isProductsOrExamples = innerTab === "produtos" || innerTab === "exemplos"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Carregando instruções…
      </div>
    )
  }

  return (
    <div>
      {/* Inner tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {INNER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setInnerTab(tab.key)}
            className="px-4 py-2 text-sm font-medium transition-colors relative"
            style={{ color: innerTab === tab.key ? "#E2211C" : "#6B7280" }}
          >
            {tab.label}
            {innerTab === tab.key && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "#E2211C" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content inside white card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ minHeight: 400 }}>
        {innerTab === "geral" && (
          <>
            <GeralTab
              data={data.general}
              onChange={general => update({ general })}
            />
            <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} />
          </>
        )}

        {innerTab === "email" && (
          <>
            <FormatTab
              format="email"
              value={data.formats.email}
              onChange={v => update({ formats: { ...data.formats, email: v } })}
            />
            <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} />
          </>
        )}

        {innerTab === "whatsapp" && (
          <>
            <FormatTab
              format="whatsapp"
              value={data.formats.whatsapp}
              onChange={v => update({ formats: { ...data.formats, whatsapp: v } })}
            />
            <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} />
          </>
        )}

        {innerTab === "carrossel" && (
          <>
            <FormatTab
              format="carrossel"
              value={data.formats.carousel}
              onChange={v => update({ formats: { ...data.formats, carousel: v } })}
            />
            <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} />
          </>
        )}

        {innerTab === "produtos" && (
          <>
            <ProdutosTab
              products={data.products}
              onChange={products => update({ products })}
            />
            <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} />
          </>
        )}

        {innerTab === "exemplos" && (
          <>
            <ExemplosTab
              examples={data.examples}
              products={data.products}
              onChange={examples => update({ examples })}
            />
            <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} />
          </>
        )}
      </div>
    </div>
  )
}
