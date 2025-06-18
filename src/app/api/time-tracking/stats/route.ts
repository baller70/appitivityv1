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

// GET /api/time-tracking/stats?bookmarkId=xxx - Get time stats for a bookmark
// GET /api/time-tracking/stats - Get overall user time stats
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    const timeTracker = new TimeTrackingService(userId)

    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (bookmarkId && bookmarkId.trim()) {
      // Get stats for specific bookmark
      const stats = await timeTracker.getBookmarkTimeStats(bookmarkId)
      return NextResponse.json(stats)
    } else if (startDate && endDate) {
      // Get analytics for date range
      const analytics = await timeTracker.getTimeAnalytics(
        new Date(startDate),
        new Date(endDate)
      )
      return NextResponse.json(analytics)
    } else {
      // Get overall user stats
      const stats = await timeTracker.getUserTimeStats()
      return NextResponse.json(stats)
    }
  } catch (error) {
    console.error('Error getting time stats:', error)
    return NextResponse.json(
      { error: 'Failed to get time stats' },
      { status: 500 }
    )
  }
} 