import { createSupabaseClient } from '../supabase'
import type { TeamBookmark, TeamBookmarkInsert } from '../../types/supabase'

export class TeamBookmarkService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async shareBookmark(teamId: string, bookmarkId: string): Promise<TeamBookmark> {
    const { data, error } = await this.supabase
      .from('team_bookmarks')
      .insert({ team_id: teamId, bookmark_id: bookmarkId, added_by: this.userId })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to share bookmark: ${error.message}`)
    }
    return data as TeamBookmark
  }

  async listTeamBookmarks(teamId: string): Promise<TeamBookmark[]> {
    const { data, error } = await this.supabase
      .from('team_bookmarks')
      .select('*, bookmarks(*)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch team bookmarks: ${error.message}`)
    }
    return data as any
  }

  async removeShared(teamBookmarkId: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_bookmarks')
      .delete()
      .eq('id', teamBookmarkId)

    if (error) {
      throw new Error(`Failed to remove shared bookmark: ${error.message}`)
    }
  }
} 