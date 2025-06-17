import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { BookmarkService } from '../../../../lib/services/bookmarks'
import { ensureUserProfile } from '../../../../lib/fix-database'

// Helper to determine actual user profile ID (handles demo mode and ensureUserProfile)
async function resolveActualUserId(): Promise<{ success: boolean; userId?: string; error?: unknown }> {
  try {
    const { userId } = await auth()
    const user = await currentUser().catch(() => null)

    const effectiveUserId = userId || 'demo-user'
    if (!effectiveUserId) {
      return { success: false, error: 'No user session' }
    }

    // Ensure profile exists and get canonical DB user id
    const email = user?.emailAddresses?.[0]?.emailAddress || ''
    const fullName = user?.firstName || ''
    const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
    if (!profileResult.success) {
      return { success: false, error: profileResult.error }
    }

    return { success: true, userId: profileResult.userId || effectiveUserId }
  } catch (error) {
    return { success: false, error }
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { success, userId, error } = await resolveActualUserId()
  if (!success || !userId) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookmarkService = new BookmarkService(userId)
    const bookmark = await bookmarkService.getBookmark(params.id)
    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }
    return NextResponse.json(bookmark)
  } catch (err) {
    console.error('Error fetching bookmark:', err)
    return NextResponse.json({ error: 'Failed to fetch bookmark' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { success, userId, error } = await resolveActualUserId()
  if (!success || !userId) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    const bookmarkService = new BookmarkService(userId)
    const bookmark = await bookmarkService.updateBookmark(params.id, updates)
    return NextResponse.json(bookmark)
  } catch (err) {
    console.error('Error updating bookmark:', err)
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { success, userId, error } = await resolveActualUserId()
  if (!success || !userId) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookmarkService = new BookmarkService(userId)
    await bookmarkService.deleteBookmark(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting bookmark:', err)
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
  }
} 