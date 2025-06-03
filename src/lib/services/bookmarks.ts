import { createSupabaseClient } from '../supabase'
import { normalizeUserId } from '../uuid-compat'
import type { 
  Bookmark, 
  BookmarkInsert, 
  BookmarkUpdate,
  Folder,
  Tag 
} from '../../types/supabase'

// Bookmark with related data
export interface BookmarkWithRelations extends Bookmark {
  folder?: Folder | null
  tags?: Tag[]
}

export class BookmarkService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = normalizeUserId(userId)
    this.supabase = createSupabaseClient(this.userId)
  }

  // Get all bookmarks for the current user
  async getBookmarks(options?: {
    folderId?: string
    isArchived?: boolean
    isFavorite?: boolean
    limit?: number
    offset?: number
  }): Promise<BookmarkWithRelations[]> {
    let query = this.supabase
      .from('bookmarks')
      .select(`
        *,
        folder:folders(*),
        tags:bookmark_tags(tag:tags(*))
      `)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (options?.folderId) {
      query = query.eq('folder_id', options.folderId)
    }
    if (options?.isArchived !== undefined) {
      query = query.eq('is_archived', options.isArchived)
    }
    if (options?.isFavorite !== undefined) {
      query = query.eq('is_favorite', options.isFavorite)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`)
    }

    // Transform the data to include tags properly
    return data?.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags?.map((bt: { tag: Tag }) => bt.tag).filter(Boolean) || []
    })) || []
  }

  // Get a single bookmark by ID
  async getBookmark(id: string): Promise<BookmarkWithRelations | null> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(`
        *,
        folder:folders(*),
        tags:bookmark_tags(tag:tags(*))
      `)
      .eq('id', id)
      .eq('user_id', this.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch bookmark: ${error.message}`)
    }

    return {
      ...data,
      tags: data.tags?.map((bt: { tag: Tag }) => bt.tag).filter(Boolean) || []
    }
  }

  // Create a new bookmark
  async createBookmark(bookmark: Omit<BookmarkInsert, 'user_id'>, tagIds?: string[]): Promise<Bookmark> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .insert({
        ...bookmark,
        user_id: this.userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create bookmark: ${error.message}`)
    }

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await this.addTagsToBookmark(data.id, tagIds)
    }

    return data
  }

  // Update a bookmark
  async updateBookmark(id: string, updates: BookmarkUpdate): Promise<Bookmark> {
    const response = await fetch('/api/bookmarks', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for Clerk authentication
      body: JSON.stringify({
        id,
        ...updates
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update bookmark')
    }

    return response.json()
  }

  // Delete a bookmark
  async deleteBookmark(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete bookmark: ${error.message}`)
    }
  }

  // Add tags to a bookmark
  async addTagsToBookmark(bookmarkId: string, tagIds: string[]): Promise<void> {
    const bookmarkTags = tagIds.map(tagId => ({
      bookmark_id: bookmarkId,
      tag_id: tagId
    }))

    const { error } = await this.supabase
      .from('bookmark_tags')
      .insert(bookmarkTags)

    if (error) {
      throw new Error(`Failed to add tags to bookmark: ${error.message}`)
    }
  }

  // Remove tags from a bookmark
  async removeTagsFromBookmark(bookmarkId: string, tagIds?: string[]): Promise<void> {
    let query = this.supabase
      .from('bookmark_tags')
      .delete()
      .eq('bookmark_id', bookmarkId)

    if (tagIds) {
      query = query.in('tag_id', tagIds)
    }

    const { error } = await query

    if (error) {
      throw new Error(`Failed to remove tags from bookmark: ${error.message}`)
    }
  }

  // Search bookmarks
  async searchBookmarks(searchTerm: string): Promise<BookmarkWithRelations[]> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(`
        *,
        folder:folders(*),
        tags:bookmark_tags(tag:tags(*))
      `)
      .eq('user_id', this.userId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,url.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search bookmarks: ${error.message}`)
    }

    return data?.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags?.map((bt: { tag: Tag }) => bt.tag).filter(Boolean) || []
    })) || []
  }

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<Bookmark> {
    // First get the current status
    const bookmark = await this.getBookmark(id)
    if (!bookmark) {
      throw new Error('Bookmark not found')
    }

    return this.updateBookmark(id, {
      is_favorite: !bookmark.is_favorite
    })
  }

  // Toggle archive status
  async toggleArchive(id: string): Promise<Bookmark> {
    // First get the current status
    const bookmark = await this.getBookmark(id)
    if (!bookmark) {
      throw new Error('Bookmark not found')
    }

    return this.updateBookmark(id, {
      is_archived: !bookmark.is_archived
    })
  }

  // Bulk operations
  async bulkUpdate(ids: string[], updates: BookmarkUpdate): Promise<void> {
    // For bulk operations, we'll update each bookmark individually using the API
    // This ensures consistency with RLS and error handling
    const updatePromises = ids.map(id => this.updateBookmark(id, updates))
    
    try {
      await Promise.all(updatePromises)
    } catch (error) {
      throw new Error(`Failed to bulk update bookmarks: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('bookmarks')
      .delete()
      .in('id', ids)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to bulk delete bookmarks: ${error.message}`)
    }
  }
} 