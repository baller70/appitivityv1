import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AILearningPathGenerator } from '@/lib/ai/learning-path-generator'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, limit } = await req.json().catch(() => ({}))
  try {
    const generator = new AILearningPathGenerator(new BookmarkService(userId))
    const path = await generator.generatePath({ topic, limit })
    return NextResponse.json({ path })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal error' }, { status: 500 })
  }
} 