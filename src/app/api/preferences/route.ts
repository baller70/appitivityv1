import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'
import { normalizeUserId } from '../../../lib/uuid-compat'

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

    const normalizedUserId = normalizeUserId(userId)

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('theme, view_mode')
      .eq('user_id', normalizedUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Return default preferences if none exist
    const preferences = data || { theme: 'system', view_mode: 'grid' }
    
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

    const normalizedUserId = normalizeUserId(userId)
    const body: Partial<UserPreferences> = await request.json()
    
    // Validate input
    if (body.theme && !['light', 'dark', 'system'].includes(body.theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }
    
    if (body.view_mode && !['grid', 'list', 'kanban'].includes(body.view_mode)) {
      return NextResponse.json({ error: 'Invalid view_mode value' }, { status: 400 })
    }

    // Upsert preferences
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: normalizedUserId,
        ...body,
        updated_at: new Date().toISOString()
      })
      .select('theme, view_mode')
      .single()

    if (error) {
      console.error('Error updating preferences:', error)
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Preferences POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 