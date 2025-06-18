import { BookmarkService, BookmarkWithRelations } from '../services'

export class AIBookmarkFinder {
  constructor(private readonly bookmarkService: BookmarkService) {}

  async find(query: string): Promise<BookmarkWithRelations[]> {
    // For now use existing text search. Could be replaced with embeddings in future.
    return this.bookmarkService.searchBookmarks(query)
  }
} 