'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { Folder, Tag } from '../../types/supabase';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { SelectionProvider } from '../../contexts/SelectionContext';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { 
  Search, 
  ArrowLeft,
  Grid, 
  List, 
  RefreshCw,
  BookOpen,
  Heart,
  Code,
  Palette,
  Zap,
  GraduationCap,
  Music,
  FileText,
  Briefcase,
  Gamepad2,
  ShoppingCart,
  Wrench,
  Star,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NextLink from 'next/link';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';

interface CategoryPageContentProps {
  categorySlug: string;
}

export function CategoryPageContent({ categorySlug }: CategoryPageContentProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showBookmarkDetail, setShowBookmarkDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'url'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Category configuration
  const getCategoryConfig = (slug: string) => {
    const configs = {
      all: { 
        title: 'All Bookmarks', 
        icon: BookOpen, 
        description: 'All your saved bookmarks',
        color: 'text-gray-700'
      },
      favorites: { 
        title: 'Favorites', 
        icon: Heart, 
        description: 'Your favorite bookmarks',
        color: 'text-red-600'
      },
      uncategorized: { 
        title: 'Uncategorized', 
        icon: FileText, 
        description: 'Bookmarks without a specific category',
        color: 'text-gray-600'
      },
      development: { 
        title: 'Development', 
        icon: Code, 
        description: 'Development tools and resources',
        color: 'text-blue-600'
      },
      design: { 
        title: 'Design', 
        icon: Palette, 
        description: 'Design inspiration and tools',
        color: 'text-purple-600'
      },
      productivity: { 
        title: 'Productivity', 
        icon: Zap, 
        description: 'Productivity apps and workflows',
        color: 'text-green-600'
      },
      learning: { 
        title: 'Learning', 
        icon: GraduationCap, 
        description: 'Educational content and courses',
        color: 'text-yellow-600'
      },
      entertainment: { 
        title: 'Entertainment', 
        icon: Music, 
        description: 'Entertainment and leisure content',
        color: 'text-pink-600'
      }
    };
    return configs[slug as keyof typeof configs] || configs.all;
  };

  const categoryConfig = getCategoryConfig(categorySlug);
  const CategoryIcon = categoryConfig.icon;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [bookmarksData, foldersData] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders()
      ]);
      
      setBookmarks(bookmarksData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load bookmarks: ${errorMessage}`);
      toast.error(`Failed to load bookmarks: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookmarks based on category
  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      if (categorySlug === 'all') {
        return matchesSearch;
      } else if (categorySlug === 'favorites') {
        return matchesSearch && bookmark.is_favorite;
      } else {
        // Match folder by name (case-insensitive)
        const folderMatch = bookmark.folder?.name?.toLowerCase() === categorySlug.toLowerCase();
        return matchesSearch && folderMatch;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'url':
          return a.url.localeCompare(b.url);
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  const handleBookmarkUpdated = (updatedBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => prev.map(b => 
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
    toast.success('Bookmark updated successfully');
  };

  const handleBookmarkDeleted = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    toast.success('Bookmark deleted successfully');
  };

  const handleOpenDetail = (bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setShowBookmarkDetail(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading bookmarks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold">Error Loading Bookmarks</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <SelectionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button and title */}
            <div className="flex items-center space-x-4">
              <NextLink href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </NextLink>
              
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${categoryConfig.color}`}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categoryConfig.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {categoryConfig.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">A to Z</SelectItem>
                  <SelectItem value="url">By URL</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredBookmarks.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'} found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CategoryIcon className={`h-12 w-12 ${categoryConfig.color} mb-4`} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No bookmarks found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                {searchTerm 
                  ? `No bookmarks match your search "${searchTerm}"`
                  : `No bookmarks in ${categoryConfig.title.toLowerCase()} yet`
                }
              </p>
              <NextLink href="/dashboard">
                <Button>
                  Back to Dashboard
                </Button>
              </NextLink>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                folders={folders}
                onUpdated={handleBookmarkUpdated}
                onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                onOpenDetail={() => handleOpenDetail(bookmark)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        bookmark={selectedBookmark}
        folders={folders}
        tags={[]} // We'll need to load tags if needed
        isOpen={showBookmarkDetail}
        onClose={() => {
          setShowBookmarkDetail(false);
          setSelectedBookmark(null);
        }}
        onUpdated={handleBookmarkUpdated}
      />
    </div>
    </SelectionProvider>
  );
} 