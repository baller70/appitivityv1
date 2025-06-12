import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { BookmarkService } from '../../../lib/services/bookmarks'
import { supabaseAdmin } from '../../../lib/supabase'
import { normalizeUserId } from '../../../lib/uuid-compat'
import { ensureUserProfile } from '../../../lib/fix-database'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    // Ensure user profile exists and get the actual profile ID
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      // Use the actual profile ID from the database
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    } else {
      // For demo mode, still need to ensure we have the right user ID
      const profileResult = await ensureUserProfile(effectiveUserId, '', '')
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    console.log('GET bookmarks - using actualUserId:', actualUserId)
    const bookmarkService = new BookmarkService(actualUserId)
    const bookmarks = await bookmarkService.getBookmarks()
    
    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const data = await request.json()
    
    // Extract tagIds from data since it's a separate parameter in createBookmark
    const { tagIds, ...bookmarkData } = data
    
    // Ensure user profile exists and get the actual profile ID
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      // Use the actual profile ID from the database
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    } else {
      // For demo mode, still need to ensure we have the right user ID
      const profileResult = await ensureUserProfile(effectiveUserId, '', '')
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }
    
    console.log('POST bookmark - using actualUserId:', actualUserId)
    const bookmarkService = new BookmarkService(actualUserId)
    const bookmark = await bookmarkService.createBookmark(bookmarkData, tagIds)
    
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: `Failed to create bookmark: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    // Ensure user profile exists and get the actual profile ID
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      // Use the actual profile ID from the database - this is critical for bookmark operations
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    } else {
      // For demo mode, still need to ensure we have the right user ID
      const profileResult = await ensureUserProfile(effectiveUserId, '', '')
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }
    
    console.log('PUT bookmark - using actualUserId:', actualUserId, 'for bookmark:', id)
    const bookmarkService = new BookmarkService(actualUserId)
    const bookmark = await bookmarkService.updateBookmark(id, updateData)
    
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const ids = url.searchParams.get('ids')
    
    if (!id && !ids) {
      return NextResponse.json({ error: 'Bookmark ID or IDs are required' }, { status: 400 })
    }

    // Ensure user profile exists and get the actual profile ID
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      // Use the actual profile ID from the database
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    } else {
      // For demo mode, still need to ensure we have the right user ID
      const profileResult = await ensureUserProfile(effectiveUserId, '', '')
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }
    
    console.log('DELETE bookmark - using actualUserId:', actualUserId)
    const bookmarkService = new BookmarkService(actualUserId)
    
    if (ids) {
      // Bulk delete
      const bookmarkIds = ids.split(',')
      for (const bookmarkId of bookmarkIds) {
        await bookmarkService.deleteBookmark(bookmarkId)
      }
      return NextResponse.json({ success: true, deletedCount: bookmarkIds.length })
    } else if (id) {
      // Single delete
      await bookmarkService.deleteBookmark(id)
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: `Failed to delete bookmark: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
} 