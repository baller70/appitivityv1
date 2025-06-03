'use client';

import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder as FolderType, Tag } from '../../types/supabase';

interface BookmarkDetailModalProps {
  bookmark: BookmarkWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (bookmark: BookmarkWithRelations) => void;
  folders?: FolderType[];
  tags?: Tag[];
}

export function BookmarkDetailModal({ 
  bookmark
}: BookmarkDetailModalProps) {
  if (!bookmark) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">{bookmark.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{bookmark.description || 'No description available'}</p>
        <div className="flex justify-between items-center">
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Visit Link
          </a>
          <span className="text-sm text-gray-500">
            {bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : 'No date'}
          </span>
        </div>
      </div>
    </div>
  );
}