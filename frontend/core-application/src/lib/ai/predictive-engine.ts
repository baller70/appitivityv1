export interface Prediction {
  bookmarkId: string
  score: number
}

import { BookmarkService, BookmarkWithRelations } from '../services'

/**
 * AIPredictiveEngine ranks bookmarks based on visit frequency and recency
 * to predict which links a user is most likely to open next.
 */
export class AIPredictiveEngine {
  constructor(private readonly bookmarkService: BookmarkService) {}

  /**
   * Return predicted next bookmarks sorted by descending score.
   * @param limit Maximum number of predictions to return
   */
  async predictNext(limit = 5): Promise<BookmarkWithRelations[]> {
    const bookmarks = await this.bookmarkService.getBookmarks()

    if (!bookmarks.length) return []

    const now = Date.now()
    const scored = bookmarks.map(bm => {
      const visits = bm.visit_count ?? 0
      const lastVisited = bm.last_visited_at ? new Date(bm.last_visited_at).getTime() : 0
      // Recency score: newer visits higher value (within last 30 days -> up to 1)
      const recencyDays = lastVisited ? (now - lastVisited) / (1000 * 60 * 60 * 24) : undefined
      const recencyScore = recencyDays !== undefined ? Math.max(0, 30 - recencyDays) / 30 : 0
      const score = visits * 0.7 + recencyScore * 0.3 * (visits > 0 ? 1 : 10) // boost unseen but recent
      return { bm, score }
    })

    // Sort by score desc
    scored.sort((a, b) => b.score - a.score)

    // slice limit and return bookmarks
    return scored.slice(0, limit).map(s => s.bm)
  }
} 