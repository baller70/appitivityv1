'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Search, 
  Filter, 
  Tag, 
  Folder, 
  Clock, 
  TrendingUp, 
  Zap,
  Heart,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder as FolderType, Tag as TagType } from '../../types/supabase';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { toast } from 'sonner';

interface EnhancedSearchDashboardProps {
  userId: string;
}

export function EnhancedSearchDashboard({ userId }: EnhancedSearchDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBookmarks([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await apiClient.searchBookmarks(query);
      setBookmarks(results);
      
      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [userId, searchHistory]);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, performSearch]);

  const loadInitialData = useCallback(async () => {
    try {
      const [foldersData, tagsData] = await Promise.all([
        apiClient.getFolders(),
        apiClient.getTags()
      ]);
      setFolders(foldersData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enhanced Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover your bookmarks with advanced search and filtering
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Smart Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bookmarks, tags, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Folder className="h-4 w-4" />
                All Folders
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Tag className="h-4 w-4" />
                All Tags
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Any Time
              </Button>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && !searchQuery && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery(query)}
                      className="text-xs"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Results
                {bookmarks.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({bookmarks.length} found)
                  </span>
                )}
              </h2>
              
              {bookmarks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Sort by Relevance
                  </Button>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">Searching...</span>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && bookmarks.length > 0 && (
              <div className="grid gap-4">
                {bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    folders={folders}
                    onUpdated={(updatedBookmark) => {
                      setBookmarks(prev => prev.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
                    }}
                    onDeleted={() => {
                      setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
                    }}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchQuery && bookmarks.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <Search className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!searchQuery && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Quick Search
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find bookmarks instantly with smart suggestions
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Favorites
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse your most important bookmarks
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Smart Collections
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered bookmark recommendations
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 