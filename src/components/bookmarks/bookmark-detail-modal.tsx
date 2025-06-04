'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';

import { Label } from '../ui/label';
import { 
  Clock, 
  Bell, 
  Calendar, 
  Link, 
  FileText, 
  TrendingUp, 
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
  X
} from 'lucide-react';
import { RichTextEditor } from '../ui/rich-text-editor';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface BookmarkDetailModalProps {
  bookmark: BookmarkWithRelations | null;
  folders: Folder[];
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkCreated?: (bookmark: BookmarkWithRelations) => void;
}

type TabType = 'overview' | 'timer' | 'notifications' | 'reminders' | 'related' | 'documents' | 'progress';

export function BookmarkDetailModal({
  bookmark,
  folders,
  tags,
  isOpen,
  onClose,
  onUpdated,
  onBookmarkCreated
}: BookmarkDetailModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timerTime, setTimerTime] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);
  
  // Editable fields state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(bookmark?.description || '');
  const [notes, setNotes] = useState('<h2>Main Repository Notes</h2><p>This is the main repository hosting platform for all projects. Contains personal and work repositories.</p><ul><li>Personal projects</li><li>Work repositories</li><li>Open source contributions</li></ul><blockquote><p>Remember to check for updates regularly and maintain proper documentation.</p></blockquote>');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
          setTimerProgress(((25 * 60 - newTime) / (25 * 60)) * 100);
          if (newTime <= 0) {
            setIsTimerRunning(false);
            // Timer completed notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Timer completed for ${bookmark?.title}!`, {
                body: 'Time to take a break or start a new session.',
                icon: '/favicon.ico'
              });
            }
            toast.success(`Timer completed for ${bookmark?.title}!`);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime, bookmark?.title]);

  // Request notification permission when component mounts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
    setTimerTime(25 * 60);
    setTimerProgress(0);
    toast.info('🔄 Timer reset to 25 minutes');
  };

  const saveDescription = () => {
    // Here you would typically call an API to update the bookmark
    setIsEditingDescription(false);
    if (bookmark) {
      onUpdated({ ...bookmark, description: editedDescription });
    }
  };

  const saveNotes = async () => {
    // Here you would typically call an API to save the notes
    if (!bookmark || !user) {
      toast.error('Please sign in to save notes');
      return;
    }
    
    try {
      // For now, we'll just update the local state
      // In a real app, you'd save this to the database
      setIsEditingNotes(false);
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
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

  if (!bookmark) return null;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'timer' as const, label: 'Timer', icon: Clock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'reminders' as const, label: 'Reminders', icon: Calendar },
    { id: 'related' as const, label: 'Related', icon: Link },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
    { id: 'progress' as const, label: 'Progress', icon: TrendingUp },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{bookmark.title}</DialogTitle>
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
              Visit Site
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics & Performance</h3>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {bookmark.visit_count || 45}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Visits</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">+12% from last week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">2h 30m</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Time Spent</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average 3m per visit</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">45</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">This Week</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Most active day: Mon</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">98%</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Globe className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Uptime</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">Site Health: Excellent</p>
                    </CardContent>
                  </Card>
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

              {/* Notes Section - Full Width */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-lg font-semibold">Notes & Documentation</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Rich text notes with full formatting support
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isEditingNotes ? saveNotes() : setIsEditingNotes(true)}
                    className="flex items-center gap-2"
                  >
                    {isEditingNotes ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
                {isEditingNotes ? (
                  <RichTextEditor
                    content={notes}
                    onChange={setNotes}
                    placeholder="Start writing your notes... Use the toolbar above for rich formatting including headings, lists, text alignment, and more."
                    className="min-h-[350px]"
                  />
                ) : (
                  <div 
                    className="min-h-[250px] p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer prose prose-sm dark:prose-invert max-w-none hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    onClick={() => setIsEditingNotes(true)}
                    dangerouslySetInnerHTML={{ __html: notes || '<div class="text-center text-gray-500 dark:text-gray-400 py-8"><p class="text-lg mb-2">📝 Click to add notes</p><p class="text-sm">Use rich text formatting to organize your thoughts, add documentation, or create detailed annotations for this bookmark.</p></div>' }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Focus Timer</h3>
                <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                  {formatTime(timerTime)}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={startTimer}
                    disabled={isTimerRunning || timerTime === 0}
                    className="min-w-[100px]"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    onClick={pauseTimer}
                    disabled={!isTimerRunning}
                    className="min-w-[100px]"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTimer}
                    className="min-w-[100px]"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Browser notifications when timer completes</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if ('Notification' in window) {
                            if (Notification.permission === 'default') {
                              Notification.requestPermission().then(permission => {
                                toast.success(permission === 'granted' ? 'Notifications enabled!' : 'Notifications not enabled');
                              });
                            } else {
                              toast.info(`Notifications are ${Notification.permission}`);
                            }
                          } else {
                            toast.error('Notifications not supported in this browser');
                          }
                        }}
                        title="Configure notifications"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Daily reading reminder</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Daily reminders coming soon!')}
                        title="Add daily reminder"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Smart Reminders</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    Set up intelligent reminders to revisit this bookmark based on your learning goals and browsing patterns.
                  </p>
                  <div className="text-center">
                    <Button onClick={() => toast.info('Smart reminders feature coming soon!')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Related Tab */}
          {activeTab === 'related' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related Bookmarks</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    Discover bookmarks related to &ldquo;{bookmark.title}&rdquo; based on content similarity, tags, and browsing patterns.
                  </p>
                  <div className="text-center">
                    <Button 
                      variant="outline"
                      onClick={() => toast.info('Related bookmarks feature coming soon!')}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Find Related
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
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
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {bookmark.visit_count || 0}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      0
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Study Sessions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      0h
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 