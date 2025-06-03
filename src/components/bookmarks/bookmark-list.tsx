'use client';

import React from 'react';
import { BookmarkCard } from './bookmark-card';
import { BookmarkListItem } from './bookmark-list-item';
import { BookmarkCheckbox } from '../common/mass-actions';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';

interface BookmarkListProps {
  bookmarks: BookmarkWithRelations[];
  folders: Folder[];
  tags: Tag[];
  viewMode: 'grid' | 'list';
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
}

export function BookmarkList({
  bookmarks,
  folders,
  tags,
  viewMode,
  selectedIds = [],
  onSelectionChange,
  onBookmarkUpdated,
  onBookmarkDeleted
}: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No bookmarks found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start by adding your first bookmark or try adjusting your filters.
        </p>
      </div>
    );
  }

  const toggleSelection = (bookmarkId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedIds.includes(bookmarkId)) {
      onSelectionChange(selectedIds.filter(id => id !== bookmarkId));
    } else {
      onSelectionChange([...selectedIds, bookmarkId]);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="relative">
            {onSelectionChange && (
              <div className="absolute top-2 left-2 z-10">
                <BookmarkCheckbox
                  bookmarkId={bookmark.id}
                  isSelected={selectedIds.includes(bookmark.id)}
                  onToggle={toggleSelection}
                />
              </div>
            )}
            <BookmarkCard
              bookmark={bookmark}
              folders={folders}
              tags={tags}
              onUpdated={onBookmarkUpdated}
              onDeleted={() => onBookmarkDeleted(bookmark.id)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="flex items-center space-x-3">
          {onSelectionChange && (
            <BookmarkCheckbox
              bookmarkId={bookmark.id}
              isSelected={selectedIds.includes(bookmark.id)}
              onToggle={toggleSelection}
            />
          )}
          <div className="flex-1">
            <BookmarkListItem
              bookmark={bookmark}
              folders={folders}
              tags={tags}
              onUpdated={onBookmarkUpdated}
              onDeleted={() => onBookmarkDeleted(bookmark.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 