import { BookmarkService, BookmarkWithRelations } from '../services'

export interface RefreshResult {
  bookmarks: BookmarkWithRelations[]
  lastSync: string
}

/**
 * AIRealTimeRefresher returns bookmarks that have changed since last sync.
 */
export class AIRealTimeRefresher {
  constructor(private readonly bookmarkService: BookmarkService) {}

  async getUpdates(since?: string, limit = 20): Promise<RefreshResult> {
    const all = await this.bookmarkService.getBookmarks()
    let filtered = all
    if (since) {
      const sinceMs = Date.parse(since)
      filtered = all.filter(bm => {
        const updatedAt = bm.updated_at || bm.created_at
        return updatedAt ? Date.parse(updatedAt) > sinceMs : false
      })
    }

    // Sort by updated_at desc
    filtered.sort((a, b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || '')
      const bTime = Date.parse(b.updated_at || b.created_at || '')
      return bTime - aTime
    })

    return {
      bookmarks: filtered.slice(0, limit),
      lastSync: new Date().toISOString(),
    }
  }
} 