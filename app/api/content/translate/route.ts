import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildTranslatePrompt } from '@/lib/content-prompts'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { text } = await req.json() as { text: string }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const prompt = buildTranslatePrompt(text)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    return NextResponse.json({ translated: content.text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
