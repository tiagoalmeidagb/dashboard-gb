import { NextResponse } from 'next/server'
import { getThemes, createTheme } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const themes = await getThemes()
    return NextResponse.json(themes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, angle, product, formats } = body

    if (!title || !angle || !product || !formats) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const theme = await createTheme({ title, description, angle, product, formats })
    return NextResponse.json(theme, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}
