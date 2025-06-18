import { BookmarkService } from '../services'
import type { BookmarkWithRelations } from '../services'

export interface AllianceRecommendation {
  tag: string
  bookmarks: BookmarkWithRelations[]
}

/**
 * AIAllianceService groups bookmarks that share tags and recommends clusters.
 * If a tag appears on at least 2 bookmarks, we suggest that as an alliance.
 */
export class AIAllianceService {
  constructor(private readonly bookmarkService: BookmarkService) {}

  async recommendAlliances(): Promise<AllianceRecommendation[]> {
    const bookmarks = await this.bookmarkService.getBookmarks()

    // Map tag -> bookmarks array
    const tagMap: Record<string, BookmarkWithRelations[]> = {}
    for (const bm of bookmarks) {
      const tags = (bm as any).tags ?? []
      for (const rawTag of tags) {
        const tag = typeof rawTag === 'string' ? rawTag : rawTag.name ?? ''
        if (!tag) continue
        if (!tagMap[tag]) tagMap[tag] = []
        tagMap[tag].push(bm)
      }
    }

    // Build recommendations where at least 2 bookmarks share a tag
    return Object.entries(tagMap)
      .filter(([, bks]) => bks.length >= 2)
      .map(([tag, bks]) => ({ tag, bookmarks: bks }))
      .sort((a, b) => b.bookmarks.length - a.bookmarks.length)
  }
} 