/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import { TimeCapsuleService } from '../../../../lib/services/time-capsule'
import { ensureProfileMiddleware } from '../../../../lib/middleware/ensure-profile'

export async function GET() {
  try {
    const { userId } = await ensureProfileMiddleware()
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    const stats = await timeCapsuleService.getTimeCapsuleStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error fetching time capsule stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time capsule stats' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
} 