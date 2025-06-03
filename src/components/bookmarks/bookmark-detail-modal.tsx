'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { BookmarkRelationshipService, type RelatedBookmark } from '../../lib/services/bookmark-relationships';
import { bookmarkTodoService, type TodoItem, type BookmarkNotes } from '../../lib/services/bookmark-todos';
import { bookmarkReminderService, type BookmarkReminder, type ReminderInterval } from '../../lib/services/bookmark-reminders';
import { type Folder, type Tag } from '../../types/supabase';
import { BookmarkForm } from './bookmark-form';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { 
  Heart, 
  Share2, 
  ExternalLink, 
  X,
  Eye,
  TrendingUp,
  Edit,
  Pin,
  Archive,
  Star,
  GitBranch,
  Download,
  ChevronRight,
  Home,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Bell,
  BellOff,
  Sparkles,
  FolderOpen,
  Filter,
  ArrowUpDown,
  Clock
} from 'lucide-react';

import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { cn } from '../../lib/utils';
import { TimerTaskComponent } from '../timer/timer-task-modal';

interface BookmarkDetailModalProps {
  bookmark: BookmarkWithRelations | null;
  folders: Folder[];
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onDeleted: () => void;
}

export function BookmarkDetailModal({ 
  bookmark, 
  folders, 
  tags, 
  isOpen, 
  onClose, 
  onUpdated, 
  onDeleted 
}: BookmarkDetailModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isWatching, setIsWatching] = useState(true);
  const [notesContent, setNotesContent] = useState((bookmark as any)?.notes || 'Primary development platform for hosting repositories, collaborating on code, and managing software projects. Essential for version control workflows and team collaboration.\n\nKey Features:\n• Git repository hosting\n• Issue and project management\n• Collaborative code review\n• CI/CD integration\n• Documentation hosting\n\nUsage Notes:\nRegularly used for open-source projects and team collaboration. Important for staying updated with latest development trends and tools.');
  const [descriptionContent, setDescriptionContent] = useState(bookmark?.description || 'A comprehensive development platform for version control and collaboration. This bookmark contains essential tools and resources for modern software development workflows.');
  
  // Related bookmarks state
  const [relatedBookmarks, setRelatedBookmarks] = useState<RelatedBookmark[]>([]);
  const [showAddRelated, setShowAddRelated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<RelatedBookmark[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [hasLoadedRelated, setHasLoadedRelated] = useState(false);



  // Reminder state
  const [bookmarkReminder, setBookmarkReminder] = useState<BookmarkReminder | null>(() => {
    // In a real app, this would come from the database
    return null;
  });
  const [reminderInterval, setReminderInterval] = useState<ReminderInterval>('none');
  const [customDays, setCustomDays] = useState<number>(7);

  // Activity filter state
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySort, setActivitySort] = useState('newest');


  const bookmarkService = user ? new BookmarkService(user.id) : null;
  const relationshipService = user ? new BookmarkRelationshipService(user.id) : null;



  // Load related bookmarks when bookmark changes
  useEffect(() => {
    let mounted = true;
    let loadingTimeoutId: NodeJS.Timeout;
    
    const loadRelatedBookmarks = async () => {
      if (!relationshipService || !bookmark) {
        if (mounted) {
          setRelatedBookmarks([]);
          setLoadingRelated(false);
          setHasLoadedRelated(false);
        }
        return;
      }
      
      try {
        if (mounted) {
          // Add a small delay before setting loading to prevent rapid flickering
          loadingTimeoutId = setTimeout(() => {
            if (mounted) {
              setLoadingRelated(true);
            }
          }, 50);
        }
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading related bookmarks')), 6000)
        );
        
        const dataPromise = relationshipService.getRelatedBookmarks(bookmark.id);
        
        const related = await Promise.race([dataPromise, timeoutPromise]) as any;
        
        if (mounted) {
          clearTimeout(loadingTimeoutId);
          setRelatedBookmarks(related || []);
          setLoadingRelated(false);
          setHasLoadedRelated(true);
        }
      } catch (error) {
        console.error('Error loading related bookmarks:', error);
        if (mounted) {
          clearTimeout(loadingTimeoutId);
          // Set empty array instead of leaving in loading state
          setRelatedBookmarks([]);
          setLoadingRelated(false);
          setHasLoadedRelated(true);
          // Only show error toast for actual errors, not timeouts when component unmounts
          if (mounted) {
            toast.error('Failed to load related bookmarks');
          }
        }
      }
    };

    // Add a delay to prevent rapid successive calls
    const debounceTimeoutId = setTimeout(loadRelatedBookmarks, 150);
    
    return () => {
      mounted = false;
      clearTimeout(debounceTimeoutId);
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
    };
  }, [bookmark?.id, relationshipService, bookmark]);

  // Search for bookmarks to relate
  useEffect(() => {
    const searchBookmarks = async () => {
      if (!relationshipService || !bookmark || !searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        // Add timeout for search operations
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), 5000)
        );
        
        const searchPromise = relationshipService.searchBookmarksForRelation(bookmark.id, searchTerm);
        
        const results = await Promise.race([searchPromise, timeoutPromise]) as any;
        setSearchResults(results || []);
      } catch (error) {
        console.error('Error searching bookmarks:', error);
        setSearchResults([]);
        toast.error('Search failed, please try again');
      }
    };

    const debounceTimer = setTimeout(searchBookmarks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, bookmark?.id, relationshipService, bookmark]);

  if (!bookmark) return null;



  // Reminder handlers
  const handleUpdateReminder = async () => {
    if (!bookmark) return;

    try {
      let updatedReminder: BookmarkReminder;
      
      if (bookmarkReminder) {
        // Update existing reminder
        updatedReminder = bookmarkReminderService.updateReminder(bookmarkReminder, {
          interval: reminderInterval,
          customDays: reminderInterval === 'custom' ? customDays : undefined,
          isActive: reminderInterval !== 'none'
        });
      } else {
        // Create new reminder
        updatedReminder = bookmarkReminderService.createReminder(
          bookmark.id,
          reminderInterval,
          'in-app',
          reminderInterval === 'custom' ? customDays : undefined
        );
      }

      setBookmarkReminder(updatedReminder);
      
      // In a real app, this would save to the database
      // await bookmarkService.updateBookmarkReminder(bookmark.id, updatedReminder);
      
      toast.success(
        reminderInterval === 'none' 
          ? 'Reminder disabled' 
          : `Reminder set for ${bookmarkReminderService.getIntervalDescription(reminderInterval, customDays)}`
      );
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const handleToggleFavorite = async () => {
    if (!bookmarkService) return;
    
    try {
      setLoading(true);
      const updated = await bookmarkService.toggleFavorite(bookmark.id);
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleVisit = () => {
    window.open(bookmark.url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        url: bookmark.url
      });
    } else {
      navigator.clipboard.writeText(bookmark.url);
      toast.success('URL copied to clipboard');
    }
  };

  const handleEdit = () => {
    setShowEdit(true);
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
    toast.success(isPinned ? 'Unpinned bookmark' : 'Pinned bookmark');
  };

  const handleWatch = () => {
    setIsWatching(!isWatching);
    toast.success(isWatching ? 'Stopped watching' : 'Now watching');
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertList = (ordered: boolean = false) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const listType = ordered ? 'ol' : 'ul';
      const listItem = document.createElement('li');
      const list = document.createElement(listType);
      
      if (range.collapsed) {
        listItem.textContent = 'List item';
      } else {
        listItem.appendChild(range.extractContents());
      }
      
      list.appendChild(listItem);
      range.insertNode(list);
      range.selectNodeContents(listItem);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleAddRelationship = async (relatedBookmarkId: string) => {
    if (!relationshipService || !bookmark) return;

    try {
      await relationshipService.addRelationship(bookmark.id, relatedBookmarkId, 'related');
      
      // Refresh related bookmarks
      const updated = await relationshipService.getRelatedBookmarks(bookmark.id);
      setRelatedBookmarks(updated);
      
      // Clear search
      setSearchTerm('');
      setSearchResults([]);
      setShowAddRelated(false);
      
      toast.success('Related bookmark added successfully');
    } catch (error) {
      console.error('Error adding relationship:', error);
      toast.error('Failed to add related bookmark');
    }
  };

  const handleRemoveRelationship = async (relatedBookmarkId: string) => {
    if (!relationshipService || !bookmark) return;

    try {
      await relationshipService.removeRelationship(bookmark.id, relatedBookmarkId);
      
      // Refresh related bookmarks
      const updated = await relationshipService.getRelatedBookmarks(bookmark.id);
      setRelatedBookmarks(updated);
      
      toast.success('Related bookmark removed');
    } catch (error) {
      console.error('Error removing relationship:', error);
      toast.error('Failed to remove related bookmark');
    }
  };

  // Mock analytics data - in real app this would come from your analytics service
  const analyticsData = {
    totalVisits: bookmark.visit_count || 45,
    timeSpent: '2h 30m',
    thisWeek: 45,
    siteHealth: 'excellent',
    lastVisited: '2 hours ago',
    avgTimeOnSite: '3.5m',
    bounceRate: '25%'
  };

  // Enhanced activity data with more details
  const activityData = [
    { 
      id: 1,
      action: 'Page Visited', 
      description: 'Opened link in new tab',
      time: '2 hours ago', 
      timestamp: '14:30',
      category: 'visit',
      icon: Eye,
      metadata: { duration: '5m 32s', source: 'Direct Link' }
    },
    { 
      id: 2,
      action: 'Added to Favorites', 
      description: 'Marked as important resource',
      time: '1 day ago', 
      timestamp: '09:15',
      category: 'interaction',
      icon: Heart,
      metadata: { reason: 'Useful tutorial' }
    },
    { 
      id: 3,
      action: 'Tag Applied', 
      description: 'Added "development" and "javascript" tags',
      time: '2 days ago', 
      timestamp: '16:45',
      category: 'organization',
      icon: GitBranch,
      metadata: { tags: ['development', 'javascript'] }
    },
    { 
      id: 4,
      action: 'Shared', 
      description: 'Shared via copy link',
      time: '3 days ago', 
      timestamp: '11:20',
      category: 'sharing',
      icon: Share2,
      metadata: { method: 'Copy Link' }
    },
    { 
      id: 5,
      action: 'Note Added', 
      description: 'Added personal notes and insights',
      time: '5 days ago', 
      timestamp: '13:10',
      category: 'content',
      icon: Edit,
      metadata: { noteLength: '150 characters' }
    },
    { 
      id: 6,
      action: 'Bookmark Created', 
      description: 'Initial bookmark saved from browser',
      time: '1 week ago', 
      timestamp: '10:00',
      category: 'creation',
      icon: Star,
      metadata: { source: 'Browser Extension' }
    }
  ];

  // Filter and sort activity data
  const filteredActivityData = activityData
    .filter(activity => activityFilter === 'all' || activity.category === activityFilter)
    .sort((a, b) => {
      if (activitySort === 'newest') return b.id - a.id;
      return a.id - b.id;
    });

  // Activity category colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'visit': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'interaction': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'organization': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'sharing': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'content': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
      case 'creation': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getSiteHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-green-600 bg-green-100';
    }
  };



  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'analytics', label: 'Analytics', count: null },
    { id: 'activity', label: 'Activity', count: 12 },
    { id: 'todos', label: 'Timer', count: null },
    { id: 'reminders', label: 'Reminders', count: bookmarkReminder?.isActive ? 1 : null },
    { id: 'related', label: 'Related', count: relatedBookmarks.length > 0 ? relatedBookmarks.length : null }
  ];

  return (
    <>
      <Dialog open={isOpen && !showEdit} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          {/* Breadcrumb - Outside main header for better alignment */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <Home className="h-3 w-3" />
              <ChevronRight className="h-3 w-3" />
              <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                {bookmark.folder?.name || 'Bookmarks'}
              </span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-md">
                {bookmark.title}
              </span>
            </nav>
          </div>

          {/* Main Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              {/* Left side - Icon and Info */}
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                {/* Favicon */}
                <div className="flex-shrink-0 mt-1">
                  {bookmark.favicon_url ? (
                    <img
                      src={bookmark.favicon_url}
                      alt=""
                      className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        {bookmark.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title, URL and Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {bookmark.title}
                    </h1>
                    {/* Status badges */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {bookmark.is_favorite && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Star className="w-3 h-3 mr-1" />
                          Favorite
                        </span>
                      )}
                      {isPinned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <a 
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline block truncate mb-2"
                  >
                    {bookmark.url}
                  </a>

                  {/* Quick stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {bookmark.visit_count || 0} visits
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {analyticsData.lastVisited}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getSiteHealthColor(analyticsData.siteHealth)
                    )}>
                      {analyticsData.siteHealth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Watch Button */}
                <Button
                  variant={isWatching ? "default" : "outline"}
                  size="sm"
                  onClick={handleWatch}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {isWatching ? 'Watching' : 'Watch'}
                </Button>

                {/* Pin Button */}
                <Button
                  variant={isPinned ? "default" : "outline"}
                  size="sm"
                  onClick={handlePin}
                >
                  <Pin className="h-4 w-4" />
                </Button>

                {/* Favorite Button */}
                <Button
                  variant={bookmark.is_favorite ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={loading}
                  className={bookmark.is_favorite ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    bookmark.is_favorite && "fill-current"
                  )} />
                </Button>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* Share Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                {/* Archive Button */}
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Archive className="h-4 w-4" />
                </Button>

                {/* Visit Site Button */}
                <Button
                  onClick={handleVisit}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Site
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 min-h-full">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      <textarea
                        className="w-full min-h-[120px] p-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm bg-transparent border-none outline-none resize-y focus:ring-0 rounded-lg"
                        value={descriptionContent}
                        onChange={(e) => setDescriptionContent(e.target.value)}
                        placeholder="Add a description for this bookmark..."
                      />
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analyticsData.totalVisits}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Visits
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analyticsData.avgTimeOnSite}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Avg. Time
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analyticsData.bounceRate}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Bounce Rate
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                        <div className="mb-1">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            getSiteHealthColor(analyticsData.siteHealth)
                          )}>
                            {analyticsData.siteHealth}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Site Status
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookmark.tags && bookmark.tags.length > 0 ? (
                        bookmark.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                          >
                            #{tag.name}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                            #development
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                            #version-control
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                            #collaboration
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
                            #tools
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notes
                      </h3>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      {/* Rich Text Editor Toolbar */}
                      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-t-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('bold')}
                          type="button"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('italic')}
                          type="button"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('underline')}
                          type="button"
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => insertList(false)}
                          type="button"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => insertList(true)}
                          type="button"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('justifyLeft')}
                          type="button"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('justifyCenter')}
                          type="button"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('justifyRight')}
                          type="button"
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => formatText('createLink', prompt('Enter URL:') || '')}
                          type="button"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Rich Text Editor Content */}
                      <div
                        contentEditable
                        className="w-full min-h-[200px] max-h-[400px] p-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm bg-transparent outline-none focus:ring-0 rounded-b-lg overflow-y-auto resize-y"
                        onInput={(e) => setNotesContent(e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ 
                          __html: notesContent.replace(/\n/g, '<br>') 
                        }}
                        suppressContentEditableWarning
                      />
                    </div>
                  </div>


                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Analytics Dashboard
                    </h3>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Visits</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalVisits}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">+12% from last week</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.timeSpent}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">+5% from last week</p>
                        </div>
                        <Clock className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.thisWeek}</p>
                          <p className="text-xs text-red-600 dark:text-red-400">-3% from last week</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visit Trends</h4>
                    <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {/* Activity Header with Controls */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Activity Timeline
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {filteredActivityData.length} activities • Last activity {activityData[0]?.time}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Filter Dropdown */}
                      <select
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Activities</option>
                        <option value="visit">Visits</option>
                        <option value="interaction">Interactions</option>
                        <option value="organization">Organization</option>
                        <option value="sharing">Sharing</option>
                        <option value="content">Content</option>
                        <option value="creation">Creation</option>
                      </select>

                      {/* Sort Dropdown */}
                      <select
                        value={activitySort}
                        onChange={(e) => setActivitySort(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Activity Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activityData.filter(a => a.category === 'visit').length}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Visits</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activityData.filter(a => a.category === 'interaction').length}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Interactions</p>
                        </div>
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activityData.filter(a => a.category === 'sharing').length}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Shares</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activityData.filter(a => a.category === 'organization').length}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Organization</p>
                        </div>
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <GitBranch className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Activity Timeline */}
                  <div className="space-y-4">
                    {filteredActivityData.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filter settings.</p>
                      </div>
                    ) : (
                      filteredActivityData.map((activity, index) => (
                        <div key={activity.id} className="relative">
                          {/* Timeline line */}
                          {index !== filteredActivityData.length - 1 && (
                            <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200 dark:bg-gray-700"></div>
                          )}
                          
                          <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200 group">
                            {/* Icon with category color */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={cn(
                                "w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-200",
                                getCategoryColor(activity.category),
                                "group-hover:scale-105"
                              )}>
                                <activity.icon className="h-5 w-5" />
                              </div>
                            </div>

                            {/* Activity Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {activity.action}
                                    </h4>
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                                      getCategoryColor(activity.category)
                                    )}>
                                      {activity.category}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {activity.description}
                                  </p>

                                  {/* Metadata */}
                                  {activity.metadata && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {Object.entries(activity.metadata).map(([key, value]) => (
                                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                          <span className="font-medium mr-1">{key}:</span>
                                          {Array.isArray(value) ? value.join(', ') : value}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Timestamp */}
                                <div className="text-right text-xs text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                                  <div>{activity.time}</div>
                                  <div className="font-mono">{activity.timestamp}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Activity Insights */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          Activity Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="text-blue-800 dark:text-blue-300">
                            <span className="font-medium">Most Active Time:</span> Afternoon (14:00-16:00)
                          </div>
                          <div className="text-blue-800 dark:text-blue-300">
                            <span className="font-medium">Primary Actions:</span> Visiting and organizing
                          </div>
                          <div className="text-blue-800 dark:text-blue-300">
                            <span className="font-medium">Engagement Level:</span> High (regular interactions)
                          </div>
                          <div className="text-blue-800 dark:text-blue-300">
                            <span className="font-medium">Last Active:</span> {activityData[0]?.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'todos' && (
                <TimerTaskComponent />
              )}

              {activeTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Revisit Reminders
                    </h3>
                    {bookmarkReminder?.isActive && (
                      <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <Bell className="h-4 w-4" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="space-y-6">
                      {/* Current Reminder Status */}
                      {bookmarkReminder?.isActive && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900 dark:text-blue-200">
                                Next Reminder
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {bookmarkReminderService.formatReminderDate(bookmarkReminder.nextReminderDate)}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {bookmarkReminderService.getIntervalDescription(bookmarkReminder.interval, bookmarkReminder.customDays)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reminder Configuration */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reminder Frequency
                          </label>
                          <select
                            value={reminderInterval}
                            onChange={(e) => setReminderInterval(e.target.value as ReminderInterval)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {bookmarkReminderService.getAvailableIntervals().map(interval => (
                              <option key={interval.value} value={interval.value}>
                                {interval.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Days Input */}
                        {reminderInterval === 'custom' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Custom Interval (days)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={customDays}
                              onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter number of days"
                            />
                          </div>
                        )}

                        {/* Preview */}
                        {reminderInterval !== 'none' && (
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                                         <p className="text-sm text-gray-600 dark:text-gray-400">
                               <strong>Preview:</strong> You'll be reminded to revisit this bookmark{' '}
                               {bookmarkReminderService.getIntervalDescription(reminderInterval, customDays).toLowerCase()}
                               . Next reminder would be on{' '}
                               <strong>
                                 {bookmarkReminderService.formatReminderDate(
                                   bookmarkReminderService.calculateNextReminderDate(reminderInterval, customDays)
                                 )}
                               </strong>
                             </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <button
                            onClick={handleUpdateReminder}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            {bookmarkReminder ? 'Update Reminder' : 'Set Reminder'}
                          </button>
                          
                          {bookmarkReminder?.isActive && (
                            <button
                              onClick={() => {
                                setReminderInterval('none');
                                handleUpdateReminder();
                              }}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <BellOff className="h-4 w-4 mr-2 inline" />
                              Disable
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-900 dark:text-amber-200">
                              How Reminders Work
                            </h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              You'll receive in-app notifications when it's time to revisit this bookmark. 
                              This is perfect for articles you want to read again, tools you need to check periodically, 
                              or any content that benefits from regular review.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {activeTab === 'related' && (
                <div className="space-y-6">
                  {/* Header with enhanced stats and controls */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Related Bookmarks
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Discover connections and related content ({relatedBookmarks.length} items)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/* Add auto-suggest feature */}}
                          className="hidden sm:flex"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Auto Suggest
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddRelated(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Related
                        </Button>
                      </div>
                    </div>

                    {/* Relationship Stats Dashboard */}
                    {relatedBookmarks.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <GitBranch className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {relatedBookmarks.length}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Total Related
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {Math.round(relatedBookmarks.reduce((sum, b) => sum + (b.similarity_score || 0), 0) / relatedBookmarks.length) || 0}%
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Avg Similarity
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Share2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {new Set(relatedBookmarks.map(b => b.relationship_type)).size}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                Relationship Types
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <FolderOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {new Set(relatedBookmarks.map(b => b.folder_name).filter(Boolean)).size}
                              </p>
                              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                Different Folders
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Filters and Sort */}
                    {relatedBookmarks.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                          </div>
                          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="all">All Types</option>
                            <option value="similar">Similar Content</option>
                            <option value="reference">Reference</option>
                            <option value="prerequisite">Prerequisite</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="related">Related Topic</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <ArrowUpDown className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
                          </div>
                          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="similarity">Similarity Score</option>
                            <option value="recent">Recently Added</option>
                            <option value="title">Title A-Z</option>
                            <option value="folder">Folder</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Related Bookmark Interface */}
                  {showAddRelated && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">Add Related Bookmark</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddRelated(false);
                              setSearchTerm('');
                              setSearchResults([]);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search your bookmarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map((result) => (
                              <div
                                key={result.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors"
                              >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  {result.favicon_url ? (
                                    <img
                                      src={result.favicon_url}
                                      alt=""
                                      className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                        {result.title.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {result.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {result.folder_name && `${result.folder_name} • `}
                                      {result.url}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddRelationship(result.id)}
                                  className="flex-shrink-0"
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {searchTerm && searchResults.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No bookmarks found matching "{searchTerm}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Related Bookmarks List */}
                  {loadingRelated ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading related bookmarks...</p>
                    </div>
                  ) : relatedBookmarks.length > 0 ? (
                    <div className="space-y-4">
                      {/* View Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {relatedBookmarks.length} related bookmark{relatedBookmarks.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="h-8 px-3">
                            <Eye className="h-4 w-4 mr-1" />
                            Cards
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-3">
                            <List className="h-4 w-4 mr-1" />
                            List
                          </Button>
                        </div>
                      </div>
                      
                      {/* Enhanced Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedBookmarks.map((related) => (
                          <div
                            key={related.id}
                            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1"
                          >
                            {/* Header with relationship type badge */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {related.favicon_url ? (
                                  <div className="relative">
                                    <img
                                      src={related.favicon_url}
                                      alt=""
                                      className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white dark:border-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-white">
                                      {related.title.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                                    {related.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {new URL(related.url).hostname}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Relationship Type Badge */}
                              <div className="flex flex-col items-end space-y-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  related.relationship_type === 'similar' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  related.relationship_type === 'reference' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  related.relationship_type === 'prerequisite' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  related.relationship_type === 'follow-up' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {related.relationship_type}
                                </span>
                                
                                {/* Remove button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveRelationship(related.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Description */}
                            {related.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                                {related.description}
                              </p>
                            )}
                            
                            {/* Metadata Row */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                {related.similarity_score && (
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                      {related.similarity_score}% match
                                    </span>
                                  </div>
                                )}
                                {related.folder_name && (
                                  <div className="flex items-center space-x-1">
                                    <FolderOpen className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {related.folder_name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Connection strength indicator */}
                              <div className="flex items-center space-x-1">
                                <div className="flex space-x-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        i < Math.floor((related.similarity_score || 0) / 20) 
                                          ? 'bg-blue-500' 
                                          : 'bg-gray-300 dark:bg-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(related.url, '_blank')}
                                  className="h-8 px-3 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Visit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                              </div>
                              
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                Added 2d ago
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full opacity-50"></div>
                        </div>
                        <div className="relative">
                          <GitBranch className="h-16 w-16 text-gray-400 mx-auto" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        No related bookmarks yet
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                        Create connections between your bookmarks to discover related content and build knowledge networks. 
                        Related bookmarks help you organize and explore topics more effectively.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          variant="default" 
                          onClick={() => setShowAddRelated(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Related Bookmark
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {/* Add auto-suggest feature */}}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Auto Suggest
                        </Button>
                      </div>
                      
                      {/* Tips Section */}
                      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-lg mx-auto">
                        <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Pro Tips</h5>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p>• Link similar topics for easier discovery</p>
                          <p>• Connect prerequisites and follow-ups</p>
                          <p>• Group resources by project or subject</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {relatedBookmarks.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Related bookmarks help you discover connections between your saved links and organize related content together.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <BookmarkForm
            bookmark={bookmark}
            folders={folders}
            tags={tags}
            onSubmit={(updatedBookmark) => {
              onUpdated(updatedBookmark);
              setShowEdit(false);
            }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 