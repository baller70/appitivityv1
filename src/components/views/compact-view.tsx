'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Heart, 
  ArrowLeft,
  Folder as FolderIcon,
  Plus,
  ChevronRight,
  Home
} from 'lucide-react';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { BookmarkForm } from '../bookmarks/bookmark-form';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';

interface CompactViewProps {
  bookmarks: BookmarkWithRelations[];
  folders: Folder[];
  tags: Tag[];
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddBookmarkToFolder: (folderId: string) => void;
}

export function CompactView({ 
  bookmarks, 
  folders, 
  tags, 
  onBookmarkUpdated, 
  onBookmarkDeleted,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onAddBookmarkToFolder
}: CompactViewProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBookmarkDetail, setShowBookmarkDetail] = useState(false);

  // Get bookmarks for the selected folder
  const getFolderBookmarks = (folderId: string) => {
    return bookmarks.filter(bookmark => bookmark.folder_id === folderId);
  };

  // Count bookmarks per folder (including nested folders)
  const getBookmarkCount = (folderId: string): number => {
    const directBookmarks = bookmarks.filter(bookmark => bookmark.folder_id === folderId).length;
    const subfolders = folders.filter(folder => folder.parent_id === folderId);
    const nestedBookmarks = subfolders.reduce((count, subfolder) => {
      return count + getBookmarkCount(subfolder.id);
    }, 0);
    return directBookmarks + nestedBookmarks;
  };

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  const handleEdit = (bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setShowEditDialog(true);
  };

  const handleToggleFavorite = async (bookmark: BookmarkWithRelations) => {
    try {
      const updatedBookmark = {
        ...bookmark,
        is_favorite: !bookmark.is_favorite
      };
      onBookmarkUpdated(updatedBookmark);
      toast.success(updatedBookmark.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleDelete = async (bookmarkId: string) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        onBookmarkDeleted(bookmarkId);
        toast.success('Bookmark deleted');
      } catch (error) {
        console.error('Failed to delete bookmark:', error);
        toast.error('Failed to delete bookmark');
      }
    }
  };

  const handleFormSubmit = (updatedBookmark: BookmarkWithRelations) => {
    onBookmarkUpdated(updatedBookmark);
    setShowEditDialog(false);
    setSelectedBookmark(null);
    toast.success('Bookmark updated successfully');
  };

  const handleBookmarkClick = (bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setShowBookmarkDetail(true);
  };

  const handleBookmarkUpdated = (updatedBookmark: BookmarkWithRelations) => {
    onBookmarkUpdated(updatedBookmark);
    setSelectedBookmark(updatedBookmark);
  };

  const getFolderColor = (folder: Folder) => {
    return folder.color || '#3b82f6'; // Default blue
  };

  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const displayBookmarks = selectedFolder ? getFolderBookmarks(selectedFolder.id) : [];

  // Show folder bookmarks view
  if (selectedFolder) {
    return (
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToFolders}
              className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Folders</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg shadow-sm"
                style={{ backgroundColor: getFolderColor(selectedFolder) }}
              >
                <FolderIcon 
                  className="h-5 w-5" 
                  style={{ color: getContrastColor(getFolderColor(selectedFolder)) }}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedFolder.name.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFolder.description || `Compact view of ${selectedFolder.name} bookmarks`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {displayBookmarks.length} bookmark{displayBookmarks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {displayBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
              <FolderIcon className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Bookmarks Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This folder is empty. Add some bookmarks to get started.
            </p>
            <Button onClick={() => onAddBookmarkToFolder(selectedFolder.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {displayBookmarks.map((bookmark) => (
              <Card 
                key={bookmark.id} 
                className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer"
                onClick={() => handleBookmarkClick(bookmark)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {bookmark.favicon_url ? (
                        <Image
                          src={bookmark.favicon_url}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                      )}
                      <CardTitle className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                        {bookmark.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(bookmark);
                      }}
                    >
                      <Heart 
                        className={`h-3 w-3 ${bookmark.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 pt-0 space-y-2">
                  {/* Description */}
                  {bookmark.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}
                  
                  {/* URL */}
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate font-mono">
                    {new URL(bookmark.url).hostname}
                  </p>

                  {/* Tags */}
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-0 h-5">
                          {tag.name}
                        </Badge>
                      ))}
                      {bookmark.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                          +{bookmark.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(bookmark.url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(bookmark);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bookmark.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bookmark Detail Modal */}
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
      </div>
    );
  }

  // Show folders grid view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            COMPACT VIEW
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse your folders in a compact, efficient layout
          </p>
        </div>
        <Button onClick={onCreateFolder} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Create Folder</span>
        </Button>
      </div>

      {folders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <FolderIcon className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Folders Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first folder to organize your bookmarks in a compact view.
          </p>
          <Button onClick={onCreateFolder} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {folders.map((folder) => {
            const bookmarkCount = getBookmarkCount(folder.id);
            const folderColor = getFolderColor(folder);
            const textColor = getContrastColor(folderColor);
            return (
              <Card 
                key={folder.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                onClick={() => handleFolderClick(folder)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div 
                      className="p-2 rounded-lg shadow-sm"
                      style={{ backgroundColor: folderColor }}
                    >
                      <FolderIcon 
                        className="h-5 w-5" 
                        style={{ color: textColor }}
                      />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFolder(folder);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 pt-0 space-y-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {folder.name}
                  </CardTitle>
                  
                  {folder.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {folder.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                      {bookmarkCount} item{bookmarkCount !== 1 ? 's' : ''}
                    </Badge>
                    <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          {selectedBookmark && (
            <BookmarkForm
              bookmark={selectedBookmark}
              folders={folders}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedBookmark(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 