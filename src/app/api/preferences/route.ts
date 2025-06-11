import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  view_mode: 'grid' | 'list' | 'kanban'
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // FIXME: user_preferences table doesn't exist, return defaults
    const preferences = { theme: 'system', view_mode: 'grid' }
    
    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Preferences GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: Partial<UserPreferences> = await request.json()
    
    // Validate input
    if (body.theme && !['light', 'dark', 'system'].includes(body.theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }
    
    if (body.view_mode && !['grid', 'list', 'kanban'].includes(body.view_mode)) {
      return NextResponse.json({ error: 'Invalid view_mode value' }, { status: 400 })
    }

    // FIXME: user_preferences table doesn't exist, return the body as saved
    return NextResponse.json(body)
  } catch (error) {
    console.error('Preferences POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 