import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { FolderService } from '../../../lib/services/folders'
import { ensureUserProfile } from '../../../lib/fix-database'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    // Get the actual profile ID if user exists
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    const folderService = new FolderService(actualUserId)
    const folders = await folderService.getFolders()
    
    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    // Ensure user profile exists before creating folder
    let actualUserId = effectiveUserId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      console.log('Calling ensureUserProfile with:', { effectiveUserId, email, fullName })
      const profileResult = await ensureUserProfile(effectiveUserId, email, fullName)
      console.log('ensureUserProfile result:', profileResult)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      // Use the actual profile ID from the database
      if (profileResult.userId) {
        actualUserId = profileResult.userId
        console.log('Using actual profile ID for folder creation:', actualUserId)
      }
    }

    const data = await request.json()
    
    // Only include basic folder fields that exist in the database schema
    const folderData = {
      name: data.name,
      description: data.description,
      color: data.color,
      parent_id: data.parent_id || null
    }
    
    const folderService = new FolderService(actualUserId)
    const folder = await folderService.createFolder(folderData)
    
    return NextResponse.json(folder)
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' }, 
      { status: 500 }
    )
  }
} 