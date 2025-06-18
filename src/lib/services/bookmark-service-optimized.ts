import { supabaseAdmin, supabase, createSupabaseClient } from '../supabase'
import { normalizeUserId } from '../uuid-compat'
import type { 
  Bookmark, 
  BookmarkInsert, 
  BookmarkUpdate,
  Folder,
  Tag
} from '../../types/supabase'

// Optimized bookmark with relations using new indexes
export interface OptimizedBookmarkWithRelations extends Bookmark {
  folder?: Folder | null
  tags?: Tag[]
  preview_image?: string | null
  deadline_date?: string | null
  goal_description?: string | null
  goal_type?: string | null
  goal_status?: string | null
  goal_priority?: string | null
  goal_progress?: number | null
  goal_notes?: string | null
  goal_created_at?: string | null
  goal_completed_at?: string | null
  reminder_at?: string | null
}

// User statistics from materialized view
export interface UserBookmarkStats {
  user_id: string
  total_bookmarks: number
  favorite_count: number
  archived_count: number
  recent_bookmarks: number
  total_visits: number
  last_bookmark_added: string
  avg_visits_per_bookmark: number
}

export class OptimizedBookmarkService {
  private supabase
  private userId: string
  private originalUserId: string

  constructor(userId: string) {
    this.originalUserId = userId
    this.userId = userId.startsWith('user_') ? normalizeUserId(userId) : userId
    
    const isServer = typeof window === 'undefined'
    if (isServer && supabaseAdmin) {
      this.supabase = supabaseAdmin
    } else {
      this.supabase = createSupabaseClient(this.userId)
    }
    
    console.log('OptimizedBookmarkService initialized for user:', {
      original: this.originalUserId,
      normalized: this.userId,
      environment: isServer ? 'server' : 'client'
    })
  }

  // ============================================================================
  // OPTIMIZED QUERY METHODS USING NEW INDEXES
  // ============================================================================

  /**
   * Get bookmarks with optimized query using new composite indexes
   * Uses idx_bookmarks_user_created_desc for fast sorting
   */
  async getBookmarksOptimized(options?: {
    folderId?: string
    isArchived?: boolean
    isFavorite?: boolean
    limit?: number
    offset?: number
  }): Promise<OptimizedBookmarkWithRelations[]> {
    console.log('Fetching optimized bookmarks for user:', this.userId)
    
    // Use optimized query with proper index utilization
    let query = this.supabase
      .from('bookmarks')
      .select(`
        id,
        title,
        url,
        description,
        favicon_url,
        screenshot_url,
        is_favorite,
        is_archived,
        visit_count,
        last_visited_at,
        created_at,
        updated_at,
        user_id,
        folder_id,
        deadline_date,
        goal_description,
        goal_type,
        goal_status,
        goal_priority,
        goal_progress,
        goal_notes,
        goal_created_at,
        goal_completed_at,
        folder:folders(id, name, color),
        tags:bookmark_tags(tag:tags(id, name, color))
      `)
      .eq('user_id', this.userId)

    // Apply filters to use specific indexes
    if (options?.folderId) {
      query = query.eq('folder_id', options.folderId)
    }
    if (options?.isArchived !== undefined) {
      query = query.eq('is_archived', options.isArchived)
    }
    if (options?.isFavorite !== undefined) {
      query = query.eq('is_favorite', options.isFavorite)
    }

    // Use the optimized index for ordering
    query = query.order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching optimized bookmarks:', error)
      throw new Error(`Failed to fetch bookmarks: ${error.message}`)
    }

    console.log(`Found ${data?.length || 0} bookmarks for user (optimized query)`)
    
