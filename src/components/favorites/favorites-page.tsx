'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import { apiClient } from '../../lib/api/client';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowLeft, 
  Heart, 
  Search,
  Grid3X3,
  List,
  LayoutGrid,
  Columns,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SelectionProvider } from '../../contexts/SelectionContext';

interface FavoritesPageProps {
  userId: string;
}

export function FavoritesPage({ userId }: FavoritesPageProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact' | 'kanban' | 'timeline'>('grid');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data
      const [bookmarksData, foldersData, tagsData] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders(),
        apiClient.getTags()
      ]);

      // Filter only favorite bookmarks
      const favoriteBookmarks = bookmarksData.filter(bookmark => bookmark.is_favorite);
      
      setBookmarks(favoriteBookmarks);
      setFolders(foldersData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(term) ||
        bookmark.url.toLowerCase().includes(term) ||
        bookmark.description?.toLowerCase().includes(term) ||
        bookmark.tags?.some(tag => tag.name.toLowerCase().includes(term))
      );
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [bookmarks, searchTerm, applyFilters]);

  const handleBookmarkUpdated = (updatedBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => prev.map(b => 
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
    
    // If bookmark is no longer favorite, remove it from the list
    if (!updatedBookmark.is_favorite) {
      setBookmarks(prev => prev.filter(b => b.id !== updatedBookmark.id));
    }
    
    setSelectedBookmark(updatedBookmark);
  };

  const handleBookmarkDeleted = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    setShowDetailModal(false);
    setSelectedBookmark(null);
  };

  const handleOpenDetail = (bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setShowDetailModal(true);
  };

  const renderBookmarks = () => {
    if (filteredBookmarks.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Bookmarks you mark as favorites will appear here
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      );
    }

    const gridClasses = {
      grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      list: 'grid-cols-1',
      compact: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
      kanban: 'grid-cols-1 md:grid-cols-3',
      timeline: 'grid-cols-1'
    };

    return (
      <div className={`grid gap-6 ${gridClasses[viewMode]}`}>
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SelectionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Favorites ({bookmarks.length})
              </h1>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="px-3"
            >
              <Columns className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="px-3"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {renderBookmarks()}
      </main>

      {/* Detail Modal */}
      <BookmarkDetailModal
        bookmark={selectedBookmark}
        folders={folders}
        tags={tags}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBookmark(null);
        }}
        onUpdated={handleBookmarkUpdated}
      />
    </div>
    </SelectionProvider>
  );
} 