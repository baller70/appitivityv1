import { BookmarkService, type BookmarkWithRelations } from './bookmarks';
import Fuse from 'fuse.js';

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
  private fuse: Fuse<BookmarkWithRelations> | null = null;

  constructor(userId: string) {
    this.bookmarkService = new BookmarkService(userId);
  }

  /**
   * Initialize or update the Fuse.js search index with enhanced fields
   */
  private initializeFuseIndex(bookmarks: BookmarkWithRelations[]): void {
    // Prepare enhanced search data with extracted notes content
    const enhancedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      notesText: this.extractNotesText((bookmark as any).notes),
      todosText: this.extractTodosText((bookmark as any).notes),
      domainName: this.extractDomain(bookmark.url),
      searchableContent: this.createSearchableContent(bookmark)
    }));

    const fuseOptions = {
      keys: [
        {
          name: 'title',
          weight: 0.25
        },
        {
          name: 'description',
          weight: 0.15
        },
        {
          name: 'notesText',
          weight: 0.2
        },
        {
          name: 'todosText',
          weight: 0.15
        },
        {
          name: 'url',
          weight: 0.05
        },
        {
          name: 'domainName',
          weight: 0.1
        },
        {
          name: 'tags.name',
          weight: 0.15
        },
        {
          name: 'folder.name',
          weight: 0.1
        },
        {
          name: 'searchableContent',
          weight: 0.05
        }
      ],
      threshold: 0.3, // More precise matching (0 = perfect match, 1 = match anything)
      distance: 150, // Increased distance for better fuzzy matching
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true, // Search in entire string, not just beginning
      sortFn: (a: any, b: any) => a.score - b.score // Sort by relevance score
    };

    this.fuse = new Fuse(enhancedBookmarks, fuseOptions);
  }

  /**
   * Enhanced search with fuzzy matching and faceted results
   */
  async search(filters: SearchFilters): Promise<SearchResult> {
    // Get all bookmarks first
    let bookmarks = await this.bookmarkService.getBookmarks();

    // Apply basic filters first (except text search)
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

    // Apply fuzzy text search using Fuse.js
    if (filters.query && filters.query.trim() !== '') {
      bookmarks = this.fuzzySearchWithFuse(bookmarks, filters.query);
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
   * Enhanced fuzzy search using Fuse.js
   */
  private fuzzySearchWithFuse(bookmarks: BookmarkWithRelations[], query: string): BookmarkWithRelations[] {
    // Initialize Fuse with current bookmarks set
    this.initializeFuseIndex(bookmarks);
    
    if (!this.fuse) return bookmarks;

    // Perform the search
    const results = this.fuse.search(query);
    
    // Return bookmarks sorted by relevance score
    return results.map(result => result.item);
  }

  /**
   * Legacy fuzzy search implementation (fallback)
   */
  private legacyFuzzySearch(bookmarks: BookmarkWithRelations[], query: string): BookmarkWithRelations[] {
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
   * Calculate relevance score for legacy search
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
   * Get enhanced search suggestions based on partial query
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const bookmarks = await this.bookmarkService.getBookmarks();
    const suggestions = new Set<string>();

    // Initialize Fuse for suggestions
    this.initializeFuseIndex(bookmarks);
    
    if (this.fuse) {
      // Use Fuse.js for better suggestion matching
      const results = this.fuse.search(query, { limit: 10 });
      
      results.forEach(result => {
        const bookmark = result.item;
        // Add titles, tags, and folder names as suggestions
        if (bookmark.title && bookmark.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(bookmark.title);
        }
        
        bookmark.tags?.forEach(tag => {
          if (tag.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag.name);
          }
        });
        
        if (bookmark.folder?.name && bookmark.folder.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(bookmark.folder.name);
        }
      });
    }

    // Fallback to legacy suggestion logic
    const queryLower = query.toLowerCase();
    
    bookmarks.forEach(bookmark => {
      // Title suggestions
      if (bookmark.title?.toLowerCase().includes(queryLower)) {
        suggestions.add(bookmark.title);
      }
      
      // Tag suggestions
      bookmark.tags?.forEach(tag => {
        if (tag.name.toLowerCase().includes(queryLower)) {
          suggestions.add(tag.name);
        }
      });
      
      // Folder suggestions
      if (bookmark.folder?.name?.toLowerCase().includes(queryLower)) {
        suggestions.add(bookmark.folder.name);
      }
      
      // URL domain suggestions
      try {
        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        if (domain.includes(queryLower)) {
          suggestions.add(domain);
        }
      } catch {
        // Invalid URL, skip
      }
    });

    return Array.from(suggestions)
      .sort((a, b) => {
        // Prioritize suggestions that start with the query
        const aStarts = a.toLowerCase().startsWith(queryLower);
        const bStarts = b.toLowerCase().startsWith(queryLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.length - b.length; // Shorter suggestions first
      })
      .slice(0, 8); // Limit to 8 suggestions
  }

  /**
   * Get search highlights for a bookmark based on query
   */
  getSearchHighlights(bookmark: BookmarkWithRelations, query: string): string[] {
    if (!query || !this.fuse) return [];
    
    const results = this.fuse.search(query);
    const matchedResult = results.find(r => r.item.id === bookmark.id);
    
    if (!matchedResult?.matches) return [];
    
    return matchedResult.matches.map(match => match.key || '');
  }

  /**
   * Extract plain text from notes field (handles both JSON and plain text)
   */
  private extractNotesText(notes?: string | null): string {
    if (!notes) return '';
    
    try {
      // Try to parse as structured JSON (from TODO service)
      const parsed = JSON.parse(notes);
      if (parsed.textContent !== undefined) {
        // Combine text content and TODO items for search
        const todoTexts = (parsed.todos || []).map((todo: any) => todo.text).join(' ');
        return `${parsed.textContent} ${todoTexts}`.trim();
      }
    } catch {
      // If not JSON, treat as plain text
      return this.cleanTextForSearch(notes);
    }
    
    return this.cleanTextForSearch(notes);
  }

  /**
   * Extract TODO items text from notes field
   */
  private extractTodosText(notes?: string | null): string {
    if (!notes) return '';
    
    try {
      // Try to parse as structured JSON
      const parsed = JSON.parse(notes);
      if (parsed.todos && Array.isArray(parsed.todos)) {
        return parsed.todos.map((todo: any) => todo.text).join(' ');
      }
    } catch {
      // Extract markdown-style checkboxes from plain text
      const todoRegex = /^\s*[-*+]?\s*\[([x\s])\]\s*(.+)$/gim;
      const matches = notes.match(todoRegex);
      if (matches) {
        return matches
          .map(match => match.replace(/^\s*[-*+]?\s*\[([x\s])\]\s*/, ''))
          .join(' ');
      }
    }
    
    return '';
  }

  /**
   * Extract domain name from URL for better search
   */
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return '';
    }
  }

  /**
   * Create a comprehensive searchable content string
   */
  private createSearchableContent(bookmark: BookmarkWithRelations): string {
    const parts = [
      bookmark.title,
      bookmark.description,
      this.extractNotesText((bookmark as any).notes),
      bookmark.tags?.map(tag => tag.name).join(' '),
      bookmark.folder?.name,
      this.extractDomain(bookmark.url)
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Clean text for search by removing markdown and special characters
   */
  private cleanTextForSearch(text: string): string {
    return text
      .replace(/[#*_`~\[\]]/g, '') // Remove markdown formatting
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Enhanced search with content-based keywords extraction
   */
  async searchWithContentAnalysis(filters: SearchFilters): Promise<SearchResult & { contentKeywords?: string[] }> {
    const basicResult = await this.search(filters);
    
    // Extract content-based keywords from search query
    const contentKeywords = this.extractContentKeywords(filters.query || '');
    
    return {
      ...basicResult,
      contentKeywords
    };
  }

  /**
   * Extract potential content keywords for enhanced search
   */
  private extractContentKeywords(query: string): string[] {
    if (!query) return [];
    
    // Common tech/content keywords that might benefit from content extraction
    const contentKeywords = [
      'tutorial', 'guide', 'documentation', 'api', 'reference',
      'article', 'blog', 'news', 'review', 'comparison',
      'framework', 'library', 'tool', 'resource', 'example',
      'course', 'learning', 'education', 'training',
      'best practices', 'tips', 'tricks', 'how to'
    ];
    
    const queryLower = query.toLowerCase();
    return contentKeywords.filter(keyword => 
      queryLower.includes(keyword) || 
      keyword.split(' ').some(word => queryLower.includes(word))
    );
  }

  /**
   * Get advanced search suggestions with context
   */
  async getAdvancedSuggestions(query: string): Promise<{
    suggestions: string[];
    categories: { type: string; items: string[] }[];
  }> {
    const basicSuggestions = await this.getSuggestions(query);
    
    // Categorize suggestions
    const categories = [
      {
        type: 'Recent Searches',
        items: this.getRecentSearches().filter(s => 
          s.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3)
      },
      {
        type: 'Popular Tags',
        items: basicSuggestions.filter(s => 
          // This is a simplified check - in real implementation, 
          // you'd check against actual tag frequency
          s.length < 20 && !s.includes('.')
        ).slice(0, 4)
      },
      {
        type: 'Domain Suggestions',
        items: basicSuggestions.filter(s => 
          s.includes('.') && !s.includes(' ')
        ).slice(0, 3)
      }
    ].filter(category => category.items.length > 0);
    
    return {
      suggestions: basicSuggestions,
      categories
    };
  }

  /**
   * Get recent searches (mock implementation - would use localStorage or database)
   */
  private getRecentSearches(): string[] {
    // In a real implementation, this would retrieve from localStorage or user preferences
    return [];
  }
} 