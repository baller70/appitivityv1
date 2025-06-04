import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { FolderService } from '../../../lib/services/folders'

export async function GET() {
  try {
    const { userId } = await auth()
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const folderService = new FolderService(effectiveUserId)
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
    
    // Handle both authenticated users and demo mode
    const effectiveUserId = userId || 'demo-user'
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'No user session' }, { status: 401 })
    }

    const data = await request.json()
    const folderService = new FolderService(effectiveUserId)
    const folder = await folderService.createFolder(data)
    
    return NextResponse.json(folder)
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' }, 
      { status: 500 }
    )
  }
} 