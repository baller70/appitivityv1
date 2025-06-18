import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AICopilotCore } from '@/lib/ai/copilot-core'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query } = await req.json().catch(() => ({ query: undefined }))
  try {
    const core = new AICopilotCore(new BookmarkService(userId))
    const result = await core.dashboardOverview(query)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal' }, { status: 500 })
  }
} 