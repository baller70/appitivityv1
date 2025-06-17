import { NextResponse } from 'next/server'
import { ensureUserProfile } from '../../../lib/fix-database'
import { normalizeUserId } from '../../../lib/uuid-compat'

export async function GET() {
  try {
    console.log('Debug Profile - Starting')
    
    const originalUserId = 'demo-user'
    const normalizedUserId = normalizeUserId(originalUserId)
    const email = 'user@example.com'
    const fullName = 'User'
    
    console.log('Debug Profile - Input:')
    console.log('- Original User ID:', originalUserId)
    console.log('- Normalized User ID:', normalizedUserId)
    console.log('- Email:', email)
    console.log('- Full Name:', fullName)
    
    const profileResult = await ensureUserProfile(originalUserId, email, fullName)
    
    console.log('Debug Profile - Result:', profileResult)
    
    return NextResponse.json({
      input: {
        originalUserId,
        normalizedUserId,
        email,
        fullName
      },
      result: profileResult
    })
  } catch (error) {
    console.error('Debug Profile - Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
} 