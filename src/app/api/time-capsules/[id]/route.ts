/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { TimeCapsuleService } from '../../../../lib/services/time-capsule'
import { ensureProfileMiddleware } from '../../../../lib/middleware/ensure-profile'

export async function GET(_request: NextRequest,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await ensureProfileMiddleware()
    const { id } = await params
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    const timeCapsule = await timeCapsuleService.getTimeCapsule(id)
    
    if (!timeCapsule) {
      return NextResponse.json(
        { error: 'Time capsule not found' }, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { status: 404 }
      )
    }
    
    return NextResponse.json(timeCapsule)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error fetching time capsule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time capsule' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
}

export async function PUT(_request: NextRequest,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await ensureProfileMiddleware()
    const { id } = await params
    
    const data = await _request.json()
    const { name, description } = data
    
    const updates: { name?: string; description?: string } = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' }, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { status: 400 }
      )
    }
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    const timeCapsule = await timeCapsuleService.updateTimeCapsule(id, updates)
    
    return NextResponse.json(timeCapsule)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error updating time capsule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update time capsule' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await ensureProfileMiddleware()
    const { id } = await params
    
    const timeCapsuleService = new TimeCapsuleService(userId)
    await timeCapsuleService.deleteTimeCapsule(id)
    
    return NextResponse.json({ _message: 'Time capsule deleted successfully' })
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error deleting time capsule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete time capsule' }, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    )
  }
} 