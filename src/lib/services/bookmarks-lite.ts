// Lightweight BookmarkService for API routes - no Supabase client imports
import { normalizeUserId } from '../uuid-compat'
import type { 
  Bookmark, 
  BookmarkInsert, 
  BookmarkUpdate,
  Folder,
  Tag
} from '../../types/supabase'

export interface BookmarkWithRelations extends Bookmark {
  folder?: Folder | null
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

export class BookmarkServiceLite {
  private userId: string
  private originalUserId: string
  private headers: Record<string, string>
  private baseUrl: string

  constructor(userId: string) {
    this.originalUserId = userId
    this.userId = userId.startsWith('user_') ? normalizeUserId(userId) : userId
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    this.baseUrl = `${supabaseUrl}/rest/v1`
    this.headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
    
    console.log('BookmarkServiceLite initialized for user:', {
      original: this.originalUserId,
      normalized: this.userId,
      environment: 'server'
    })
  }

  async getBookmarks(): Promise<BookmarkWithRelations[]> {
    console.log('Fetching bookmarks for user:', this.userId)
    
    const url = `${this.baseUrl}/bookmarks?user_id=eq.${this.userId}&select=*,folder:folders(*),tags:bookmark_tags(tag:tags(*))&order=created_at.desc`
    
    const response = await fetch(url, {
      headers: this.headers
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch bookmarks: ${error}`)
    }
    
    const data = await response.json()
    console.log(`Found ${data?.length || 0} bookmarks for user`)
    
    return data?.map((bookmark: any) => ({
      ...bookmark,
      tags: (bookmark.tags as any[] ?? []).map((t: any) => t.tag).filter(Boolean),
      reminder_at: bookmark.reminder_at || null
    })) || []
  }

  async trackVisit(bookmarkId: string): Promise<void> {
    console.log('Tracking visit for bookmark:', bookmarkId, 'user:', this.userId)
    
    // First get current visit count
    const getUrl = `${this.baseUrl}/bookmarks?id=eq.${bookmarkId}&user_id=eq.${this.userId}&select=visit_count`
    const getResponse = await fetch(getUrl, {
      headers: this.headers
    })
    
    if (!getResponse.ok) {
      throw new Error('Failed to get bookmark for visit tracking')
    }
    
    const [currentBookmark] = await getResponse.json()
    const newVisitCount = (currentBookmark?.visit_count || 0) + 1
    
    // Update visit count
    const updateUrl = `${this.baseUrl}/bookmarks?id=eq.${bookmarkId}&user_id=eq.${this.userId}`
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        visit_count: newVisitCount,
        last_visited_at: new Date().toISOString()
      })
    })
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      throw new Error(`Failed to track visit: ${error}`)
    }
    
    console.log('Successfully tracked visit for bookmark:', bookmarkId)
  }

  async getBookmark(bookmarkId: string): Promise<{ 
    success: boolean; 
    data?: BookmarkWithRelations; 
    error?: string 
  }> {
    try {
      const url = `${this.baseUrl}/bookmarks?id=eq.${bookmarkId}&user_id=eq.${this.userId}&select=*,folder:folders(*),tags:bookmark_tags(tag:tags(*))`
      
      const response = await fetch(url, {
        headers: this.headers
      })
      
      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Failed to fetch bookmark: ${error}` }
      }
      
      const data = await response.json()
      const bookmark = data?.[0]
      
      if (!bookmark) {
        return { success: false, error: 'Bookmark not found' }
      }
      
      const transformed = {
        ...bookmark,
        tags: (bookmark.tags as any[] ?? []).map((t: any) => t.tag).filter(Boolean),
        reminder_at: bookmark.reminder_at || null
      }
      
      return { success: true, data: transformed }
    } catch (err) {
      console.error('Unexpected error getting bookmark:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  async createBookmark(data: {
    url: string;
    title: string;
    description?: string;
    tags?: string[];
  }): Promise<{ 
    success: boolean; 
    data?: BookmarkWithRelations; 
    error?: string 
  }> {
    try {
      const bookmarkData = {
        url: data.url,
        title: data.title,
        description: data.description || null,
        user_id: this.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const url = `${this.baseUrl}/bookmarks`
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(bookmarkData)
      })
      
      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Failed to create bookmark: ${error}` }
      }
      
      const [createdBookmark] = await response.json()
      
      // TODO: Handle tags if provided
      // For now, just return the bookmark without tags
      
      return { success: true, data: createdBookmark }
    } catch (err) {
      console.error('Unexpected error creating bookmark:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  async searchBookmarks(query: string): Promise<BookmarkWithRelations[]> {
    console.log('Searching bookmarks for user:', this.userId, 'query:', query)
    
    if (!query.trim()) {
      return this.getBookmarks()
    }
    
    // Use PostgREST's text search capabilities
    const searchQuery = encodeURIComponent(query.trim())
    const url = `${this.baseUrl}/bookmarks?user_id=eq.${this.userId}&or=(title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,url.ilike.%${searchQuery}%)&select=*,folder:folders(*),tags:bookmark_tags(tag:tags(*))&order=created_at.desc`
    
    const response = await fetch(url, {
      headers: this.headers
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to search bookmarks: ${error}`)
    }
    
    const data = await response.json()
    console.log(`Found ${data?.length || 0} bookmarks matching search`)
    
    return data?.map((bookmark: any) => ({
      ...bookmark,
      tags: (bookmark.tags as any[] ?? []).map((t: any) => t.tag).filter(Boolean),
      reminder_at: bookmark.reminder_at || null
    })) || []
  }
} 