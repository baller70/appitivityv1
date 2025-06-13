import { createSupabaseClient } from '../supabase'
import type { BookmarkStatus, BookmarkStatusInsert } from '../../types/supabase'

export class BookmarkStatusService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async setStatus(bookmarkId: string, status: string): Promise<BookmarkStatus> {
    const payload: Omit<BookmarkStatusInsert, 'updated_at'> = {
      bookmark_id: bookmarkId,
      status,
      updated_by: this.userId,
    }
    const { data, error } = await this.supabase
      .from('bookmark_status')
      .insert({ ...payload, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw new Error(`Failed to set status: ${error.message}`)
    return data
  }

  async getLatestStatus(bookmarkId: string): Promise<BookmarkStatus | null> {
    const { data, error } = await this.supabase
      .from('bookmark_status')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data ?? null
  }

  async getHistory(bookmarkId: string): Promise<BookmarkStatus[]> {
    const { data, error } = await this.supabase
      .from('bookmark_status')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .order('updated_at', { ascending: false })
    if (error) throw new Error(`Failed to fetch status history: ${error.message}`)
    return data ?? []
  }
} 