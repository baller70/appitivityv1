'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface BookmarkFormProps {
  bookmark?: BookmarkWithRelations;
  folders: Folder[];
  tags: Tag[];
  onSubmit: (bookmark: BookmarkWithRelations) => void;
  onCancel: () => void;
}

export function BookmarkForm({ bookmark, folders, tags, onSubmit, onCancel }: BookmarkFormProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: bookmark?.title || '',
    url: bookmark?.url || '',
    description: bookmark?.description || '',
    category: bookmark?.folder_id || '',
    priority: '', // Not storing in DB yet, just for form UX
    tags: bookmark?.tags?.map(tag => tag.name).join(', ') || '',
    notes: '', // Not storing in DB yet, just for form UX
  });

  const bookmarkService = user ? new BookmarkService(user.id) : null;

  // Auto-fetch title from URL when URL changes
  useEffect(() => {
    if (formData.url && !formData.title && !bookmark) {
      fetchUrlMetadata(formData.url);
    }
  }, [formData.url, formData.title, bookmark]);

  const fetchUrlMetadata = async (url: string) => {
    try {
      const response = await fetch(`/api/url-metadata?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const metadata = await response.json();
        if (metadata.title) {
          setFormData(prev => ({ ...prev, title: metadata.title }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch URL metadata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookmarkService) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      setLoading(true);

      // Parse tags from comma-separated string
      const tagNames = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Find existing tags and create list of tag IDs
      const tagIds = tagNames
        .map(tagName => tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())?.id)
        .filter(Boolean) as string[];

      let result: BookmarkWithRelations;

      if (bookmark) {
        // Update existing bookmark
        const updated = await bookmarkService.updateBookmark(bookmark.id, {
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || null,
          folder_id: formData.category || null,
        });

        // Update tags
        const currentTagIds = bookmark.tags?.map(tag => tag.id) || [];
        const tagsToRemove = currentTagIds.filter(id => !tagIds.includes(id));
        const tagsToAdd = tagIds.filter(id => !currentTagIds.includes(id));

        if (tagsToRemove.length > 0) {
          await bookmarkService.removeTagsFromBookmark(bookmark.id, tagsToRemove);
        }
        if (tagsToAdd.length > 0) {
          await bookmarkService.addTagsToBookmark(bookmark.id, tagsToAdd);
        }

        // Fetch the updated bookmark with relations
        result = await bookmarkService.getBookmark(bookmark.id) || updated as BookmarkWithRelations;
      } else {
        // Create new bookmark via API to bypass RLS issues
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            url: formData.url.trim(),
            description: formData.description.trim() || null,
            folder_id: formData.category || null,
            tagIds: tagIds
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create bookmark');
        }

        const created = await response.json();
        
        // Convert to BookmarkWithRelations format
        result = {
          ...created,
          folder: folders.find(f => f.id === created.folder_id) || null,
          tags: tagIds.map(id => tags.find(t => t.id === id)).filter(Boolean) as any[]
        };
      }

      onSubmit(result);
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save bookmark: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
      {/* Header - Exact from Reference */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Add New Bookmark
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a new website to your bookmark collection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title - Exact from Reference */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Website title"
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* URL - Exact from Reference */}
        <div>
          <Label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            URL
          </Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com"
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Description - Exact from Reference */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the website"
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>

        {/* Category and Priority Row - Exact from Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </Label>
            <Select value={formData.category || undefined} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </Label>
            <Select value={formData.priority || undefined} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags - Exact from Reference */}
        <div>
          <Label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="tag1, tag2, tag3"
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Notes - Exact from Reference */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes or comments"
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>

        {/* Buttons - Exact from Reference */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
          >
            {loading ? 'Saving...' : 'Add Bookmark'}
          </Button>
        </div>
      </form>
    </div>
  );
} 