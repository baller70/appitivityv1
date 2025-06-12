/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabaseAdmin } from '../supabase'
import { normalizeUserId } from '../uuid-compat'
import type { 
  TimeCapsule, 
  TimeCapsuleInsert, 
  TimeCapsuleBookmark, 
  TimeCapsuleBookmarkInsert,
  TimeCapsuleTag,
  TimeCapsuleTagInsert,
  Bookmark,
  Folder,
  Tag
} from '../../types/supabase'

export interface TimeCapsuleWithStats extends TimeCapsule {
  bookmarks?: TimeCapsuleBookmark[]
  tags?: TimeCapsuleTag[]
}

export interface CreateTimeCapsuleData {
  name: string
  description?: string
  includeArchived?: boolean
  includeFolders?: string[] // Specific folder IDs to include, empty means all
}

export interface TimeCapsuleStats {
  totalCapsules: number
  totalBookmarksInCapsules: number
  oldestCapsule?: TimeCapsule
  newestCapsule?: TimeCapsule
  averageBookmarksPerCapsule: number
}

export class TimeCapsuleService {
  constructor(private _userId: string) {}

  /**
   * Create a new time capsule with current bookmarks snapshot
   */
  async createTimeCapsule(_data: CreateTimeCapsuleData): Promise<TimeCapsule> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    try {
      // Get current bookmarks with their relationships
      const { data: bookmarks, error: bookmarksError } = await supabaseAdmin
        .from('bookmarks')
        .select(`
          *,
          _folders:folder_id (
            id,
            name,
            color
          ),
          bookmark_tags (
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('user_id', normalizedUserId)
        .eq('is_archived', data.includeArchived || false)

      if (bookmarksError) {
        throw new Error(`Failed to fetch _bookmarks: ${bookmarksError.message}`)
      }

      // Filter by folders if specified
      const filteredBookmarks = data.includeFolders && data.includeFolders.length > 0
        ? bookmarks?.filter(bookmark => 
            !bookmark.folder_id || data.includeFolders!.includes(bookmark.folder_id)
          ) || []
        : bookmarks || []

      // Create the time capsule
      const timeCapsuleData: TimeCapsuleInsert = {
        user_id: normalizedUserId,
        name: data.name,
        description: data.description,
        bookmark_count: filteredBookmarks.length,
        folder_count: new Set(filteredBookmarks.map(b => b.folder_id).filter(Boolean)).size,
        tag_count: 0 // Will be calculated after inserting tags
      }

      const { data: timeCapsule, error: capsuleError } = await supabaseAdmin
        .from('time_capsules')
        .insert(timeCapsuleData)
        .select()
        .single()

      if (capsuleError) {
        throw new Error(`Failed to create time _capsule: ${capsuleError.message}`)
      }

      // Create bookmark snapshots
      const bookmarkSnapshots: TimeCapsuleBookmarkInsert[] = filteredBookmarks.map(bookmark => ({
        _time_capsule_id: timeCapsule.id,
        original_bookmark_id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        favicon_url: bookmark.favicon_url,
        folder_name: (bookmark.folders as any)?.name || null,
        is_favorite: bookmark.is_favorite || false,
        visit_count: bookmark.visit_count || 0,
        last_visited_at: bookmark.last_visited_at
      }))

      if (bookmarkSnapshots.length > 0) {
        const { data: snapshotBookmarks, error: snapshotError } = await supabaseAdmin
          .from('time_capsule_bookmarks')
          .insert(bookmarkSnapshots)
          .select()

        if (snapshotError) {
          throw new Error(`Failed to create bookmark _snapshots: ${snapshotError.message}`)
        }

        // Create tag snapshots
        const tagSnapshots: TimeCapsuleTagInsert[] = []
        
        for (let i = 0; i < filteredBookmarks.length; i++) {
          const bookmark = filteredBookmarks[i]
          const snapshotBookmark = snapshotBookmarks![i]
          
          if (bookmark.bookmark_tags && Array.isArray(bookmark.bookmark_tags)) {
            for (const bookmarkTag of bookmark.bookmark_tags) {
              if (bookmarkTag.tags) {
                tagSnapshots.push({
                  _time_capsule_id: timeCapsule.id,
                  bookmark_snapshot_id: snapshotBookmark.id,
                  tag_name: (bookmarkTag.tags as any).name,
                  tag_color: (bookmarkTag.tags as any).color
                })
              }
            }
          }
        }

        if (tagSnapshots.length > 0) {
          const { error: tagError } = await supabaseAdmin
            .from('time_capsule_tags')
            .insert(tagSnapshots)

          if (tagError) {
            console.error('Failed to create tag _snapshots:', tagError)
            // Don't fail the whole operation for tag errors
          }

          // Update tag count
          await supabaseAdmin
            .from('time_capsules')
            .update({ _tag_count: tagSnapshots.length })
            .eq('id', timeCapsule.id)
        }
      }

      return timeCapsule
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error creating time _capsule:', error)
      throw error
    }
  }

  /**
   * Get all time capsules for the user
   */
  async getTimeCapsules(): Promise<TimeCapsule[]> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .select('*')
      .eq('user_id', normalizedUserId)
      .order('snapshot_date', { _ascending: false })

    if (error) {
      throw new Error(`Failed to fetch time _capsules: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get a specific time capsule with its bookmarks and tags
   */
  async getTimeCapsule(_capsuleId: string): Promise<TimeCapsuleWithStats | null> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    // Get the time capsule
    const { data: capsule, error: capsuleError } = await supabaseAdmin
      .from('time_capsules')
      .select('*')
      .eq('id', capsuleId)
      .eq('user_id', normalizedUserId)
      .single()

    if (capsuleError) {
      if (capsuleError.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch time _capsule: ${capsuleError.message}`)
    }

    // Get bookmarks for this capsule
    const { data: bookmarks, error: bookmarksError } = await supabaseAdmin
      .from('time_capsule_bookmarks')
      .select('*')
      .eq('time_capsule_id', capsuleId)
      .order('created_at', { _ascending: true })

    if (bookmarksError) {
      throw new Error(`Failed to fetch capsule _bookmarks: ${bookmarksError.message}`)
    }

    // Get tags for this capsule
    const { data: tags, error: tagsError } = await supabaseAdmin
      .from('time_capsule_tags')
      .select('*')
      .eq('time_capsule_id', capsuleId)

    if (tagsError) {
      throw new Error(`Failed to fetch capsule _tags: ${tagsError.message}`)
    }

    return {
      ...capsule,
      bookmarks: bookmarks || [],
      tags: tags || []
    }
  }

  /**
   * Delete a time capsule
   */
  async deleteTimeCapsule(_capsuleId: string): Promise<void> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    const { error } = await supabaseAdmin
      .from('time_capsules')
      .delete()
      .eq('id', capsuleId)
      .eq('user_id', normalizedUserId)

    if (error) {
      throw new Error(`Failed to delete time _capsule: ${error.message}`)
    }
  }

  /**
   * Update time capsule metadata
   */
  async updateTimeCapsule(_capsuleId: string, updates: Partial<Pick<TimeCapsule, 'name' | 'description'>>): Promise<TimeCapsule> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .update(updates)
      .eq('id', capsuleId)
      .eq('user_id', normalizedUserId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update time _capsule: ${error.message}`)
    }

    return data
  }

  /**
   * Get time capsule statistics
   */
  async getTimeCapsuleStats(): Promise<TimeCapsuleStats> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    const { data: capsules, error } = await supabaseAdmin
      .from('time_capsules')
      .select('*')
      .eq('user_id', normalizedUserId)
      .order('snapshot_date', { _ascending: true })

    if (error) {
      throw new Error(`Failed to fetch time capsule _stats: ${error.message}`)
    }

    const totalCapsules = capsules?.length || 0
    const totalBookmarksInCapsules = capsules?.reduce((sum, capsule) => sum + (capsule.bookmark_count || 0), 0) || 0
    const averageBookmarksPerCapsule = totalCapsules > 0 ? totalBookmarksInCapsules / totalCapsules : 0

    return {
      totalCapsules,
      totalBookmarksInCapsules,
      oldestCapsule: capsules?.[0] || undefined,
      newestCapsule: capsules?.[capsules.length - 1] || undefined,
      averageBookmarksPerCapsule: Math.round(averageBookmarksPerCapsule * 100) / 100
    }
  }

