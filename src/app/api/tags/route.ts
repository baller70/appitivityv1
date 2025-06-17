import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { TagServiceLite } from '../../../lib/services/tags-lite'
import { ensureUserProfile } from '../../../lib/fix-database'

export async function GET() {
  try {
    const { userId } = await auth()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    // Ensure user profile exists and get the database user ID
    const email = 'user@example.com' // Default email for demo mode
    const fullName = 'User' // Default name for demo mode
    const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
    
    if (!profileResult.success || !profileResult.userId) {
      return NextResponse.json({ error: 'Failed to ensure user profile' }, { status: 500 })
    }
    
    const tagService = new TagServiceLite(profileResult.userId)
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
    console.log('Tags API POST - Starting request')
    
    const { userId } = await auth()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    console.log('Tags API POST - Raw userId:', userId)
    console.log('Tags API POST - Effective userId:', effectiveUserId)
    
    if (!effectiveUserId) {
      console.log('Tags API POST - No effective user ID')
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    console.log('Tags API POST - Calling ensureUserProfile')
    
    // Ensure user profile exists and get the database user ID
    const email = 'user@example.com' // Default email for demo mode
    const fullName = 'User' // Default name for demo mode
    const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)

    console.log('Tags API POST - Profile result:', profileResult)

    if (!profileResult.success || !profileResult.userId) {
      console.log('Tags API POST - Profile creation failed')
      return NextResponse.json({ error: 'Failed to ensure user profile' }, { status: 500 })
    }

    console.log('Tags API POST - Using database userId:', profileResult.userId)

    const data = await request.json()
    console.log('Tags API POST - Tag data:', data)
    
    console.log('Tags API POST - Creating TagServiceLite')
    const tagService = new TagServiceLite(profileResult.userId)
    
    console.log('Tags API POST - Calling createTag')
    const tag = await tagService.createTag(data)
    
    console.log('Tags API POST - Created tag:', tag)
    
    return NextResponse.json(tag)
  } catch (error) {
    console.error('Tags API POST - Error:', error)
    console.error('Tags API POST - Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to create tag' }, 
      { status: 500 }
    )
  }
} 