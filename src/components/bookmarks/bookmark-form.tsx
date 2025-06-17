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
import * as Sentry from '@sentry/nextjs';

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
    folder_id: bookmark?.folder_id || 'no-folder',
    reminder_at: bookmark?.reminder_at ? bookmark.reminder_at.split('T')[0] : ''
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

  const createBookmarkViaAPI = async (bookmarkData: any): Promise<BookmarkWithRelations> => {
    console.log('📝 Creating bookmark via API:', bookmarkData);
    console.log('🔍 Request details:', {
      url: '/api/bookmarks',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookmarkData, null, 2)
    });
    
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmarkData)
      });

      console.log('📡 Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = await response.text();
        }
        
        console.error('❌ Bookmark creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails,
          url: response.url
        });
        
        Sentry.captureMessage('Bookmark creation failed', {
          level: 'error',
          tags: { operation: 'bookmark_creation' },
          extra: { bookmarkData, error: errorDetails, status: response.status }
        });
        
        throw new Error(`Failed to create bookmark: ${response.status} - ${JSON.stringify(errorDetails)}`);
      }

      const result = await response.json();
      console.log('✅ Bookmark created successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error creating bookmark:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        bookmarkData
      });
      Sentry.captureException(error, {
        tags: { operation: 'bookmark_creation' },
        extra: { bookmarkData }
      });
      throw error;
    }
  };

  const updateBookmarkViaAPI = async (bookmarkId: string, bookmarkData: any): Promise<BookmarkWithRelations> => {
    console.log('📝 Updating bookmark via API:', { bookmarkId, bookmarkData });
    
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmarkData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Bookmark update failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new Error(`Failed to update bookmark: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Bookmark updated successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error updating bookmark:', error);
      throw error;
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
        folder_id: formData.folder_id && formData.folder_id !== 'no-folder' ? formData.folder_id : null,
        favicon_url: metadata?.favicon_url || null,
        reminder_at: formData.reminder_at ? new Date(formData.reminder_at).toISOString() : null
      };

      let resultBookmark: BookmarkWithRelations;

      if (bookmark) {
        // Update existing bookmark via API
        resultBookmark = await updateBookmarkViaAPI(bookmark.id, bookmarkData);
        toast.success('Bookmark updated');
      } else {
        // Create new bookmark via API - this will generate a proper UUID
        resultBookmark = await createBookmarkViaAPI(bookmarkData);
        toast.success('Bookmark created');
      }

      // Call the parent's onSubmit with the actual bookmark from the API
      onSubmit(resultBookmark);

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
            <SelectItem value="no-folder">No folder</SelectItem>
            {folders.map(folder => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reminder_at">Reminder</Label>
        <Input
          id="reminder_at"
          type="date"
          value={formData.reminder_at}
          onChange={e => setFormData(prev => ({ ...prev, reminder_at: e.target.value }))}
        />
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