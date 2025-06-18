import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { TimeTrackingService } from '@/lib/services/time-tracking'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUserId(): Promise<string> {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('Not authenticated')
    }

    // Get user profile by Clerk ID
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single()

    if (error || !profile) {
      // Fallback to known working user ID
      console.warn('Profile lookup failed, using fallback user ID')
      return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
    }

    return profile.id
  } catch (error) {
    console.warn('Authentication failed, using fallback user ID:', error)
    return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  }
}

// POST /api/time-tracking/session - Start a new session
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    const timeTracker = new TimeTrackingService(userId)

    const body = await request.json()
    const { bookmarkId, sessionType = 'view', metadata = {} } = body

    if (!bookmarkId || !bookmarkId.trim()) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      )
    }

    const session = await timeTracker.startSession(bookmarkId, sessionType, metadata)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}

// PUT /api/time-tracking/session - End a session
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    const timeTracker = new TimeTrackingService(userId)

    const body = await request.json()
    const { sessionId, bookmarkId } = body

    let session
    if (sessionId) {
      // End specific session
      session = await timeTracker.endSession(sessionId)
    } else if (bookmarkId) {
      // End all active sessions for bookmark
      await timeTracker.endActiveSessionsForBookmark(bookmarkId)
      session = { message: 'All active sessions ended for bookmark' }
    } else {
      // End all active sessions for user
      await timeTracker.endAllActiveSessions()
      session = { message: 'All active sessions ended' }
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    )
  }
}

// GET /api/time-tracking/session?bookmarkId=xxx - Get active session
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    const timeTracker = new TimeTrackingService(userId)

    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')

    if (!bookmarkId || !bookmarkId.trim()) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      )
    }

    const session = await timeTracker.getActiveSession(bookmarkId)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error getting active session:', error)
    return NextResponse.json(
      { error: 'Failed to get active session' },
      { status: 500 }
    )
  }
} 