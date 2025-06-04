'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookmarkWithRelations } from '../../lib/services/bookmarks';
import { useSelection } from '../../contexts/SelectionContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Bookmark,
  Heart,
  Eye,
  ExternalLink,
  Check,
  GripVertical
} from 'lucide-react';

interface BookmarkListViewProps {
  bookmarks: BookmarkWithRelations[];
  onOpenDetail: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onLoadData?: () => void;
}

export function BookmarkListView({ 
  bookmarks, 
  onOpenDetail, 
  onBookmarkDeleted: _onBookmarkDeleted,
  onLoadData
}: BookmarkListViewProps) {
  // Use the parameter to avoid unused variable error
  void _onBookmarkDeleted;
  const { isSelectionMode, isSelected, toggleItem } = useSelection();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, bookmarkId: string) => {
    setDraggedItem(bookmarkId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', bookmarkId);
  };

  const handleDragOver = (e: React.DragEvent, bookmarkId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(bookmarkId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetBookmarkId: string) => {
    e.preventDefault();
    const draggedBookmarkId = e.dataTransfer.getData('text/plain');
    
    if (draggedBookmarkId && draggedBookmarkId !== targetBookmarkId) {
      const draggedBookmark = bookmarks.find(b => b.id === draggedBookmarkId);
      const targetBookmark = bookmarks.find(b => b.id === targetBookmarkId);
      
      if (draggedBookmark && targetBookmark) {
        try {
          const response = await fetch('/api/bookmarks/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceId: draggedBookmarkId,
              targetId: targetBookmarkId,
              position: 'after'
            })
          });

          if (response.ok) {
            toast.success(`Moved "${draggedBookmark.title}" after "${targetBookmark.title}"`);
            onLoadData?.();
          } else {
            toast.error('Failed to reorder bookmarks');
          }
        } catch (error: unknown) {
          console.error('Failed to reorder bookmarks:', error);
          toast.error('Failed to reorder bookmarks');
        }
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleBookmarkClick = (bookmark: BookmarkWithRelations, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || isSelectionMode) {
      return;
    }
    
    onOpenDetail(bookmark);
  };

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          draggable={!isSelectionMode}
          onDragStart={(e) => handleDragStart(e, bookmark.id)}
          onDragOver={(e) => handleDragOver(e, bookmark.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, bookmark.id)}
          onClick={(e) => handleBookmarkClick(bookmark, e)}
          className={cn(
            "group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer",
            isSelected(bookmark.id) ? "ring-2 ring-blue-500 border-blue-500" : "",
            draggedItem === bookmark.id ? "opacity-50 scale-95" : "",
            dragOverItem === bookmark.id ? "ring-2 ring-green-500 border-green-500 scale-105" : ""
          )}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Drag Handle */}
              {!isSelectionMode && (
                <div className="flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </div>
              )}

              {/* Selection Checkbox */}
              {isSelectionMode && (
                <div className="flex-shrink-0 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(bookmark.id);
                    }}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                      isSelected(bookmark.id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                    )}
                  >
                    {isSelected(bookmark.id) && <Check className="w-3 h-3" />}
                  </button>
                </div>
              )}

              {/* Favicon */}
              <div className="flex-shrink-0">
                {bookmark.favicon_url ? (
                  <Image
                    src={bookmark.favicon_url}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Bookmark className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and URL */}
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {bookmark.title}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                        {bookmark.url}
                      </p>
                    </div>

                    {/* Description */}
                    {bookmark.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}

                    {/* Tags and Metadata */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {bookmark.folder && (
                        <span className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: bookmark.folder.color || '#6b7280' }}
                          />
                                                        {bookmark.folder.name.toUpperCase()}
                        </span>
                      )}
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="flex gap-1">
                          {bookmark.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {bookmark.tags.length > 3 && (
                            <span className="text-gray-400">+{bookmark.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      <span>{new Date(bookmark.created_at || Date.now()).toLocaleDateString()}</span>
                      {bookmark.visit_count && bookmark.visit_count > 0 && (
                        <span>{bookmark.visit_count} visits</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite toggle
                      }}
                      className="p-1.5 text-gray-400 hover:text-yellow-500 rounded transition-colors"
                    >
                      <Heart className={cn("w-4 h-4", bookmark.is_favorite && "text-red-500 fill-red-500")} />
                    </button>

                    {/* View Details Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(bookmark);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* External Link Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(bookmark.url, '_blank');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 