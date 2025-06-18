'use client';

import React, { useState } from 'react';
import { type Folder, type Tag } from '../../types/supabase';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { 
  Folder as FolderIcon, 
  Plus, 
  Heart, 
  Archive, 
  Home
} from 'lucide-react';

interface FolderSidebarProps {
  folders: Folder[];
  tags: Tag[];
  selectedFolder: string | null;
  selectedTags: string[];
  onFolderSelect: (folderId: string | null) => void;
  onTagSelect: (tagIds: string[]) => void;
  onFolderCreated: (folder: Folder) => void;
  onTagCreated: (tag: Tag) => void;
  filters: {
    isArchived: boolean;
    isFavorite: boolean;
  };
  onFiltersChange: (filters: { isArchived: boolean; isFavorite: boolean }) => void;
}

export function FolderSidebar({
  folders,
  tags,
  selectedFolder,
  selectedTags,
  onFolderSelect,
  onTagSelect,
  onFolderCreated,
  onTagCreated,
  filters,
  onFiltersChange
}: FolderSidebarProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      // Call the API to create a new folder
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          description: null,
          color: null,
          parent_id: null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create folder');
      }

      const newFolder = await response.json();
      
      onFolderCreated(newFolder);
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      // Call the API to create a new tag
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: '#3B82F6' // Default blue color
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }

      const newTag = await response.json();
      
      onTagCreated(newTag);
      setNewTagName('');
      setShowCreateTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagSelect(selectedTags.filter(id => id !== tagId));
    } else {
      onTagSelect([...selectedTags, tagId]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">NAVIGATION</h2>
        
        {/* Quick Filters */}
        <div className="space-y-2">
          <Button
            variant={!selectedFolder && !filters.isArchived && !filters.isFavorite ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              onFolderSelect(null);
              onFiltersChange({ isArchived: false, isFavorite: false });
            }}
          >
            <Home className="h-4 w-4 mr-2" />
            All Bookmarks
          </Button>
          
          <Button
            variant={filters.isFavorite ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              onFolderSelect(null);
              onFiltersChange({ ...filters, isFavorite: !filters.isFavorite });
            }}
          >
            <Heart className={`h-4 w-4 mr-2 ${filters.isFavorite ? 'fill-current' : ''}`} />
            Favorites
          </Button>
          
          <Button
            variant={filters.isArchived ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              onFolderSelect(null);
              onFiltersChange({ ...filters, isArchived: !filters.isArchived });
            }}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archived
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Folders Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">FOLDERS</h3>
            <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-1">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onFolderSelect(folder.id)}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                <span className="truncate">{folder.name.toUpperCase()}</span>
              </Button>
            ))}
            
            {folders.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No folders yet
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Tags Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">TAGS</h3>
            <Dialog open={showCreateTag} onOpenChange={setShowCreateTag}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag-name">Tag Name</Label>
                    <Input
                      id="tag-name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateTag(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTag}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-2">
            {selectedTags.length > 0 && (
              <div className="mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTagSelect([])}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            
            {tags.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No tags yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>📁 {folders.length} folders</div>
          <div>🏷️ {tags.length} tags</div>
          {selectedTags.length > 0 && (
            <div>🔍 {selectedTags.length} tag filter{selectedTags.length !== 1 ? 's' : ''} active</div>
          )}
        </div>
      </div>
    </div>
  );
} 