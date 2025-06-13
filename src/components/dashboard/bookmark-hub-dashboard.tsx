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
  X,
  Globe,
  Crown,
  Brain,
  Sparkles,
  Users,
  Grid3X3,
  MoreHorizontal,
  FolderOpen,
  FileText
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

import { IntegrationsDialog } from '../integrations/integrations-dialog';
import { MonetizationDialog } from '../monetization/monetization-dialog';
import { IndustryFilterDialog } from '../ai/industry-filter-dialog';
import { SmartRecommendations } from '../recommendations/smart-recommendations';
import { AdvancedAnalyticsDashboard } from '../analytics/advanced-analytics-dashboard';
import { BackupRestoreSystem } from '../backup/backup-restore-system';
import { CollaborationSystem } from '../sharing/collaboration-system';


interface BookmarkHubDashboardProps {
  userId: string;
  userData: {
    id: string;
    firstName: string | null;
    email: string | undefined;
  };
  onNavigate?: (path: string) => void;
}

type ViewMode = 'grid' | 'list' | 'compact' | 'kanban' | 'timeline' | 'folder-grid' | 'detailed' | 'goals';

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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showBookmarkDetail, setShowBookmarkDetail] = useState(false);
  const [showEnhancedDialog, setShowEnhancedDialog] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);

  // Filter state for the new FilterPopover
  const [filters, setFilters] = useState({
    contentType: 'all' as 'all' | 'bookmarks' | 'notes' | 'tags',
    context: 'all' as 'all' | 'personal' | 'work' | 'shared',
    sortBy: 'newest' as 'newest' | 'oldest' | 'title' | 'url' | 'recent' | 'visits' | 'favorites'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  // Removed activeTab state - using only view mode selector now

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
                {/* Bookmarks Display */}
                <div className="space-y-6">
                             {viewMode === 'folder-grid' ? (
                 <FolderGridView 
                   folders={folders}
                   bookmarks={bookmarks}
                   onCreateFolder={() => {}}
                   onEditFolder={() => {}}
                   onDeleteFolder={() => {}}
                   onAddBookmarkToFolder={() => {}}
                   onDropBookmarkToFolder={() => {}}
                   onBookmarkUpdated={handleBookmarkUpdated}
                   onBookmarkDeleted={handleBookmarkDeleted}
                   onOpenDetail={handleOpenDetail}
                   currentFolderId={selectedFolder}
                   onFolderNavigate={setSelectedFolder}
                 />
              ) : (
                <>


                  {/* Professional View Mode Selector - Large Size */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-14 border border-slate-200 dark:border-slate-700 shadow-xl mb-10">
                    <div className="flex items-center justify-center">
                      <div className="inline-flex h-18 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 p-3 shadow-lg border border-gray-200 dark:border-gray-700">
                        {[
                          { mode: 'list' as ViewMode, icon: List, label: 'List' },
                          { mode: 'grid' as ViewMode, icon: LayoutGrid, label: 'Grid' },
                          { mode: 'kanban' as ViewMode, icon: Trello, label: 'Kanban' },
                          { mode: 'timeline' as ViewMode, icon: Clock, label: 'Timeline' },
                          { mode: 'folder-grid' as ViewMode, icon: FolderTree, label: 'Folder Grid' },
                          { mode: 'compact' as ViewMode, icon: Rows3, label: 'Compact' },
                          { mode: 'detailed' as ViewMode, icon: FileText, label: 'Detailed' },
                          { mode: 'goals' as ViewMode, icon: Target, label: 'Goals' }
                        ].map(({ mode, icon: Icon, label }, index) => (
                          <React.Fragment key={mode}>
                            <button
                              onClick={() => setViewMode(mode)}
                              className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-7 py-3.5 text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                viewMode === mode
                                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg border border-gray-200 dark:border-gray-600'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                              }`}
                            >
                              <Icon className="w-5 h-5 mr-3" />
                              {label}
                            </button>
                            {/* Vertical Separator */}
                            {index < 7 && (
                              <div className="h-10 w-px bg-gray-300 dark:bg-gray-600 mx-2.5" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bookmarks Content */}
                  {viewMode === 'list' ? (
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
                  ) : viewMode === 'grid' ? (
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
                  ) : viewMode === 'folder-grid' ? (
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
                      currentFolderId={selectedFolder}
                      onFolderNavigate={setSelectedFolder}
                    />
                  ) : viewMode === 'detailed' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredAndSortedBookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="space-y-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{bookmark.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{bookmark.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new URL(bookmark.url).hostname}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(bookmark.created_at || Date.now()).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}</span>
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
                      ))}
                    </div>
                  ) : viewMode === 'goals' ? (
                    /* GOALS View Content */
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">GOALS MANAGEMENT</h2>
                        
                        {/* Goals Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Active Goals</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingItems.filter(item => item.status === 'active').length}</p>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Completed</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{upcomingItems.filter(item => item.status === 'completed').length}</p>
                          </div>
                          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">Overdue</h3>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                              {upcomingItems.filter(item => item.deadline && new Date(item.deadline) < new Date()).length}
                            </p>
                          </div>
                        </div>

                        {/* Goals Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full rounded-lg">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Goal Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Deadline</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {upcomingItems.length > 0 ? upcomingItems.map(item => (
                                <tr key={item.type + '-' + item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.type}</td>
                                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.name}</td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.goal || 'No goal description'}</td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                    {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.status === 'completed' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : item.deadline && new Date(item.deadline) < new Date()
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }`}>
                                      {item.status === 'completed' ? 'Completed' : 
                                       item.deadline && new Date(item.deadline) < new Date() ? 'Overdue' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                          style={{ width: `${item.progress || 0}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.progress || 0}%</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium">
                                        Edit
                                      </button>
                                      <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 text-sm font-medium">
                                        Complete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center space-y-4">
                                      <Target className="h-12 w-12 text-gray-400" />
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals found</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Start setting goals for your bookmarks and folders to track your progress.</p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Default fallback view */
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Unknown view mode: {viewMode}</p>
                    </div>
                  )}
                </>
              )}
            </div>

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