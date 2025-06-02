'use client';

import React, { useState } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';
import { BookmarkForm } from './bookmark-form';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Heart, Archive, ExternalLink, MoreHorizontal, Edit, Trash2, Folder as FolderIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface BookmarkCardProps {
  bookmark: BookmarkWithRelations;
  folders: Folder[];
  tags: Tag[];
  onUpdated: (bookmark: BookmarkWithRelations) => void;
  onDeleted: () => void;
}

export function BookmarkCard({ bookmark, folders, tags, onUpdated, onDeleted }: BookmarkCardProps) {
  const { user } = useUser();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const bookmarkService = user ? new BookmarkService(user.id) : null;

  const handleToggleFavorite = async () => {
    if (!bookmarkService) return;
    
    try {
      setLoading(true);
      const updated = await bookmarkService.toggleFavorite(bookmark.id);
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!bookmarkService) return;
    
    try {
      setLoading(true);
      const updated = await bookmarkService.toggleArchive(bookmark.id);
      onUpdated({ ...bookmark, ...updated });
      toast.success(updated.is_archived ? 'Archived bookmark' : 'Unarchived bookmark');
    } catch (error) {
      console.error('Failed to toggle archive:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookmarkService) return;
    
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      setLoading(true);
      await bookmarkService.deleteBookmark(bookmark.id);
      onDeleted();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      toast.error('Failed to delete bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (updatedBookmark: BookmarkWithRelations) => {
    onUpdated(updatedBookmark);
    setShowEdit(false);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {bookmark.favicon_url && (
                <img
                  src={bookmark.favicon_url}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {bookmark.title}
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleFavorite} disabled={loading}>
                  <Heart className={`h-4 w-4 mr-2 ${bookmark.is_favorite ? 'fill-current text-red-500' : ''}`} />
                  {bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleArchive} disabled={loading}>
                  <Archive className="h-4 w-4 mr-2" />
                  {bookmark.is_archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {bookmark.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {bookmark.description}
            </p>
          )}
          
          <div className="space-y-2">
            {bookmark.folder && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FolderIcon className="h-3 w-3 mr-1" />
                {bookmark.folder.name}
              </div>
            )}
            
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {bookmark.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{bookmark.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate flex-1 mr-2"
            >
              {new URL(bookmark.url).hostname}
            </a>
            <div className="flex items-center space-x-2">
              {bookmark.is_favorite && (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              )}
              {bookmark.is_archived && (
                <Archive className="h-4 w-4 text-gray-500" />
              )}
              <Button size="sm" variant="ghost" asChild>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          <BookmarkForm
            bookmark={bookmark}
            folders={folders}
            tags={tags}
            onSubmit={handleEdit}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 