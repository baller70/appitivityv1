import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { TimeTrackingService } from '@/lib/services/time-tracking'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookmarkId, metadata = {} } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'bookmarkId is required' }, { status: 400 })
    }

    const timeTrackingService = new TimeTrackingService()
    
    // Start automatic external visit tracking
    await timeTrackingService.trackExternalVisit(bookmarkId, userId, {
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('External visit tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track external visit' },
      { status: 500 }
    )
  }
} 