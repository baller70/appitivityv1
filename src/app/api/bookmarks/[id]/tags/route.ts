import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '../../../../../lib/services/bookmarks'
import { ensureUserProfile } from '../../../../../lib/fix-database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    // Ensure user profile exists and get the database user ID
    const email = 'user@example.com'
    const fullName = 'User'
    const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
    
    if (!profileResult.success || !profileResult.userId) {
      return NextResponse.json({ error: 'Failed to ensure user profile' }, { status: 500 })
    }

    const { tagIds } = await request.json()
    
    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: 'tagIds must be an array' }, { status: 400 })
    }

    const bookmarkService = new BookmarkService(profileResult.userId)
    await bookmarkService.addTagsToBookmark(params.id, tagIds)
    
    // Return updated bookmark
    const updatedBookmark = await bookmarkService.getBookmark(params.id)
    return NextResponse.json(updatedBookmark)
  } catch (error) {
    console.error('Error adding tags to bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to add tags to bookmark' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    // Ensure user profile exists and get the database user ID
    const email = 'user@example.com'
    const fullName = 'User'
    const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
    
    if (!profileResult.success || !profileResult.userId) {
      return NextResponse.json({ error: 'Failed to ensure user profile' }, { status: 500 })
    }

    const { tagIds } = await request.json()
    
    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: 'tagIds must be an array' }, { status: 400 })
    }

    const bookmarkService = new BookmarkService(profileResult.userId)
    await bookmarkService.removeTagsFromBookmark(params.id, tagIds)
    
    // Return updated bookmark
    const updatedBookmark = await bookmarkService.getBookmark(params.id)
    return NextResponse.json(updatedBookmark)
  } catch (error) {
    console.error('Error removing tags from bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to remove tags from bookmark' }, 
      { status: 500 }
    )
  }
} 