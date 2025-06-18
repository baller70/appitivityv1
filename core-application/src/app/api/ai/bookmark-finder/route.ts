import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AIBookmarkFinder } from '@/lib/ai/bookmark-finder'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { query } = await req.json()
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  try {
    const finder = new AIBookmarkFinder(new BookmarkService(userId))
    const results = await finder.find(query)
    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal error' }, { status: 500 })
  }
} 