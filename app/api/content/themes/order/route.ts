import { NextResponse } from 'next/server'
import { reorderThemes } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
  try {
    const { orderedIds } = await req.json()
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 })
    }
    await reorderThemes(orderedIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to reorder themes' }, { status: 500 })
  }
}
