import { BookmarkService, BookmarkWithRelations } from '../services'

export interface LearningPathOptions {
  topic?: string // tag/topic to focus on
  limit?: number
}

/**
 * AILearningPathGenerator builds a progression of bookmarks for a topic.
 * Strategy: filter bookmarks by `topic` tag (if provided), then sort by
 * visit_count ASC (less explored first) and by created_at ASC to create a
 * step-by-step path from oldest/least-visited to newest/most-visited.
 */
export class AILearningPathGenerator {
  constructor(private readonly bookmarkService: BookmarkService) {}

  async generatePath(options: LearningPathOptions = {}): Promise<BookmarkWithRelations[]> {
    const { topic, limit = 10 } = options
    let bookmarks = await this.bookmarkService.getBookmarks()

    if (topic) {
      const lower = topic.toLowerCase()
      bookmarks = bookmarks.filter(bm => {
        const tags = (bm as any).tags as string[] | undefined
        return tags?.some(t => typeof t === 'string' && t.toLowerCase() === lower)
      })
    }

    // Sort by visit_count (ascending) and created_at (ascending)
    bookmarks.sort((a, b) => {
      const visitDiff = (a.visit_count ?? 0) - (b.visit_count ?? 0)
      if (visitDiff !== 0) return visitDiff
      return Date.parse(a.created_at || '') - Date.parse(b.created_at || '')
    })

    return bookmarks.slice(0, limit)
  }
} 