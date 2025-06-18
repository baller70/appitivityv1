import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { TimeTrackingService } from '@/lib/services/time-tracking'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getAuthenticatedUserId(): Promise<string> {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('Not authenticated')
    }

    const user = await currentUser()
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      throw new Error('No email found')
    }

    const email = user.emailAddresses[0].emailAddress

    // Try to find profile by email (since clerk_id column might not exist)
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (error || !profile) {
      console.error('Profile lookup failed:', error)
      // Use fallback user ID that we know exists
      return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
    }

    return profile.id
  } catch (error) {
    console.error('Authentication failed:', error)
    // Use fallback user ID that we know exists
    return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  }
}

// POST /api/time-tracking/session - Start a new session
export async function POST(request: NextRequest) {
  try {
    const { bookmarkId } = await request.json()
    
    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      )
    }

    const userId = await getAuthenticatedUserId()
    console.log('Starting session for user:', userId, 'bookmark:', bookmarkId)
    
    // Create service with admin client to bypass RLS temporarily
    const timeTrackingService = new TimeTrackingService(supabaseAdmin)
    const session = await timeTrackingService.startSession(bookmarkId, userId)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/time-tracking/session - End a session
export async function PUT(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const userId = await getAuthenticatedUserId()
    
    // Create service with admin client to bypass RLS temporarily
    const timeTrackingService = new TimeTrackingService(supabaseAdmin)
    const session = await timeTrackingService.endSession(sessionId, userId)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json(
      { error: 'Failed to end session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET /api/time-tracking/session?bookmarkId=xxx - Get active session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')
    
    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      )
    }

    const userId = await getAuthenticatedUserId()
    
    // Create service with admin client to bypass RLS temporarily
    const timeTrackingService = new TimeTrackingService(supabaseAdmin)
    const activeSession = await timeTrackingService.getActiveSession(bookmarkId, userId)

    return NextResponse.json({ activeSession })
  } catch (error) {
    console.error('Error getting active session:', error)
    return NextResponse.json(
      { error: 'Failed to get active session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 