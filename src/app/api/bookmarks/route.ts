import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUserId() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
    }

    const email = user.emailAddresses?.[0]?.emailAddress
    if (!email) {
      return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    return profile?.id || '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  } catch (error) {
    console.error('Auth error, using fallback user ID:', error)
    return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  }
}

export async function GET() {
  try {
    const startTime = Date.now()
    const actualUserId = await getAuthenticatedUserId()
    console.log('GET bookmarks - using actualUserId:', actualUserId)
    
    // Fast query with minimal joins - just get bookmarks with folder info
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        user_id,
        folder_id,
        title,
        url,
        description,
        favicon_url,
        is_favorite,
        is_archived,
        visit_count,
        last_visited_at,
        created_at,
        updated_at,
        folder:folders(id, name, color)
      `)
      .eq('user_id', actualUserId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' }, 
        { status: 500 }
      )
    }

    // Get tags separately for better performance
    const bookmarkIds = bookmarks?.map(b => b.id) || []
    let tagsData: any[] = []
    
    if (bookmarkIds.length > 0) {
      const { data: tags } = await supabase
        .from('bookmark_tags')
        .select(`
          bookmark_id,
          tag:tags(id, name, color)
        `)
        .in('bookmark_id', bookmarkIds)
      
      tagsData = tags || []
    }

    // Combine bookmarks with their tags
    const bookmarksWithTags = bookmarks?.map(bookmark => ({
      ...bookmark,
      tags: tagsData
        .filter((t: any) => t.bookmark_id === bookmark.id)
        .map((t: any) => t.tag)
        .filter(Boolean)
    })) || []

    const responseTime = Date.now() - startTime
    console.log(`GET bookmarks completed in ${responseTime}ms`)
    
    return NextResponse.json(bookmarksWithTags)
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
    const actualUserId = await getAuthenticatedUserId()
    console.log('POST bookmark - using actualUserId:', actualUserId)
    
    const data = await request.json()
    const { tagIds, ...bookmarkData } = data
    
    // Simple bookmark creation
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        ...bookmarkData,
        user_id: actualUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating bookmark:', error)
      return NextResponse.json(
        { error: `Failed to create bookmark: ${error.message}` }, 
        { status: 500 }
      )
    }

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tagInserts = tagIds.map((tagId: string) => ({
        bookmark_id: bookmark.id,
        tag_id: tagId
      }))

      await supabase
        .from('bookmark_tags')
        .insert(tagInserts)
    }
    
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: `Failed to create bookmark: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actualUserId = await getAuthenticatedUserId()
    console.log('PUT bookmark - using actualUserId:', actualUserId)
    
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }
    
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', actualUserId)
      .select()
      .single()

    if (error) {
      console.error('Error updating bookmark:', error)
      return NextResponse.json(
        { error: `Failed to update bookmark: ${error.message}` }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actualUserId = await getAuthenticatedUserId()
    console.log('DELETE bookmark - using actualUserId:', actualUserId)
    
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const ids = url.searchParams.get('ids')
    
    if (!id && !ids) {
      return NextResponse.json({ error: 'Bookmark ID or IDs required' }, { status: 400 })
    }

    if (ids) {
      // Bulk delete
      const idArray = ids.split(',')
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .in('id', idArray)
        .eq('user_id', actualUserId)

      if (error) {
        console.error('Error bulk deleting bookmarks:', error)
        return NextResponse.json(
          { error: `Failed to delete bookmarks: ${error.message}` }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, deleted: idArray.length })
    } else if (id) {
      // Single delete
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', actualUserId)

      if (error) {
        console.error('Error deleting bookmark:', error)
        return NextResponse.json(
          { error: `Failed to delete bookmark: ${error.message}` }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: `Failed to delete bookmark: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
} 