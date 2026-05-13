import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '@/lib/content-prompts'
import { getInstructions } from '@/lib/content-store'
import type { ContentFormat } from '@/types/content'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { type, theme } = await req.json() as {
      type: ContentFormat
      theme: { title: string; description?: string; angle: string; product: string }
    }

    if (!type || !theme?.title || !theme?.angle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const instructions = await getInstructions()
    const prompt = buildPrompt(type, theme, instructions)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    return NextResponse.json({ content: content.text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
