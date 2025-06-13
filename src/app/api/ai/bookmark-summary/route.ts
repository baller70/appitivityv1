import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AIBookmarkSummary } from '@/lib/ai/bookmark-summary'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookmarkId } = await req.json()
  if (!bookmarkId) return NextResponse.json({ error: 'bookmarkId required' }, { status: 400 })

  try {
    const summarizer = new AIBookmarkSummary(new BookmarkService(userId))
    const result = await summarizer.summarize(bookmarkId)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal' }, { status: 500 })
  }
} 