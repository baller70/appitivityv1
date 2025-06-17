import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../../../lib/fix-database'
import { normalizeUserId } from '../../../lib/uuid-compat'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    const effectiveUserId = userId || 'demo-user'
    console.log('🌐 Browser auth test:', {
      clerkUserId: userId,
      effectiveUserId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      userName: user?.firstName,
      hasUser: !!user
    })

    // Get profile like the relationship service does
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    // Normalize like the service
    const normalizedUserId = actualUserId.startsWith('user_') ? normalizeUserId(actualUserId) : actualUserId

    return NextResponse.json({
      success: true,
      authentication: {
        isAuthenticated: !!userId,
        clerkUserId: userId,
        effectiveUserId,
        actualUserId,
        normalizedUserId,
        userInfo: user ? {
          email: user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName
        } : null
      },
      instructions: 'Open this in your browser while signed in to test authentication'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      instructions: 'Make sure you are signed in to your application'
    }, { status: 500 })
  }
} 