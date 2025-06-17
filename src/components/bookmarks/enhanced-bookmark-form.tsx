'use client';

import React, { useState } from 'react';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { type Folder, type Tag } from '../../types/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedBookmarkFormProps {
  bookmark?: BookmarkWithRelations;
  folders: Folder[];
  tags: Tag[];
  onSubmit: (bookmark: BookmarkWithRelations) => void;
  onCancel: () => void;
}

export function EnhancedBookmarkForm({ bookmark, folders, tags, onSubmit, onCancel }: EnhancedBookmarkFormProps) {
  const [formData, setFormData] = useState({
    title: bookmark?.title || '',
    url: bookmark?.url || '',
    description: bookmark?.description || '',
    folder_id: bookmark?.folder_id ? bookmark.folder_id : 'no-category',
    priority: (bookmark as any)?.priority || 'medium',
    notes: (bookmark as any)?.notes || '',
    selectedTags: bookmark?.tags?.map(t => t.name) || []
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const priorities = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !formData.selectedTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const fetchUrlMetadata = async (url: string) => {
    try {
      new URL(url);
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
        folder_id: formData.folder_id === 'no-category' ? null : formData.folder_id,
        favicon_url: metadata?.favicon_url || null,
        priority: formData.priority,
        notes: formData.notes.trim()
      };

      if (bookmark) {
        const updatedBookmark = { 
          ...bookmark, 
          ...bookmarkData,
          tags: formData.selectedTags.map(tagName => ({ 
            id: `tag-${tagName}`, 
            name: tagName, 
            color: null,
            user_id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        };
        onSubmit(updatedBookmark);
      } else {
        // Create new bookmark via API - this will generate a proper UUID
        try {
          console.log('📝 Creating bookmark via API:', bookmarkData);
          
          const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookmarkData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Bookmark creation failed:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`Failed to create bookmark: ${response.status} ${errorText}`);
          }

          const createdBookmark = await response.json();
          console.log('✅ Bookmark created successfully:', createdBookmark);
          
          // Add the selected tags to the created bookmark for display purposes
          const bookmarkWithTags = {
            ...createdBookmark,
            tags: formData.selectedTags.map(tagName => ({ 
              id: `tag-${tagName}`, 
              name: tagName, 
              color: null,
              user_id: createdBookmark.user_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          };
          
          onSubmit(bookmarkWithTags);
        } catch (apiError) {
          console.error('❌ Error creating bookmark via API:', apiError);
          throw apiError;
        }
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
    <div className="w-full">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Add a new website to your bookmark collection.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Website title"
                className="mt-1 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* URL */}
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
                className="mt-1 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the website"
                rows={3}
                className="mt-1 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                {folders.length === 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 mb-2">
                    No categories/folders available. Please create a folder first.
                  </div>
                )}
                <Select
                  value={formData.folder_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, folder_id: value }))}
                >
                  <SelectTrigger className="mt-1 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="no-category">No category</SelectItem>
                    {folders.map(folder => (
                      <SelectItem 
                        key={folder.id} 
                        value={folder.id}
                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
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
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-1 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {priorities.map(priority => (
                      <SelectItem 
                        key={priority.value} 
                        value={priority.value}
                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </Label>
              <div className="mt-1">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="tag1, tag2, tag3"
                  className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {formData.selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or comments"
                rows={4}
                className="mt-1 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6 py-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                {isLoading ? 'Adding...' : 'Add Bookmark'}
              </Button>
            </div>
          </form>
    </div>
  );
} 