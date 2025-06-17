import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { BookmarkRelationshipServiceLite } from '../../../../../lib/services/bookmark-relationships-lite'
import { BookmarkServiceLite } from '../../../../../lib/services/bookmarks-lite'
import { ensureUserProfile } from '../../../../../lib/fix-database'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the same user ID resolution as the main bookmark API
    let actualUserId = effectiveUserId
    if (user && userId) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || 'Demo'
      const profileResult = await ensureUserProfile(userId, email, fullName)
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    console.log('🔗 Related bookmarks - using actualUserId:', actualUserId)

    const { id: bookmarkId } = await params
    const relationshipService = new BookmarkRelationshipServiceLite(actualUserId)
    
    // Get all relationships for this bookmark
    const relationships = await relationshipService.getRelationshipsForBookmark(bookmarkId)
    
    if (!relationships.success) {
      return NextResponse.json({ error: relationships.error }, { status: 500 })
    }

    // Get bookmark details for each related bookmark
    const bookmarkService = new BookmarkServiceLite(actualUserId)
    const relatedBookmarks = []
    
    for (const rel of relationships.data || []) {
      const relatedId = rel.related_bookmark_id
      
      // Skip self-references (bookmark related to itself)
      if (relatedId === bookmarkId) {
        console.warn('⚠️ Skipping self-reference for bookmark:', bookmarkId)
        continue
      }
      
      const bookmarkResult = await bookmarkService.getBookmark(relatedId)
      if (bookmarkResult.success && bookmarkResult.data) {
        relatedBookmarks.push(bookmarkResult.data)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: relatedBookmarks,
      count: relatedBookmarks.length 
    })
  } catch (error) {
    console.error('Error fetching related bookmarks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the same user ID resolution as the main bookmark API
    let actualUserId = effectiveUserId
    if (user && userId) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || 'Demo'
      const profileResult = await ensureUserProfile(userId, email, fullName)
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    console.log('🔗 POST Related bookmarks - using actualUserId:', actualUserId)

    const { id: bookmarkId } = await params
    const body = await request.json()
    const { url, title, tags, notes, relatedBookmarkId } = body as {
      url?: string
      title?: string
      tags?: string[]
      notes?: string
      relatedBookmarkId?: string
    }

    // Either relatedBookmarkId is provided (existing bookmark) or url+title for new creation.
    if (!relatedBookmarkId && (!url || !title)) {
      return NextResponse.json({ 
        error: 'Either relatedBookmarkId or both url and title are required' 
      }, { status: 400 })
    }

    const relationshipService = new BookmarkRelationshipServiceLite(actualUserId)
    let targetBookmarkId = relatedBookmarkId

    // If creating new bookmark, do that first
    if (!relatedBookmarkId && url && title) {
      const bookmarkService = new BookmarkServiceLite(actualUserId)
      const newBookmarkResult = await bookmarkService.createBookmark({
        url,
        title,
        description: notes,
        tags: tags || []
      })
      
      if (!newBookmarkResult.success) {
        return NextResponse.json({ error: newBookmarkResult.error }, { status: 500 })
      }
      
      targetBookmarkId = newBookmarkResult.data!.id
    }

    // Create the relationship
    const result = await relationshipService.createRelationship(
      bookmarkId, 
      targetBookmarkId!
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      bookmarkId: targetBookmarkId 
    })
  } catch (error) {
    console.error('Error creating related bookmark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 