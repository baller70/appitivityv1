import type { Folder, Tag } from '../../types/supabase'
import type { BookmarkWithRelations } from '../services/bookmarks'

// Base API client for making authenticated requests
class ApiClient {
  private baseUrl = '/api'

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for Clerk authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Folders API
  async getFolders(): Promise<Folder[]> {
    return this.request<Folder[]>('/folders')
  }

  async createFolder(folder: Omit<Folder, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Folder> {
    return this.request<Folder>('/folders', {
      method: 'POST',
      body: JSON.stringify(folder),
    })
  }

  // Tags API
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/tags')
  }

  async createTag(tag: Omit<Tag, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Tag> {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    })
  }

  // Bookmarks API
  async getBookmarks(): Promise<BookmarkWithRelations[]> {
    return this.request<BookmarkWithRelations[]>('/bookmarks')
  }

  async createBookmark(bookmark: Omit<BookmarkWithRelations, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tags' | 'folder'>): Promise<BookmarkWithRelations> {
    return this.request<BookmarkWithRelations>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark),
    })
  }

  async updateBookmark(id: string, updates: Partial<BookmarkWithRelations>): Promise<BookmarkWithRelations> {
    return this.request<BookmarkWithRelations>('/bookmarks', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    })
  }

  // Profile API
  async ensureUserProfile(email: string, fullName?: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/profile', {
      method: 'POST',
      body: JSON.stringify({ email, fullName }),
    })
  }
}

// Export a singleton instance
export const apiClient = new ApiClient() 