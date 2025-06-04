import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../../../lib/fix-database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const { email, fullName } = await request.json()
    const success = await ensureUserProfile(effectiveUserId, email, fullName)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create user profile' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return NextResponse.json(
      { error: 'Failed to ensure user profile' }, 
      { status: 500 }
    )
  }
} 