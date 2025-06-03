'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookmarkService, type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { FolderService } from '../../lib/services/folders';
import { TagService } from '../../lib/services/tags';
import type { Folder, Tag } from '../../types/supabase';
import { BookmarkList } from '../bookmarks/bookmark-list';
import { BookmarkForm } from '../bookmarks/bookmark-form';
import { FolderSidebar } from '../layout/folder-sidebar';
import { AdvancedSearchBar } from '../common/advanced-search-bar';
import { MassActions } from '../common/mass-actions';
import { BulkImportModal } from '../bulk-import-modal';
import type { SearchFilters } from '../../lib/services/search';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Upload, Grid, List } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardMainProps {
  userId: string;
}

export function DashboardMain({ userId }: DashboardMainProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [filters, setFilters] = useState({
    isArchived: false,
    isFavorite: false
  });

  const bookmarkService = new BookmarkService(userId);
  const folderService = new FolderService(userId);
  const tagService = new TagService(userId);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookmarksData, foldersData, tagsData] = await Promise.all([
        bookmarkService.getBookmarks(),
        folderService.getFolders(),
        tagService.getTags()
      ]);

      setBookmarks(bookmarksData);
      setFolders(foldersData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [bookmarkService, folderService, tagService]);

    const loadBookmarks = useCallback(async () => {
    try {
      let bookmarksData: BookmarkWithRelations[];
      
      if (searchTerm || Object.keys(searchFilters).length > 1) {
        // Use advanced search if we have search term or filters
        bookmarksData = await bookmarkService.searchBookmarks(searchTerm);
        
        // Apply additional filters from searchFilters
        if (searchFilters.folderId) {
          bookmarksData = bookmarksData.filter(b => b.folder_id === searchFilters.folderId);
        }
        if (searchFilters.tagIds && searchFilters.tagIds.length > 0) {
          bookmarksData = bookmarksData.filter(b => 
            b.tags?.some(tag => searchFilters.tagIds!.includes(tag.id))
          );
        }
        if (searchFilters.isFavorite !== undefined) {
          bookmarksData = bookmarksData.filter(b => b.is_favorite === searchFilters.isFavorite);
        }
        if (searchFilters.isArchived !== undefined) {
          bookmarksData = bookmarksData.filter(b => b.is_archived === searchFilters.isArchived);
        }
        if (searchFilters.hasDescription) {
          bookmarksData = bookmarksData.filter(b => b.description && b.description.trim().length > 0);
        }
      } else {
        bookmarksData = await bookmarkService.getBookmarks({
          folderId: selectedFolder || undefined,
          isArchived: filters.isArchived,
          isFavorite: filters.isFavorite
        });
      }

      // Filter by selected tags if any (from sidebar)
      if (selectedTags.length > 0) {
        bookmarksData = bookmarksData.filter(bookmark =>
          bookmark.tags?.some(tag => selectedTags.includes(tag.id))
        );
      }

      setBookmarks(bookmarksData);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      toast.error('Failed to load bookmarks');
    }
  }, [bookmarkService, selectedFolder, selectedTags, searchTerm, searchFilters, filters]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload bookmarks when filters change
  useEffect(() => {
    if (!loading) {
      loadBookmarks();
    }
  }, [loading, loadBookmarks]);

  const handleBookmarkCreated = (newBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => [newBookmark, ...prev]);
    setShowAddBookmark(false);
    toast.success('Bookmark created successfully');
  };

  const handleBookmarkUpdated = (updatedBookmark: BookmarkWithRelations) => {
    setBookmarks(prev => prev.map(b => 
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
    toast.success('Bookmark updated successfully');
  };

  const handleBookmarkDeleted = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    toast.success('Bookmark deleted successfully');
  };

  const handleBulkImport = async (bookmarks: { url: string; title?: string; description?: string; folderId?: string; tagIds?: string[]; favicon?: string; }[]) => {
    // Here we would normally use the BookmarkService to create the bookmarks
    // For now, let's just simulate the import
    try {
      for (const bookmark of bookmarks) {
        await bookmarkService.createBookmark({
          url: bookmark.url,
          title: bookmark.title || bookmark.url,
          description: bookmark.description || '',
          folder_id: bookmark.folderId || null,
          favicon_url: bookmark.favicon || null
        }, bookmark.tagIds || []);
      }
      await loadBookmarks();
      setShowBulkImport(false);
      toast.success(`Successfully imported ${bookmarks.length} bookmarks`);
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast.error('Failed to import bookmarks');
      throw error;
    }
  };

  const handleFolderCreated = (newFolder: Folder) => {
    setFolders(prev => [...prev, newFolder]);
  };

  const handleTagCreated = (newTag: Tag) => {
    setTags(prev => [...prev, newTag]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <FolderSidebar
          folders={folders}
          tags={tags}
          selectedFolder={selectedFolder}
          selectedTags={selectedTags}
          onFolderSelect={setSelectedFolder}
          onTagSelect={setSelectedTags}
          onFolderCreated={handleFolderCreated}
          onTagCreated={handleTagCreated}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <AdvancedSearchBar
                userId={userId}
                value={searchTerm}
                onChange={setSearchTerm}
                onFiltersChange={setSearchFilters}
                folders={folders}
                tags={tags}
                placeholder="Search bookmarks..."
              />
            </div>
            
            <div className="flex items-center space-x-3 ml-4">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                onClick={() => setShowBulkImport(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>

              <Dialog open={showAddBookmark} onOpenChange={setShowAddBookmark}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Bookmark</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Bookmark</DialogTitle>
                  </DialogHeader>
                  <BookmarkForm
                    folders={folders}
                    tags={tags}
                    onSubmit={handleBookmarkCreated}
                    onCancel={() => setShowAddBookmark(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Mass Actions */}
        {selectedBookmarkIds.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <MassActions
              userId={userId}
              bookmarks={bookmarks}
              selectedIds={selectedBookmarkIds}
              onSelectionChange={setSelectedBookmarkIds}
              onBookmarksUpdated={loadBookmarks}
              folders={folders}
              tags={tags}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6">
          <BookmarkList
            bookmarks={bookmarks}
            folders={folders}
            tags={tags}
            viewMode={viewMode}
            selectedIds={selectedBookmarkIds}
            onSelectionChange={setSelectedBookmarkIds}
            onBookmarkUpdated={handleBookmarkUpdated}
            onBookmarkDeleted={handleBookmarkDeleted}
          />
        </div>
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImport}
        folders={folders}
        tags={tags}
      />
    </div>
  );
} 