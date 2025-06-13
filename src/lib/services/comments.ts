import { createSupabaseClient } from '../supabase'
import type { BookmarkComment, BookmarkCommentInsert, BookmarkCommentUpdate } from '../../types/supabase'

export class CommentService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async listComments(bookmarkId: string): Promise<BookmarkComment[]> {
    const { data, error } = await this.supabase
      .from('bookmark_comments')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`)
    }
    return data ?? []
  }

  async addComment(bookmarkId: string, text: string): Promise<BookmarkComment> {
    const { data, error } = await this.supabase
      .from('bookmark_comments')
      .insert({ bookmark_id: bookmarkId, text, user_id: this.userId } as BookmarkCommentInsert)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`)
    }
    return data
  }

  async deleteComment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookmark_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`)
    }
  }

  async updateComment(id: string, updates: BookmarkCommentUpdate): Promise<BookmarkComment> {
    const { data, error } = await this.supabase
      .from('bookmark_comments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update comment: ${error.message}`)
    }
    return data
  }
} 