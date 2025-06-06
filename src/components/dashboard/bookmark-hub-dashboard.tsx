'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NextLink from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { Button } from '../ui/button';
import { BookmarkCard } from '../bookmarks/bookmark-card';

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
  Trello,
  ExternalLink,
  Folder as FolderIcon,
  Eye,
  Edit,
  Trash2,
  Tags,
  User,
  LogOut,
  Archive,
  FileText,
  Globe,
  Clock,
  Activity,
  Zap,
  Target,
  CheckCircle,
  Info,
  MoreVertical,
  LayoutGrid,
  X,
  CheckSquare
} from 'lucide-react';
import { BookmarkValidationModal } from '../bookmarks/bookmark-validation-modal';
import { SelectionProvider, useSelection } from '../../contexts/SelectionContext';
import { MassActionsToolbar } from './MassActionsToolbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';
import { BulkImportModal } from '../bulk-import-modal';
import { BookmarkListView } from '../bookmarks/bookmark-list-view';
import { BookmarkKanban } from '../bookmarks/bookmark-kanban';
import { Timeline } from '../ui/timeline';
import { KanbanView } from '../views/kanban-view';
import { TimelineView } from '../views/timeline-view';
import { ListView } from '../views/list-view';
import { CompactView } from '../views/compact-view';
import { EnhancedBookmarkDialog } from '../bookmarks/enhanced-bookmark-dialog';
import { BookmarkStats } from './bookmark-stats';
import { FolderGridView } from '../folders/folder-grid-view';
import { FolderOrgChartView } from '../folders/folder-org-chart-view';
import { FolderFormDialog } from '../folders/folder-form-dialog';
import { FilterPopover } from '../ui/filter-popover';


interface BookmarkHubDashboardProps {
  userId: string;
  userData: {
    id: string;
    firstName: string | null;
    email: string | undefined;
  };
}

type ViewMode = 'grid' | 'list' | 'compact' | 'kanban' | 'timeline' | 'folder' | 'org-chart';

