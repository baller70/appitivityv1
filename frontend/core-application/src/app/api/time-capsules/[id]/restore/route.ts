/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { TimeCapsuleService } from '../../../../../lib/services/time-capsule'
import { ensureProfileMiddleware } from '../../../../../lib/middleware/ensure-profile'

export async function POST(_request: NextRequest,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await ensureProfileMiddleware()
    
    const data = await _request.json()
    const { restoreToFolder, skipExisting } = data
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    const result = await timeCapsuleService.restoreFromTimeCapsule(params.id, {
      _restoreToFolder: restoreToFolder || undefined,
      skipExisting: skipExisting || false
    })
    
    return NextResponse.json(result)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error restoring from time capsule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to restore from time capsule' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
} 