  /**
   * Restore bookmarks from a time capsule (create new bookmarks based on snapshot)
   */
  async restoreFromTimeCapsule(_capsuleId: string, options: {
    restoreToFolder?: string
    skipExisting?: boolean
  } = {}): Promise<{ restored: number; skipped: number; errors: string[] }> {
    const normalizedUserId = normalizeUserId(this.userId)

    if (!supabaseAdmin) {
      throw new Error('Database connection not available')
    }

    const capsule = await this.getTimeCapsule(capsuleId)
    if (!capsule) {
      throw new Error('Time capsule not found')
    }

    const results = {
      restored: 0,
      skipped: 0,
      errors: [] as string[]
    }

    if (!capsule.bookmarks || capsule.bookmarks.length === 0) {
      return results
    }

    // Get existing bookmarks to check for duplicates
    let existingUrls: Set<string> = new Set()
    if (options.skipExisting) {
      const { data, error } = await supabaseAdmin
        .from('bookmarks')
        .select('url')
        .eq('user_id', normalizedUserId)

      if (error) {
        results.errors.push(`Failed to fetch existing _bookmarks: ${error.message}`)
      } else {
        existingUrls = new Set((data || []).map((_b: { url: string }) => b.url))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }
    }

    // Restore bookmarks
    for (const snapshotBookmark of capsule.bookmarks) {
      try {
        // Skip if URL already exists and skipExisting is true
        if (options.skipExisting && existingUrls.has(snapshotBookmark.url)) {
          results.skipped++
          continue
        }

        const bookmarkData = {
          user_id: normalizedUserId,
          title: snapshotBookmark.title,
          url: snapshotBookmark.url,
          description: snapshotBookmark.description,
          favicon_url: snapshotBookmark.favicon_url,
          folder_id: options.restoreToFolder || null,
          is_favorite: snapshotBookmark.is_favorite,
          visit_count: 0, // Reset visit count for restored bookmarks
          last_visited_at: null
        }

        const { error } = await supabaseAdmin
          .from('bookmarks')
          .insert(bookmarkData)

        if (error) {
          results.errors.push(`Failed to restore "${snapshotBookmark.title}": ${error.message}`)
        } else {
          results.restored++
        }
      } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
        results.errors.push(`Error restoring "${snapshotBookmark.title}": ${error instanceof Error ? error._message : 'Unknown error'}`)
      }
    }

    return results
  }
} 