import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AIRealTimeRefresher } from '@/lib/ai/real-time-refresher'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = req.nextUrl.searchParams.get('since') || undefined
  try {
    const refresher = new AIRealTimeRefresher(new BookmarkService(userId))
    const result = await refresher.getUpdates(since)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal error' }, { status: 500 })
  }
} 