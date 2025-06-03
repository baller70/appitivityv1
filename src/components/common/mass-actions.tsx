'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Archive, 
  Heart, 
  Folder, 
  Tag as TagIcon,
  MoreHorizontal,
  X
} from 'lucide-react';
import { BookmarkService } from '../../lib/services/bookmarks';

import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder as FolderType, Tag } from '../../types/supabase';
import { toast } from 'sonner';

interface MassActionsProps {
  userId: string;
  bookmarks: BookmarkWithRelations[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBookmarksUpdated: () => void;
  folders: FolderType[];
  tags: Tag[];
}

export function MassActions({
  userId,
  bookmarks,
  selectedIds,
  onSelectionChange,
  onBookmarksUpdated,
  folders,
  tags
}: MassActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const bookmarkService = new BookmarkService(userId);

  // Check if all visible bookmarks are selected
  const allSelected = bookmarks.length > 0 && bookmarks.every(b => selectedIds.includes(b.id));
  const someSelected = selectedIds.length > 0;
  
  // Toggle select all
  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(bookmarks.map(b => b.id));
    }
  };



  // Bulk operations
  const handleBulkFavorite = async () => {
    setIsLoading(true);
    try {
      await bookmarkService.bulkUpdate(selectedIds, { is_favorite: true });
      onBookmarksUpdated();
      onSelectionChange([]);
      toast.success(`Added ${selectedIds.length} bookmarks to favorites`);
    } catch (error) {
      console.error('Failed to favorite bookmarks:', error);
      toast.error('Failed to favorite bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUnfavorite = async () => {
    setIsLoading(true);
    try {
      await bookmarkService.bulkUpdate(selectedIds, { is_favorite: false });
      onBookmarksUpdated();
      onSelectionChange([]);
      toast.success(`Removed ${selectedIds.length} bookmarks from favorites`);
    } catch (error) {
      console.error('Failed to unfavorite bookmarks:', error);
      toast.error('Failed to unfavorite bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsLoading(true);
    try {
      await bookmarkService.bulkUpdate(selectedIds, { is_archived: true });
      onBookmarksUpdated();
      onSelectionChange([]);
      toast.success(`Archived ${selectedIds.length} bookmarks`);
    } catch (error) {
      console.error('Failed to archive bookmarks:', error);
      toast.error('Failed to archive bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUnarchive = async () => {
    setIsLoading(true);
    try {
      await bookmarkService.bulkUpdate(selectedIds, { is_archived: false });
      onBookmarksUpdated();
      onSelectionChange([]);
      toast.success(`Unarchived ${selectedIds.length} bookmarks`);
    } catch (error) {
      console.error('Failed to unarchive bookmarks:', error);
      toast.error('Failed to unarchive bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} bookmarks? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await bookmarkService.bulkDelete(selectedIds);
      onBookmarksUpdated();
      onSelectionChange([]);
      toast.success(`Deleted ${selectedIds.length} bookmarks`);
    } catch (error) {
      console.error('Failed to delete bookmarks:', error);
      toast.error('Failed to delete bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkMoveToFolder = async (folderId: string | null) => {
    setIsLoading(true);
    try {
      await bookmarkService.bulkUpdate(selectedIds, { folder_id: folderId });
      onBookmarksUpdated();
      onSelectionChange([]);
      const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No folder';
      toast.success(`Moved ${selectedIds.length} bookmarks to ${folderName}`);
    } catch (error) {
      console.error('Failed to move bookmarks:', error);
      toast.error('Failed to move bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAddTag = async (tagId: string) => {
    setIsLoading(true);
    try {
      // Add the tag to all selected bookmarks
      for (const bookmarkId of selectedIds) {
        await bookmarkService.addTagsToBookmark(bookmarkId, [tagId]);
      }
      onBookmarksUpdated();
      onSelectionChange([]);
      const tagName = tags.find(t => t.id === tagId)?.name;
      toast.success(`Added tag "${tagName}" to ${selectedIds.length} bookmarks`);
    } catch (error) {
      console.error('Failed to add tag to bookmarks:', error);
      toast.error('Failed to add tag to bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  if (!someSelected) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSelectAll}
          className="flex items-center space-x-2"
        >
          <Square className="h-4 w-4" />
          <span>Select All</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
      {/* Selection indicator */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSelectAll}
        className="flex items-center space-x-2"
      >
        <CheckSquare className="h-4 w-4" />
        <span>{selectedIds.length} selected</span>
      </Button>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Quick actions */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBulkFavorite}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <Heart className="h-3 w-3" />
          <span>Favorite</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBulkArchive}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <Archive className="h-3 w-3" />
          <span>Archive</span>
        </Button>

        {/* Move to folder dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <Folder className="h-3 w-3 mr-1" />
              Move
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-1">
              <p className="text-sm font-medium">Move to folder</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkMoveToFolder(null)}
                className="w-full justify-start"
              >
                No folder
              </Button>
              {folders.map(folder => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkMoveToFolder(folder.id)}
                  className="w-full justify-start"
                >
                  <Folder className="h-3 w-3 mr-2" />
                  {folder.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Add tag dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <TagIcon className="h-3 w-3 mr-1" />
              Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-1">
              <p className="text-sm font-medium">Add tag</p>
              {tags.map(tag => (
                <Button
                  key={tag.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAddTag(tag.id)}
                  className="w-full justify-start"
                >
                  <TagIcon className="h-3 w-3 mr-2" />
                  {tag.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* More actions dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkUnfavorite}
                className="w-full justify-start"
              >
                <Heart className="h-3 w-3 mr-2" />
                Remove from favorites
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkUnarchive}
                className="w-full justify-start"
              >
                <Archive className="h-3 w-3 mr-2" />
                Unarchive
              </Button>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear selection */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelectionChange([])}
        className="ml-auto"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Individual bookmark selection checkbox component
interface BookmarkCheckboxProps {
  bookmarkId: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function BookmarkCheckbox({ bookmarkId, isSelected, onToggle }: BookmarkCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(bookmarkId);
      }}
      className="flex items-center justify-center w-4 h-4 rounded border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
    >
      {isSelected && <CheckSquare className="h-3 w-3 text-blue-600" />}
      {!isSelected && <Square className="h-3 w-3 text-gray-400" />}
    </button>
  );
} 