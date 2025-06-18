import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { TagService } from '../../../lib/services/tags'

export async function GET() {
  try {
    const { userId } = await auth()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const tagService = new TagService(effectiveUserId)
    const tags = await tagService.getTags()
    
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const data = await request.json()
    const tagService = new TagService(effectiveUserId)
    const tag = await tagService.createTag(data)
    
    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' }, 
      { status: 500 }
    )
  }
} 