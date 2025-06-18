import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    return NextResponse.json({
      authenticated: !!userId,
      userId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
      userName: user?.firstName || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      error: 'Auth test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 