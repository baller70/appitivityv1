'use client';

import React, { useState } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';
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
import { useUser } from '@clerk/nextjs';
import { useSelection } from '../../contexts/SelectionContext';
import { cn } from '../../lib/utils';

interface BookmarkCardProps {
  bookmark: BookmarkWithRelations;
  folders: Folder[];
  tags: Tag[];
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onDeleted: () => void;
  onOpenDetail?: () => void;
}

export function BookmarkCard({ bookmark, folders, tags, onUpdated, onDeleted, onOpenDetail }: BookmarkCardProps) {
  const { user } = useUser();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { 
    isSelectionMode, 
    isSelected, 
    toggleItem, 
    enterSelectionMode 
  } = useSelection();

  const bookmarkService = user ? new BookmarkService(user.id) : null;

  const handleToggleFavorite = async () => {
    if (!bookmarkService) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Toggling favorite for bookmark:', bookmark.id);
      const updated = await bookmarkService.toggleFavorite(bookmark.id);
      console.log('Favorite toggled successfully:', updated);
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update bookmark: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookmarkService) return;
    
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      setLoading(true);
      await bookmarkService.deleteBookmark(bookmark.id);
      onDeleted();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      toast.error('Failed to delete bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (updatedBookmark: BookmarkWithRelations) => {
    onUpdated(updatedBookmark);
    setShowEdit(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      toggleItem(bookmark.id);
    } else {
      // Open detail modal when clicking on the card
      onOpenDetail?.();
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      enterSelectionMode();
      toggleItem(bookmark.id);
    }
  };

  const selected = isSelected(bookmark.id);

  // Get priority color - exact from reference
  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200'; // default to medium
    }
  };

  // Get letter icon from title - exact from reference
  const getLetterIcon = (title: string) => {
    return title.charAt(0).toUpperCase();
  };

  return (
    <>
      <Card 
        className={cn(
          "group hover:shadow-lg transition-all duration-200 cursor-pointer relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          selected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
        )}
        onClick={handleCardClick}
        onDoubleClick={handleLongPress}
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
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              disabled={loading}
            >
              <Heart className={cn(
                "h-4 w-4",
                bookmark.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400"
              )} />
            </Button>

            {/* Eye - View */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                window.open(bookmark.url, '_blank');
              }}
            >
              <Eye className="h-4 w-4 text-gray-400" />
            </Button>

            {/* Edit */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                setShowEdit(true);
              }}
            >
              <Edit className="h-4 w-4 text-gray-400" />
            </Button>

            {/* External Link */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                window.open(bookmark.url, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Letter Icon or Image - Exact from Reference */}
          <div className="relative">
            {bookmark.favicon_url ? (
              <img
                src={bookmark.favicon_url}
                alt=""
                className="w-full h-32 object-cover rounded-t-lg"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback Letter Icon */}
            <div className={cn(
              "w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center",
              bookmark.favicon_url && "hidden"
            )}>
              <div className="w-12 h-12 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {getLetterIcon(bookmark.title)}
                </span>
              </div>
            </div>

            {/* Image Placeholder Icon - Exact from Screenshot */}
            {!bookmark.favicon_url && (
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
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline block mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {bookmark.url}
            </a>

            {/* Description */}
            {bookmark.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {bookmark.description}
              </p>
            )}

            {/* Tags Row - Exact from Reference */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {bookmark.tags.map((tag) => (
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

            {/* Priority and Category Row - Exact from Reference */}
            <div className="flex items-center justify-between mb-3">
              <Badge 
                className={cn(
                  "text-xs px-2 py-1 border",
                  getPriorityColor((bookmark as any).priority || 'medium')
                )}
              >
                {(bookmark as any).priority || 'medium'}
              </Badge>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{bookmark.folder?.name || 'Uncategorized'}</span>
              </div>
            </div>

            {/* Visit Count - Exact from Reference */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
              <Eye className="h-4 w-4 mr-1" />
              <span>{bookmark.visit_count || 0} visits</span>
            </div>

                         {/* Additional Description - Exact from Reference */}
             {(bookmark as any).additional_description && (
               <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                 {(bookmark as any).additional_description}
               </p>
             )}
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
            tags={tags}
            onSubmit={handleEdit}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 