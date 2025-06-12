/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { TimeCapsuleService } from '../../../lib/services/time-capsule'
import { ensureProfileMiddleware } from '../../../lib/middleware/ensure-profile'

export async function GET() {
  try {
    const { userId } = await ensureProfileMiddleware()
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    const timeCapsules = await timeCapsuleService.getTimeCapsules()
    
    return NextResponse.json(timeCapsules)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error fetching time capsules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time capsules' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  try {
    const { userId } = await ensureProfileMiddleware()
    
    const data = await request.json()
    const { name, description, includeArchived, includeFolders } = data
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' }, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { status: 400 }
      )
    }
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    const timeCapsule = await timeCapsuleService.createTimeCapsule({
      name,
      description,
      _includeArchived: includeArchived || false,
      includeFolders: includeFolders || []
    })
    
    return NextResponse.json(timeCapsule)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error creating time capsule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create time capsule' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
} 