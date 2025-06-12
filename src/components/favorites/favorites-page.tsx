/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserButton } from '@clerk/nextjs';
import { apiClient } from '../../lib/api/client';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { 
  ArrowLeft, 
  Heart, 
  Search,
  Grid3X3,
  List,
  LayoutGrid,
  Columns,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Download,
  Star,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  Clock,
  Globe,
  Folder as FolderIcon,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  Tag as TagIcon,
  TrendingUp,
  Eye,
  ChevronDown,
  X,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  Plus,
  ExternalLink,
  Share2,
  BarChart3,
  Zap,
  Target,
  Award,
  Bookmark,
  Sparkles,
  Timer,
  ChevronUp,
  Flame,
  Crown,
  Trophy,
  Lightbulb,
  BookOpen,
  Coffee,
  Briefcase,
  Gamepad2,
  Music,
  Camera,
  Code,
  Palette,
  ShoppingBag,
  Utensils,
  Plane,
  Home,
  Dumbbell,
  GraduationCap,
  DollarSign,
  Smartphone,
  Monitor,
  Headphones,
  Car,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SelectionProvider } from '../../contexts/SelectionContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

interface FavoritesPageProps {
  userId: string;
}

type SortOption = 'title' | 'created_at' | 'updated_at' | 'visit_count' | 'folder';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'folder' | 'tag' | 'domain';

// Memoized components for better performance
const FavoritesSkeleton = React.memo(() => (
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
));

FavoritesSkeleton.displayName = 'FavoritesSkeleton';

const EmptyFavoritesState = React.memo(({ onNavigateToDashboard }: { onNavigateToDashboard: () => void }) => (
  <div className="text-center py-16 px-4">
    <div className="max-w-md mx-auto">
      <div className="relative mb-8">
        <Heart className="h-24 w-24 text-gray-200 dark:text-gray-700 mx-auto" />
        <Star className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No Favorites Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        Start building your collection of favorite bookmarks. 
        Click the heart icon on any bookmark to add it here.
      </p>
      <div className="space-y-3">
        <Button onClick={onNavigateToDashboard} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Browse Bookmarks
        </Button>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Tip: Use Ctrl+F to quickly find and favorite bookmarks
        </p>
      </div>
    </div>
  </div>
));

EmptyFavoritesState.displayName = 'EmptyFavoritesState';

const StatsCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  description?: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

interface FavoritesStats {
  totalFavorites: number
  totalVisits: number
  averageVisits: number
  uniqueDomains: number
  foldersUsed: number
  mostVisitedBookmark: BookmarkWithRelations | null
  recentlyAdded: number
  thisWeekVisits: number
  topCategories: Array<{ name: string; count: number; color: string }>
  engagementScore: number
  streakDays: number
  timeSpentToday: number
}

interface ViewMode {
  id: string
  name: string
  icon: React.ReactNode
}

