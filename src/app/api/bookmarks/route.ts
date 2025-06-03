import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '../../../lib/services/bookmarks'
import { supabaseAdmin } from '../../../lib/supabase'
import { normalizeUserId } from '../../../lib/uuid-compat'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarkService = new BookmarkService(userId)
    const bookmarks = await bookmarkService.getBookmarks()
    
    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const normalizedUserId = normalizeUserId(userId)
    
    // Extract tagIds from data since it's not a bookmarks table column
    const { tagIds, ...bookmarkData } = data
    
    // Use direct database insert with admin client to bypass RLS
    const { data: bookmark, error } = await supabaseAdmin
      .from('bookmarks')
      .insert({
        ...bookmarkData,
        user_id: normalizedUserId
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to create bookmark: ${error.message}` }, 
        { status: 500 }
      )
    }

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const bookmarkTags = tagIds.map((tagId: string) => ({
        bookmark_id: bookmark.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabaseAdmin
        .from('bookmark_tags')
        .insert(bookmarkTags)

      if (tagError) {
        console.error('Tag error:', tagError)
        // Don't fail the whole operation for tag errors
      }
    }
    
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to create bookmark' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    const normalizedUserId = normalizeUserId(userId)
    
    // Update bookmark using admin client to bypass RLS
    const { data: bookmark, error } = await supabaseAdmin
      .from('bookmarks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', normalizedUserId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to update bookmark: ${error.message}` }, 
        { status: 500 }
      )
    }

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }
    
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to update bookmark' }, 
      { status: 500 }
    )
  }
} 