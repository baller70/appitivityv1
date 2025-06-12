/* eslint-disable @typescript-eslint/no-unused-vars */
import { BookmarkWithRelations } from './bookmarks';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class BookmarkCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SEARCH_CACHE_SIZE = 50;
  private searchCache = new Map<string, BookmarkWithRelations[]>();

  // Cache keys
  private readonly KEYS = {
    ALL_BOOKMARKS: 'all_bookmarks',
    FOLDERS: 'folders',
    TAGS: 'tags',
    FAVORITES: 'favorites',
    RECENT: 'recent',
    FOLDER_BOOKMARKS: (folderId: string) => `folder_${folderId}`,
    TAG_BOOKMARKS: (tagId: string) => `tag_${tagId}`,
    SEARCH: (query: string) => `search_${query}`,
  };

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Invalidate cache
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.searchCache.clear();
      return;
    }

    // Invalidate entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Cache all bookmarks
  cacheBookmarks(bookmarks: BookmarkWithRelations[]): void {
    this.set(this.KEYS.ALL_BOOKMARKS, bookmarks);
    
    // Also cache favorites and recent
    const favorites = bookmarks.filter(b => b.is_favorite);
    this.set(this.KEYS.FAVORITES, favorites);
    
    const recent = [...bookmarks]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 20);
    this.set(this.KEYS.RECENT, recent);
  }

  // Get cached bookmarks
  getCachedBookmarks(): BookmarkWithRelations[] | null {
    return this.get(this.KEYS.ALL_BOOKMARKS);
  }

  // Cache search results
  cacheSearchResults(query: string, results: BookmarkWithRelations[]): void {
    // Limit search cache size
    if (this.searchCache.size >= this.SEARCH_CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey !== undefined) {
        this.searchCache.delete(firstKey);
      }
    }
    
    this.searchCache.set(query.toLowerCase(), results);
  }

  // Get cached search results
  getCachedSearchResults(query: string): BookmarkWithRelations[] | null {
    const result = this.searchCache.get(query.toLowerCase());
    return result !== undefined ? result : null;
  }

  // Optimistic update for bookmark creation
  optimisticCreate(bookmark: BookmarkWithRelations): void {
    const cached = this.getCachedBookmarks();
    if (cached) {
      this.cacheBookmarks([bookmark, ...cached]);
    }
  }

  // Optimistic update for bookmark update
  optimisticUpdate(bookmarkId: string, updates: Partial<BookmarkWithRelations>): void {
    const cached = this.getCachedBookmarks();
    if (cached) {
      const updated = cached.map(b => 
        b.id === bookmarkId ? { ...b, ...updates } : b
      );
      this.cacheBookmarks(updated);
    }
  }

  // Optimistic update for bookmark deletion
  optimisticDelete(bookmarkId: string): void {
    const cached = this.getCachedBookmarks();
    if (cached) {
      const filtered = cached.filter(b => b.id !== bookmarkId);
      this.cacheBookmarks(filtered);
    }
  }

  // Prefetch related data
  async prefetchRelated(bookmarkIds: string[]): Promise<void> {
    // This would typically fetch related bookmarks, tags, etc.
    // For now, it's a placeholder for future optimization
    console.log('Prefetching related data for', bookmarkIds.length, 'bookmarks');
  }

  // Get cache statistics
  getStats(): {
    size: number;
    searchCacheSize: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      searchCacheSize: this.searchCache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const bookmarkCache = new BookmarkCacheService(); 