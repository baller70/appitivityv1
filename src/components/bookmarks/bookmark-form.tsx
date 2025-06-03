'use client';

import React, { useState } from 'react';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder } from '../../types/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface BookmarkFormProps {
  bookmark?: BookmarkWithRelations;
  folders: Folder[];
  onSubmit: (bookmark: BookmarkWithRelations) => void;
  onCancel: () => void;
}

export function BookmarkForm({ bookmark, folders, onSubmit, onCancel }: BookmarkFormProps) {
  const [formData, setFormData] = useState({
    title: bookmark?.title || '',
    url: bookmark?.url || '',
    description: bookmark?.description || '',
    folder_id: bookmark?.folder_id || '',
    tag_ids: bookmark?.tag_ids || []
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUrlMetadata = async (url: string) => {
    try {
      // Simple URL validation
      new URL(url);
      // In a real app, you would fetch metadata from the URL
      return {
        title: url,
        description: '',
        favicon_url: ''
      };
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.url) {
        toast.error('URL is required');
        return;
      }

      let metadata = null;
      if (!bookmark) {
        metadata = await fetchUrlMetadata(formData.url);
      }

      const bookmarkData = {
        title: formData.title.trim() || metadata?.title || formData.url,
        url: formData.url,
        description: formData.description.trim(),
        folder_id: formData.folder_id || null,
        tag_ids: formData.tag_ids,
        favicon_url: metadata?.favicon_url || null
      };

      if (bookmark) {
        // Update existing bookmark
        const updatedBookmark = { ...bookmark, ...bookmarkData };
        onSubmit(updatedBookmark);
      } else {
        // Create new bookmark
        const newBookmark = {
          id: Date.now().toString(), // Temporary ID
          ...bookmarkData,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_visited_at: null,
          visit_count: 0,
          is_favorited: false,
          is_archived: false,
          folder: null,
          tags: []
        } as BookmarkWithRelations;
        onSubmit(newBookmark);
      }

      toast.success(bookmark ? 'Bookmark updated' : 'Bookmark created');
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Failed to save bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData(prev => ({ ...prev, url: e.target.value }))
          }
          placeholder="https://example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          placeholder="Bookmark title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="folder">Folder</Label>
        <Select
          value={formData.folder_id}
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, folder_id: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No folder</SelectItem>
            {folders.map(folder => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : bookmark ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
} 