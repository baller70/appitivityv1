'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Check, 
  X, 
  Archive, 
  Trash2, 
  Heart, 
  Tag as TagIcon, 
  Folder,
  MoreHorizontal,
  CheckSquare,
  Square,
  Download,
  Copy
} from 'lucide-react';
import { useSelection } from '../../contexts/SelectionContext';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import bookmarkExportService from '../../lib/services/export';
import type { Folder as FolderType, Tag } from '../../types/supabase';

interface MassActionsToolbarProps {
  bookmarks: BookmarkWithRelations[];
  folders: FolderType[];
  tags: Tag[];
  userId: string;
  onUpdate: () => void;
}

export function MassActionsToolbar({
  bookmarks,
  folders,
  tags,
  userId,
  onUpdate
}: MassActionsToolbarProps) {
  const {
    selectedCount,
    getSelectedItems,
    selectAll,
    deselectAll,
    exitSelectionMode,
    isSelectionMode
  } = useSelection();

  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const bookmarkService = new BookmarkService(userId);
  const selectedItems = getSelectedItems(bookmarks);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const ids = selectedItems.map(item => item.id);
      await bookmarkService.bulkDelete(ids);
      exitSelectionMode();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete bookmarks:', error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle bulk archive/unarchive
  const handleBulkArchive = async (archive: boolean) => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const ids = selectedItems.map(item => item.id);
      await bookmarkService.bulkUpdate(ids, { is_archived: archive });
      exitSelectionMode();
      onUpdate();
    } catch (error) {
      console.error('Failed to update bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk favorite/unfavorite
  const handleBulkFavorite = async (favorite: boolean) => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const ids = selectedItems.map(item => item.id);
      await bookmarkService.bulkUpdate(ids, { is_favorite: favorite });
      exitSelectionMode();
      onUpdate();
    } catch (error) {
      console.error('Failed to update bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk move to folder
  const handleBulkMove = async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const ids = selectedItems.map(item => item.id);
      await bookmarkService.bulkUpdate(ids, { 
        folder_id: selectedFolderId === 'none' ? null : selectedFolderId 
      });
      exitSelectionMode();
      onUpdate();
    } catch (error) {
      console.error('Failed to move bookmarks:', error);
    } finally {
      setLoading(false);
      setShowMoveDialog(false);
      setSelectedFolderId('');
    }
  };

  // Handle bulk tag operations
  const handleBulkTagging = async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      // For simplicity, we'll remove all existing tags and add new ones
      // In a more sophisticated implementation, you might want to merge/subtract tags
      for (const item of selectedItems) {
        // Remove existing tags
        await bookmarkService.removeTagsFromBookmark(item.id);
        
        // Add new tags
        if (selectedTagIds.length > 0) {
          await bookmarkService.addTagsToBookmark(item.id, selectedTagIds);
        }
      }
      
      exitSelectionMode();
      onUpdate();
    } catch (error) {
      console.error('Failed to update tags:', error);
    } finally {
      setLoading(false);
      setShowTagDialog(false);
      setSelectedTagIds([]);
    }
  };

  // Handle bulk export
  const handleBulkExport = async (action: 'download' | 'copy') => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      // Transform selected bookmarks to export format
      const exportData = selectedItems.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || '',
        folder: bookmark.folder?.name || 'Uncategorized',
        tags: bookmark.tags?.map((tag: any) => tag.name).filter(Boolean).join(', ') || '',
        is_favorite: bookmark.is_favorite,
        is_archived: bookmark.is_archived,
        created_at: bookmark.created_at,
        updated_at: bookmark.updated_at,
        visit_count: bookmark.visit_count || 0,
        last_visited_at: bookmark.last_visited_at || '',
        favicon_url: bookmark.favicon_url || ''
      }));

      const jsonData = {
        exportDate: new Date().toISOString(),
        totalBookmarks: exportData.length,
        bookmarks: exportData
      };

      const result = {
        data: JSON.stringify(jsonData, null, 2),
        filename: `selected-bookmarks-${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json'
      };

      if (action === 'download') {
        bookmarkExportService.downloadFile(result);
        // Simple success notification
        alert(`Downloaded ${result.filename}`);
      } else if (action === 'copy') {
        await bookmarkExportService.copyToClipboard(result);
        alert('Copied to clipboard');
      }

      exitSelectionMode();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSelectionMode) {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={exitSelectionMode}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="h-6">
                {selectedCount} selected
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedCount === bookmarks.length ? deselectAll() : selectAll(bookmarks)}
                className="h-8 text-xs"
              >
                {selectedCount === bookmarks.length ? (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkFavorite(true)}
              disabled={loading || selectedCount === 0}
              className="h-8"
            >
              <Heart className="h-4 w-4 mr-1" />
              Favorite
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkArchive(true)}
              disabled={loading || selectedCount === 0}
              className="h-8"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loading || selectedCount === 0}
                  className="h-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
                  <Folder className="h-4 w-4 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTagDialog(true)}>
                  <TagIcon className="h-4 w-4 mr-2" />
                  Update Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkExport('download')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkExport('copy')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkFavorite(false)}>
                  <Heart className="h-4 w-4 mr-2" />
                  Remove from Favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkArchive(false)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Unarchive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bookmarks</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} bookmark{selectedCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to move {selectedCount} bookmark{selectedCount !== 1 ? 's' : ''} to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMoveDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkMove}
              disabled={loading || !selectedFolderId}
            >
              {loading ? 'Moving...' : 'Move'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Tags Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tags</DialogTitle>
            <DialogDescription>
              Select tags to apply to {selectedCount} bookmark{selectedCount !== 1 ? 's' : ''}. 
              This will replace existing tags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTagIds(prev => [...prev, tag.id]);
                      } else {
                        setSelectedTagIds(prev => prev.filter(id => id !== tag.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTagDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkTagging}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Tags'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 