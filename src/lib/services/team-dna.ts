import { createSupabaseClient } from '../supabase'
import type { Json } from '../../types/supabase'

export interface TeamDna {
  tagCounts: Record<string, number>
  topTags: string[]
}

export class TeamDnaService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  /**
   * Compute team DNA by aggregating tags across all team bookmarks.
   * Returns tag counts and top tags (up to 10).
   */
  async compute(teamId: string): Promise<TeamDna> {
    // Fetch team bookmark ids
    const { data: teamBookmarks, error } = await this.supabase
      .from('team_bookmarks')
      .select('bookmark_id')
      .eq('team_id', teamId)

    if (error) {
      throw new Error(`Failed to fetch team bookmarks: ${error.message}`)
    }

    const bookmarkIds = (teamBookmarks ?? []).map((b) => b.bookmark_id)
    if (bookmarkIds.length === 0) {
      return { tagCounts: {}, topTags: [] }
    }

    // Fetch bookmarks with tags
    const { data: bookmarks, error: bError } = await this.supabase
      .from('bookmarks')
      .select('id, tags')
      .in('id', bookmarkIds)

    if (bError) {
      throw new Error(`Failed to fetch bookmarks: ${bError.message}`)
    }

    const tagCounts: Record<string, number> = {}
    for (const bookmark of bookmarks ?? []) {
      const tags = (bookmark as any).tags as Array<{ name: string }> | null
      if (tags) {
        for (const tag of tags) {
          tagCounts[tag.name] = (tagCounts[tag.name] ?? 0) + 1
        }
      }
    }

    // Determine top tags
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name)

    return { tagCounts, topTags }
  }

  /**
   * Store computed DNA in database (requires the team_dna_profiles table or similar)
   * Currently saves nothing but returns DNA. Stub for future persistence.
   */
  async generateAndSave(teamId: string): Promise<TeamDna> {
    const dna = await this.compute(teamId)
    // Persistence is optional; implement if table exists
    return dna
  }
} 