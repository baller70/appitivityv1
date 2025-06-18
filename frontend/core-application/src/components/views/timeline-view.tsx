'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Timeline } from '../ui/timeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, 
  Heart, 
  Clock, 
  Globe, 
  Search,
  Folder as FolderIcon,
  ArrowLeft,
  Plus,
  X,
  Edit3,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  Calendar,
  BookOpen,
  TrendingUp,
  Archive,
  Lightbulb,
  Timer,
  Flag,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { BookmarkDetailModal } from '../bookmarks/bookmark-detail-modal';

interface TimelineViewProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  loading?: boolean;
  selectedCategory?: string;
  selectedFolder?: Folder;
  onCategoryChange?: (category: string) => void;
}

interface TimelineSegment {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  iconName: string;
  bookmarkIds: string[];
  order: number;
}

interface CreateSegmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSegment: (segment: Omit<TimelineSegment, 'id' | 'bookmarkIds' | 'order'>) => void;
}

interface BookmarkAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkWithRelations[];
  segments: TimelineSegment[];
  onAssignBookmark: (bookmarkId: string, segmentId: string) => void;
  onRemoveBookmark: (bookmarkId: string, segmentId: string) => void;
}

interface CompactBookmarkCardProps {
  bookmark: BookmarkWithRelations;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  onClick?: (bookmark: BookmarkWithRelations) => void;
  index: number;
}

const segmentIcons = [
  { icon: Lightbulb, name: 'Ideas' },
  { icon: BookOpen, name: 'Learning' },
  { icon: Timer, name: 'Current' },
  { icon: TrendingUp, name: 'Progress' },
  { icon: Flag, name: 'Goals' },
  { icon: Target, name: 'Priority' },
  { icon: CheckCircle, name: 'Completed' },
  { icon: Archive, name: 'Archive' },
  { icon: Clock, name: 'Later' },
  { icon: Calendar, name: 'Scheduled' }
];

