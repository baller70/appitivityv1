'use client';

import React from 'react';
import { BookmarkCard } from './bookmark-card';
import { BookmarkListItem } from './bookmark-list-item';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';

interface BookmarkListProps {
  bookmarks: BookmarkWithRelations[];
  folders: Folder[];
  tags: Tag[];
  viewMode: 'grid' | 'list';
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
}

export function BookmarkList({
  bookmarks,
  folders,
  tags,
  viewMode,
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

  if (viewMode === 'grid') {
    // Calculate total visits for percentage calculation
    const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            folders={folders}
            onUpdated={onBookmarkUpdated}
            onDeleted={() => onBookmarkDeleted(bookmark.id)}
            totalBookmarkVisits={totalVisits}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <BookmarkListItem
          key={bookmark.id}
          bookmark={bookmark}
          folders={folders}
          tags={tags}
          onUpdated={onBookmarkUpdated}
          onDeleted={() => onBookmarkDeleted(bookmark.id)}
        />
      ))}
    </div>
  );
} 