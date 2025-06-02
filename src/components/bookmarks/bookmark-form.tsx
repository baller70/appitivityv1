'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
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
    folder_id: bookmark?.folder_id || '',
    is_favorite: bookmark?.is_favorite || false,
    is_archived: bookmark?.is_archived || false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(
    bookmark?.tags?.map(tag => tag.id) || []
  );
  const [newTagName, setNewTagName] = useState('');

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

      let result: BookmarkWithRelations;

      if (bookmark) {
        // Update existing bookmark
        const updated = await bookmarkService.updateBookmark(bookmark.id, {
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || null,
          folder_id: formData.folder_id || null,
          is_favorite: formData.is_favorite,
          is_archived: formData.is_archived,
        });

        // Update tags
        const currentTagIds = bookmark.tags?.map(tag => tag.id) || [];
        const tagsToRemove = currentTagIds.filter(id => !selectedTags.includes(id));
        const tagsToAdd = selectedTags.filter(id => !currentTagIds.includes(id));

        if (tagsToRemove.length > 0) {
          await bookmarkService.removeTagsFromBookmark(bookmark.id, tagsToRemove);
        }
        if (tagsToAdd.length > 0) {
          await bookmarkService.addTagsToBookmark(bookmark.id, tagsToAdd);
        }

        // Fetch the updated bookmark with relations
        result = await bookmarkService.getBookmark(bookmark.id) || updated as BookmarkWithRelations;
      } else {
        // Create new bookmark
        const created = await bookmarkService.createBookmark({
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || null,
          folder_id: formData.folder_id || null,
          is_favorite: formData.is_favorite,
          is_archived: formData.is_archived,
        }, selectedTags);

        // Fetch the created bookmark with relations
        result = await bookmarkService.getBookmark(created.id) || created as BookmarkWithRelations;
      }

      onSubmit(result);
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      toast.error('Failed to save bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    
    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        setSelectedTags(prev => [...prev, existingTag.id]);
      }
    } else {
      // Create new tag (this would need to be implemented)
      toast.info('Creating new tags is not yet implemented');
    }
    
    setNewTagName('');
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Bookmark title"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="folder">Folder</Label>
          <Select value={formData.folder_id} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, folder_id: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No folder</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_favorite}
                onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Favorite</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_archived}
                onChange={(e) => setFormData(prev => ({ ...prev, is_archived: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Archived</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {selectedTagObjects.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Add tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {tags
              .filter(tag => !selectedTags.includes(tag.id))
              .slice(0, 10)
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setSelectedTags(prev => [...prev, tag.id])}
                >
                  {tag.name}
                </Badge>
              ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (bookmark ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
} 