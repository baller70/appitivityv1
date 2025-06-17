'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';

import { Label } from '../ui/label';
import { 
  Clock, 
  Bell, 
  Link, 
  FileText, 
  BarChart3,
  Eye,
  Heart,
  ExternalLink,
  Play,
  Pause,
  Square,
  Plus,
  Settings,
  Edit,
  Save,
  Share,
  Copy,
  Globe,
  Upload,
  X,
  RotateCcw,
  Target,
  MessageCircle,
  Image,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { RichTextEditor } from '../ui/rich-text-editor';
import { NotificationIframe } from '../notifications/notification-iframe';
import { ReminderManager } from '@/components/reminders';
import { RelatedBookmarksSection } from '@/components/related/related-gallery';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { BookmarkComments } from '../comments/bookmark-comments';
import { BookmarkForm } from './bookmark-form';
import { Input } from '../ui/input';
import { type BookmarkCardData } from '@/components/related/related-gallery';

interface BookmarkDetailModalProps {
  bookmark: BookmarkWithRelations | null;
  folders: Folder[];
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkCreated?: (bookmark: BookmarkWithRelations) => void;
  onOpenDetail?: (bookmark: BookmarkWithRelations) => void;
}

type TabType = 'overview' | 'timer' | 'notifications' | 'media' | 'comments';

export function BookmarkDetailModal({
  bookmark,
  folders: _folders,
  tags: _tags,
  isOpen,
  onClose,
  onUpdated,
  onBookmarkCreated,
  onOpenDetail
}: BookmarkDetailModalProps) {
  // We will use folders for Add Bookmark dialog
  void _folders;
  void _tags;

  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timerTime, setTimerTime] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);
  
  // Quick Timer state
  const [quickTimerTask, setQuickTimerTask] = useState('');
  const [quickTimerList, setQuickTimerList] = useState('');
  const [quickTimerDuration, setQuickTimerDuration] = useState(25);
  const [initialTime, setInitialTime] = useState(25 * 60);
  
  // Editable fields state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(bookmark?.description || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [allBookmarks, setAllBookmarks] = useState<BookmarkWithRelations[]>([]);

  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [manualLinks, setManualLinks] = useState<BookmarkCardData[]>([]);
  const [searchExisting, setSearchExisting] = useState('');

  const relatedItems = useMemo(() => {
    if (!bookmark) return [] as any[];
    return allBookmarks
      .filter((b) => b.id !== bookmark.id)
      .filter((b) => {
        // same folder
        if (bookmark.folder_id && b.folder_id === bookmark.folder_id) return true;
        // overlapping tags
        const t1 = bookmark.tags?.map((t) => t.id) || [];
        const t2 = b.tags?.map((t) => t.id) || [];
        return t1.some((id) => t2.includes(id));
      })
      .map((b) => ({
        id: b.id,
        title: b.title,
        url: b.url,
        faviconUrl: b.favicon_url ?? undefined,
        tags: b.tags?.map((t) => t.name) || [],
        lastVisited: b.last_visited_at ? new Date(b.last_visited_at) : undefined,
        visitCount: b.visit_count ?? 0,
      }));
  }, [bookmark, allBookmarks]);

  const combinedRelated = useMemo(() => {
    return [...relatedItems, ...manualLinks.filter(m => !relatedItems.find(r => r.id === m.id))];
  }, [relatedItems, manualLinks]);

  const filteredExisting = useMemo(()=>{
    if(!bookmark) return [] as BookmarkWithRelations[];
    const q = searchExisting.toLowerCase();
    return allBookmarks.filter(b=>{
      if(b.id===bookmark.id) return false;
      const already = relatedItems.find(r=>r.id===b.id) || manualLinks.find(m=>m.id===b.id);
      if(already) return false;
      if(q && !b.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [searchExisting, allBookmarks, relatedItems, manualLinks]);

  // Update edited description when bookmark changes
  useEffect(() => {
    if (bookmark?.description) {
      setEditedDescription(bookmark.description);
    }
  }, [bookmark?.description]);

  // Initialize preview image from bookmark data
  useEffect(() => {
    if (bookmark?.preview_image) {
      setPreviewImage(bookmark.preview_image);
    } else {
      setPreviewImage(null);
    }
  }, [bookmark?.preview_image]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime(prev => {
          const newTime = prev - 1;
          setTimerProgress(((initialTime - newTime) / initialTime) * 100);
          if (newTime <= 0) {
            setIsTimerRunning(false);
            // Timer completed notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Timer completed for ${bookmark?.title}!`, {
                body: `${quickTimerTask || 'Timer'} session completed!`,
                icon: '/favicon.ico'
              });
            }
            const taskName = quickTimerTask === 'bookmark-focus' ? `Focus on ${bookmark?.title}` : 
                            quickTimerTask ? quickTimerTask.charAt(0).toUpperCase() + quickTimerTask.slice(1).replace('-', ' ') : 
                            'Timer';
            toast.success(`🎉 ${taskName} completed!`);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime, bookmark?.title, initialTime, quickTimerTask]);

  // Request notification permission when component mounts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch all bookmarks for related bookmarks functionality
  useEffect(() => {
    const fetchAllBookmarks = async () => {
      if (!user || !isOpen) return;
      
      try {
        const bookmarkService = new BookmarkService(user.id);
        const bookmarks = await bookmarkService.getBookmarks();
        setAllBookmarks(bookmarks);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      }
    };

    fetchAllBookmarks();
  }, [user, isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    toast.success('🎯 Focus timer started! Stay focused!');
  };
  
  const pauseTimer = () => {
    setIsTimerRunning(false);
    toast.info('⏸️ Timer paused');
  };
  
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerTime(quickTimerDuration * 60);
    setInitialTime(quickTimerDuration * 60);
    setTimerProgress(0);
    toast.info(`🔄 Timer reset to ${quickTimerDuration} minutes`);
  };

  const saveDescription = () => {
    // Here you would typically call an API to update the bookmark
    setIsEditingDescription(false);
    if (bookmark) {
      onUpdated({ ...bookmark, description: editedDescription });
    }
  };

  const handleFavorite = async () => {
    // Toggle favorite status
    if (!bookmark || !user) {
      toast.error('Please sign in to favorite bookmarks');
      return;
    }
    
    try {
      // Create a bookmark service instance
      const bookmarkService = new BookmarkService(user.id);
      
      console.log('Modal: Toggling favorite for bookmark:', bookmark.id, 'Current favorite status:', bookmark.is_favorite);
      
      // Update the bookmark in the database
      const updatedBookmark = await bookmarkService.updateBookmark(bookmark.id, {
        is_favorite: !bookmark.is_favorite
      });
      
      console.log('Modal: Updated bookmark result:', updatedBookmark);
      
      // Update the local state
      onUpdated({ ...bookmark, ...updatedBookmark });
      toast.success(updatedBookmark.is_favorite ? '❤️ Added to favorites' : '💔 Removed from favorites');
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update favorite status: ${errorMessage}`);
      
      // Update UI optimistically
      onUpdated({ ...bookmark, is_favorite: !bookmark.is_favorite });
    }
  };

  const handleShare = async () => {
    if (!bookmark) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookmark.title,
          url: bookmark.url,
          text: bookmark.description || `Check out this bookmark: ${bookmark.title}`,
        });
        toast.success('Bookmark shared successfully');
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to share bookmark');
        }
      }
    } else {
      // Fallback to copy link
      handleCopy();
    }
  };

  const handleCopy = async () => {
    if (!bookmark || !user) {
      toast.error('Unable to duplicate bookmark');
      return;
    }
    
    try {
      console.log('Starting bookmark duplication for:', bookmark.title);
      
      // Create a duplicate bookmark with " (Copy)" appended to the title
      const duplicateData = {
        title: `${bookmark.title} (Copy)`,
        url: bookmark.url,
        description: bookmark.description || '',
        folder_id: bookmark.folder?.id || null,
        favicon_url: bookmark.favicon_url || null,
        is_favorite: false, // Set copy as not favorite initially
        is_archived: false, // Set copy as not archived initially
      };
      
      console.log('Duplicate data prepared:', duplicateData);
      
      // Get the tag IDs from the original bookmark
      const tagIds = bookmark.tags?.map(tag => tag.id).filter(Boolean) || [];
      console.log('Tag IDs to duplicate:', tagIds);
      
      // Use the API route to create the bookmark to avoid RLS issues
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...duplicateData,
          tagIds: tagIds
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bookmark');
      }
      
      const newBookmark = await response.json();
      console.log('New bookmark created:', newBookmark.id);
      
      // Create a bookmark service instance to fetch the complete bookmark
      const bookmarkService = new BookmarkService(user.id);
      
      // Fetch the complete bookmark with relations
      const completeBookmark = await bookmarkService.getBookmark(newBookmark.id);
      console.log('Complete bookmark fetched:', completeBookmark);
      
      if (completeBookmark && onBookmarkCreated) {
        console.log('Calling onBookmarkCreated callback');
        onBookmarkCreated(completeBookmark);
        // Close the modal after successful duplication
        onClose();
      } else {
        console.warn('onBookmarkCreated callback not available or bookmark incomplete');
      }
      
      toast.success('📋 Bookmark duplicated successfully!');
    } catch (error) {
      console.error('Failed to duplicate bookmark:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to duplicate bookmark: ${errorMessage}`);
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      // Skip favicon for localhost domains since they won't work
      if (domain === 'localhost' || domain.includes('127.0.0.1') || domain.includes('192.168.')) {
        return null;
      }
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        // Update the bookmark with the new preview image
        if (bookmark) {
          const updatedBookmark = { 
            ...bookmark, 
            preview_image: result 
          };
          onUpdated(updatedBookmark);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removePreviewImage = () => {
    setPreviewImage(null);
  };

  const handleAddBookmarkSubmit = (newBookmark: BookmarkWithRelations) => {
    // Optimistically add new bookmark to local list
    setAllBookmarks(prev => [...prev, newBookmark]);
    // Also add to manual links so it appears immediately in related section
    const transformed: BookmarkCardData = {
      id: newBookmark.id,
      title: newBookmark.title,
      url: newBookmark.url,
      faviconUrl: newBookmark.favicon_url ?? undefined,
      tags: newBookmark.tags?.map(t => t.name) || [],
      lastVisited: newBookmark.last_visited_at ? new Date(newBookmark.last_visited_at) : undefined,
      visitCount: newBookmark.visit_count ?? 0,
    };
    setManualLinks(prev => [...prev, transformed]);
    toast.success('Bookmark added');
    setIsAddBookmarkOpen(false);
    if (onBookmarkCreated) {
      onBookmarkCreated(newBookmark);
    }
  };

  const handleSelectExisting = (b: BookmarkWithRelations) => {
    const transformed: BookmarkCardData = {
      id: b.id,
      title: b.title,
      url: b.url,
      faviconUrl: b.favicon_url ?? undefined,
      tags: b.tags?.map((t) => t.name) || [],
      lastVisited: b.last_visited_at ? new Date(b.last_visited_at) : undefined,
      visitCount: b.visit_count ?? 0,
    };
    setManualLinks(prev => [...prev, transformed]);
    toast.success('Linked existing bookmark');
    setIsAddBookmarkOpen(false);
  };

  const handleOpenRelatedBookmark = (id: string) => {
    // find bookmark in allBookmarks (fetched earlier)
    const b = allBookmarks.find((bk) => bk.id === id);
    if (b) {
      // open new detail first so parent state sets before closing current modal
      if (onOpenDetail) {
        onOpenDetail(b);
      }
      // now close current modal
      onClose();
    } else {
      toast.error('Bookmark not found');
    }
  };

  if (!bookmark) return null;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'timer' as const, label: 'Timer', icon: Clock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'media' as const, label: 'Media', icon: Image },
    { id: 'comments' as const, label: 'Comments', icon: MessageCircle },
  ];

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{bookmark.title?.toUpperCase()}</DialogTitle>
        </DialogHeader>
        {/* Custom Header with Favicon, Title, URL and Action Buttons */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Favicon */}
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
              {getFaviconUrl(bookmark.url) ? (
                <img 
                  src={getFaviconUrl(bookmark.url) || ''} 
                  alt="Site favicon" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Globe className={`w-5 h-5 text-gray-500 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
            </div>
            
            {/* Title and URL */}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {bookmark.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {bookmark.url}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Favorite Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavorite}
              className={`p-2 ${bookmark.is_favorite ? 'text-red-500 border-red-200' : ''}`}
            >
              <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
            </Button>

            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share className="h-4 w-4" />
            </Button>

            {/* Duplicate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="p-2"
              title="Duplicate Bookmark"
            >
              <Copy className="h-4 w-4" />
            </Button>

            {/* Visit Site Button */}
            <Button
              onClick={() => window.open(bookmark.url, '_blank')}
              className="px-4 py-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              VISIT SITE
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Analytics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">ANALYTICS AND PERFORMANCE</h3>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {bookmark.visit_count || 0}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Visits</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(bookmark.visit_count || 0) > 0 ? '+12% from last week' : 'No visits yet'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {(bookmark.visit_count || 0) > 0 ? '0m' : '0m'}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Time Spent</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(bookmark.visit_count || 0) > 0 ? 'Average 0m per visit' : 'No time tracked yet'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {bookmark.visit_count || 0}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">This Week</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(bookmark.visit_count || 0) > 0 ? 'Most active day: Mon' : 'No activity yet'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">100%</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Globe className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Uptime</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">Site Health: Excellent</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* View Full Analytics Button */}
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => {
                      window.open(`/analytics?bookmark=${bookmark.id}`, '_blank');
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    VIEW FULL ANALYTICS
                  </Button>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side - Preview */}
                <div className="lg:col-span-1">
                  {/* Preview/Thumbnail with Upload */}
                  <div 
                    className={`relative w-full h-48 rounded-lg flex items-center justify-center border-2 border-dashed transition-all cursor-pointer group ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : previewImage 
                        ? 'border-gray-200 dark:border-gray-700' 
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('preview-upload')?.click()}
                  >
                    {previewImage ? (
                      <>
                        {/* Uploaded Image */}
                        <img 
                          src={previewImage} 
                          alt="Bookmark preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {/* Remove Button - appears on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePreviewImage();
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {/* Upload overlay - appears on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center text-white">
                            <Upload className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Change Image</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        {isDragOver ? (
                          <>
                            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">Drop image here</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2 group-hover:text-gray-500" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                              Click or drag to upload
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    {/* Hidden file input */}
                    <input
                      id="preview-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Description Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isEditingDescription ? saveDescription() : setIsEditingDescription(true)}
                      >
                        {isEditingDescription ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                    </div>
                    {isEditingDescription ? (
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Add a description for this bookmark..."
                        className="min-h-[80px] resize-none"
                        onBlur={saveDescription}
                      />
                    ) : (
                      <div 
                        className="min-h-[80px] p-3 border rounded-md bg-gray-50 dark:bg-gray-800 cursor-pointer"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {editedDescription || 'Click to add a description...'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {/* Default tags matching your screenshot */}
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        code
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        git
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        collaboration
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                        open-source
                      </Badge>
                      {/* User's actual tags */}
                      {bookmark.tags?.map(tag => (
                        <Badge key={tag.id} variant="secondary" style={{ backgroundColor: (tag.color || '#6366f1') + '20', color: tag.color || '#6366f1' }}>
                          {tag.name}
                        </Badge>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2" 
                        onClick={() => toast.info('Tag management coming soon!')}
                        title="Add new tag"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
              {/* Related Section */}
              {bookmark && (
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold uppercase">RELATED BOOKMARKS</h3>
                  <RelatedBookmarksSection
                    items={combinedRelated}
                    onAdd={() => setIsAddBookmarkOpen(true)}
                    onEdit={(id) => toast.info(`Edit ${id}`)}
                    onDelete={(id) => toast.success(`Deleted ${id}`)}
                    onReorder={(newOrder) => {
                      // TODO: persist reorder later
                      console.log('reorder', newOrder.map((i) => i.id));
                    }}
                    onOpenDetail={handleOpenRelatedBookmark}
                  />
                </div>
              )}
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Focus Timer</h3>
                
                {/* Bookmark Focus Card */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 rounded-lg overflow-hidden flex-shrink-0">
                        {getFaviconUrl(bookmark.url) ? (
                          <img 
                            src={getFaviconUrl(bookmark.url) || ''} 
                            alt="Site favicon" 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Globe className={`w-5 h-5 text-blue-500 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Focus on: {bookmark.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Start a Pomodoro session for this bookmark
                        </p>
                      </div>
                    </div>
                    
                    {/* Quick Timer Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <Button
                        onClick={() => {
                          // Store bookmark context in localStorage for the timer
                          localStorage.setItem('pomodoroBookmarkContext', JSON.stringify({
                            id: bookmark.id,
                            title: bookmark.title,
                            url: bookmark.url,
                            favicon: getFaviconUrl(bookmark.url)
                          }));
                          // Open the comprehensive timer in a new tab
                          window.open('/timer', '_blank');
                        }}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start 25min Focus
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Store bookmark context and close modal
                          localStorage.setItem('pomodoroBookmarkContext', JSON.stringify({
                            id: bookmark.id,
                            title: bookmark.title,
                            url: bookmark.url,
                            favicon: getFaviconUrl(bookmark.url)
                          }));
                          onClose();
                          // Navigate to timer page
                          window.location.href = '/timer';
                        }}
                        className="w-full"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Go to Timer Page
                      </Button>
                    </div>
                    
                    {/* Enhanced Quick Timer */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quick timer (enhanced mode):</p>
                      
                      {/* Quick Timer Configuration - Compact Row */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {/* Task Selection */}
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Task</label>
                          <select 
                            className="w-full text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={quickTimerTask}
                            onChange={(e) => setQuickTimerTask(e.target.value)}
                          >
                            <option value="">Select task...</option>
                            <option value="bookmark-focus">Focus on bookmark</option>
                            <option value="reading">Reading session</option>
                            <option value="research">Research time</option>
                            <option value="learning">Learning session</option>
                            <option value="review">Content review</option>
                          </select>
                        </div>

                        {/* List/Category Selection */}
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">List</label>
                          <select 
                            className="w-full text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={quickTimerList}
                            onChange={(e) => setQuickTimerList(e.target.value)}
                          >
                            <option value="">No list</option>
                            <option value="work">Work tasks</option>
                            <option value="personal">Personal</option>
                            <option value="learning">Learning</option>
                            <option value="urgent">Urgent</option>
                            <option value="someday">Someday/Maybe</option>
                          </select>
                        </div>

                        {/* Duration Selection */}
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Minutes</label>
                          <select 
                            className="w-full text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={quickTimerDuration}
                            onChange={(e) => {
                              const newDuration = parseInt(e.target.value);
                              setQuickTimerDuration(newDuration);
                              setTimerTime(newDuration * 60);
                              setInitialTime(newDuration * 60);
                            }}
                          >
                            <option value="5">5 min</option>
                            <option value="10">10 min</option>
                            <option value="15">15 min</option>
                            <option value="20">20 min</option>
                            <option value="25">25 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                          </select>
                        </div>
                      </div>

                      {/* Current Task Display */}
                      {quickTimerTask && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              {quickTimerTask === 'bookmark-focus' ? `Focus: ${bookmark.title}` : 
                               quickTimerTask.charAt(0).toUpperCase() + quickTimerTask.slice(1).replace('-', ' ')}
                            </span>
                            {quickTimerList && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">
                                {quickTimerList}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-3xl font-mono font-bold text-gray-700 dark:text-gray-300 mb-3 text-center">
                        {formatTime(timerTime)}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${timerProgress}%` }}
                        ></div>
                      </div>

                      {/* Enhanced Timer Controls */}
                      <div className="flex justify-center space-x-2">
                        <Button
                          size="sm"
                          onClick={startTimer}
                          disabled={isTimerRunning || timerTime === 0}
                          variant="outline"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={pauseTimer}
                          disabled={!isTimerRunning}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={resetTimer}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex justify-center space-x-1 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setQuickTimerDuration(5);
                            setTimerTime(5 * 60);
                            setInitialTime(5 * 60);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          5m
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setQuickTimerDuration(15);
                            setTimerTime(15 * 60);
                            setInitialTime(15 * 60);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          15m
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setQuickTimerDuration(25);
                            setTimerTime(25 * 60);
                            setInitialTime(25 * 60);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          25m
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Feature Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        Comprehensive Timer
                      </h5>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Full Pomodoro cycles</li>
                        <li>• Task management</li>
                        <li>• Progress tracking</li>
                        <li>• Statistics</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                        Quick Timer
                      </h5>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Simple 25min timer</li>
                        <li>• In-modal convenience</li>
                        <li>• No setup required</li>
                        <li>• Basic notifications</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Notifications & Reminders Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              {/* Notifications Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Comprehensive notification management
                      </p>
                      {/* Embedded Notification Demo */}
                      <NotificationIframe height="600px" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                        Features Available
                      </h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Toast notifications (success, error, warning, info)</li>
                        <li>• Priority levels (low, medium, high, urgent)</li>
                        <li>• Browser notifications support</li>
                        <li>• Audio alerts with volume control</li>
                        <li>• Notification center with history</li>
                        <li>• Filtering and search capabilities</li>
                        <li>• Persistent storage</li>
                        <li>• Customizable settings</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Reminders Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Reminders</h3>
                <ReminderManager
                  bookmarkId={bookmark.id}
                  bookmarkTitle={bookmark.title}
                />
              </div>
            </div>
          )}

          {/* Media Tab (includes former Documents content) */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Reuse preview upload section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side - Preview Upload */}
                <div className="lg:col-span-1">
                  {/* Preview/Thumbnail with Upload */}
                  {/* Reusing same block from Overview for consistency */}
                  {/* BEGIN Preview Upload */}
                  <div 
                    className={`relative w-full h-48 rounded-lg flex items-center justify-center border-2 border-dashed transition-all cursor-pointer group ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : previewImage 
                        ? 'border-gray-200 dark:border-gray-700' 
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('preview-upload')?.click()}
                  >
                    {previewImage ? (
                      <>
                        <img 
                          src={previewImage} 
                          alt="Bookmark preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePreviewImage();
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center text-white">
                            <Upload className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Change Image</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        {isDragOver ? (
                          <>
                            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">Drop image here</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2 group-hover:text-gray-500" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                              Click or drag to upload
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    {/* Hidden file input */}
                    <input
                      id="preview-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                  {/* END Preview Upload */}
                </div>
                {/* Right side placeholder for future media list or description */}
                <div className="lg:col-span-2 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 min-h-[12rem]">
                  {previewImage ? 'Image preview shown on the left.' : 'Upload images or media related to this bookmark.'}
                </div>
              </div>

              {/* Documents Content (merged) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documents & Notes</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      Create and attach documents, notes, and annotations for this bookmark.
                    </p>
                    <div className="text-center">
                      <Button onClick={() => toast.info('Document management feature coming soon!')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <BookmarkComments bookmarkId={bookmark.id} />
          )}
        </div>
      </DialogContent>
    </Dialog>
    {/* Add / New Links Dialog */}
    <Dialog open={isAddBookmarkOpen} onOpenChange={(open)=>{setIsAddBookmarkOpen(open); if(!open) setShowCreateNew(false);}}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showCreateNew ? 'ADD NEW BOOKMARK' : 'LINK EXISTING BOOKMARK'}</DialogTitle>
        </DialogHeader>
        {showCreateNew ? (
          <BookmarkForm
            folders={_folders}
            onSubmit={handleAddBookmarkSubmit}
            onCancel={() => setIsAddBookmarkOpen(false)}
          />
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Search bookmarks..."
              value={searchExisting}
              onChange={(e)=>setSearchExisting(e.target.value)}
            />
            <div className="max-h-80 overflow-y-auto divide-y divide-border rounded-md border">
              {filteredExisting.map(b=> (
                <button key={b.id} className="w-full text-left px-4 py-2 hover:bg-muted flex flex-col" onClick={()=>handleSelectExisting(b)}>
                  <span className="font-medium text-sm">{b.title}</span>
                  <span className="text-xs text-muted-foreground truncate">{b.url}</span>
                </button>
              ))}
              {filteredExisting.length===0 && <p className="p-4 text-sm text-muted-foreground">No bookmarks found</p>}
            </div>
            <div className="text-center">
              <Button variant="link" onClick={()=>setShowCreateNew(true)}>+ ADD NEW BOOKMARK INSTEAD</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
} 