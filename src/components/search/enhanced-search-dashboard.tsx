'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, TrendingUp, Clock, Tag, Folder, Zap, X, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { SearchService, type SearchFilters, type SearchResult } from '../../lib/services/search';
import { contentExtractionService } from '../../lib/services/content-extraction';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { useDebounce } from '../../hooks/use-debounce';
import { toast } from 'sonner';

interface EnhancedSearchDashboardProps {
  userId: string;
  folders: any[];
  tags: any[];
}

export function EnhancedSearchDashboard({ userId, folders, tags }: EnhancedSearchDashboardProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced' | 'ai'>('basic');
  const [contentKeywords, setContentKeywords] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState({
    totalTime: 0,
    indexedBookmarks: 0,
    suggestions: 0
  });

  const debouncedQuery = useDebounce(query, 300);
  const [searchService] = useState(() => new SearchService(userId));
  const [bookmarkService] = useState(() => new BookmarkService(userId));

  // Perform search when query or filters change
  useEffect(() => {
    performSearch();
  }, [debouncedQuery, filters]);

  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim() && Object.keys(filters).length <= 1) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        query: debouncedQuery
      };

      let result: SearchResult;
      if (searchMode === 'advanced') {
        // Use enhanced search with content analysis
        const enhancedResult = await searchService.searchWithContentAnalysis(searchFilters);
        result = enhancedResult;
        setContentKeywords(enhancedResult.contentKeywords || []);
      } else {
        // Use basic search
        result = await searchService.search(searchFilters);
        setContentKeywords([]);
      }

      setSearchResults(result);
      setSearchStats({
        totalTime: Date.now() - startTime,
        indexedBookmarks: result.total,
        suggestions: 0 // Would be populated by actual suggestions
      });

    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, filters, searchMode, searchService]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
  };

  const handleTagFilter = (tagId: string) => {
    const currentTags = filters.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    handleFilterChange({ tagIds: newTags.length > 0 ? newTags : undefined });
  };

  const enhanceBookmarksWithContent = useCallback(async (bookmarks: BookmarkWithRelations[]) => {
    if (searchMode !== 'ai' || bookmarks.length === 0) return bookmarks;

    try {
      // Extract content for first few bookmarks to demonstrate capability
      const urlsToEnhance = bookmarks.slice(0, 5).map(b => b.url);
      const contentResults = await contentExtractionService.bulkExtract(urlsToEnhance);
      
      return bookmarks.map(bookmark => {
        const contentData = contentResults.get(bookmark.url);
        if (contentData?.success && contentData.metadata) {
          return {
            ...bookmark,
            contentMetadata: contentData.metadata
          };
        }
        return bookmark;
      });
    } catch (error) {
      console.error('Content enhancement failed:', error);
      return bookmarks;
    }
  }, [searchMode]);

  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'query' && filters[key as keyof SearchFilters] !== undefined
  ).length;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Enhanced Search
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {searchStats.indexedBookmarks} bookmarks indexed
              </Badge>
              {searchStats.totalTime > 0 && (
                <Badge variant="outline" className="text-xs">
                  {searchStats.totalTime}ms
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookmarks, notes, TODOs, and content..."
              className="pl-10 pr-20 h-12 text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {isSearching && (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
              <Button
                variant={activeFiltersCount > 0 ? "default" : "ghost"}
                size="sm"
                onClick={() => {/* Toggle filters panel */}}
                className="h-8"
              >
                <Filter className="h-3 w-3 mr-1" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Mode Selector */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={searchMode === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('basic')}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Basic
              </Button>
              <Button
                variant={searchMode === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('advanced')}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced
              </Button>
              <Button
                variant={searchMode === 'ai' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('ai')}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                AI Enhanced
              </Button>
            </div>

            {/* Search Mode Description */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchMode === 'basic' && (
                <p>Fast fuzzy search across titles, descriptions, URLs, tags, and folders.</p>
              )}
              {searchMode === 'advanced' && (
                <div className="space-y-2">
                  <p>Enhanced search including notes, TODOs, and content analysis.</p>
                  {contentKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Content keywords:</span>
                      {contentKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {searchMode === 'ai' && (
                <p>AI-powered search with content extraction and semantic understanding.</p>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          {(filters.tagIds || filters.folderId || filters.isFavorite !== undefined) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 self-center">Active filters:</span>
              
              {filters.folderId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {folders.find(f => f.id === filters.folderId)?.name || 'Unknown'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange({ folderId: undefined })}
                  />
                </Badge>
              )}
              
              {filters.tagIds?.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleTagFilter(tagId)}
                    />
                  </Badge>
                ) : null;
              })}
              
              {filters.isFavorite && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ⭐ Favorites
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange({ isFavorite: undefined })}
                  />
                </Badge>
              )}
              
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {searchResults.total} bookmark{searchResults.total !== 1 ? 's' : ''} found
              {query && ` for "${query}"`}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {searchStats.totalTime}ms
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Ranked by relevance
              </span>
            </div>
          </div>

          {/* Search Facets */}
          {(searchResults.facets.folders.length > 0 || searchResults.facets.tags.length > 0) && (
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.facets.folders.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Folder className="h-4 w-4" />
                        Folders
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {searchResults.facets.folders.slice(0, 8).map(folder => (
                          <Badge
                            key={folder.id}
                            variant={filters.folderId === folder.id ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => handleFilterChange({ 
                              folderId: filters.folderId === folder.id ? undefined : folder.id 
                            })}
                          >
                            {folder.name} ({folder.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.facets.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {searchResults.facets.tags.slice(0, 8).map(tag => (
                          <Badge
                            key={tag.id}
                            variant={filters.tagIds?.includes(tag.id) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => handleTagFilter(tag.id)}
                          >
                            {tag.name} ({tag.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookmarks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                folders={folders}
                tags={tags}
                onUpdated={(updated) => {/* Handle update - would refresh search results */}}
                onDeleted={() => {/* Handle delete - would refresh search results */}}
              />
            ))}
          </div>

          {searchResults.bookmarks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookmarks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or filters.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Welcome State */}
      {!searchResults && !query && (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Enhanced Search Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Search across your bookmarks, notes, TODOs, and content. Our enhanced search understands context and provides intelligent suggestions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Fuzzy Search</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find bookmarks even with typos
                </p>
              </div>
              <div className="text-center">
                <SlidersHorizontal className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Deep Indexing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Search notes and TODOs
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">AI Enhanced</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Content analysis and keywords
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 