'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  X, 
  Loader, 
  Link, 
  Globe,
  Tag,
  Folder,
  Save,
  ExternalLink 
} from 'lucide-react';
import { BookmarkWithRelations } from '../../lib/services/bookmarks';
import { toast } from 'sonner';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookmarkAdded: (bookmark: any) => void;
  targetBookmark?: BookmarkWithRelations;
  folders: Array<{ id: string; name: string; color?: string }>;
  existingTags: string[];
}

export function AddBookmarkModal({
  isOpen,
  onClose,
  onBookmarkAdded,
  targetBookmark,
  folders = [],
  existingTags = []
}: AddBookmarkModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    folder_id: '',
    tags: [] as string[],
    is_favorite: false
  });
  const [newTag, setNewTag] = useState('');
  const [urlError, setUrlError] = useState('');

  // Pre-populate form based on target bookmark context
  useEffect(() => {
    if (!targetBookmark) return;

    // Suggest tags from the target bookmark
    const suggestedTags = targetBookmark.tags?.map(tag => tag.name) || [];
    
    setFormData(prev => ({
      ...prev,
      folder_id: targetBookmark.folder?.id || '',
      tags: suggestedTags.slice(0, 2) // Pre-select up to 2 tags for relation
    }));
  }, [targetBookmark]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setFormData(prev => ({ ...prev, url: value }));
    
    if (value && !validateUrl(value)) {
      setUrlError('Please enter a valid URL (including https://)');
    } else {
      setUrlError('');
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    const tagName = newTag.trim().toLowerCase();
    if (!formData.tags.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    if (!validateUrl(formData.url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically call your bookmark creation API
      const newBookmark = {
        id: Date.now().toString(), // Temporary ID - replace with actual API response
        ...formData,
        favicon_url: `https://www.google.com/s2/favicons?domain=${new URL(formData.url).hostname}&sz=32`,
        visit_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onBookmarkAdded(newBookmark);
      toast.success('Bookmark added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        url: '',
        description: '',
        folder_id: '',
        tags: [],
        is_favorite: false
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error('Failed to add bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  // Auto-fetch title from URL (basic implementation)
  const fetchTitleFromUrl = async (url: string) => {
    if (!validateUrl(url) || formData.title.trim()) return;
    
    try {
      // In a real implementation, you'd call your backend to fetch page title
      // For now, just extract domain name as fallback
      const domain = new URL(url).hostname.replace('www.', '');
      setFormData(prev => ({
        ...prev,
        title: domain.charAt(0).toUpperCase() + domain.slice(1)
      }));
    } catch (error) {
      console.error('Error fetching title:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Related Bookmark</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Field */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>URL *</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={() => fetchTitleFromUrl(formData.url)}
                className={urlError ? 'border-red-500' : ''}
                required
              />
              {formData.url && validateUrl(formData.url) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(formData.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            {urlError && (
              <p className="text-sm text-red-600">{urlError}</p>
            )}
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center space-x-1">
              <Link className="h-4 w-4" />
              <span>Title *</span>
            </Label>
            <Input
              id="title"
              placeholder="Bookmark title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Folder className="h-4 w-4" />
              <span>Folder</span>
            </Label>
            <Select
              value={formData.folder_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, folder_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center space-x-2">
                      {folder.color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: folder.color }}
                        />
                      )}
                      <span>{folder.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </Label>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Tag Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag and press Enter"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                list="existing-tags"
              />
              <datalist id="existing-tags">
                {existingTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Context Info */}
          {targetBookmark && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Creating related to:</span> {targetBookmark.title}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !!urlError}>
              {isLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 