function BookmarkHubDashboardContent({ userId, userData }: BookmarkHubDashboardProps) {
  const { enterSelectionMode, isSelectionMode } = useSelection();
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');

  const [showBulkImport, setShowBulkImport] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showBookmarkDetail, setShowBookmarkDetail] = useState(false);
  const [showEnhancedDialog, setShowEnhancedDialog] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Filter state for the new FilterPopover
  const [filters, setFilters] = useState({
    contentType: 'all' as 'all' | 'bookmarks' | 'notes' | 'tags',
    context: 'all' as 'all' | 'personal' | 'work' | 'shared',
    sortBy: 'newest' as 'newest' | 'oldest' | 'title' | 'url' | 'recent' | 'visits' | 'favorites'
  });

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
      { name: 'DEVELOPMENT', description: 'Development tools and resources', color: '#3b82f6', parent_id: null },
      { name: 'DESIGN', description: 'Design inspiration and tools', color: '#8b5cf6', parent_id: null },
      { name: 'PRODUCTIVITY', description: 'Productivity apps and workflows', color: '#10b981', parent_id: null },
      { name: 'LEARNING', description: 'Educational content and courses', color: '#f59e0b', parent_id: null },
      { name: 'ENTERTAINMENT', description: 'Entertainment and leisure content', color: '#ef4444', parent_id: null }
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
    toast.success('Bookmark created successfully');
  };

  const handleEnhancedBookmarkSubmit = async (bookmarkData: BookmarkWithRelations) => {
    try {
      let folderId = bookmarkData.folder_id;
      
      // If no folder is selected, create or find default "Uncategorized" folder
      if (!folderId) {
        let defaultFolder = folders.find(f => f.name.toLowerCase() === 'uncategorized');
        
        if (!defaultFolder) {
          // Create the default folder
          try {
            defaultFolder = await apiClient.createFolder({
              name: 'Uncategorized',
              description: 'Default folder for bookmarks without a category',
              color: '#6b7280', // Gray color
              parent_id: null
            });
            setFolders(prev => [...prev, defaultFolder!]);
            toast.success('Created default "Uncategorized" folder');
          } catch (error) {
            console.error('Failed to create default folder:', error);
            // Continue without folder if creation fails
          }
        }
        
        folderId = defaultFolder?.id || null;
      }

      // Use API route instead of direct BookmarkService to ensure proper authentication
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: bookmarkData.url,
          title: bookmarkData.title,
          description: bookmarkData.description || '',
          folder_id: folderId,
          favicon_url: bookmarkData.favicon_url,
          tagIds: bookmarkData.tags?.map(tag => tag.id) || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bookmark');
      }

      const newBookmark = await response.json();
      setBookmarks(prev => [newBookmark, ...prev]);
      toast.success('Bookmark created successfully');
    } catch (error) {
      console.error('Failed to create bookmark:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create bookmark');
    }
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
      // Ensure default folder exists for bulk import
      let defaultFolder = folders.find(f => f.name.toLowerCase() === 'uncategorized');
      if (!defaultFolder) {
        try {
          defaultFolder = await apiClient.createFolder({
            name: 'Uncategorized',
            description: 'Default folder for bookmarks without a category',
            color: '#6b7280', // Gray color
            parent_id: null
          });
          setFolders(prev => [...prev, defaultFolder!]);
        } catch (error) {
          console.error('Failed to create default folder:', error);
        }
      }

      for (const bookmark of bookmarks) {
        let folderId = bookmark.folderId;
        
        // If no folder specified, use default folder
        if (!folderId && defaultFolder) {
          folderId = defaultFolder.id;
        }

        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: bookmark.url,
            title: bookmark.title || bookmark.url,
            description: bookmark.description || '',
            folder_id: folderId || null,
            favicon_url: bookmark.favicon || null,
            tagIds: bookmark.tagIds || []
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to import bookmark: ${bookmark.url}`);
        }
      }
      await loadData();
      setShowBulkImport(false);
      toast.success(`Successfully imported ${bookmarks.length} bookmarks`);
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import bookmarks');
      throw error;
    }
  };

  // Folder management functions
  const handleCreateFolder = () => {
    setEditingFolder(null);
    setShowFolderForm(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderForm(true);
  };

  const handleFolderSubmit = async (data: { name: string; description?: string; color?: string }) => {
    try {
      if (editingFolder) {
        // Update existing folder
        const updated = await apiClient.updateFolder(editingFolder.id, data);
        setFolders(prev => prev.map(f => f.id === editingFolder.id ? updated : f));
        toast.success('Folder updated successfully');
      } else {
        // Create new folder
        const newFolder = await apiClient.createFolder({
          name: data.name,
          description: data.description || null,
          color: data.color || null,
          parent_id: null
        });
        setFolders(prev => [...prev, newFolder]);
        toast.success('Folder created successfully');
      }
    } catch (error) {
      console.error('Failed to save folder:', error);
      toast.error('Failed to save folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? All bookmarks in this folder will be moved to "No category".')) {
      return;
    }

    try {
      // Move all bookmarks from this folder to no category
      const bookmarksInFolder = bookmarks.filter(b => b.folder_id === folderId);
      for (const bookmark of bookmarksInFolder) {
        await apiClient.updateBookmark(bookmark.id, { folder_id: null });
      }

      // Delete the folder
      await apiClient.deleteFolder(folderId);
      
      // Update local state
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setBookmarks(prev => prev.map(b => 
        b.folder_id === folderId ? { ...b, folder_id: null } : b
      ));
      
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const handleAddBookmarkToFolder = (folderId: string) => {
    setTargetFolderId(folderId);
    setShowEnhancedDialog(true);
  };

  const handleDropBookmarkToFolder = async (folderId: string, bookmark: BookmarkWithRelations) => {
    try {
      const updated = await apiClient.updateBookmark(bookmark.id, { folder_id: folderId });
      setBookmarks(prev => prev.map(b => 
        b.id === bookmark.id ? { ...b, folder_id: folderId } : b
      ));
      
      const folder = folders.find(f => f.id === folderId);
      toast.success(`Bookmark moved to ${folder?.name || 'folder'}`);
    } catch (error) {
      console.error('Failed to move bookmark:', error);
      toast.error('Failed to move bookmark');
    }
  };

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = bookmarks
    .filter(bookmark => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Content type filter
      const matchesContentFilter = filters.contentType === 'all' || 
        (filters.contentType === 'bookmarks' && !(bookmark.is_archived ?? false)) ||
        (filters.contentType === 'notes' && bookmark.description && bookmark.description.length > 0) ||
        (filters.contentType === 'tags' && bookmark.tags && bookmark.tags.length > 0);

      // Context filter (based on folder/category)
      const matchesContextFilter = filters.context === 'all' ||
        (filters.context === 'personal' && (!bookmark.folder || bookmark.folder.name.toLowerCase().includes('personal'))) ||
        (filters.context === 'work' && bookmark.folder?.name.toLowerCase().includes('work')) ||
        (filters.context === 'shared' && bookmark.folder?.name.toLowerCase().includes('shared'));
      
      // Category filter from sidebar
      let matchesCategoryFilter = true;
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'favorites') {
          matchesCategoryFilter = bookmark.is_favorite ?? false;
        } else {
          // Categories from reference website
          matchesCategoryFilter = bookmark.folder?.name?.toLowerCase() === selectedCategory.toLowerCase();
        }
      }
      
      return matchesSearch && matchesContentFilter && matchesContextFilter && matchesCategoryFilter;
    })
    .filter(bookmark => {
      // Tag filter
      if (selectedTags.length === 0) return true;
      return bookmark.tags?.some(tag => selectedTags.includes(tag.id)) || false;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'url':
          return a.url.localeCompare(b.url);
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'recent':
          return (b.last_visited_at ? new Date(b.last_visited_at).getTime() : 0) - 
                 (a.last_visited_at ? new Date(a.last_visited_at).getTime() : 0);
        case 'visits':
          return (b.visit_count || 0) - (a.visit_count || 0);
        case 'favorites':
          return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
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

  // Transform bookmarks to timeline format
  const transformBookmarksToTimeline = (bookmarks: BookmarkWithRelations[]) => {
    // Group bookmarks by date
    const groupedByDate = bookmarks.reduce((acc, bookmark) => {
      const date = new Date(bookmark.created_at || Date.now());
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(bookmark);
      return acc;
    }, {} as Record<string, BookmarkWithRelations[]>);

    // Convert to timeline format
    return Object.entries(groupedByDate)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, bookmarks]) => ({
        title: date,
        content: (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id} 
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenDetail(bookmark)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {bookmark.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {bookmark.title}
                    </h3>
                    {bookmark.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new URL(bookmark.url).hostname}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(bookmark.created_at || Date.now()).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                                             {bookmark.folder && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                           <FolderIcon className="w-3 h-3 mr-1" />
                           {bookmark.folder.name.toUpperCase()}
                         </span>
                       )}
                    </div>
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bookmark.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {bookmark.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{bookmark.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(bookmark.url, '_blank');
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {bookmark.is_favorite && (
                      <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ),
      }));
  };

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
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <NextLink href="/dashboard">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    BOOKMARKHUB
                  </h1>
                </NextLink>
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
                NAVIGATION
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
                CATEGORIES
              </h3>
              <nav className="space-y-1">
                {/* All Categories */}
                <NextLink
                  href="/category/all"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>All</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.length}
                  </span>
                </NextLink>

                {/* Development */}
                <NextLink
                  href="/category/development"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>Development</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name?.toLowerCase() === 'development').length}
                  </span>
                </NextLink>

                {/* Design */}
                <NextLink
                  href="/category/design"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>Design</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name?.toLowerCase() === 'design').length}
                  </span>
                </NextLink>

                {/* Productivity */}
                <NextLink
                  href="/category/productivity"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>Productivity</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name?.toLowerCase() === 'productivity').length}
                  </span>
                </NextLink>

                {/* Learning */}
                <NextLink
                  href="/category/learning"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>Learning</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name?.toLowerCase() === 'learning').length}
                  </span>
                </NextLink>

                {/* Entertainment */}
                <NextLink
                  href="/category/entertainment"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>Entertainment</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.folder?.name?.toLowerCase() === 'entertainment').length}
                  </span>
                </NextLink>

                {/* Favorites */}
                <NextLink
                  href="/category/favorites"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>Favorites</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                    {bookmarks.filter(b => b.is_favorite).length}
                  </span>
                </NextLink>
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
          <BookmarkStats bookmarks={bookmarks} />

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

                {/* Modern Filter Popover */}
                <FilterPopover
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>

              <div className="flex items-center space-x-2">
                {/* View Mode Navigation Buttons */}
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

                  {/* Folder View */}
                  <Button
                    variant={viewMode === 'folder' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('folder')}
                    className="p-2 rounded-none border-r border-gray-300 dark:border-gray-600"
                    title="Folder View"
                  >
                    <FolderIcon className="h-4 w-4" />
                  </Button>

                  {/* Org Chart View */}
                  <Button
                    variant={viewMode === 'org-chart' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('org-chart')}
                    className="p-2 rounded-none border-r border-gray-300 dark:border-gray-600"
                    title="Organizational Chart View"
                  >
                    <BarChart3 className="h-4 w-4" />
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
                    <Trello className="h-4 w-4" />
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

                <Button onClick={() => setShowEnhancedDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>

                <Button 
                  variant="outline" 
                  onClick={enterSelectionMode}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled={isSelectionMode}
                  title={isSelectionMode ? 'Selection mode is active' : 'Enter selection mode to bulk delete, move, or manage bookmarks'}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {isSelectionMode ? 'Selection Active' : 'Select'}
                </Button>

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
            {viewMode === 'folder' ? (
              // Dedicated Folder View Mode - always shows folders
              <FolderGridView
                folders={folders}
                bookmarks={bookmarks}
                onCreateFolder={handleCreateFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                onAddBookmarkToFolder={handleAddBookmarkToFolder}
                onDropBookmarkToFolder={handleDropBookmarkToFolder}
                onBookmarkUpdated={handleBookmarkUpdated}
                onBookmarkDeleted={handleBookmarkDeleted}
                onOpenDetail={handleOpenDetail}
                currentFolderId={currentFolderId}
                onFolderNavigate={setCurrentFolderId}
              />
            ) : viewMode === 'org-chart' ? (
              // Organizational Chart View Mode - folder hierarchy visualization
              <FolderOrgChartView
                folders={folders}
                bookmarks={bookmarks}
                onCreateFolder={handleCreateFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                onAddBookmarkToFolder={handleAddBookmarkToFolder}
                onDropBookmarkToFolder={handleDropBookmarkToFolder}
                onBookmarkUpdated={handleBookmarkUpdated}
                onBookmarkDeleted={handleBookmarkDeleted}
                onOpenDetail={handleOpenDetail}
                currentFolderId={currentFolderId}
                onFolderNavigate={setCurrentFolderId}
              />
            ) : viewMode === 'timeline' ? (
              <TimelineView
                bookmarks={filteredAndSortedBookmarks}
                onBookmarkClick={handleOpenDetail}
                onFavorite={(bookmark: BookmarkWithRelations) => {
                  const updatedBookmark = { ...bookmark, is_favorite: !bookmark.is_favorite };
                  handleBookmarkUpdated(updatedBookmark);
                }}
                loading={loading}
              />
            ) : viewMode === 'kanban' ? (
              <KanbanView
                bookmarks={filteredAndSortedBookmarks}
                onBookmarkClick={handleOpenDetail}
                onFavorite={(bookmark: BookmarkWithRelations) => {
                  const updatedBookmark = { ...bookmark, is_favorite: !bookmark.is_favorite };
                  handleBookmarkUpdated(updatedBookmark);
                }}
                loading={loading}
              />
            ) : viewMode === 'list' ? (
              <ListView
                bookmarks={filteredAndSortedBookmarks}
                onBookmarkClick={handleOpenDetail}
                onFavorite={(bookmark: BookmarkWithRelations) => {
                  const updatedBookmark = { ...bookmark, is_favorite: !bookmark.is_favorite };
                  handleBookmarkUpdated(updatedBookmark);
                }}
                onReorder={(reorderedBookmarks: BookmarkWithRelations[]) => {
                  setBookmarks(reorderedBookmarks);
                }}
                loading={loading}
              />
            ) : viewMode === 'compact' ? (
              <CompactView
                bookmarks={filteredAndSortedBookmarks}
                folders={folders}
                tags={tags}
                onBookmarkUpdated={handleBookmarkUpdated}
                onBookmarkDeleted={(bookmarkId: string) => {
                  handleBookmarkDeleted(bookmarkId);
                }}
                onCreateFolder={handleCreateFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                onAddBookmarkToFolder={handleAddBookmarkToFolder}
              />
            ) : (
              // Grid View - shows bookmark cards
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onUpdated={handleBookmarkUpdated}
                    onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                    onOpenDetail={() => handleOpenDetail(bookmark)}
                    folders={folders}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
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

      <EnhancedBookmarkDialog
        open={showEnhancedDialog}
        onOpenChange={setShowEnhancedDialog}
        folders={folders}
        tags={tags}
        onSubmit={handleEnhancedBookmarkSubmit}
      />

      <FolderFormDialog
        open={showFolderForm}
        onOpenChange={setShowFolderForm}
        folder={editingFolder}
        onSubmit={handleFolderSubmit}
      />
    </>
  );
}

export function BookmarkHubDashboard({ userId, userData }: BookmarkHubDashboardProps) {
  return (
    <SelectionProvider>
      <BookmarkHubDashboardContent userId={userId} userData={userData} />
    </SelectionProvider>
  );
}