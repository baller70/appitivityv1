import { BookmarkService, BookmarkWithRelations } from '../services'

export class AIBookmarkSummary {
  constructor(private readonly bookmarkService: BookmarkService) {}

  async summarize(bookmarkId: string): Promise<{ summary: string; bookmark: BookmarkWithRelations | null }> {
    const bookmark = await this.bookmarkService.getBookmark(bookmarkId)
    if (!bookmark) {
      return { summary: 'Bookmark not found', bookmark: null }
    }

    const base = bookmark.description || ''
    const summary = base.length > 0 ? base.slice(0, 280) : `${bookmark.title} — ${bookmark.url}`
    return { summary, bookmark }
  }
} 