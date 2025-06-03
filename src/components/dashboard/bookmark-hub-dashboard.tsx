'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { Button } from '../ui/button';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { BookmarkForm } from '../bookmarks/bookmark-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { apiClient } from '../../lib/api/client';
import type { Folder, Tag } from '../../types/supabase';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Bookmark, 
  Star,
  TrendingUp,
  Calendar,
  BarChart3,
  Menu,
  Settings,
  Heart,
  AlertCircle,
  Upload,
  Shield,
  Rows3,
  Columns
} from 'lucide-react';
import { BookmarkValidationModal } from '../bookmarks/bookmark-validation-modal';
import { SelectionProvider } from '../../contexts/SelectionContext';
import { MassActionsToolbar } from './MassActionsToolbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';
import { BulkImportModal } from '../bulk-import-modal';

interface BookmarkHubDashboardProps {
  userId: string;
  userData: {
    id: string;
    firstName: string | null;
    email: string | undefined;
  };
}

export function BookmarkHubDashboard({ userId, userData }: BookmarkHubDashboardProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact' | 'kanban' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'url'>('newest');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showBookmarkDetail, setShowBookmarkDetail] = useState(false);

  const bookmarkService = new BookmarkService(userId);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.ensureUserProfile('user@example.com', 'User');
      
      const [bookmarksData, foldersData, tagsData] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders(),
        apiClient.getTags()
      ]);

      // Create default folders if none exist
      let finalFoldersData = foldersData;
      if (foldersData.length === 0) {
        const defaultFolders = [
          { name: 'Development', description: 'Development tools and resources', color: '#3b82f6', parent_id: null },
          { name: 'Design', description: 'Design inspiration and tools', color: '#8b5cf6', parent_id: null },
          { name: 'Productivity', description: 'Productivity apps and workflows', color: '#10b981', parent_id: null },
          { name: 'Learning', description: 'Educational content and courses', color: '#f59e0b', parent_id: null },
          { name: 'Entertainment', description: 'Entertainment and leisure content', color: '#ef4444', parent_id: null }
        ];

        const createdFolders: Folder[] = [];
        for (const folder of defaultFolders) {
          try {
            const created = await apiClient.createFolder(folder);
            createdFolders.push(created);
          } catch (error) {
            console.error(`Failed to create default folder ${folder.name}:`, error);
          }
        }
        finalFoldersData = createdFolders;
      }

      setBookmarks(bookmarksData);
      setFolders(finalFoldersData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load dashboard data: ${errorMessage}`);
      toast.error(`Failed to load dashboard data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBookmarkCreated = (newBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => [newBookmark, ...prev]);
    setShowAddBookmark(false);
    toast.success('Bookmark created successfully');
  };

  const handleBookmarkUpdated = (updatedBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => prev.map(b => 
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
    toast.success('Bookmark updated successfully');
  };

  const handleBookmarkDeleted = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    setShowBookmarkDetail(false);
    setSelectedBookmark(null);
    toast.success('Bookmark deleted successfully');
  };

  const handleOpenDetail = (bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setShowBookmarkDetail(true);
  };

  const handleBulkImport = async (bookmarks: { url: string; title?: string; description?: string; folderId?: string; tagIds?: string[]; favicon?: string; }[]) => {
    try {
      for (const bookmark of bookmarks) {
        await bookmarkService.createBookmark({
          url: bookmark.url,
          title: bookmark.title || bookmark.url,
          description: bookmark.description || '',
          folder_id: bookmark.folderId || null,
          favicon_url: bookmark.favicon || null
        }, bookmark.tagIds || []);
      }
      await loadData();
      setShowBulkImport(false);
      toast.success(`Successfully imported ${bookmarks.length} bookmarks`);
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast.error('Failed to import bookmarks');
      throw error;
    }
  };

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = bookmarks
    .filter(bookmark => {
      const matchesSearch = searchTerm === '' || 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'favorites') return matchesSearch && bookmark.is_favorite;
      
      // Categories from reference website
      if (selectedCategory === 'development') return matchesSearch && bookmark.folder?.name.toLowerCase() === 'development';
      if (selectedCategory === 'design') return matchesSearch && bookmark.folder?.name.toLowerCase() === 'design';
      if (selectedCategory === 'productivity') return matchesSearch && bookmark.folder?.name.toLowerCase() === 'productivity';
      if (selectedCategory === 'learning') return matchesSearch && bookmark.folder?.name.toLowerCase() === 'learning';
      if (selectedCategory === 'entertainment') return matchesSearch && bookmark.folder?.name.toLowerCase() === 'entertainment';
      
      return matchesSearch && bookmark.folder?.name.toLowerCase() === selectedCategory.toLowerCase();
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

  // Calculate stats
  const totalBookmarks = bookmarks.length;
  const thisMonthBookmarks = bookmarks.filter(b => {
    if (!b.created_at) return false;
    const bookmarkDate = new Date(b.created_at);
    const thisMonth = new Date();
    return bookmarkDate.getMonth() === thisMonth.getMonth() && 
           bookmarkDate.getFullYear() === thisMonth.getFullYear();
  }).length;
  const favoriteBookmarks = bookmarks.filter(b => b.is_favorite).length;
  const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Database Connection Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SelectionProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  BookmarkHub
                </h1>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            {!sidebarCollapsed && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your digital workspace
              </p>
            )}
          </div>

          {/* Navigation */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <nav className="space-y-1">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Dashboard
                </button>
                <button 
                  onClick={() => window.location.href = '/analytics'}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Analytics
                </button>
                <button 
                  onClick={() => window.location.href = '/favorites'}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Star className="mr-3 h-4 w-4" />
                  Favorites
                  <span className="ml-auto bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {favoriteBookmarks}
                  </span>
                </button>
                <button 
                  onClick={() => window.location.href = '/settings'}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </button>
              </nav>
            </div>
          )}

          {/* Categories */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <nav className="space-y-1">
                {/* Development */}
                <button
                  onClick={() => setSelectedCategory('development')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === 'development' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Development</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name.toLowerCase() === 'development').length}
                  </span>
                </button>

                {/* Design */}
                <button
                  onClick={() => setSelectedCategory('design')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === 'design' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Design</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name.toLowerCase() === 'design').length}
                  </span>
                </button>

                {/* Productivity */}
                <button
                  onClick={() => setSelectedCategory('productivity')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === 'productivity' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Productivity</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name.toLowerCase() === 'productivity').length}
                  </span>
                </button>

                {/* Learning */}
                <button
                  onClick={() => setSelectedCategory('learning')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === 'learning' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Learning</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name.toLowerCase() === 'learning').length}
                  </span>
                </button>

                {/* Entertainment */}
                <button
                  onClick={() => setSelectedCategory('entertainment')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === 'entertainment' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Entertainment</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name.toLowerCase() === 'entertainment').length}
                  </span>
                </button>
              </nav>
            </div>
          )}

          {/* Stats */}
          {!sidebarCollapsed && (
            <div className="p-4 flex-1">
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Bookmarks</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{totalBookmarks}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">+{thisMonthBookmarks}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Favorites</div>
                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{favoriteBookmarks}</div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle Sidebar Button for collapsed state */}
          {sidebarCollapsed && (
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => setSidebarCollapsed(false)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'Dashboard' : 
                   selectedCategory === 'favorites' ? 'Favorites' : 
                   selectedCategory === 'development' ? 'Development' :
                   selectedCategory === 'design' ? 'Design' :
                   selectedCategory === 'productivity' ? 'Productivity' :
                   selectedCategory === 'learning' ? 'Learning' :
                   selectedCategory === 'entertainment' ? 'Entertainment' :
                   selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {userData.firstName || userData.email}!
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>

          {/* Dashboard Stats Cards */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Bookmarks</p>
                    <p className="text-2xl font-bold">{totalBookmarks}</p>
                  </div>
                  <Bookmark className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">This Month</p>
                    <p className="text-2xl font-bold">+{thisMonthBookmarks}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Visits</p>
                    <p className="text-2xl font-bold">{totalVisits}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Favorites</p>
                    <p className="text-2xl font-bold">{favoriteBookmarks}</p>
                  </div>
                  <Heart className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {/* Search and Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search bookmarks, tags, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* First "All" Dropdown */}
                <Select value="all" onValueChange={() => {}}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="bookmarks">Bookmarks</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="tags">Tags</SelectItem>
                  </SelectContent>
                </Select>

                {/* Second "All" Dropdown */}
                <Select value="all" onValueChange={() => {}}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>

                {/* Last Visited Dropdown */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'title' | 'url')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Last Visited" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Last Visited</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="visits">Most Visited</SelectItem>
                    <SelectItem value="favorites">Favorites</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                {/* 5 View Mode Buttons */}
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  {/* Grid View */}
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2 rounded-r-none border-r border-gray-300 dark:border-gray-600"
                    title="Grid View"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>

                  {/* List View */}
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2 rounded-none border-r border-gray-300 dark:border-gray-600"
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </Button>

                  {/* Compact View */}
                  <Button
                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('compact')}
                    className="p-2 rounded-none border-r border-gray-300 dark:border-gray-600"
                    title="Compact View"
                  >
                    <Rows3 className="h-4 w-4" />
                  </Button>

                  {/* Kanban View */}
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="p-2 rounded-none border-r border-gray-300 dark:border-gray-600"
                    title="Kanban View"
                  >
                    <Columns className="h-4 w-4" />
                  </Button>

                  {/* Timeline View */}
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                    className="p-2 rounded-l-none"
                    title="Timeline View"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>

                <Dialog open={showAddBookmark} onOpenChange={setShowAddBookmark}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bookmark
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Add New Bookmark</DialogTitle>
                    </DialogHeader>
                    <BookmarkForm
                      onSubmit={handleBookmarkCreated}
                      folders={folders}
                      onCancel={() => setShowAddBookmark(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import URLs
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Bulk Import Bookmarks</DialogTitle>
                    </DialogHeader>
                    <BulkImportModal
                      isOpen={showBulkImport}
                      onImport={handleBulkImport}
                      folders={folders}
                      tags={tags}
                      onClose={() => setShowBulkImport(false)}
                    />
                  </DialogContent>
                </Dialog>

                <BookmarkValidationModal
                  bookmarks={filteredAndSortedBookmarks}
                  trigger={
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Check Links
                    </Button>
                  }
                />
              </div>
            </div>

            <MassActionsToolbar 
              bookmarks={filteredAndSortedBookmarks}
              userId={userId}
              onUpdate={loadData}
              folders={folders}
              tags={tags}
            />

            {/* Main Content Display */}
            {filteredAndSortedBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookmarks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first bookmark.'}
                </p>
                <Dialog open={showAddBookmark} onOpenChange={setShowAddBookmark}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Bookmark
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Add New Bookmark</DialogTitle>
                    </DialogHeader>
                    <BookmarkForm
                      onSubmit={handleBookmarkCreated}
                      folders={folders}
                      onCancel={() => setShowAddBookmark(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
                viewMode === 'list' ? "space-y-3" :
                viewMode === 'compact' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3" :
                viewMode === 'kanban' ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" :
                viewMode === 'timeline' ? "space-y-6" :
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              }>
                {viewMode === 'timeline' ? (
                  // Timeline View - Chronological with dates
                  filteredAndSortedBookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="flex">
                      <div className="flex-shrink-0 w-24 text-right pr-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(bookmark.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-px bg-gray-200 dark:bg-gray-700 mr-4 relative">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-2"></div>
                      </div>
                      <div className="flex-1">
                        <BookmarkCard
                          bookmark={bookmark}
                          onUpdated={handleBookmarkUpdated}
                          onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                          onOpenDetail={() => handleOpenDetail(bookmark)}
                          folders={folders}
                          tags={tags}
                        />
                      </div>
                    </div>
                  ))
                ) : viewMode === 'kanban' ? (
                  // Kanban View - Grouped by priority/folder
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['High', 'Medium', 'Low'].map(priority => (
                      <div key={priority} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                          {priority} Priority
                        </h3>
                        <div className="space-y-3">
                          {filteredAndSortedBookmarks
                            .filter(bookmark => (bookmark as BookmarkWithRelations & { priority?: string }).priority === priority.toLowerCase() || 
                              (priority === 'Medium' && !(bookmark as BookmarkWithRelations & { priority?: string }).priority))
                            .map((bookmark) => (
                              <BookmarkCard
                                key={bookmark.id}
                                bookmark={bookmark}
                                onUpdated={handleBookmarkUpdated}
                                onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                                onOpenDetail={() => handleOpenDetail(bookmark)}
                                folders={folders}
                                tags={tags}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Grid, List, and Compact Views
                  filteredAndSortedBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onUpdated={handleBookmarkUpdated}
                      onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                      onOpenDetail={() => handleOpenDetail(bookmark)}
                      folders={folders}
                      tags={tags}
                    />
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        bookmark={selectedBookmark}
        folders={folders}
        tags={tags}
        isOpen={showBookmarkDetail}
        onClose={() => {
          setShowBookmarkDetail(false);
          setSelectedBookmark(null);
        }}
        onUpdated={handleBookmarkUpdated}
      />
    </SelectionProvider>
  );
} 