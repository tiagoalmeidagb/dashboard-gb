import fs from 'fs/promises'
import path from 'path'
import type { ContentTheme, GeneratedContent, ContentInstructions } from '@/types/content'

const DATA_DIR = path.join(process.cwd(), 'data')
const THEMES_FILE = path.join(DATA_DIR, 'themes.json')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const INSTRUCTIONS_FILE = path.join(DATA_DIR, 'instructions.json')

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Themes ────────────────────────────────────────────────────────────────────

export async function getThemes(): Promise<ContentTheme[]> {
  const themes = await readJson<ContentTheme>(THEMES_FILE)
  return themes.sort((a, b) => a.order - b.order)
}

export async function createTheme(theme: Omit<ContentTheme, 'id' | 'order' | 'createdAt'>): Promise<ContentTheme> {
  const themes = await readJson<ContentTheme>(THEMES_FILE)
  const maxOrder = themes.length > 0 ? Math.max(...themes.map(t => t.order)) : -1
  const newTheme: ContentTheme = {
    ...theme,
    id: crypto.randomUUID(),
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  }
  themes.push(newTheme)
  await writeJson(THEMES_FILE, themes)
  return newTheme
}

export async function deleteTheme(id: string): Promise<boolean> {
  const themes = await readJson<ContentTheme>(THEMES_FILE)
  const filtered = themes.filter(t => t.id !== id)
  if (filtered.length === themes.length) return false
  await writeJson(THEMES_FILE, filtered)
  return true
}

export async function reorderThemes(orderedIds: string[]): Promise<void> {
  const themes = await readJson<ContentTheme>(THEMES_FILE)
  const updated = themes.map(t => ({
    ...t,
    order: orderedIds.indexOf(t.id),
  }))
  await writeJson(THEMES_FILE, updated)
}

// ── Generated Content ─────────────────────────────────────────────────────────

export async function listContent(): Promise<GeneratedContent[]> {
  const items = await readJson<GeneratedContent>(CONTENT_FILE)
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getContent(id: string): Promise<GeneratedContent | null> {
  const items = await readJson<GeneratedContent>(CONTENT_FILE)
  return items.find(i => i.id === id) ?? null
}

export async function saveContent(item: Omit<GeneratedContent, 'id' | 'createdAt'>): Promise<GeneratedContent> {
  const items = await readJson<GeneratedContent>(CONTENT_FILE)
  const newItem: GeneratedContent = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  items.push(newItem)
  await writeJson(CONTENT_FILE, items)
  return newItem
}

export async function updateContent(id: string, patch: Partial<GeneratedContent>): Promise<GeneratedContent | null> {
  const items = await readJson<GeneratedContent>(CONTENT_FILE)
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...patch }
  await writeJson(CONTENT_FILE, items)
  return items[idx]
}

// ── Instructions ──────────────────────────────────────────────────────────────

const DEFAULT_INSTRUCTIONS: ContentInstructions = {
  general: { toneOfVoice: '', targetAudience: '', generalRules: '' },
  formats: { email: '', whatsapp: '', carousel: '' },
  products: [],
  examples: [],
  updatedAt: '',
}

export async function getInstructions(): Promise<ContentInstructions> {
  try {
    const raw = await fs.readFile(INSTRUCTIONS_FILE, 'utf-8')
    return { ...DEFAULT_INSTRUCTIONS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_INSTRUCTIONS
  }
}

export async function saveInstructions(data: ContentInstructions): Promise<ContentInstructions> {
  const updated = { ...data, updatedAt: new Date().toISOString() }
  await fs.writeFile(INSTRUCTIONS_FILE, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}
