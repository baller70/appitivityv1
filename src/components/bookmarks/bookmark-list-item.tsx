'use client';

import React, { useState } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';
import { BookmarkForm } from './bookmark-form';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Heart, Archive, ExternalLink, MoreHorizontal, Edit, Trash2, Folder as FolderIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useSelection } from '../../contexts/SelectionContext';
import { cn } from '../../lib/utils';
import Image from 'next/image';

interface BookmarkListItemProps {
  bookmark: BookmarkWithRelations;
  folders: Folder[];
  tags: Tag[];
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onDeleted: () => void;
}

export function BookmarkListItem({ bookmark, folders, tags, onUpdated, onDeleted }: BookmarkListItemProps) {
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

  const handleToggleArchive = async () => {
    if (!bookmarkService) return;
    
    try {
      setLoading(true);
      const updated = await bookmarkService.toggleArchive(bookmark.id);
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_archived ? 'Archived bookmark' : 'Unarchived bookmark');
    } catch (error) {
      console.error('Failed to toggle archive:', error);
      toast.error('Failed to update bookmark');
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

  const handleItemClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      toggleItem(bookmark.id);
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      enterSelectionMode();
      toggleItem(bookmark.id);
    }
  };

  const selected = isSelected(bookmark.id);

  return (
    <>
      <div 
        className={cn(
          "group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer relative",
          isSelectionMode && "hover:ring-2 hover:ring-blue-400",
          selected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
        )}
        onClick={handleItemClick}
        onDoubleClick={handleLongPress}
      >
        {/* Selection indicator */}
        {isSelectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <div 
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
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
          </div>
        )}

        <div className={cn(
          "flex items-center space-x-4 min-w-0 flex-1",
          isSelectionMode && "ml-6"
        )}>
          {/* Favicon */}
          <div className="flex-shrink-0">
            {bookmark.favicon_url ? (
              <Image
                src={bookmark.favicon_url}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {bookmark.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Bookmark Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {bookmark.title}
              </h3>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-1">
                {bookmark.is_favorite && (
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                )}
                {bookmark.is_archived && (
                  <Archive className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline truncate"
              >
                {new URL(bookmark.url).hostname}
              </a>
              
              {bookmark.folder && (
                <div className="flex items-center">
                  <FolderIcon className="h-3 w-3 mr-1" />
                                            {bookmark.folder.name.toUpperCase()}
                </div>
              )}
              
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {bookmark.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {bookmark.tags.length > 2 && (
                    <span className="text-xs">+{bookmark.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
            
            {bookmark.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                {bookmark.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isSelectionMode && (
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" asChild>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEdit(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleFavorite} disabled={loading}>
                <Heart className={`h-4 w-4 mr-2 ${bookmark.is_favorite ? 'fill-current text-red-500' : ''}`} />
                {bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleArchive} disabled={loading}>
                <Archive className="h-4 w-4 mr-2" />
                {bookmark.is_archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        )}
      </div>

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