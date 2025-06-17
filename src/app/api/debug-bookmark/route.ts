import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../../../lib/fix-database'
import { normalizeUserId } from '../../../lib/uuid-compat'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug bookmark creation starting...')
    
    // Step 1: Check authentication
    const { userId } = await auth()
    console.log('📝 Auth userId:', userId)
    
    const user = await currentUser()
    console.log('📝 Current user:', user ? {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName
    } : 'null')
    
    // Step 2: Handle demo mode
    const effectiveUserId = userId || 'demo-user'
    console.log('📝 Effective userId:', effectiveUserId)
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }
    
    // Step 3: Normalize user ID
    const normalizedUserId = normalizeUserId(effectiveUserId)
    console.log('📝 Normalized userId:', normalizedUserId)
    
    // Step 4: Ensure user profile
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      console.log('📝 Ensuring profile with email:', email, 'fullName:', fullName)
      
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      console.log('📝 Profile result:', profileResult)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    } else {
      console.log('📝 No user, using demo mode')
      const profileResult = await ensureUserProfile(effectiveUserId, '', '')
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }
    
    console.log('📝 Final actualUserId:', actualUserId)
    
    // Step 5: Get request data
    const data = await request.json()
    console.log('📝 Request data:', data)
    
    return NextResponse.json({
      success: true,
      debug: {
        authUserId: userId,
        effectiveUserId,
        normalizedUserId,
        actualUserId,
        hasUser: !!user,
        requestData: data
      }
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
} 