const viewModes: ViewMode[] = [
  { id: 'grid', name: 'Grid', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'list', name: 'List', icon: <List className="w-4 h-4" /> },
  { id: 'timeline', name: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
  { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
]

const categoryIcons: Record<string, React.ReactNode> = {
  'design': <Palette className="w-4 h-4" />,
  'development': <Code className="w-4 h-4" />,
  'productivity': <Zap className="w-4 h-4" />,
  'learning': <GraduationCap className="w-4 h-4" />,
  'entertainment': <Gamepad2 className="w-4 h-4" />,
  'music': <Music className="w-4 h-4" />,
  'photography': <Camera className="w-4 h-4" />,
  'business': <Briefcase className="w-4 h-4" />,
  'shopping': <ShoppingBag className="w-4 h-4" />,
  'food': <Utensils className="w-4 h-4" />,
  'travel': <Plane className="w-4 h-4" />,
  'home': <Home className="w-4 h-4" />,
  'fitness': <Dumbbell className="w-4 h-4" />,
  'finance': <DollarSign className="w-4 h-4" />,
  'technology': <Smartphone className="w-4 h-4" />,
  'default': <Bookmark className="w-4 h-4" />
}

export function FavoritesPage({ userId }: FavoritesPageProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'analytics'>('grid');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Enhanced filtering and sorting
  const [sortBy, setSortBy] = useState<SortOption>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<FavoritesStats | null>(null);

  // Load data with error handling and loading states
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Load all data in parallel
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
      
      if (isRefresh) {
        toast.success('Favorites refreshed successfully');
      }

      // Calculate stats
      const totalVisits = favoriteBookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
      const uniqueDomains = new Set(favoriteBookmarks.map(b => new URL(b.url).hostname)).size;
      const foldersUsed = new Set(favoriteBookmarks.map(b => b.folder_id).filter(Boolean)).size;
      const mostVisited = favoriteBookmarks.reduce((max, b) => 
        (b.visit_count || 0) > (max?.visit_count || 0) ? b : max, null as BookmarkWithRelations | null);
      
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentlyAdded = favoriteBookmarks.filter(b => 
        new Date(b.created_at) > oneWeekAgo).length;
      
      // Calculate engagement score (0-100)
      const avgVisits = totalVisits / Math.max(favoriteBookmarks.length, 1);
      const engagementScore = Math.min(100, Math.round(
        (avgVisits * 10) + (recentlyAdded * 5) + (uniqueDomains * 2)
      ));

      // Top categories from folders
      const folderCounts = favoriteBookmarks.reduce((acc, bookmark) => {
        const folder = foldersData.find(f => f.id === bookmark.folder_id);
        if (folder) {
          acc[folder.name] = (acc[folder.name] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(folderCounts)
        .map(([name, count]) => {
          const folder = foldersData.find(f => f.name === name);
          return {
            name,
            count,
            color: folder?.color || '#6366f1'
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalFavorites: favoriteBookmarks.length,
        totalVisits,
        averageVisits: Math.round(avgVisits * 10) / 10,
        uniqueDomains,
        foldersUsed,
        mostVisitedBookmark: mostVisited,
        recentlyAdded,
        thisWeekVisits: Math.floor(totalVisits * 0.3), // Simulated
        topCategories,
        engagementScore,
        streakDays: Math.floor(Math.random() * 30) + 1, // Simulated
        timeSpentToday: Math.floor(Math.random() * 120) + 15 // Simulated minutes
      });

    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Advanced filtering and sorting logic
  const applyFiltersAndSort = useCallback(() => {
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

    // Advanced filters
    if (filterBy === 'folder' && selectedFolder) {
      filtered = filtered.filter(bookmark => bookmark.folder_id === selectedFolder);
    } else if (filterBy === 'tag' && selectedTag) {
      filtered = filtered.filter(bookmark => 
        bookmark.tags?.some(tag => tag.id === selectedTag)
      );
    } else if (filterBy === 'domain' && selectedDomain) {
      filtered = filtered.filter(bookmark => {
        try {
          return new URL(bookmark.url).hostname === selectedDomain;
        } catch {
          return false;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || 0);
          bValue = new Date(b.updated_at || 0);
          break;
        case 'visit_count':
          aValue = a.visit_count || 0;
          bValue = b.visit_count || 0;
          break;
        case 'folder':
          aValue = a.folder?.name || '';
          bValue = b.folder?.name || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm, filterBy, selectedFolder, selectedTag, selectedDomain, sortBy, sortDirection]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
    const avgVisits = bookmarks.length > 0 ? Math.round(totalVisits / bookmarks.length) : 0;
    
    const domains = new Set(bookmarks.map(b => {
      try {
        return new URL(b.url).hostname;
      } catch {
        return 'unknown';
      }
    }));

    const foldersUsed = new Set(bookmarks.map(b => b.folder?.name).filter(Boolean));
    
    return {
      totalFavorites: bookmarks.length,
      totalVisits,
      avgVisits,
      uniqueDomains: domains.size,
      foldersUsed: foldersUsed.size,
      mostVisited: bookmarks.sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))[0]
    };
  }, [bookmarks]);

  // Event handlers
  const handleBookmarkUpdated = useCallback((updatedBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => prev.map(b => 
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
    
    // If bookmark is no longer favorite, remove it from the list
    if (!updatedBookmark.is_favorite) {
      setBookmarks(prev => prev.filter(b => b.id !== updatedBookmark.id));
      toast.info('Bookmark removed from favorites');
    }
    
    setSelectedBookmark(updatedBookmark);
  }, []);

  const handleBookmarkDeleted = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    setShowDetailModal(false);
    setSelectedBookmark(null);
    toast.success('Bookmark deleted');
  }, []);

  const handleOpenDetail = useCallback((bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setShowDetailModal(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterBy('all');
    setSelectedFolder('');
    setSelectedTag('');
    setSelectedDomain('');
          setSortBy('updated_at');
    setSortDirection('desc');
  }, []);

  const handleExportFavorites = useCallback(() => {
    const exportData = bookmarks.map(bookmark => ({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      folder: bookmark.folder?.name,
      tags: bookmark.tags?.map(tag => tag.name).join(', '),
      visits: bookmark.visit_count || 0,
      created: bookmark.created_at,
      updated: bookmark.updated_at
    }));

    const csvContent = [
      ['Title', 'URL', 'Description', 'Folder', 'Tags', 'Visits', 'Created', 'Updated'],
      ...exportData.map(item => [
        item.title,
        item.url,
        item.description || '',
        item.folder || '',
        item.tags || '',
        item.visits.toString(),
        item.created || '',
        item.updated || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Favorites exported successfully');
  }, [bookmarks]);

  // Get unique domains for filter dropdown
  const uniqueDomains = useMemo(() => {
    const domains = new Set(bookmarks.map(b => {
      try {
        return new URL(b.url).hostname;
      } catch {
        return null;
      }
    }).filter(Boolean));
    return Array.from(domains).sort();
  }, [bookmarks]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filterBy !== 'all') count++;
          if (sortBy !== 'updated_at' || sortDirection !== 'desc') count++;
    return count;
  }, [searchTerm, filterBy, sortBy, sortDirection]);

  const renderBookmarks = () => {
    if (filteredBookmarks.length === 0) {
      if (searchTerm || filterBy !== 'all') {
        return (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No matches found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        );
      }

      return <EmptyFavoritesState onNavigateToDashboard={() => router.push('/dashboard')} />;
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
            totalBookmarkVisits={analytics.totalVisits}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          <FavoritesSkeleton />
        </div>
      </div>
    );
  }

  return (
    <SelectionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Enhanced Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Favorites
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({bookmarks.length})
                  </span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              {bookmarks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportFavorites}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              )}
              
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Analytics Stats */}
        {bookmarks.length > 0 && (
          <div className="px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatsCard
                title="Total Favorites"
                value={analytics.totalFavorites}
                icon={Heart}
                description="Bookmarks marked as favorite"
              />
              <StatsCard
                title="Total Visits"
                value={analytics.totalVisits}
                icon={Eye}
                description="Combined visits to favorites"
              />
              <StatsCard
                title="Avg Visits"
                value={analytics.avgVisits}
                icon={TrendingUp}
                description="Average visits per favorite"
              />
              <StatsCard
                title="Unique Domains"
                value={analytics.uniqueDomains}
                icon={Globe}
                description="Different websites favorited"
              />
              <StatsCard
                title="Folders Used"
                value={analytics.foldersUsed}
                icon={FolderIcon}
                description="Folders containing favorites"
              />
              <StatsCard
                title="Most Visited"
                value={analytics.mostVisited?.visit_count || 0}
                icon={Star}
                description={analytics.mostVisited?.title || 'None'}
              />
            </div>
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* View Mode and Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* View Mode Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
                  {viewModes.map((mode) => (
                    <Button
                      key={mode.id}
                      variant={viewMode === mode.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode(mode.id as any)}
                      className="rounded-none first:rounded-l-lg last:rounded-r-lg border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                      title={mode.name}
                    >
                      {mode.icon}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="created_at">Date Added</SelectItem>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="visit_count">Most Visited</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center space-x-1"
                >
                  {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
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