'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder } from '../../types/supabase';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';
import { SelectionProvider } from '../../contexts/SelectionContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  Archive,
  FolderIcon,
  ExternalLink,
  Eye,
  Trash2,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import NextLink from 'next/link';
import { useUser } from '@clerk/nextjs';
import { cn, getDomainFromUrl, getFaviconUrl } from '../../lib/utils';
import Image from 'next/image';

interface CategoryPageContentProps {
  categorySlug: string;
}

// Simple Bookmark List Item Component for vertical list display
interface BookmarkListItemProps {
  bookmark: BookmarkWithRelations;
  folders: Folder[];
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onDeleted: () => void;
  onOpenDetail?: () => void;
}

function BookmarkListItem({ bookmark, onUpdated, onDeleted, onOpenDetail }: BookmarkListItemProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const bookmarkService = user ? new BookmarkService(user.id) : null;

  const handleToggleFavorite = async () => {
    if (!bookmarkService) return;
    
    try {
      setLoading(true);
      const updated = await bookmarkService.updateBookmark(bookmark.id, {
        is_favorite: !bookmark.is_favorite
      });
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_favorite ? '❤️ Added to favorites' : '💔 Removed from favorites');
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/bookmarks?id=${bookmark.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      onDeleted();
      toast.success('Bookmark deleted successfully');
    } catch {
      toast.error('Failed to delete bookmark');
    } finally {
      setLoading(false);
    }
  };

  const domain = getDomainFromUrl(bookmark.url);
  const faviconUrl = getFaviconUrl(bookmark.url);

  return (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 group">
      {/* Favicon */}
      <div className="flex-shrink-0 mr-4">
        {faviconUrl ? (
          <Image
            src={faviconUrl}
            alt={`${domain} favicon`}
            width={20}
            height={20}
            className="w-5 h-5"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={cn(
          "w-5 h-5 bg-gray-400 rounded-sm flex items-center justify-center",
          faviconUrl && "hidden"
        )}>
          <Globe className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                onClick={() => onOpenDetail?.()}>
              {bookmark.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {bookmark.url}
            </p>
            {bookmark.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                {bookmark.description}
              </p>
            )}
            
            {/* Tags and folder info */}
            <div className="flex items-center gap-3 mt-2">
              {bookmark.folder && (
                <Badge variant="outline" className="text-xs">
                  {bookmark.folder.name}
                </Badge>
              )}
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="flex gap-1">
                  {bookmark.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {bookmark.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{bookmark.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleToggleFavorite}
              disabled={loading}
            >
              <Heart className={cn(
                "h-4 w-4",
                bookmark.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
              )} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => window.open(bookmark.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onOpenDetail?.()}
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryPageContent({ categorySlug }: CategoryPageContentProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'url'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list for category pages
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showBookmarkDetail, setShowBookmarkDetail] = useState(false);

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
        description: 'Tools to boost your productivity',
        color: 'text-green-600'
      },
      learning: { 
        title: 'Learning', 
        icon: GraduationCap, 
        description: 'Educational resources and courses',
        color: 'text-indigo-600'
      },
      entertainment: { 
        title: 'Entertainment', 
        icon: Music, 
        description: 'Fun and entertainment content',
        color: 'text-pink-600'
      },
      work: { 
        title: 'Work', 
        icon: Briefcase, 
        description: 'Work-related bookmarks',
        color: 'text-gray-700'
      },
      gaming: { 
        title: 'Gaming', 
        icon: Gamepad2, 
        description: 'Gaming resources and entertainment',
        color: 'text-orange-600'
      },
      shopping: { 
        title: 'Shopping', 
        icon: ShoppingCart, 
        description: 'Shopping sites and deals',
        color: 'text-emerald-600'
      },
      tools: { 
        title: 'Tools', 
        icon: Wrench, 
        description: 'Useful tools and utilities',
        color: 'text-yellow-600'
      },
      starred: { 
        title: 'Starred', 
        icon: Star, 
        description: 'Your starred bookmarks',
        color: 'text-yellow-500'
      },
      archived: { 
        title: 'Archived', 
        icon: Archive, 
        description: 'Archived bookmarks',
        color: 'text-gray-500'
      }
    };

    // Convert slug back to folder name for dynamic folders
    const folderTitle = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return configs[slug as keyof typeof configs] || {
      title: folderTitle,
      icon: FolderIcon,
      description: `Bookmarks organized in ${folderTitle} folder`,
      color: 'text-blue-600'
    };
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
      
      const [bookmarksResponse, foldersResponse] = await Promise.all([
        fetch('/api/bookmarks'),
        fetch('/api/folders')
      ]);

      if (!bookmarksResponse.ok || !foldersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [bookmarksData, foldersData] = await Promise.all([
        bookmarksResponse.json(),
        foldersResponse.json()
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
        // Match folder by name (case-insensitive) or by slug
        const folderName = bookmark.folder?.name?.toLowerCase() || 'uncategorized';
        const folderSlug = folderName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const folderMatch = folderName === categorySlug.toLowerCase() || folderSlug === categorySlug.toLowerCase();
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
              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'title' | 'url') => setSortBy(value)}>
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
            : "space-y-3"
          }>
            {filteredBookmarks.map((bookmark) => {
              // Calculate total visits for percentage calculation
              const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
              
              return viewMode === 'list' ? (
                <BookmarkListItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  folders={folders}
                  onUpdated={handleBookmarkUpdated}
                  onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                  onOpenDetail={() => handleOpenDetail(bookmark)}
                />
              ) : (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  folders={folders}
                  onUpdated={handleBookmarkUpdated}
                  onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                  onOpenDetail={() => handleOpenDetail(bookmark)}
                  totalBookmarkVisits={totalVisits}
                />
              );
            })}
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