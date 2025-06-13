import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AIPredictiveEngine } from '@/lib/ai/predictive-engine'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookmarkService = new BookmarkService(userId)
    const engine = new AIPredictiveEngine(bookmarkService)
    const predictions = await engine.predictNext()
    return NextResponse.json({ predictions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal error' }, { status: 500 })
  }
} 