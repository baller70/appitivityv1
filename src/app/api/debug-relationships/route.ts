import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../../../lib/fix-database'
import { BookmarkRelationshipServiceLite } from '../../../lib/services/bookmark-relationships-lite'
import { supabaseAdminLite } from '../../../lib/supabase-lite'
import { normalizeUserId } from '../../../lib/uuid-compat'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting debug endpoint for bookmark relationships...')
    
    const { userId } = await auth()
    const user = await currentUser()

    // Always use demo mode for debugging
    const effectiveUserId = userId || 'demo-user'
    console.log('👤 Debug mode - using effectiveUserId:', effectiveUserId)

    // Check for bookmarkId parameter to get relationships for a specific bookmark
    const url = new URL(request.url)
    const bookmarkId = url.searchParams.get('bookmarkId')

    // Check user profile
    const email = user?.emailAddresses?.[0]?.emailAddress || ''
    const fullName = user?.firstName || ''
    const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
    
    console.log('📋 Profile result:', profileResult)
    
    let actualUserId = effectiveUserId
    if (profileResult.success && profileResult.userId) {
      actualUserId = profileResult.userId
    }
    
    console.log('👤 Final user IDs for debug:', {
      original: effectiveUserId,
      actual: actualUserId
    })

    // If bookmarkId is provided, get relationships for that bookmark
    if (bookmarkId) {
      console.log(`🔗 Getting relationships for bookmark: ${bookmarkId}`)
      const service = new BookmarkRelationshipServiceLite(actualUserId)
      const relationshipsResult = await service.getRelationshipsForBookmark(bookmarkId)
      
      return NextResponse.json({
        success: true,
        bookmarkId,
        relationships: relationshipsResult
      })
    }

    // Check existing bookmarks for this user
    const bookmarksResult = await supabaseAdminLite.select('bookmarks', {
      select: 'id, title, user_id'
    })
    
    console.log('📚 Bookmarks check result:', bookmarksResult)

    // Check if bookmark_relationships table exists
    const tableExistsResult = await supabaseAdminLite.select('bookmark_relationships', {
      select: 'id'
    })
    
    console.log('🔧 Table exists check:', tableExistsResult)

    // Get all relationships for debugging
    const allRelationshipsResult = await supabaseAdminLite.select('bookmark_relationships', {
      select: '*'
    })

    return NextResponse.json({
      success: true,
      debug: {
        effectiveUserId,
        actualUserId,
        profileResult,
        bookmarksCount: bookmarksResult.data?.length || 0,
        bookmarks: bookmarksResult.data || [],
        tableExists: !tableExistsResult.error,
        tableError: tableExistsResult.error?.message,
        allRelationships: allRelationshipsResult.data || [],
        relationshipsCount: allRelationshipsResult.data?.length || 0
      }
    })
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorDetails: error
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting bookmark relationship debugging...')
    
    const { userId } = await auth()
    const user = await currentUser()

    const effectiveUserId = userId || 'demo-user'
    console.log('👤 User info:', {
      clerkUserId: userId,
      effectiveUserId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      userName: user?.firstName
    })

    const body = await request.json()
    const { bookmarkId, relatedBookmarkId } = body as {
      bookmarkId: string
      relatedBookmarkId: string
    }

    console.log('📝 Request body:', { bookmarkId, relatedBookmarkId })

    // Ensure profile and get actual profile ID (for non-demo)
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      
      console.log('🔄 Ensuring user profile...')
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      
      console.log('📋 Profile result:', {
        success: profileResult.success,
        userId: profileResult.userId,
        error: profileResult.error
      })
      
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    // Normalize user ID like the service does
    const originalUserId = actualUserId
    const normalizedUserId = actualUserId.startsWith('user_') ? normalizeUserId(actualUserId) : actualUserId

    console.log('👤 Final user IDs:', {
      original: originalUserId,
      normalized: normalizedUserId
    })

    // Check bookmark 1
    const bookmark1 = await supabaseAdminLite.select('bookmarks', {
      select: 'id, user_id, title',
      id: bookmarkId
    })

    console.log('📋 Bookmark 1 result:', {
      error: bookmark1.error,
      data: bookmark1.data
    })

    // Check bookmark 2
    const bookmark2 = await supabaseAdminLite.select('bookmarks', {
      select: 'id, user_id, title', 
      id: relatedBookmarkId
    })

    console.log('📋 Bookmark 2 result:', {
      error: bookmark2.error,
      data: bookmark2.data
    })

    // Ownership comparison
    const ownership = {
      bookmark1Exists: bookmark1.data && bookmark1.data.length > 0,
      bookmark2Exists: bookmark2.data && bookmark2.data.length > 0,
      bookmark1UserId: bookmark1.data?.[0]?.user_id,
      bookmark2UserId: bookmark2.data?.[0]?.user_id,
      expectedUserId: normalizedUserId,
      bookmark1Match: bookmark1.data?.[0]?.user_id === normalizedUserId,
      bookmark2Match: bookmark2.data?.[0]?.user_id === normalizedUserId
    }

    console.log('🔐 Ownership analysis:', ownership)

    return NextResponse.json({
      success: true,
      debug: {
        userIds: {
          original: originalUserId,
          normalized: normalizedUserId
        },
        bookmarks: {
          bookmark1: bookmark1.data?.[0],
          bookmark2: bookmark2.data?.[0]
        },
        ownership
      }
    })
  } catch (err) {
    console.error('💥 Debug error:', err)
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 })
  }
} 