import { NextResponse } from 'next/server'
import { getInstructions, saveInstructions } from '@/lib/content-store'
import type { ContentInstructions } from '@/types/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const instructions = await getInstructions()
    return NextResponse.json(instructions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to load instructions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body: ContentInstructions = await req.json()
    const saved = await saveInstructions(body)
    return NextResponse.json(saved)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save instructions' }, { status: 500 })
  }
}
