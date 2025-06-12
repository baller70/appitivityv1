'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NextLink from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { Button } from '../ui/button';
import { BookmarkCard } from '../bookmarks/bookmark-card';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { apiClient } from '../../lib/api/client';
import type { Folder, Tag } from '../../types/supabase';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  AlignJustify,
  Kanban,
  Clock,
  FolderTree,
  Star,
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
  CheckSquare,
  Target,
  Link as LinkIcon,
  Columns,
  X
} from 'lucide-react';
import { BookmarkValidationModal } from '../bookmarks/bookmark-validation-modal';
import { BookmarkImportModal } from '../bookmarks/bookmark-import-modal';
import { SelectionProvider, useSelection } from '../../contexts/SelectionContext';
import { MassActionsToolbar } from './MassActionsToolbar';
import { toast } from 'sonner';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';
import { BulkImportModal } from '../bulk-import-modal';
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
import { ProductivityDashboard } from '../productivity/productivity-dashboard';
import { EnhancedSidebar } from '../layout/enhanced-sidebar';


interface BookmarkHubDashboardProps {
  userId: string;
  userData: {
    id: string;
    firstName: string | null;
    email: string | undefined;
  };
  onNavigate?: (path: string) => void;
}

type ViewMode = 'grid' | 'list' | 'compact' | 'kanban' | 'timeline' | 'folder' | 'hierarchy' | 'productivity';

