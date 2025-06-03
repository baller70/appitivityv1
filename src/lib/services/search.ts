import { BookmarkService, type BookmarkWithRelations } from './bookmarks';


export interface SearchFilters {
  query?: string;
  folderId?: string;
  tagIds?: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
  hasDescription?: boolean;
}

export interface SearchResult {
  bookmarks: BookmarkWithRelations[];
  total: number;
  facets: {
    folders: { id: string; name: string; count: number }[];
    tags: { id: string; name: string; count: number }[];
    archived: number;
    favorites: number;
  };
}

export class SearchService {
  private bookmarkService: BookmarkService;

  constructor(userId: string) {
    this.bookmarkService = new BookmarkService(userId);
  }

  /**
   * Enhanced search with fuzzy matching and faceted results
   */
  async search(filters: SearchFilters): Promise<SearchResult> {
    // Get all bookmarks first for client-side fuzzy search
    // In a production app, this should be done server-side for performance
    let bookmarks = await this.bookmarkService.getBookmarks();

    // Apply basic filters first
    if (filters.folderId) {
      bookmarks = bookmarks.filter(b => b.folder_id === filters.folderId);
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      bookmarks = bookmarks.filter(b => 
        b.tags?.some(tag => filters.tagIds!.includes(tag.id))
      );
    }

    if (filters.isArchived !== undefined) {
      bookmarks = bookmarks.filter(b => b.is_archived === filters.isArchived);
    }

    if (filters.isFavorite !== undefined) {
      bookmarks = bookmarks.filter(b => b.is_favorite === filters.isFavorite);
    }

    if (filters.hasDescription !== undefined) {
      bookmarks = bookmarks.filter(b => 
        filters.hasDescription ? (b.description && b.description.trim() !== '') : !b.description || b.description.trim() === ''
      );
    }

    // Date range filtering
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      bookmarks = bookmarks.filter(b => new Date(b.created_at || '') >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      bookmarks = bookmarks.filter(b => new Date(b.created_at || '') <= toDate);
    }

    // Apply fuzzy text search
    if (filters.query && filters.query.trim() !== '') {
      bookmarks = this.fuzzySearch(bookmarks, filters.query);
    }

    // Calculate facets
    const facets = this.calculateFacets(bookmarks);

    return {
      bookmarks,
      total: bookmarks.length,
      facets
    };
  }

  /**
   * Fuzzy search implementation
   */
  private fuzzySearch(bookmarks: BookmarkWithRelations[], query: string): BookmarkWithRelations[] {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return bookmarks
      .map(bookmark => ({
        bookmark,
        score: this.calculateRelevanceScore(bookmark, searchTerms)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.bookmark);
  }

  /**
   * Calculate relevance score for fuzzy search
   */
  private calculateRelevanceScore(bookmark: BookmarkWithRelations, searchTerms: string[]): number {
    let score = 0;
    const title = bookmark.title?.toLowerCase() || '';
    const description = bookmark.description?.toLowerCase() || '';
    const url = bookmark.url?.toLowerCase() || '';
    const tagNames = bookmark.tags?.map(tag => tag.name.toLowerCase()).join(' ') || '';
    const folderName = bookmark.folder?.name?.toLowerCase() || '';

    for (const term of searchTerms) {
      // Exact matches get higher scores
      if (title.includes(term)) score += title === term ? 10 : 5;
      if (description.includes(term)) score += 3;
      if (url.includes(term)) score += 2;
      if (tagNames.includes(term)) score += 4;
      if (folderName.includes(term)) score += 3;

      // Fuzzy matching for partial matches
      if (this.fuzzyMatch(title, term)) score += 2;
      if (this.fuzzyMatch(description, term)) score += 1;
      if (this.fuzzyMatch(tagNames, term)) score += 2;
    }

    return score;
  }

  /**
   * Simple fuzzy matching for partial string matches
   */
  private fuzzyMatch(text: string, term: string): boolean {
    if (text.includes(term)) return true;
    
    // Check for partial matches (e.g., "reac" matches "react")
    for (let i = 0; i <= text.length - term.length; i++) {
      let matches = 0;
      for (let j = 0; j < term.length; j++) {
        if (text[i + j] === term[j]) {
          matches++;
        }
      }
      if (matches / term.length >= 0.8) { // 80% character match
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate search facets for filtering
   */
  private calculateFacets(bookmarks: BookmarkWithRelations[]): SearchResult['facets'] {
    const folderCounts = new Map<string, { name: string; count: number }>();
    const tagCounts = new Map<string, { name: string; count: number }>();
    let archivedCount = 0;
    let favoritesCount = 0;

    for (const bookmark of bookmarks) {
      // Count folders
      if (bookmark.folder) {
        const existing = folderCounts.get(bookmark.folder.id) || { name: bookmark.folder.name, count: 0 };
        folderCounts.set(bookmark.folder.id, { ...existing, count: existing.count + 1 });
      }

      // Count tags
      bookmark.tags?.forEach(tag => {
        const existing = tagCounts.get(tag.id) || { name: tag.name, count: 0 };
        tagCounts.set(tag.id, { ...existing, count: existing.count + 1 });
      });

      // Count archived and favorites
      if (bookmark.is_archived) archivedCount++;
      if (bookmark.is_favorite) favoritesCount++;
    }

    return {
      folders: Array.from(folderCounts.entries()).map(([id, data]) => ({ id, ...data })),
      tags: Array.from(tagCounts.entries()).map(([id, data]) => ({ id, ...data })),
      archived: archivedCount,
      favorites: favoritesCount
    };
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const bookmarks = await this.bookmarkService.getBookmarks();
    const suggestions = new Set<string>();

    const queryLower = query.toLowerCase();

    bookmarks.forEach(bookmark => {
      // Extract words from title, description, and tags
      const words = [
        ...(bookmark.title?.split(' ') || []),
        ...(bookmark.description?.split(' ') || []),
        ...(bookmark.tags?.flatMap(tag => tag.name.split(' ')) || [])
      ];

      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.startsWith(queryLower) && cleanWord.length > queryLower.length) {
          suggestions.add(cleanWord);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }
} 