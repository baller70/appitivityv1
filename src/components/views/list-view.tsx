'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ExternalLink, 
  Heart, 
  MoreVertical,
  Star,
  Globe, 
  Search,
  ArrowRight,
  Folder,
  GripVertical,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';

import { getDomainFromUrl, getFaviconUrl } from '../../lib/utils';

interface ListViewProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  loading?: boolean;
  onReorder?: (bookmarks: BookmarkWithRelations[]) => void;
}

interface FolderGroup {
  id: string;
  name: string;
  bookmarks: BookmarkWithRelations[];
  count: number;
}

interface SortableBookmarkItemProps {
  bookmark: BookmarkWithRelations;
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  isDragging?: boolean;
  index: number;
}

function SortableBookmarkItem({ bookmark, onBookmarkClick, onFavorite, isDragging, index }: SortableBookmarkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      if (diffDays <= 30) return `${Math.floor((diffDays - 1) / 7)} weeks ago`;
      if (diffDays <= 365) return `${Math.floor((diffDays - 1) / 30)} months ago`;
      return `${Math.floor((diffDays - 1) / 365)} years ago`;
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300 hover:shadow-lg cursor-pointer ${
        isDragging ? 'shadow-2xl scale-105 opacity-75 z-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div 
        className="p-6 pl-12 flex items-center justify-between"
        onClick={() => onBookmarkClick?.(bookmark)}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Enhanced Favicon with Glow Effect */}
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200/60 dark:border-gray-600/60 group-hover:shadow-lg transition-all duration-300">
            {getFaviconUrl(bookmark.url) ? (
              <div 
                className="w-8 h-8 object-contain rounded bg-cover bg-center"
                style={{ backgroundImage: `url(${getFaviconUrl(bookmark.url)})` }}
              />
            ) : (
              <Globe className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {bookmark.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mt-1">
                  {bookmark.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {getDomainFromUrl(bookmark.url)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(bookmark.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(bookmark);
            }}
            className={`rounded-full hover:scale-110 transition-all duration-200 ${
              bookmark.is_favorite 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Star 
              className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} 
            />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(bookmark.url, '_blank');
            }}
            className="rounded-full text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-400 hover:text-gray-600 hover:scale-110 transition-all duration-200"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ListView({ bookmarks, onBookmarkClick, onFavorite, loading, onReorder }: ListViewProps) {
  const router = useRouter();
  const [localBookmarks, setLocalBookmarks] = useState<BookmarkWithRelations[]>(bookmarks);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLocalBookmarks(bookmarks);
  }, [bookmarks]);

  // Group bookmarks by folder
  const folderGroups = useMemo<FolderGroup[]>(() => {
    // Filter bookmarks based on search term
    const filteredBookmarks = localBookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by folder
    const groups = new Map<string, BookmarkWithRelations[]>();
    
    filteredBookmarks.forEach(bookmark => {
      const folderName = bookmark.folder?.name || 'Uncategorized';
      if (!groups.has(folderName)) {
        groups.set(folderName, []);
      }
      groups.get(folderName)!.push(bookmark);
    });

    // Convert to FolderGroup format and sort
    return Array.from(groups.entries()).map(([name, bookmarks]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      bookmarks: bookmarks.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ),
      count: bookmarks.length
    }));
  }, [localBookmarks, searchTerm]);

  const handleFolderClick = (folderName: string) => {
    // Convert folder name to URL-safe slug
    const slug = folderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Navigate to the category page for this folder
    router.push(`/category/${slug}`);
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeBookmark = localBookmarks.find(b => b.id === active.id);
      const overBookmark = localBookmarks.find(b => b.id === over.id);
      
      if (activeBookmark && overBookmark) {
        // Only allow reordering within the same folder
        if (activeBookmark.folder?.id === overBookmark.folder?.id) {
          const oldIndex = localBookmarks.findIndex(b => b.id === active.id);
          const newIndex = localBookmarks.findIndex(b => b.id === over.id);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            const newBookmarks = arrayMove(localBookmarks, oldIndex, newIndex);
            setLocalBookmarks(newBookmarks);
            onReorder?.(newBookmarks);
          }
        }
      }
    }
    
    setActiveId(null);
  };

  const totalBookmarks = localBookmarks.length;
  const favoriteBookmarks = localBookmarks.filter(b => b.is_favorite).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with uniform pattern */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              LIST VIEW - ALL BOOKMARKS
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Click folder names to explore • Use arrows to expand/collapse content
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats Overview */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{totalBookmarks}</span> bookmarks
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{favoriteBookmarks}</span> favorites
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{folderGroups.length}</span> folders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Groups with Dropdown */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {folderGroups.map((folder, folderIndex) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: folderIndex * 0.1 }}
              className="space-y-4"
            >
              {/* Folder Header with separate click areas */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl border border-blue-200/30 dark:border-blue-700/30 hover:from-blue-500/15 hover:to-purple-500/15 transition-all duration-300 hover:shadow-lg group">
                
                {/* Clickable folder name area for navigation */}
                <div 
                  className="flex items-center space-x-4 flex-1 cursor-pointer"
                  onClick={() => handleFolderClick(folder.name)}
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Folder className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {folder.name.toUpperCase()}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {folder.count} bookmark{folder.count !== 1 ? 's' : ''} • Click to explore
                    </p>
                  </div>
                </div>

                {/* Controls area */}
                <div className="flex items-center space-x-3">
                  <Badge className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-semibold">
                    {folder.count}
                  </Badge>
                  
                  {/* Separate expand/collapse button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolderExpansion(folder.id);
                    }}
                    className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </Button>
                  
                  {/* Navigate icon */}
                  <ArrowRight className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </div>
              </div>

              {/* Expandable Bookmarks Section */}
              <AnimatePresence>
                {expandedFolders.has(folder.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden pl-4"
                  >
                    <SortableContext items={folder.bookmarks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {folder.bookmarks.map((bookmark, index) => (
                          <SortableBookmarkItem
                            key={bookmark.id}
                            bookmark={bookmark}
                            onBookmarkClick={onBookmarkClick}
                            onFavorite={onFavorite}
                            isDragging={activeId === bookmark.id}
                            index={index}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 opacity-90">
              <p className="font-medium text-gray-900 dark:text-white">
                {localBookmarks.find(b => b.id === activeId)?.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {folderGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Folder className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No bookmarks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchTerm ? `No bookmarks match "${searchTerm}"` : 'Start by adding some bookmarks to organize them in folders.'}
          </p>
        </motion.div>
      )}
    </div>
  );
} 