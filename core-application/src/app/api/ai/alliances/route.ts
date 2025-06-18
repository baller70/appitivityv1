import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AIAllianceService } from '@/lib/ai/alliances'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookmarkService = new BookmarkService(userId)
    const ai = new AIAllianceService(bookmarkService)
    const alliances = await ai.recommendAlliances()
    return NextResponse.json({ alliances })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal error' }, { status: 500 })
  }
} 