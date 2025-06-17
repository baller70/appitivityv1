import { normalizeUserId } from '../uuid-compat'
import type { 
  Tag, 
  TagInsert
} from '../../types/supabase'

export class TagServiceLite {
  private userId: string
  private headers: Record<string, string>
  private baseUrl: string

  constructor(userId: string) {
    // Use the user ID directly since ensureUserProfile already returns the correct database user ID
    this.userId = userId
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    this.baseUrl = `${supabaseUrl}/rest/v1`
    this.headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }

  // Get all tags for the current user
  async getTags(): Promise<Tag[]> {
    const url = `${this.baseUrl}/tags?user_id=eq.${this.userId}&order=name.asc`
    
    const response = await fetch(url, {
      headers: this.headers
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch tags: ${error}`)
    }
    
    const data = await response.json()
    return data || []
  }

  // Get tag by name (case insensitive)
  async getTagByName(name: string): Promise<Tag | null> {
    const url = `${this.baseUrl}/tags?user_id=eq.${this.userId}&name=ilike.${encodeURIComponent(name)}`
    
    const response = await fetch(url, {
      headers: this.headers
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch tag by name: ${error}`)
    }

    const data = await response.json()
    return data.length > 0 ? data[0] : null
  }

  // Create a new tag
  async createTag(tag: Omit<TagInsert, 'user_id'>): Promise<Tag> {
    try {
      console.log('TagServiceLite.createTag - Input:', tag)
      console.log('TagServiceLite.createTag - User ID:', this.userId)
      
      // Check if tag with same name already exists
      const existingTag = await this.getTagByName(tag.name)
      if (existingTag) {
        throw new Error(`Tag with name "${tag.name}" already exists`)
      }

      const payload = {
        ...tag,
        user_id: this.userId
      }
      
      console.log('TagServiceLite.createTag - Payload:', payload)
      console.log('TagServiceLite.createTag - URL:', `${this.baseUrl}/tags`)

      const url = `${this.baseUrl}/tags`
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      })

      console.log('TagServiceLite.createTag - Response status:', response.status)
      console.log('TagServiceLite.createTag - Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const error = await response.text()
        console.log('TagServiceLite.createTag - Error response:', error)
        throw new Error(`Failed to create tag: ${error}`)
      }

      const responseData = await response.json()
      console.log('TagServiceLite.createTag - Response data:', responseData)
      
      const [data] = Array.isArray(responseData) ? responseData : [responseData]
      return data
    } catch (error) {
      console.error('TagServiceLite.createTag - Exception:', error)
      throw error
    }
  }

  // Delete a tag
  async deleteTag(id: string): Promise<void> {
    // First remove all bookmark associations
    const deleteAssociationsUrl = `${this.baseUrl}/bookmark_tags?tag_id=eq.${id}`
    await fetch(deleteAssociationsUrl, {
      method: 'DELETE',
      headers: this.headers
    })

    // Then delete the tag
    const deleteTagUrl = `${this.baseUrl}/tags?id=eq.${id}&user_id=eq.${this.userId}`
    const response = await fetch(deleteTagUrl, {
      method: 'DELETE',
      headers: this.headers
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete tag: ${error}`)
    }
  }

  // Add tag to bookmark
  async addTagToBookmark(bookmarkId: string, tagId: string): Promise<void> {
    const url = `${this.baseUrl}/bookmark_tags`
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        bookmark_id: bookmarkId,
        tag_id: tagId
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add tag to bookmark: ${error}`)
    }
  }

  // Remove tag from bookmark
  async removeTagFromBookmark(bookmarkId: string, tagId: string): Promise<void> {
    const url = `${this.baseUrl}/bookmark_tags?bookmark_id=eq.${bookmarkId}&tag_id=eq.${tagId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to remove tag from bookmark: ${error}`)
    }
  }

  // Get tags for a specific bookmark
  async getBookmarkTags(bookmarkId: string): Promise<Tag[]> {
    const url = `${this.baseUrl}/bookmark_tags?bookmark_id=eq.${bookmarkId}&select=tag:tags(*)`
    
    const response = await fetch(url, {
      headers: this.headers
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch bookmark tags: ${error}`)
    }

    const data = await response.json()
    return data?.map((item: any) => item.tag).filter(Boolean) || []
  }
} 