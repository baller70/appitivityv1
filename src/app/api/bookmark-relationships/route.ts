import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../../../lib/fix-database'
import { BookmarkRelationshipServiceLite } from '../../../lib/services/bookmark-relationships-lite'

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Starting bookmark relationship creation...')
    
    const { userId } = await auth()
    const user = await currentUser()

    const effectiveUserId = userId || 'demo-user'
    if (!effectiveUserId) {
      console.error('❌ No user session found')
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    console.log('👤 User info:', {
      clerkUserId: userId,
      effectiveUserId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      userName: user?.firstName
    })

    const body = await request.json()
    const { bookmarkId, relatedBookmarkId, type } = body as {
      bookmarkId: string
      relatedBookmarkId: string
      type?: 'related' | 'similar' | 'dependency' | 'reference'
    }

    console.log('📝 Request body:', { bookmarkId, relatedBookmarkId, type })

    if (!bookmarkId || !relatedBookmarkId) {
      console.error('❌ Missing required fields')
      return NextResponse.json({ error: 'bookmarkId and relatedBookmarkId are required' }, { status: 400 })
    }

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
      
      if (!profileResult.success) {
        console.error('❌ Failed to ensure user profile:', profileResult.error)
        return NextResponse.json({ error: 'Failed to ensure user profile', details: profileResult.error }, { status: 500 })
      }
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    console.log('👤 Final user IDs:', {
      original: effectiveUserId,
      actual: actualUserId
    })

    console.log('🚀 Creating relationship service...')
    const service = new BookmarkRelationshipServiceLite(actualUserId)
    const result = await service.createRelationship(bookmarkId, relatedBookmarkId)

    console.log('📊 Relationship creation result:', {
      success: result.success,
      id: result.id,
      error: result.error
    })

    if (!result.success) {
      console.error('❌ Failed to create relationship:', result.error)
      return NextResponse.json({ error: result.error || 'Failed to create relationship' }, { status: 500 })
    }

    console.log('✅ Successfully created relationship')
    return NextResponse.json({ success: true, id: result.id })
  } catch (err) {
    console.error('💥 Unexpected error in bookmark relationship API:', {
      error: err,
      stack: err instanceof Error ? err.stack : undefined
    })
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
} 