const segmentColors = [
  { value: 'blue', class: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10', name: 'Blue' },
  { value: 'green', class: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10', name: 'Green' },
  { value: 'purple', class: 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/10', name: 'Purple' },
  { value: 'orange', class: 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10', name: 'Orange' },
  { value: 'pink', class: 'border-pink-200 bg-pink-50/50 dark:border-pink-800 dark:bg-pink-900/10', name: 'Pink' },
  { value: 'yellow', class: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10', name: 'Yellow' },
  { value: 'indigo', class: 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/10', name: 'Indigo' },
  { value: 'teal', class: 'border-teal-200 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-900/10', name: 'Teal' }
];

// Compact bookmark card component
function CompactBookmarkCard({ bookmark, onFavorite, onClick, index }: CompactBookmarkCardProps) {
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  const getFaviconUrl = (url: string) => {
    const domain = getDomainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
      className="group"
    >
      <div 
        onClick={() => onClick?.(bookmark)}
        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
      >
        {/* Favicon */}
        <div className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md flex-shrink-0 border border-gray-200 dark:border-gray-600">
          <img 
            src={getFaviconUrl(bookmark.url)} 
            alt=""
            className="w-4 h-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Globe className="w-3 h-3 text-gray-500 hidden" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate pr-2 leading-tight">
              {bookmark.title.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ')}
            </h4>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.(bookmark);
                }}
                className={`h-6 w-6 p-0 rounded-md ${
                  bookmark.is_favorite 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <Heart className={`h-3 w-3 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(bookmark.url, '_blank');
                }}
                className="h-6 w-6 p-0 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {getDomainFromUrl(bookmark.url)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CreateSegmentDialog({ isOpen, onClose, onCreateSegment }: CreateSegmentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onCreateSegment({
      name: name.trim(),
      description: description.trim(),
      color: segmentColors[selectedColor].class,
      icon: segmentIcons[selectedIcon].icon,
      iconName: segmentIcons[selectedIcon].name
    });
    
    setName('');
    setDescription('');
    setSelectedIcon(0);
    setSelectedColor(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Timeline Segment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Segment Name</label>
            <Input
              placeholder="e.g., Learning Queue, Current Projects..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
            <Input
              placeholder="What this timeline segment represents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {segmentIcons.map((iconItem, index) => {
                const IconComponent = iconItem.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedIcon(index)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedIcon === index 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${
                      selectedIcon === index ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Theme</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {segmentColors.map((colorItem, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`p-3 rounded-lg border-2 transition-all ${colorItem.class} ${
                    selectedColor === index 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{colorItem.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim()}>
              Create Segment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookmarkAssignmentDialog({ 
  isOpen, 
  onClose, 
  bookmarks, 
  segments, 
  onAssignBookmark, 
  onRemoveBookmark 
}: BookmarkAssignmentDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [filterSegment, setFilterSegment] = useState<string>('all');

  const getBookmarkSegment = (bookmarkId: string) => {
    return segments.find(segment => segment.bookmarkIds.includes(bookmarkId));
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  const getFaviconUrl = (url: string) => {
    const domain = getDomainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const currentSegment = getBookmarkSegment(bookmark.id);
      const matchesFilter = filterSegment === 'all' || 
                           (filterSegment === 'unassigned' && !currentSegment) ||
                           (currentSegment && currentSegment.id === filterSegment);
      
      return matchesSearch && matchesFilter;
    });
  }, [bookmarks, searchTerm, filterSegment, segments]);

  const handleSelectAll = () => {
    if (selectedBookmarks.size === filteredBookmarks.length) {
      setSelectedBookmarks(new Set());
    } else {
      setSelectedBookmarks(new Set(filteredBookmarks.map(b => b.id)));
    }
  };

  const handleBulkAssign = (segmentId: string) => {
    selectedBookmarks.forEach(bookmarkId => {
      const currentSegment = getBookmarkSegment(bookmarkId);
      if (currentSegment) {
        onRemoveBookmark(bookmarkId, currentSegment.id);
      }
      if (segmentId) {
        onAssignBookmark(bookmarkId, segmentId);
      }
    });
    setSelectedBookmarks(new Set());
  };

  const toggleBookmarkSelection = (bookmarkId: string) => {
    const newSelection = new Set(selectedBookmarks);
    if (newSelection.has(bookmarkId)) {
      newSelection.delete(bookmarkId);
    } else {
      newSelection.add(bookmarkId);
    }
    setSelectedBookmarks(newSelection);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Timeline Assignments</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Bookmarks</option>
              <option value="unassigned">Unassigned</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedBookmarks.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedBookmarks.size} bookmark{selectedBookmarks.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-700 dark:text-blue-300">Assign to:</span>
                {segments.map((segment) => (
                  <Button
                    key={segment.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAssign(segment.id)}
                    className="text-xs"
                  >
                    {segment.name}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAssign('')}
                  className="text-xs"
                >
                  Unassign
                </Button>
              </div>
            </div>
          )}

          {/* Bookmarks List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {/* Select All Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBookmarks.size === filteredBookmarks.length && filteredBookmarks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({filteredBookmarks.length})
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {selectedBookmarks.size} selected
              </span>
            </div>

            {filteredBookmarks.map((bookmark) => {
              const currentSegment = getBookmarkSegment(bookmark.id);
              const isSelected = selectedBookmarks.has(bookmark.id);
              
              return (
                <div 
                  key={bookmark.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBookmarkSelection(bookmark.id)}
                      className="rounded"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                      <img 
                        src={getFaviconUrl(bookmark.url)} 
                        alt=""
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <Globe className="w-4 h-4 text-gray-500 hidden" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {bookmark.title.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {getDomainFromUrl(bookmark.url)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentSegment && (
                      <Badge variant="secondary" className="text-xs">
                        {currentSegment.name}
                      </Badge>
                    )}
                    
                    <select
                      value={currentSegment?.id || ''}
                      onChange={(e) => {
                        const segmentId = e.target.value;
                        if (currentSegment) {
                          onRemoveBookmark(bookmark.id, currentSegment.id);
                        }
                        if (segmentId) {
                          onAssignBookmark(bookmark.id, segmentId);
                        }
                      }}
                      className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 min-w-[120px]"
                    >
                      <option value="">Unassigned</option>
                      {segments.map((segment) => (
                        <option key={segment.id} value={segment.id}>
                          {segment.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}

            {filteredBookmarks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookmarks found</p>
                <p className="text-xs">Try adjusting your search or filter</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TimelineView({ 
  bookmarks, 
  onBookmarkClick, 
  onFavorite, 
  loading,
  selectedCategory,
  selectedFolder,
  onCategoryChange 
}: TimelineViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkWithRelations | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  // Default segments with their assignments stored in localStorage
  const [segments, setSegments] = useState<TimelineSegment[]>(() => {
    const defaultSegments = [
      {
        id: 'ideas-inspiration',
        name: 'Ideas & Inspiration',
        description: 'Future concepts and creative sparks',
        color: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10',
        icon: Lightbulb,
        iconName: 'Lightbulb',
        bookmarkIds: [],
        order: 1
      },
      {
        id: 'learning-queue',
        name: 'Learning Queue',
        description: 'Educational resources and tutorials to study',
        color: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10',
        icon: BookOpen,
        iconName: 'BookOpen',
        bookmarkIds: [],
        order: 2
      },
      {
        id: 'current-focus',
        name: 'Current Focus',
        description: 'Active projects and immediate priorities',
        color: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10',
        icon: Timer,
        iconName: 'Timer',
        bookmarkIds: [],
        order: 3
      },
      {
        id: 'completed',
        name: 'Completed',
        description: 'Finished projects and accomplished goals',
        color: 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/10',
        icon: CheckCircle,
        iconName: 'CheckCircle',
        bookmarkIds: [],
        order: 4
      },
      {
        id: 'reference-library',
        name: 'Reference Library',
        description: 'Documentation and long-term resources',
        color: 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/10',
        icon: Archive,
        iconName: 'Archive',
        bookmarkIds: [],
        order: 5
      }
    ];

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timeline-segments');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Restore icon components for saved segments
          return parsed.map((segment: any) => {
            // Find matching icon component
            const iconData = segmentIcons.find(iconItem => iconItem.name === segment.iconName);
            return {
              ...segment,
              icon: iconData ? iconData.icon : Globe // fallback icon
            };
          });
        } catch {
          return defaultSegments;
        }
      }
    }
    
    return defaultSegments;
  });

  // Save segments to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeline-segments', JSON.stringify(segments));
    }
  }, [segments]);

  const handleCreateSegment = (segmentData: Omit<TimelineSegment, 'id' | 'bookmarkIds' | 'order'>) => {
    const newSegment: TimelineSegment = {
      ...segmentData,
      id: `segment-${Date.now()}`,
      bookmarkIds: [],
      order: segments.length + 1
    };
    setSegments(prev => [...prev, newSegment]);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(segment => segment.id !== segmentId));
  };

  const handleAssignBookmark = (bookmarkId: string, segmentId: string) => {
    setSegments(prev => prev.map(segment => {
      if (segment.id === segmentId) {
        return {
          ...segment,
          bookmarkIds: [...segment.bookmarkIds.filter(id => id !== bookmarkId), bookmarkId]
        };
      }
      return {
        ...segment,
        bookmarkIds: segment.bookmarkIds.filter(id => id !== bookmarkId)
      };
    }));
  };

  const handleRemoveBookmark = (bookmarkId: string, segmentId: string) => {
    setSegments(prev => prev.map(segment => {
      if (segment.id === segmentId) {
        return {
          ...segment,
          bookmarkIds: segment.bookmarkIds.filter(id => id !== bookmarkId)
        };
      }
      return segment;
    }));
  };

  const handleBookmarkClick = (bookmark: BookmarkWithRelations) => {
    setSelectedBookmark(bookmark);
    setIsDetailModalOpen(true);
    onBookmarkClick?.(bookmark);
  };

  const toggleSegmentExpansion = (segmentId: string) => {
    setExpandedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      return newSet;
    });
  };

  // Filter bookmarks based on search term and selected filters
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'all' ||
                             bookmark.folder?.name.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesFolder = !selectedFolder || bookmark.folder_id === selectedFolder.id;
      
      return matchesSearch && matchesCategory && matchesFolder;
    });
  }, [bookmarks, searchTerm, selectedCategory, selectedFolder]);

  // Get unassigned bookmarks
  const unassignedBookmarks = useMemo(() => {
    const assignedIds = new Set(segments.flatMap(segment => segment.bookmarkIds));
    return filteredBookmarks.filter(bookmark => !assignedIds.has(bookmark.id));
  }, [filteredBookmarks, segments]);

  const getViewTitle = () => {
    if (selectedFolder) {
      return `Timeline - ${selectedFolder.name}`;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      return `Timeline - ${selectedCategory}`;
    }
    return 'Timeline View';
  };

  const getViewDescription = () => {
    if (selectedFolder) {
      return `Timeline view of bookmarks in ${selectedFolder.name} folder`;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      return `Timeline view of ${selectedCategory} bookmarks`;
    }
    return 'Organize bookmarks by timeline segments representing your workflow stages';
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  const getFaviconUrl = (url: string) => {
    const domain = getDomainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  // Create timeline data for the Aceternity Timeline component
  const timelineData = useMemo(() => {
    return segments
      .sort((a, b) => a.order - b.order)
      .map((segment) => {
        const segmentBookmarks = filteredBookmarks.filter(bookmark => 
          segment.bookmarkIds.includes(bookmark.id)
        );
        const IconComponent = segment.icon;
        const isExpanded = expandedSegments.has(segment.id);
        const maxDisplay = 10;
        const hasMore = segmentBookmarks.length > maxDisplay;
        const displayBookmarks = isExpanded ? segmentBookmarks : segmentBookmarks.slice(0, maxDisplay);

        return {
          title: segment.name,
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${segment.color}`}>
                    <IconComponent className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{segment.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{segment.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {segmentBookmarks.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSegment(segment.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {segmentBookmarks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No bookmarks assigned</p>
                  <p className="text-xs">Use "Manage Timeline" to add bookmarks</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50/30 dark:bg-slate-800/30">
                  <div className="space-y-1">
                    <AnimatePresence>
                      {displayBookmarks.map((bookmark, index) => (
                        <CompactBookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          onFavorite={onFavorite}
                          onClick={handleBookmarkClick}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {hasMore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSegmentExpansion(segment.id)}
                        className="w-full mt-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show {segmentBookmarks.length - maxDisplay} More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ),
        };
      });
  }, [segments, filteredBookmarks, handleDeleteSegment, onFavorite, expandedSegments, handleBookmarkClick]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>

        {/* Loading Timeline */}
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with uniform pattern */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {(selectedCategory || selectedFolder) && onCategoryChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange('all')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getViewTitle()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {getViewDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedFolder && (
            <Badge variant="secondary" className="px-3 py-1">
              <FolderIcon className="h-3 w-3 mr-1" />
              {selectedFolder.name} ({filteredBookmarks.length})
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateSegmentOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Segment</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignmentOpen(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Manage Timeline</span>
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Timeline using Aceternity component */}
      <div className="max-w-none -mt-2">
        <Timeline data={timelineData} />
      </div>

      {/* Unassigned Bookmarks Section */}
      {unassignedBookmarks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>Unassigned Bookmarks ({unassignedBookmarks.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unassignedBookmarks.slice(0, 8).map((bookmark) => (
              <Card 
                key={bookmark.id} 
                className="p-3 bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors"
                onClick={() => handleBookmarkClick(bookmark)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                    <img 
                      src={getFaviconUrl(bookmark.url)} 
                      alt=""
                      className="w-5 h-5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Globe className="w-4 h-4 text-gray-500 hidden" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {bookmark.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {getDomainFromUrl(bookmark.url)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {unassignedBookmarks.length > 8 && (
              <Card className="p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +{unassignedBookmarks.length - 8} more
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateSegmentDialog
        isOpen={isCreateSegmentOpen}
        onClose={() => setIsCreateSegmentOpen(false)}
        onCreateSegment={handleCreateSegment}
      />

      <BookmarkAssignmentDialog
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        bookmarks={filteredBookmarks}
        segments={segments}
        onAssignBookmark={handleAssignBookmark}
        onRemoveBookmark={handleRemoveBookmark}
      />

      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        bookmark={selectedBookmark}
        folders={[]} // You may want to pass actual folders here
        tags={[]} // You may want to pass actual tags here
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBookmark(null);
        }}
        onUpdated={(updatedBookmark) => {
          // Handle bookmark updates if needed
          console.log('Bookmark updated:', updatedBookmark);
        }}
      />
    </div>
  );
}