function BookmarkHubDashboardContent({ userId, userData, onNavigate }: BookmarkHubDashboardProps) {
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
  const [showImportUrlChecker, setShowImportUrlChecker] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('folder');
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



  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.ensureUserProfile(userId, userData.email || 'user@example.com', userData.firstName || 'User');
      
      const [bookmarksData, foldersData, tagsData] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders(),
        apiClient.getTags()
      ]);

      // Create default folders if none exist
      let finalFoldersData = foldersData;
      if (foldersData.length === 0) {
            const defaultFolders = [
      { 
        name: 'DEVELOPMENT', 
        description: 'Development tools and resources', 
        color: '#3b82f6', 
        parent_id: null
      },
      { 
        name: 'DESIGN', 
        description: 'Design inspiration and tools', 
        color: '#8b5cf6', 
        parent_id: null
      },
      { 
        name: 'PRODUCTIVITY', 
        description: 'Productivity apps and workflows', 
        color: '#10b981', 
        parent_id: null
      },
      { 
        name: 'LEARNING', 
        description: 'Educational content and courses', 
        color: '#f59e0b', 
        parent_id: null
      },
      { 
        name: 'ENTERTAINMENT', 
        description: 'Entertainment and leisure content', 
        color: '#ef4444', 
        parent_id: null
      }
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
      const results = [];
      for (const bookmarkData of bookmarks) {
        try {
          const result = await apiClient.createBookmark({
            url: bookmarkData.url,
            title: bookmarkData.title || bookmarkData.url,
            description: bookmarkData.description ?? null,
            folder_id: bookmarkData.folderId || null,
            favicon_url: bookmarkData.favicon || null,
            screenshot_url: null,
            is_archived: false,
            is_favorite: false,
            last_visited_at: null,
            visit_count: 0
          });
          results.push(result);
        } catch (error) {
          console.error(`Failed to import bookmark ${bookmarkData.url}:`, error);
        }
      }
      
      if (results.length > 0) {
        await loadData(); // Refresh the data
        toast.success(`Successfully imported ${results.length} bookmarks!`);
      }
      
      setShowBulkImport(false);
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast.error('Failed to import bookmarks');
    }
  };

  const handleImportUrl = async (bookmarks: { title: string; url: string; description?: string; folder?: string; tags?: string[]; is_favorite?: boolean; }[]) => {
    try {
      const results = [];
      for (const bookmarkData of bookmarks) {
        try {
          const result = await apiClient.createBookmark({
            url: bookmarkData.url,
            title: bookmarkData.title,
            description: bookmarkData.description ?? null,
            folder_id: null, // Will be handled by the modal if needed
            favicon_url: null,
            screenshot_url: null,
            is_archived: false,
            is_favorite: bookmarkData.is_favorite || false,
            last_visited_at: null,
            visit_count: 0
          });
          results.push(result);
        } catch (error) {
          console.error(`Failed to import bookmark ${bookmarkData.url}:`, error);
        }
      }
      
      if (results.length > 0) {
        await loadData(); // Refresh the data
        toast.success(`Successfully imported ${results.length} bookmarks!`);
      }
      
      setShowImportUrlChecker(false);
    } catch (error) {
      console.error('URL import failed:', error);
      toast.error('Failed to import URLs');
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

  // --- UPCOMING DEADLINES & ACTIVE GOALS PANEL ---
  const now = new Date();
  const upcomingItems = [
    ...bookmarks
      .filter(b => b.created_at)
      .map(b => ({
        id: b.id,
        name: b.title,
        type: 'Bookmark',
        deadline: b.created_at,
        goal: b.description || '',
        status: 'active',
        progress: 0,
      })),
    ...folders
      .map(f => ({
        id: f.id,
        name: f.name,
        type: 'Folder',
        deadline: f.created_at,
        goal: f.description || '',
        status: 'active',
        progress: 0,
      })),
  ]
    .sort((a, b) => new Date(b.deadline || new Date()).getTime() - new Date(a.deadline || new Date()).getTime())
    .slice(0, 5);

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
        {/* Enhanced Sidebar */}
        <EnhancedSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          bookmarks={bookmarks}
          folders={folders}
          tags={tags}
          onNavigate={(path) => {
            if (path === 'dna-profile' && onNavigate) {
              // Use parent navigation handler if available
              onNavigate(path);
            } else {
              window.location.href = path;
            }
          }}
          currentPath={window.location.pathname}
          onAddBookmark={() => setShowEnhancedDialog(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'DASHBOARD' : 
                   selectedCategory === 'favorites' ? 'FAVORITES' : 
                                               selectedCategory === 'development' ? 'DEVELOPMENT' :
                selectedCategory === 'design' ? 'DESIGN' :
                selectedCategory === 'productivity' ? 'PRODUCTIVITY' :
                selectedCategory === 'learning' ? 'LEARNING' :
                selectedCategory === 'entertainment' ? 'ENTERTAINMENT' :
                   selectedCategory.toUpperCase()}
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
            {/* Actions Bar */}
            <div className="flex items-center justify-between space-x-4 mb-8 px-2">
              {/* Left Section - Menu Button */}
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>

              {/* Center Section - Search Bar + View Mode Selector */}
              <div className="flex items-center space-x-4 flex-1 max-w-4xl">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* View Mode Selector */}
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('grid')}
                    className="p-4 rounded-r-none border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Grid View"
                  >
                    <LayoutGrid className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('list')}
                    className="p-4 rounded-none border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="List View"
                  >
                    <List className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('compact')}
                    className="p-4 rounded-none border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Compact View"
                  >
                    <AlignJustify className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('kanban')}
                    className="p-4 rounded-none border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Kanban View"
                  >
                    <Kanban className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('timeline')}
                    className="p-4 rounded-none border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Timeline View"
                  >
                    <Clock className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('hierarchy')}
                    className="p-4 rounded-none border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Hierarchy View"
                  >
                    <FolderTree className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={viewMode === 'productivity' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setViewMode('productivity')}
                    className="p-4 rounded-l-none hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Productivity Goals"
                  >
                    <Target className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setShowEnhancedDialog(true)} 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  ADD BOOKMARK
                </Button>

                <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-emerald-300 hover:border-emerald-400"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      IMPORT URLS
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
                      existingBookmarks={bookmarks.map(b => ({ url: b.url, id: b.id, title: b.title }))}
                      onClose={() => setShowBulkImport(false)}
                    />
                  </DialogContent>
                </Dialog>

                <BookmarkValidationModal
                  bookmarks={filteredAndSortedBookmarks}
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-amber-300 hover:border-amber-400"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      CHECK LINKS
                    </Button>
                  }
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enterSelectionMode}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-purple-300 hover:border-purple-400 flex items-center space-x-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>BULK SELECT</span>
                </Button>
              </div>
            </div>

            {/* Enhanced Dialog Component */}
            <EnhancedBookmarkDialog
              open={showEnhancedDialog}
              onOpenChange={setShowEnhancedDialog}
              onSubmit={handleEnhancedBookmarkSubmit}
              folders={folders}
              tags={tags}
            />

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
            ) : viewMode === 'hierarchy' ? (
              // Hierarchy View Mode - folder hierarchy visualization
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
            ) : viewMode === 'productivity' ? (
              <ProductivityDashboard userId={userId} />
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
                {filteredAndSortedBookmarks.map((bookmark) => {
                  // Calculate total visits for percentage calculation
                  const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
                  
                  return (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onUpdated={handleBookmarkUpdated}
                      onDeleted={() => handleBookmarkDeleted(bookmark.id)}
                      onOpenDetail={() => handleOpenDetail(bookmark)}
                      folders={folders}
                      totalBookmarkVisits={totalVisits}
                    />
                  );
                })}
              </div>
            )}

            {/* Upcoming Deadlines & Active Goals Section - Add more spacing */}
            <div className="mt-12 mb-8">
              {upcomingItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">UPCOMING DEADLINES & ACTIVE GOALS</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full rounded-lg">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Deadline</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Goal</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingItems.map(item => (
                          <tr key={item.type + '-' + item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.type}</td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.name}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.deadline ? new Date(item.deadline).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.goal || '-'}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {item.status || 'active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{typeof item.progress === 'number' ? `${item.progress}%` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
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

      <BookmarkImportModal
        isOpen={showImportUrlChecker}
        onClose={() => setShowImportUrlChecker(false)}
        onImport={handleImportUrl}
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

export function BookmarkHubDashboard({ userId, userData, onNavigate }: BookmarkHubDashboardProps) {
  return (
    <SelectionProvider>
      <BookmarkHubDashboardContent userId={userId} userData={userData} onNavigate={onNavigate} />
    </SelectionProvider>
  );
}