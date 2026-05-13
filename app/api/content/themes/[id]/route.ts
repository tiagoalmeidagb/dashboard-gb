import { NextResponse } from 'next/server'
import { deleteTheme, getThemes, reorderThemes } from '@/lib/content-store'
import fs from 'fs/promises'
import path from 'path'
import type { ContentTheme } from '@/types/content'

export const dynamic = 'force-dynamic'

const THEMES_FILE = path.join(process.cwd(), 'data', 'themes.json')

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const patch: Partial<ContentTheme> = await req.json()
    const raw = await fs.readFile(THEMES_FILE, 'utf-8')
    const themes: ContentTheme[] = JSON.parse(raw)
    const idx = themes.findIndex(t => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    themes[idx] = { ...themes[idx], ...patch, id, order: themes[idx].order, createdAt: themes[idx].createdAt }
    await fs.writeFile(THEMES_FILE, JSON.stringify(themes, null, 2), 'utf-8')
    return NextResponse.json(themes[idx])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteTheme(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}
