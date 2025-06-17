'use client';

import React, { useState } from 'react';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder } from '../../types/supabase';
import { BookmarkForm } from './bookmark-form';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Heart, 
  Eye, 
  Edit, 
  ExternalLink, 
  Trash2, 
  Check, 
  ImageIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser, useAuth } from '@clerk/nextjs';
import { useSelection } from '../../contexts/SelectionContext';
import { cn } from '../../lib/utils';
import Image from 'next/image';

interface BookmarkCardProps {
  bookmark: BookmarkWithRelations;
  folders: Folder[];
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onDeleted: () => void;
  onOpenDetail?: () => void;
  totalBookmarkVisits?: number;
}

export function BookmarkCard({ bookmark, folders, onUpdated, onDeleted, onOpenDetail, totalBookmarkVisits }: BookmarkCardProps) {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { 
    isSelectionMode, 
    isSelected, 
    toggleItem, 
    enterSelectionMode 
  } = useSelection();

  const handleToggleFavorite = async () => {
    if (!isSignedIn || !user) {
      toast.error('Please sign in to favorite bookmarks');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Toggling favorite for bookmark:', bookmark.id, 'Current favorite status:', bookmark.is_favorite);
      
      // Use the API route to ensure proper persistence
      const response = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          folder_id: bookmark.folder_id,
          is_favorite: !bookmark.is_favorite,
          is_archived: bookmark.is_archived
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bookmark');
      }
      
      const updated = await response.json();
      console.log('Updated bookmark result:', updated);
      
      // Update the local state with the response from server
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_favorite ? '❤️ Added to favorites' : '💔 Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if it's a network/auth error
      if (errorMessage.includes('JWT') || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        toast.error('Authentication expired - please refresh the page');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error - please check your connection');
      } else {
        toast.error(`Failed to update bookmark: ${errorMessage}`);
      }
      
      // Update UI optimistically if it's likely just a network issue
      if (!errorMessage.includes('authentication') && !errorMessage.includes('unauthorized')) {
        onUpdated({ ...bookmark, is_favorite: !bookmark.is_favorite });
        toast.info('Update may have succeeded - page will refresh with latest data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      setLoading(true);
      
      // Use the API route to ensure proper persistence
      const response = await fetch(`/api/bookmarks?id=${bookmark.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bookmark');
      }
      
      onDeleted();
      toast.success('Bookmark deleted successfully');
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('JWT') || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        toast.error('Authentication expired - please refresh the page');
      } else {
        toast.error(`Failed to delete bookmark: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedBookmark: BookmarkWithRelations) => {
    try {
      setLoading(true);
      
      // Use the API route to ensure proper persistence
      const response = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookmark.id,
          title: updatedBookmark.title,
          url: updatedBookmark.url,
          description: updatedBookmark.description,
          folder_id: updatedBookmark.folder_id,
          is_favorite: updatedBookmark.is_favorite,
          is_archived: updatedBookmark.is_archived
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bookmark');
      }
      
      const updated = await response.json();
      onUpdated({ ...bookmark, ...updated });
      toast.success('Bookmark updated successfully');
      setShowEdit(false);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('JWT') || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        toast.error('Authentication expired - please refresh the page');
      } else {
        toast.error(`Failed to update bookmark: ${errorMessage}`);
        // Still close the edit form and update locally for better UX
        onUpdated(updatedBookmark);
        setShowEdit(false);
        toast.info('Changes saved locally - please refresh to sync');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      toggleItem(bookmark.id);
    } else {
      // Track the visit when opening detail modal
      try {
        const response = await fetch('/api/bookmarks/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookmarkId: bookmark.id,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Update the local bookmark state with new visit count
          onUpdated({
            ...bookmark,
            visit_count: result.bookmark.visit_count,
            last_visited_at: result.bookmark.last_visited_at,
          });
        }
      } catch (error) {
        console.error('Failed to track visit:', error);
      }

      // Open detail modal when clicking on the card
      onOpenDetail?.();
      toast.success('Opening bookmark details');
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      enterSelectionMode();
      toggleItem(bookmark.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(bookmark));
    e.dataTransfer.effectAllowed = 'move';
  };

  const selected = isSelected(bookmark.id);

  // Get letter icon from title - exact from reference
  const getLetterIcon = (title: string) => {
    return title.charAt(0).toUpperCase();
  };

  // Get favicon URL from bookmark URL
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

  // Calculate usage percentage
  const calculateUsagePercentage = (): number => {
    if (!totalBookmarkVisits || totalBookmarkVisits === 0) return 0;
    const bookmarkVisits = bookmark.visit_count || 0;
    return Math.round((bookmarkVisits / totalBookmarkVisits) * 100);
  };

  const usagePercentage = calculateUsagePercentage();
  
  // Debug logging
  console.log('BookmarkCard Debug:', {
    bookmarkTitle: bookmark.title,
    bookmarkVisits: bookmark.visit_count,
    totalBookmarkVisits,
    usagePercentage,
    shouldShow: totalBookmarkVisits && totalBookmarkVisits >= 0
  });

  return (
    <>
      <Card 
        className={cn(
          "group hover:shadow-lg transition-all duration-200 cursor-pointer relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          selected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
        )}
        onClick={handleCardClick}
        onDoubleClick={handleLongPress}
        draggable={true}
        onDragStart={handleDragStart}
      >
        {/* Top Row - Checkbox and Action Icons */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Checkbox - Exact from Screenshot */}
          <div 
            className={cn(
              "w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors cursor-pointer",
              selected 
                ? "bg-blue-500 border-blue-500" 
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleItem(bookmark.id);
            }}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </div>

          {/* Action Icons - Exact from Screenshot */}
          <div className="flex items-center space-x-1">
            {/* Heart - Favorite */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-auto w-auto hover:bg-white/80",
                bookmark.is_favorite && "hover:bg-red-50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              disabled={loading}
              title={bookmark.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn(
                "h-4 w-4 transition-colors",
                bookmark.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
              )} />
            </Button>

            {/* Eye - View Details */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.();
                toast.info('Opening bookmark details');
              }}
              title="View bookmark details"
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>

            {/* Edit */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                setShowEdit(true);
                toast.info('Opening edit form');
              }}
              title="Edit bookmark"
            >
              <Edit className="h-4 w-4 text-gray-400 hover:text-green-500" />
            </Button>

            {/* External Link - Opens website */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  // Track the visit
                  const response = await fetch('/api/bookmarks/visit', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      bookmarkId: bookmark.id,
                    }),
                  });

                  if (response.ok) {
                    const result = await response.json();
                    // Update the local bookmark state with new visit count
                    onUpdated({
                      ...bookmark,
                      visit_count: result.bookmark.visit_count,
                      last_visited_at: result.bookmark.last_visited_at,
                    });
                  }

                  window.open(bookmark.url, '_blank');
                  toast.success('Opening website in new tab');
                } catch (error) {
                  console.error('Failed to open bookmark:', error);
                  toast.error('Failed to open bookmark');
                }
              }}
              title="Open website in new tab"
            >
              <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={loading}
              title="Delete bookmark"
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Preview Image, Letter Icon or Favicon - Exact from Reference */}
          <div className="relative">
            {/* Priority: Preview Image > Favicon > Letter Icon */}
            {bookmark.preview_image ? (
              <Image
                src={bookmark.preview_image}
                alt={`Preview for ${bookmark.title}`}
                width={400}
                height={128}
                className="w-full h-32 object-cover rounded-t-lg"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : getFaviconUrl(bookmark.url) ? (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
                <Image
                  src={getFaviconUrl(bookmark.url) || ''}
                  alt={`Favicon for ${bookmark.title}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-12 h-12 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {getLetterIcon(bookmark.title)}
                  </span>
                </div>
              </div>
            ) : null}
            
            {/* Fallback Letter Icon */}
            <div className={cn(
              "w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center",
              (bookmark.preview_image || getFaviconUrl(bookmark.url)) && "hidden"
            )}>
              <div className="w-12 h-12 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {getLetterIcon(bookmark.title)}
                </span>
              </div>
            </div>

            {/* Image Placeholder Icon - Exact from Screenshot */}
            {!bookmark.preview_image && !bookmark.favicon_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content - Exact from Reference */}
          <div className="p-4 pt-3">
            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              {bookmark.title}
            </h3>

            {/* URL */}
            <div className="text-sm text-gray-500 dark:text-gray-400 block mb-3">
              {bookmark.url}
            </div>

            {/* Description */}
            {bookmark.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {bookmark.description}
              </p>
            )}

            {/* Tags Row - Exact from Reference */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {bookmark.tags.filter(tag => tag && tag.id && tag.name).map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary" 
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Category Row - Exact from Reference */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{bookmark.folder?.name.toUpperCase() || 'UNCATEGORIZED'}</span>
              </div>
            </div>

            {/* Visit Count - Exact from Reference */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{bookmark.visit_count || 0} visits</span>
              </div>
              
              {/* Usage Percentage - Bottom Right Corner */}
              {totalBookmarkVisits !== undefined && totalBookmarkVisits >= 0 && (
                <div 
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full"
                  title="Usage percentage"
                >
                  <span className="text-lg font-bold">{usagePercentage}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          <BookmarkForm
            bookmark={bookmark}
            folders={folders}
            onSubmit={handleEdit}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 