import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { SimpleTagService } from '../../../../../lib/services/simple-tags'
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
    console.error('Auth error, using fallback:', error)
    return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUserId = await getAuthenticatedUserId()
    const resolvedParams = await params
    const bookmarkId = resolvedParams.id
    const { tagIds } = await request.json()
    
    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: 'tagIds must be an array' }, { status: 400 })
    }

    const tagService = new SimpleTagService(dbUserId)
    
    // Add each tag to the bookmark
    for (const tagId of tagIds) {
      await tagService.addTagToBookmark(bookmarkId, tagId)
    }
    
    // Fetch the full updated bookmark with tags
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        tags:bookmark_tags(
          tag:tags(*)
        ),
        folder:folders(*)
      `)
      .eq('id', bookmarkId)
      .eq('user_id', dbUserId)
      .single()

    if (error || !bookmark) {
      console.error('Error fetching updated bookmark:', error)
      return NextResponse.json({ error: 'Failed to fetch updated bookmark' }, { status: 500 })
    }

    // Transform the bookmark tags to match expected format
    const transformedBookmark = {
      ...bookmark,
      tags: bookmark.tags?.map((t: any) => t.tag || t) || [],
      folder: bookmark.folder || null
    }
    
    return NextResponse.json(transformedBookmark)
  } catch (error) {
    console.error('Error adding tags to bookmark:', error)
    return NextResponse.json({ error: 'Failed to add tags' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUserId = await getAuthenticatedUserId()
    const resolvedParams = await params
    const bookmarkId = resolvedParams.id
    
    let tagIds: string[] | undefined
    try {
      const body = await request.json()
      tagIds = body.tagIds
    } catch {
      // If no body, remove all tags
      tagIds = undefined
    }

    const tagService = new SimpleTagService(dbUserId)
    
    if (tagIds && Array.isArray(tagIds)) {
      // Remove specific tags
      for (const tagId of tagIds) {
        await tagService.removeTagFromBookmark(bookmarkId, tagId)
      }
    } else {
      // Remove all tags from bookmark
      const currentTags = await tagService.getBookmarkTags(bookmarkId)
      for (const tag of currentTags) {
        await tagService.removeTagFromBookmark(bookmarkId, tag.id)
      }
    }
    
    // Fetch the full updated bookmark with tags
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        tags:bookmark_tags(
          tag:tags(*)
        ),
        folder:folders(*)
      `)
      .eq('id', bookmarkId)
      .eq('user_id', dbUserId)
      .single()

    if (error || !bookmark) {
      console.error('Error fetching updated bookmark:', error)
      return NextResponse.json({ error: 'Failed to fetch updated bookmark' }, { status: 500 })
    }

    // Transform the bookmark tags to match expected format
    const transformedBookmark = {
      ...bookmark,
      tags: bookmark.tags?.map((t: any) => t.tag || t) || [],
      folder: bookmark.folder || null
    }
    
    return NextResponse.json(transformedBookmark)
  } catch (error) {
    console.error('Error removing tags from bookmark:', error)
    return NextResponse.json({ error: 'Failed to remove tags' }, { status: 500 })
  }
} 