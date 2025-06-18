import { createSupabaseClient } from '../supabase'
import { normalizeUserId } from '../uuid-compat'
import type { 
  Tag, 
  TagInsert, 
  TagUpdate 
} from '../../types/supabase'

// Tag with usage count
export interface TagWithCount extends Tag {
  bookmarkCount?: number
}

export class TagService {
  private supabase
  private userId: string

  constructor(userId: string) {
    // Normalize the user ID to UUID format for database operations
    this.userId = normalizeUserId(userId)
    this.supabase = createSupabaseClient(this.userId)
  }

  // Get all tags for the current user
  async getTags(): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', this.userId)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`)
    }

    return data || []
  }

  // Get tags with bookmark counts
  async getTagsWithCounts(): Promise<TagWithCount[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select(`
        *,
        bookmark_tags(count)
      `)
      .eq('user_id', this.userId)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch tags with counts: ${error.message}`)
    }

    return data?.map(tag => ({
      ...tag,
      bookmarkCount: tag.bookmark_tags?.[0]?.count || 0
    })) || []
  }

  // Get a single tag by ID
  async getTag(id: string): Promise<Tag | null> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('user_id', this.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch tag: ${error.message}`)
    }

    return data
  }

  // Get tag by name (case insensitive)
  async getTagByName(name: string): Promise<Tag | null> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', this.userId)
      .ilike('name', name)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch tag by name: ${error.message}`)
    }

    return data
  }

  // Create a new tag
  async createTag(tag: Omit<TagInsert, 'user_id'>): Promise<Tag> {
    // Check if tag with same name already exists
    const existingTag = await this.getTagByName(tag.name)
    if (existingTag) {
      throw new Error(`Tag with name "${tag.name}" already exists`)
    }

    const { data, error } = await this.supabase
      .from('tags')
      .insert({
        ...tag,
        user_id: this.userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create tag: ${error.message}`)
    }

    return data
  }

  // Update a tag
  async updateTag(id: string, updates: TagUpdate): Promise<Tag> {
    // If updating name, check for duplicates
    if (updates.name) {
      const existingTag = await this.getTagByName(updates.name)
      if (existingTag && existingTag.id !== id) {
        throw new Error(`Tag with name "${updates.name}" already exists`)
      }
    }

    const { data, error } = await this.supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update tag: ${error.message}`)
    }

    return data
  }

  // Delete a tag
  async deleteTag(id: string): Promise<void> {
    // First remove all bookmark associations
    await this.supabase
      .from('bookmark_tags')
      .delete()
      .eq('tag_id', id)

    // Then delete the tag
    const { error } = await this.supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete tag: ${error.message}`)
    }
  }

  // Search tags by name
  async searchTags(searchTerm: string): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', this.userId)
      .ilike('name', `%${searchTerm}%`)
      .order('name')

    if (error) {
      throw new Error(`Failed to search tags: ${error.message}`)
    }

    return data || []
  }

  // Get popular tags (most used)
  async getPopularTags(limit = 10): Promise<TagWithCount[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select(`
        *,
        bookmark_tags(count)
      `)
      .eq('user_id', this.userId)
      .order('bookmark_tags.count', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch popular tags: ${error.message}`)
    }

    return data?.map(tag => ({
      ...tag,
      bookmarkCount: tag.bookmark_tags?.[0]?.count || 0
    })) || []
  }

  // Get unused tags (tags with no bookmarks)
  async getUnusedTags(): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select(`
        *,
        bookmark_tags(count)
      `)
      .eq('user_id', this.userId)
      .or('bookmark_tags.count.eq.0,bookmark_tags.count.is.null')
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch unused tags: ${error.message}`)
    }

    return data || []
  }

  // Get tags for a specific bookmark
  async getBookmarkTags(bookmarkId: string): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('bookmark_tags')
      .select('tag:tags(*)')
      .eq('bookmark_id', bookmarkId)

    if (error) {
      throw new Error(`Failed to fetch bookmark tags: ${error.message}`)
    }

    return data?.map((bt: any) => bt.tag).filter(Boolean) || []
  }

  // Create or get existing tag by name
  async createOrGetTag(name: string, color?: string): Promise<Tag> {
    const existingTag = await this.getTagByName(name)
    if (existingTag) {
      return existingTag
    }

    return this.createTag({ 
      name: name.trim(),
      color: color || this.generateRandomColor()
    })
  }

  // Bulk create tags from names
  async bulkCreateTags(names: string[]): Promise<Tag[]> {
    const uniqueNames = [...new Set(names.map(name => name.trim()))]
    const tags: Tag[] = []

    for (const name of uniqueNames) {
      if (name) {
        try {
          const tag = await this.createOrGetTag(name)
          tags.push(tag)
        } catch (error) {
          // Skip if tag creation fails (e.g., duplicate)
          console.warn(`Failed to create tag "${name}":`, error)
        }
      }
    }

    return tags
  }

  // Merge tags (move all bookmarks from sourceTagId to targetTagId, then delete source)
  async mergeTags(sourceTagId: string, targetTagId: string): Promise<void> {
    // Get all bookmark_tags for the source tag
    const { data: bookmarkTags, error: fetchError } = await this.supabase
      .from('bookmark_tags')
      .select('bookmark_id')
      .eq('tag_id', sourceTagId)

    if (fetchError) {
      throw new Error(`Failed to fetch bookmark tags: ${fetchError.message}`)
    }

    if (bookmarkTags && bookmarkTags.length > 0) {
      // Remove existing bookmark_tags for source tag
      await this.supabase
        .from('bookmark_tags')
        .delete()
        .eq('tag_id', sourceTagId)

      // Create new bookmark_tags for target tag (avoid duplicates)
      for (const bt of bookmarkTags) {
        try {
          await this.supabase
            .from('bookmark_tags')
            .insert({
              bookmark_id: bt.bookmark_id,
              tag_id: targetTagId
            })
        } catch (error) {
          // Skip if association already exists
        }
      }
    }

    // Delete the source tag
    await this.deleteTag(sourceTagId)
  }

  // Generate a random color for tags
  private generateRandomColor(): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Clean up unused tags
  async cleanupUnusedTags(): Promise<number> {
    const unusedTags = await this.getUnusedTags()
    
    for (const tag of unusedTags) {
      await this.deleteTag(tag.id)
    }

    return unusedTags.length
  }
} 