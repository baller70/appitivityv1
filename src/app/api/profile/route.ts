import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../../../lib/fix-database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, fullName } = await request.json()
    const success = await ensureUserProfile(userId, email, fullName)
    
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