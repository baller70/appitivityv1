// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function GET() {
  try {
    // Get all bookmarks with user info
    const { data: bookmarks, error: bookmarksError } = await supabaseAdmin
      .from('bookmarks')
      .select('id, user_id, title, url, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (bookmarksError) {
      throw bookmarksError
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, clerk_user_id')

    if (profilesError) {
      throw profilesError
    }

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks || [],
      profiles: profiles || [],
      bookmarkCount: bookmarks?.length || 0,
      profileCount: profiles?.length || 0
    })
  } catch (error) {
    console.error('Debug bookmarks error:', error)
    return NextResponse.json(
      { error: 'Failed to debug bookmarks' },
      { status: 500 }
    )
  }
} 