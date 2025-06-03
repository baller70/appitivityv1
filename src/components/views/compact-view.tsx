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
  MoreHorizontal
} from 'lucide-react';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { BookmarkForm } from '../bookmarks/bookmark-form';
import { toast } from 'sonner';
import Image from 'next/image';

interface CompactViewProps {
  bookmarks: BookmarkWithRelations[];
  folders: Folder[];
  tags: Tag[];
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
}

export function CompactView({ 
  bookmarks, 
  folders, 
  tags, 
  onBookmarkUpdated, 
  onBookmarkDeleted 
}: CompactViewProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No bookmarks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid layout for compact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="group hover:shadow-md transition-shadow duration-200">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {bookmark.favicon_url ? (
                    <Image
                      src={bookmark.favicon_url}
                      alt=""
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm flex-shrink-0"></div>
                  )}
                  <CardTitle className="text-sm font-medium truncate">
                    {bookmark.title}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(bookmark);
                    }}
                  >
                    <Heart 
                      className={`h-3 w-3 ${bookmark.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                    />
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {/* Description */}
                {bookmark.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                
                {/* URL */}
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {bookmark.url}
                </p>

                {/* Tags */}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs px-1 py-0">
                        {tag.name}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        +{bookmark.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Folder */}
                {bookmark.folder && (
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {bookmark.folder.name}
                    </Badge>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(bookmark.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleEdit(bookmark)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(bookmark.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold text-blue-600">{bookmarks.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold text-green-600">
              {bookmarks.filter(b => b.is_favorite).length}
            </div>
            <div className="text-xs text-gray-600">Favorites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold text-purple-600">
              {bookmarks.filter(b => b.folder).length}
            </div>
            <div className="text-xs text-gray-600">Organized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold text-orange-600">
              {bookmarks.filter(b => b.tags && b.tags.length > 0).length}
            </div>
            <div className="text-xs text-gray-600">Tagged</div>
          </CardContent>
        </Card>
      </div>

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
              tags={tags}
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