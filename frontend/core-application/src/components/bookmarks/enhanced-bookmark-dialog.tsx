'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { EnhancedBookmarkForm } from './enhanced-bookmark-form';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';

interface EnhancedBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: BookmarkWithRelations;
  folders: Folder[];
  tags: Tag[];
  onSubmit: (bookmark: BookmarkWithRelations) => void;
}

export function EnhancedBookmarkDialog({ 
  open, 
  onOpenChange, 
  bookmark, 
  folders, 
  tags, 
  onSubmit 
}: EnhancedBookmarkDialogProps) {
  const handleSubmit = (bookmarkData: BookmarkWithRelations) => {
    onSubmit(bookmarkData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {bookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="p-6">
            <EnhancedBookmarkForm
              bookmark={bookmark}
              folders={folders}
              tags={tags}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 