import type { Folder, Tag } from '../../types/supabase'
import type { BookmarkWithRelations } from '../services/bookmarks'

// Base API client for making authenticated requests
class ApiClient {
  private baseUrl: string

  constructor() {
    // Use current window location in browser, fallback to localhost:3004 in server
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin
    } else {
      this.baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3004'
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for Clerk authentication
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If not JSON, use the text as error message
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again')
      }
      console.error(`API request failed for ${url}:`, error)
      throw error
    }
  }

  // Folders API
  async getFolders(): Promise<Folder[]> {
    return this.request<Folder[]>('/api/folders')
  }

  async createFolder(folder: Omit<Folder, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Folder> {
    return this.request<Folder>('/api/folders', {
      method: 'POST',
      body: JSON.stringify(folder),
    })
  }

  async updateFolder(id: string, updates: Partial<Omit<Folder, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Folder> {
    return this.request<Folder>('/api/folders', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    })
  }

  async deleteFolder(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/folders', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  }

  // Tags API
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/api/tags')
  }

  async createTag(tag: Omit<Tag, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Tag> {
    return this.request<Tag>('/api/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    })
  }

  // Bookmarks API
  async getBookmarks(): Promise<BookmarkWithRelations[]> {
    return this.request<BookmarkWithRelations[]>('/api/bookmarks')
  }

  async searchBookmarks(query: string, options?: any): Promise<BookmarkWithRelations[]> {
    const searchParams = new URLSearchParams({ q: query })
    if (options?.filters) {
      // Add any filter parameters if needed
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }
    const result = await this.request<any>(`/api/bookmarks/search?${searchParams}`)
    return result.bookmarks || result
  }

  async aiSearchBookmarks(query: string, options?: {
    intent?: string
    timeframe?: string
    contentType?: string
  }): Promise<any> {
    const searchParams = new URLSearchParams({ 
      q: query,
      ai: 'true'
    })
    
    if (options?.intent) searchParams.append('intent', options.intent)
    if (options?.timeframe) searchParams.append('timeframe', options.timeframe)
    if (options?.contentType) searchParams.append('contentType', options.contentType)
    
    return this.request<any>(`/api/bookmarks/search?${searchParams}`)
  }

  async createBookmark(bookmark: Omit<BookmarkWithRelations, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tags' | 'folder'>): Promise<BookmarkWithRelations> {
    return this.request<BookmarkWithRelations>('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark),
    })
  }

  async updateBookmark(id: string, updates: Partial<BookmarkWithRelations>): Promise<BookmarkWithRelations> {
    return this.request<BookmarkWithRelations>('/api/bookmarks', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    })
  }

  // Profile API
  async ensureUserProfile(userId: string, email: string, fullName?: string): Promise<{ id: string; email: string }> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const response = await this.request<{
      id: string
      email: string
      full_name?: string
      error?: string
    }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        fullName 
      })
    })

    if (response.error) {
      throw new Error(response.error || 'Failed to ensure user profile')
    }

    return {
      id: response.id,
      email: response.email
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient() 