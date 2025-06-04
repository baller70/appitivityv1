'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { FolderCard } from './folder-card';
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
}

export function FolderGridView({
  folders,
  bookmarks,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onAddBookmarkToFolder,
  onDropBookmarkToFolder,
}: FolderGridViewProps) {
  // Count bookmarks per folder
  const getBookmarkCount = (folderId: string) => {
    return bookmarks.filter(bookmark => bookmark.folder_id === folderId).length;
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FOLDERS</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your bookmarks into folders
          </p>
        </div>
        <Button onClick={onCreateFolder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Folder
        </Button>
      </div>

      {/* Folder Grid */}
      {folders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              bookmarkCount={getBookmarkCount(folder.id)}
              onEdit={onEditFolder}
              onDelete={onDeleteFolder}
              onAddBookmark={onAddBookmarkToFolder}
              onDrop={onDropBookmarkToFolder}
              onDragOver={handleDragOver}
            />
          ))}
        </div>
      ) : (
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
    </div>
  );
} 