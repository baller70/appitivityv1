'use client';

import React from 'react';
import { Plus, ChevronRight, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { FolderCard } from './folder-card';
import { BookmarkCard } from '../bookmarks/bookmark-card';
import { type Folder } from '../../types/supabase';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';

interface FolderGridViewProps {
  folders: Folder[];
  bookmarks: BookmarkWithRelations[];
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddBookmarkToFolder: (folderId: string) => void;
  onDropBookmarkToFolder: (folderId: string, bookmark: BookmarkWithRelations) => void;
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onOpenDetail: (bookmark: BookmarkWithRelations) => void;
  currentFolderId?: string | null;
  onFolderNavigate: (folderId: string | null) => void;
}

export function FolderGridView({
  folders,
  bookmarks,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onAddBookmarkToFolder,
  onDropBookmarkToFolder,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
  currentFolderId,
  onFolderNavigate,
}: FolderGridViewProps) {
  // Get current folder data
  const currentFolder = currentFolderId ? folders.find(f => f.id === currentFolderId) : null;
  
  // Get relevant data based on current navigation
  const relevantFolders = currentFolderId 
    ? folders.filter(folder => folder.parent_id === currentFolderId)
    : folders.filter(folder => !folder.parent_id); // Root level folders
    
  const relevantBookmarks = currentFolderId
    ? bookmarks.filter(bookmark => bookmark.folder_id === currentFolderId)
    : []; // Don't show bookmarks at root level

  // Count bookmarks per folder (including nested folders)
  const getBookmarkCount = (folderId: string): number => {
    const directBookmarks = bookmarks.filter(bookmark => bookmark.folder_id === folderId).length;
    const subfolders = folders.filter(folder => folder.parent_id === folderId);
    const nestedBookmarks: number = subfolders.reduce((count: number, subfolder) => {
      return count + getBookmarkCount(subfolder.id);
    }, 0);
    return directBookmarks + nestedBookmarks;
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Handle folder click navigation
  const handleFolderClick = (folderId: string) => {
    onFolderNavigate(folderId);
  };

  // Breadcrumb navigation
  const getBreadcrumbs = () => {
    if (!currentFolderId) return [];
    
    const breadcrumbs: Folder[] = [];
    let folder = folders.find(f => f.id === currentFolderId);
    
    while (folder) {
      breadcrumbs.unshift(folder);
      folder = folder.parent_id ? folders.find(f => f.id === folder!.parent_id) : undefined;
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {currentFolderId && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => onFolderNavigate(null)}
            className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <Home className="h-4 w-4 mr-1" />
            All Folders
          </button>
          {breadcrumbs.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-4 w-4" />
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {folder.name.toUpperCase()}
                </span>
              ) : (
                <button
                  onClick={() => onFolderNavigate(folder.id)}
                  className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {folder.name.toUpperCase()}
                </button>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentFolder ? currentFolder.name.toUpperCase() : 'FOLDERS'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentFolder 
              ? currentFolder.description || `Contents of ${currentFolder.name} folder`
              : 'Organize your bookmarks into folders'
            }
          </p>
        </div>
        <Button onClick={onCreateFolder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Folder
        </Button>
      </div>

      {/* Subfolders */}
      {relevantFolders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentFolder ? 'SUBFOLDERS' : 'FOLDERS'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {relevantFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                bookmarkCount={getBookmarkCount(folder.id)}
                onEdit={onEditFolder}
                onDelete={onDeleteFolder}
                onAddBookmark={onAddBookmarkToFolder}
                onDrop={onDropBookmarkToFolder}
                onDragOver={handleDragOver}
                onClick={() => handleFolderClick(folder.id)}
                disableLink={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks in Current Folder */}
      {relevantBookmarks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            BOOKMARKS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantBookmarks.map((bookmark) => {
              // Calculate total visits for percentage calculation
              const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
              
              return (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onUpdated={onBookmarkUpdated}
                  onDeleted={() => onBookmarkDeleted(bookmark.id)}
                  onOpenDetail={() => onOpenDetail(bookmark)}
                  folders={folders}
                  totalBookmarkVisits={totalVisits}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty States */}
      {!currentFolderId && relevantFolders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            NO FOLDERS YET
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first folder to organize your bookmarks by category or project.
          </p>
          <Button onClick={onCreateFolder} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Folder
          </Button>
        </div>
      )}

      {currentFolderId && relevantFolders.length === 0 && relevantBookmarks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            FOLDER IS EMPTY
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            This folder doesn't contain any bookmarks or subfolders yet.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onCreateFolder} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Subfolder
            </Button>
            <Button onClick={() => onAddBookmarkToFolder(currentFolderId)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Bookmark
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 