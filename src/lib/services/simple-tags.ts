import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface SimpleTag {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export class SimpleTagService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Get all tags for user
  async getTags(): Promise<SimpleTag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', this.userId)
      .order('name')

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }

    return data || []
  }

  // Create a new tag
  async createTag(name: string, color: string = '#3B82F6'): Promise<SimpleTag | null> {
    // Check if tag already exists
    const existing = await this.getTagByName(name)
    if (existing) {
      return existing // Return existing tag instead of error
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        name,
        color,
        user_id: this.userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      return null
    }

    return data
  }

  // Get tag by name
  async getTagByName(name: string): Promise<SimpleTag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', this.userId)
      .eq('name', name)
      .single()

    if (error) {
      return null
    }

    return data
  }

  // Delete a tag
  async deleteTag(tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', this.userId)

    return !error
  }

  // Add tag to bookmark
  async addTagToBookmark(bookmarkId: string, tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('bookmark_tags')
      .insert({
        bookmark_id: bookmarkId,
        tag_id: tagId
      })

    return !error
  }

  // Remove tag from bookmark
  async removeTagFromBookmark(bookmarkId: string, tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('bookmark_tags')
      .delete()
      .eq('bookmark_id', bookmarkId)
      .eq('tag_id', tagId)

    return !error
  }

  // Get tags for a bookmark
  async getBookmarkTags(bookmarkId: string): Promise<SimpleTag[]> {
    const { data, error } = await supabase
      .from('bookmark_tags')
      .select(`
        tag:tags(*)
      `)
      .eq('bookmark_id', bookmarkId)

    if (error) {
      console.error('Error fetching bookmark tags:', error)
      return []
    }

    return data?.map((item: any) => item.tag as SimpleTag).filter(Boolean) || []
  }
} 