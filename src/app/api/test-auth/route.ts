import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    return NextResponse.json({
      success: true,
      userId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      userName: user?.firstName,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 