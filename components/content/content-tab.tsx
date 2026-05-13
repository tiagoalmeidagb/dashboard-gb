"use client"

import { useCallback, useEffect, useState } from "react"
import { ThemeQueue } from "@/components/content/theme-queue"
import { CreateThemeForm } from "@/components/content/create-theme-form"
import { GenerationWizard } from "@/components/content/generation-wizard"
import { HistoryTab } from "@/components/content/history-tab"
import { ContentDetailModal } from "@/components/content/content-detail-modal"
import { InstructionsTab } from "@/components/content/instructions-tab"
import type { ContentTheme, GeneratedContent } from "@/types/content"

type View = "main" | "create-theme" | "edit-theme"
type SubTab = "production" | "history" | "instructions"

export function ContentTab() {
  const [view, setView] = useState<View>("main")
  const [subTab, setSubTab] = useState<SubTab>("production")
  const [editingTheme, setEditingTheme] = useState<ContentTheme | null>(null)

  const [themes, setThemes] = useState<ContentTheme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<ContentTheme | null>(null)
  const [loadingThemes, setLoadingThemes] = useState(true)

  const [history, setHistory] = useState<GeneratedContent[]>([])
  const [selectedItem, setSelectedItem] = useState<GeneratedContent | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const fetchThemes = useCallback(async () => {
    try {
      const res = await fetch("/api/content/themes")
      const data = await res.json()
      setThemes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingThemes(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/content")
      const data = await res.json()
      setHistory(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => { fetchThemes() }, [fetchThemes])
  useEffect(() => { fetchHistory() }, [fetchHistory])

  async function handleCreateTheme(theme: Omit<ContentTheme, "id" | "order" | "createdAt">) {
    const res = await fetch("/api/content/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    })
    if (res.ok) {
      const created = await res.json()
      setThemes(t => [...t, created].sort((a, b) => a.order - b.order))
    }
  }

  async function handleDeleteTheme(id: string) {
    await fetch(`/api/content/themes/${id}`, { method: "DELETE" })
    setThemes(t => t.filter(x => x.id !== id))
    if (selectedTheme?.id === id) setSelectedTheme(null)
  }

  async function handleReorder(reordered: ContentTheme[]) {
    const updated = reordered.map((t, i) => ({ ...t, order: i }))
    setThemes(updated)
    await fetch("/api/content/themes/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: updated.map(t => t.id) }),
    })
  }

  async function handleComplete(item: Omit<GeneratedContent, "id" | "createdAt">) {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    if (res.ok) {
      const saved = await res.json()
      setHistory(h => [saved, ...h])
    }
  }

  function handleBack() {
    setView("main")
    setEditingTheme(null)
    fetchThemes()
  }

  // ── Create / Edit theme full view ─────────────────────────────────────────
  if (view === "create-theme" || view === "edit-theme") {
    return (
      <div style={{ height: "calc(100vh - 180px)" }}>
        <CreateThemeForm
          onBack={handleBack}
          onSave={handleCreateTheme}
          editTheme={editingTheme ?? undefined}
        />
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header row: title left, tabs right */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>

        <div className="flex gap-6">
          {(["production", "history", "instructions"] as SubTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className="pb-1 text-sm font-semibold transition-colors relative"
              style={{ color: subTab === tab ? "#E2211C" : "#6B7280" }}
            >
              {tab === "production" ? "Production" : tab === "history" ? "History" : "Instructions"}
              {subTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "#E2211C" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Production */}
      {subTab === "production" && (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "460px 1fr",
            height: "calc(100vh - 240px)",
          }}
        >
          {/* LEFT — Theme Queue */}
          <div className="overflow-y-auto pr-1">
            {loadingThemes ? (
              <div className="flex items-center justify-center py-12 text-xs text-gray-400">Loading...</div>
            ) : (
              <ThemeQueue
                themes={themes}
                selectedId={selectedTheme?.id ?? null}
                onSelect={setSelectedTheme}
                onReorder={handleReorder}
                onDelete={handleDeleteTheme}
                onEdit={theme => { setEditingTheme(theme); setView("edit-theme") }}
                onCreateClick={() => setView("create-theme")}
              />
            )}
          </div>

          {/* RIGHT — Generation Wizard */}
          <div className="overflow-y-auto">
            <GenerationWizard
              themes={themes}
              selectedTheme={selectedTheme}
              onComplete={handleComplete}
            />
          </div>
        </div>
      )}

      {/* History */}
      {subTab === "history" && (
        <>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
          ) : (
            <HistoryTab items={history} onSelect={setSelectedItem} />
          )}
          {selectedItem && (
            <ContentDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
          )}
        </>
      )}

      {/* Instructions */}
      {subTab === "instructions" && <InstructionsTab />}
    </div>
  )
}
