import { NextResponse } from 'next/server'
import { listContent, saveContent } from '@/lib/content-store'
import type { GeneratedContent } from '@/types/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await listContent()
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body: Omit<GeneratedContent, 'id' | 'createdAt'> = await req.json()
    const item = await saveContent(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