    // Transform the data to include tags properly
    return data?.map(bookmark => ({
      ...bookmark,
      tags: (bookmark.tags as any[] ?? []).map(t => t.tag || t).filter(Boolean),
      reminder_at: (bookmark as any).reminder_at || null
    })) || []
  }

  /**
   * Fast search using full-text search vector and GIN index
   * Uses idx_bookmarks_search_gin for lightning-fast text search
   */
  async searchBookmarksOptimized(searchTerm: string, limit = 50): Promise<OptimizedBookmarkWithRelations[]> {
    console.log('Performing optimized search for:', searchTerm)
    
    if (!searchTerm.trim()) {
      return []
    }

    // Use full-text search with the new search_vector column and GIN index
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(`
        id,
        title,
        url,
        description,
        favicon_url,
        screenshot_url,
        is_favorite,
        is_archived,
        visit_count,
        last_visited_at,
        created_at,
        updated_at,
        user_id,
        folder_id,
        folder:folders(id, name, color),
        tags:bookmark_tags(tag:tags(id, name, color))
      `)
      .eq('user_id', this.userId)
      .textSearch('search_vector', searchTerm, {
        type: 'websearch',
        config: 'english'
      })
      .limit(limit)

    if (error) {
      console.error('Error in optimized search:', error)
      throw new Error(`Search failed: ${error.message}`)
    }

    console.log(`Found ${data?.length || 0} search results (optimized)`)
    
    return data?.map(bookmark => ({
      ...bookmark,
      tags: (bookmark.tags as any[] ?? []).map(t => t.tag || t).filter(Boolean)
    })) || []
  }

  /**
   * Get user statistics from materialized view (instant performance)
   * Uses user_bookmark_stats materialized view for sub-millisecond response
   */
  async getUserStatsOptimized(): Promise<UserBookmarkStats | null> {
    console.log('Fetching optimized user stats for:', this.userId)
    
    const { data, error } = await this.supabase
      .from('user_bookmark_stats')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No stats found, user might not have bookmarks yet
        return null
      }
      console.error('Error fetching user stats:', error)
      throw new Error(`Failed to fetch user stats: ${error.message}`)
    }

    console.log('Retrieved optimized user stats')
    return data
  }

  /**
   * Get bookmark relationships using optimized composite index
   * Uses idx_bookmark_relationships_composite for fast relationship queries
   */
  async getBookmarkRelationshipsOptimized(bookmarkId: string): Promise<OptimizedBookmarkWithRelations[]> {
    console.log('Fetching optimized relationships for bookmark:', bookmarkId)
    
    const { data, error } = await this.supabase
      .from('bookmark_relationships')
      .select(`
        related_bookmark_id,
        relationship_type,
        related_bookmark:bookmarks!bookmark_relationships_related_bookmark_id_fkey(
          id,
          title,
          url,
          description,
          favicon_url,
          is_favorite,
          visit_count,
          created_at,
          folder:folders(id, name, color)
        )
      `)
      .eq('bookmark_id', bookmarkId)

    if (error) {
      console.error('Error fetching bookmark relationships:', error)
      throw new Error(`Failed to fetch relationships: ${error.message}`)
    }

    console.log(`Found ${data?.length || 0} relationships (optimized)`)
    
    return data?.map(rel => ({
      ...rel.related_bookmark,
      relationship_type: rel.relationship_type
    })) || []
  }

  /**
   * Bulk operations using optimized queries
   * Uses composite indexes for efficient bulk operations
   */
  async bulkUpdateOptimized(ids: string[], updates: BookmarkUpdate): Promise<void> {
    console.log(`Performing optimized bulk update for ${ids.length} bookmarks`)
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // Use IN clause with the user_id index for efficient bulk updates
    const { error } = await this.supabase
      .from('bookmarks')
      .update(updateData)
      .in('id', ids)
      .eq('user_id', this.userId)

    if (error) {
      console.error('Error in optimized bulk update:', error)
      throw new Error(`Bulk update failed: ${error.message}`)
    }

    console.log(`Successfully updated ${ids.length} bookmarks (optimized)`)
  }

  /**
   * Get favorites using optimized partial index
   * Uses idx_bookmarks_user_favorite_active for instant favorites lookup
   */
  async getFavoritesOptimized(limit = 50): Promise<OptimizedBookmarkWithRelations[]> {
    console.log('Fetching optimized favorites for user:', this.userId)
    
    // This query will use the optimized partial index for favorites
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(`
        id,
        title,
        url,
        description,
        favicon_url,
        is_favorite,
        visit_count,
        created_at,
        folder:folders(id, name, color),
        tags:bookmark_tags(tag:tags(id, name, color))
      `)
      .eq('user_id', this.userId)
      .eq('is_favorite', true)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching optimized favorites:', error)
      throw new Error(`Failed to fetch favorites: ${error.message}`)
    }

    console.log(`Found ${data?.length || 0} favorites (optimized)`)
    
    return data?.map(bookmark => ({
      ...bookmark,
      tags: (bookmark.tags as any[] ?? []).map(t => t.tag || t).filter(Boolean)
    })) || []
  }

  // ============================================================================
  // MAINTENANCE AND OPTIMIZATION METHODS
  // ============================================================================

  /**
   * Refresh user statistics manually
   * Triggers refresh of materialized view for this user
   */
  async refreshUserStats(): Promise<void> {
    console.log('Refreshing user stats for:', this.userId)
    
    const { error } = await this.supabase
      .rpc('refresh_user_bookmark_stats', { affected_user_id: this.userId })

    if (error) {
      console.error('Error refreshing user stats:', error)
      throw new Error(`Failed to refresh user stats: ${error.message}`)
    }

    console.log('User stats refreshed successfully')
  }

  /**
   * Update search vectors for user's bookmarks
   * Ensures full-text search is up-to-date
   */
  async updateSearchVectors(): Promise<void> {
    console.log('Updating search vectors for user:', this.userId)
    
    const { error } = await this.supabase
      .from('bookmarks')
      .update({
        // Trigger the search vector update
        updated_at: new Date().toISOString()
      })
      .eq('user_id', this.userId)
      .is('search_vector', null)

    if (error) {
      console.error('Error updating search vectors:', error)
      throw new Error(`Failed to update search vectors: ${error.message}`)
    }

    console.log('Search vectors updated successfully')
  }

  /**
   * Get performance metrics for monitoring
   */
  async getPerformanceMetrics(): Promise<{
    total_bookmarks: number
    indexed_bookmarks: number
    search_ready: boolean
    stats_available: boolean
  }> {
    console.log('Fetching performance metrics for user:', this.userId)
    
    // Check total bookmarks
    const { count: totalBookmarks } = await this.supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)

    // Check indexed bookmarks (with search vectors)
    const { count: indexedBookmarks } = await this.supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .not('search_vector', 'is', null)

    // Check if stats are available
    const { data: stats } = await this.supabase
      .from('user_bookmark_stats')
      .select('user_id')
      .eq('user_id', this.userId)
      .single()

    return {
      total_bookmarks: totalBookmarks || 0,
      indexed_bookmarks: indexedBookmarks || 0,
      search_ready: (indexedBookmarks || 0) === (totalBookmarks || 0),
      stats_available: !!stats
    }
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * Legacy method that now uses optimized implementation
   */
  async getBookmarks(options?: {
    folderId?: string
    isArchived?: boolean
    isFavorite?: boolean
    limit?: number
    offset?: number
  }): Promise<OptimizedBookmarkWithRelations[]> {
    return this.getBookmarksOptimized(options)
  }

  /**
   * Legacy search method that now uses optimized implementation
   */
  async searchBookmarks(searchTerm: string): Promise<OptimizedBookmarkWithRelations[]> {
    return this.searchBookmarksOptimized(searchTerm)
  }

  /**
   * Update a single bookmark using optimized bulk update
   */
  async updateBookmark(id: string, updates: BookmarkUpdate): Promise<OptimizedBookmarkWithRelations> {
    console.log('Updating bookmark:', id, 'for user:', this.userId)
    
    // Use the optimized bulk update for single bookmark
    await this.bulkUpdateOptimized([id], updates)
    
    // Fetch and return the updated bookmark
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(`
        id,
        title,
        url,
        description,
        favicon_url,
        screenshot_url,
        is_favorite,
        is_archived,
        visit_count,
        last_visited_at,
        created_at,
        updated_at,
        user_id,
        folder_id,
        deadline_date,
        goal_description,
        goal_type,
        goal_status,
        goal_priority,
        goal_progress,
        goal_notes,
        goal_created_at,
        goal_completed_at,
        folder:folders(id, name, color),
        tags:bookmark_tags(tag:tags(id, name, color))
      `)
      .eq('id', id)
      .eq('user_id', this.userId)
      .single()

    if (error) {
      console.error('Error fetching updated bookmark:', error)
      throw new Error(`Failed to fetch updated bookmark: ${error.message}`)
    }

    return {
      ...data,
      tags: (data.tags as any[] ?? []).map(t => t.tag || t).filter(Boolean),
      reminder_at: (data as any).reminder_at || null
    }
  }

  /**
   * Legacy method for creating bookmarks (unchanged but will benefit from triggers)
   */
  async createBookmark(bookmark: Omit<BookmarkInsert, 'user_id'>, tagIds?: string[]): Promise<Bookmark> {
    console.log('Creating bookmark for user:', this.userId)
    
    const bookmarkData = {
      ...bookmark,
      user_id: this.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('bookmarks')
      .insert(bookmarkData)
      .select()
      .single()

    if (error) {
      console.error('Error creating bookmark:', error)
      throw new Error(`Failed to create bookmark: ${error.message}`)
    }

    console.log('Successfully created bookmark:', data.id)

    // Add tags if provided (uses optimized composite index)
    if (tagIds && tagIds.length > 0) {
      await this.addTagsToBookmark(data.id, tagIds)
    }

    return data
  }

  /**
   * Add tags using optimized composite index
   */
  private async addTagsToBookmark(bookmarkId: string, tagIds: string[]): Promise<void> {
    const tagInserts = tagIds.map(tagId => ({
      bookmark_id: bookmarkId,
      tag_id: tagId,
      created_at: new Date().toISOString()
    }))

    const { error } = await this.supabase
      .from('bookmark_tags')
      .insert(tagInserts)

    if (error) {
      console.error('Error adding tags to bookmark:', error)
      throw new Error(`Failed to add tags: ${error.message}`)
    }
  }
}

// Export both the optimized service and a factory function
export const createOptimizedBookmarkService = (userId: string) => {
  return new OptimizedBookmarkService(userId)
}

export default OptimizedBookmarkService 