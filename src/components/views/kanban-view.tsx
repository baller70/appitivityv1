'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  ExternalLink, 
  Heart,
  MoreHorizontal,
  Search,
  ArrowLeft,
  Folder as FolderIcon,
  Star,
  Bookmark,
  Globe,
  Tag,
  Calendar,
  Eye,
  Plus,
  X,
  Edit3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings
} from 'lucide-react';
import Image from 'next/image';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder as FolderType } from '../../types/supabase';

interface KanbanViewProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  loading?: boolean;
  selectedCategory?: string;
  selectedFolder?: FolderType;
  onCategoryChange?: (category: string) => void;
}

interface KanbanBoard {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  bookmarkIds: string[];
}

interface CreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (board: Omit<KanbanBoard, 'id' | 'bookmarkIds'>) => void;
}

interface BookmarkAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkWithRelations[];
  boards: KanbanBoard[];
  onAssignBookmark: (bookmarkId: string, boardId: string) => void;
  onRemoveBookmark: (bookmarkId: string, boardId: string) => void;
}

const boardIcons = [
  { icon: Target, name: 'Target' },
  { icon: Clock, name: 'Clock' },
  { icon: CheckCircle, name: 'Check' },
  { icon: AlertCircle, name: 'Alert' },
  { icon: Zap, name: 'Zap' },
  { icon: Star, name: 'Star' },
  { icon: Bookmark, name: 'Bookmark' },
  { icon: Globe, name: 'Globe' },
  { icon: Tag, name: 'Tag' },
  { icon: Calendar, name: 'Calendar' }
];

const boardColors = [
  { value: 'blue', class: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10', name: 'Blue' },
  { value: 'green', class: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10', name: 'Green' },
  { value: 'purple', class: 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/10', name: 'Purple' },
  { value: 'orange', class: 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10', name: 'Orange' },
  { value: 'pink', class: 'border-pink-200 bg-pink-50/50 dark:border-pink-800 dark:bg-pink-900/10', name: 'Pink' },
  { value: 'yellow', class: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10', name: 'Yellow' }
];

function CreateBoardDialog({ isOpen, onClose, onCreateBoard }: CreateBoardDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onCreateBoard({
      name: name.trim(),
      description: description.trim(),
      color: boardColors[selectedColor].class,
      icon: boardIcons[selectedIcon].icon
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
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Board Name</label>
            <Input
              placeholder="Enter board name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
            <Input
              placeholder="Enter board description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {boardIcons.map((iconItem, index) => {
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {boardColors.map((colorItem, index) => (
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
              Create Board
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
  boards, 
  onAssignBookmark, 
  onRemoveBookmark 
}: BookmarkAssignmentDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBookmarkBoard = (bookmarkId: string) => {
    return boards.find(board => board.bookmarkIds.includes(bookmarkId));
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    const domain = getDomainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Bookmark Assignments</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredBookmarks.map((bookmark) => {
              const currentBoard = getBookmarkBoard(bookmark.id);
              const IconComponent = currentBoard?.icon || Globe;

              return (
                <div key={bookmark.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
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
                      <h4 className="font-medium text-sm truncate">{bookmark.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{getDomainFromUrl(bookmark.url)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentBoard && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <IconComponent className="h-3 w-3" />
                        <span>{currentBoard.name}</span>
                      </div>
                    )}
                    
                    <select
                      value={currentBoard?.id || ''}
                      onChange={(e) => {
                        if (currentBoard) {
                          onRemoveBookmark(bookmark.id, currentBoard.id);
                        }
                        if (e.target.value) {
                          onAssignBookmark(bookmark.id, e.target.value);
                        }
                      }}
                      className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800"
                    >
                      <option value="">No Board</option>
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function KanbanView({ 
  bookmarks, 
  onBookmarkClick, 
  onFavorite, 
  loading,
  selectedCategory,
  selectedFolder,
  onCategoryChange 
}: KanbanViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  // Initialize with default boards
  useEffect(() => {
    const defaultBoards: KanbanBoard[] = [
      {
        id: 'todo',
        name: 'To Review',
        description: 'Bookmarks to review and organize',
        color: boardColors[0].class,
        icon: Clock,
        bookmarkIds: []
      },
      {
        id: 'in-progress',
        name: 'Priority',
        description: 'High priority bookmarks',
        color: boardColors[2].class,
        icon: Target,
        bookmarkIds: []
      },
      {
        id: 'completed',
        name: 'Favorites',
        description: 'Your favorite bookmarks',
        color: boardColors[1].class,
        icon: Star,
        bookmarkIds: []
      },
      {
        id: 'archived',
        name: 'Research',
        description: 'Research and reference materials',
        color: boardColors[3].class,
        icon: Globe,
        bookmarkIds: []
      }
    ];
    setBoards(defaultBoards);
  }, []);

  const handleCreateBoard = (boardData: Omit<KanbanBoard, 'id' | 'bookmarkIds'>) => {
    const newBoard: KanbanBoard = {
      ...boardData,
      id: `board-${Date.now()}`,
      bookmarkIds: []
    };
    setBoards(prev => [...prev, newBoard]);
  };

  const handleDeleteBoard = (boardId: string) => {
    setBoards(prev => prev.filter(board => board.id !== boardId));
  };

  const handleAssignBookmark = (bookmarkId: string, boardId: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarkIds: [...board.bookmarkIds.filter(id => id !== bookmarkId), bookmarkId]
        };
      }
      return {
        ...board,
        bookmarkIds: board.bookmarkIds.filter(id => id !== bookmarkId)
      };
    }));
  };

  const handleRemoveBookmark = (bookmarkId: string, boardId: string) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, bookmarkIds: board.bookmarkIds.filter(id => id !== bookmarkId) }
        : board
    ));
  };

  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    if (selectedFolder) {
      filtered = filtered.filter(bookmark => bookmark.folder_id === selectedFolder.id);
    } else if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(bookmark => {
        const tags = bookmark.tags || [];
        return tags.some(tag => tag.name.toLowerCase() === selectedCategory.toLowerCase());
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [bookmarks, searchTerm, selectedCategory, selectedFolder]);

  const getViewTitle = () => {
    if (selectedFolder) {
      return `KANBAN VIEW - ${selectedFolder.name.toUpperCase()}`;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      return `KANBAN VIEW - ${selectedCategory.toUpperCase()}`;
    }
    return 'KANBAN VIEW - CUSTOM BOARDS';
  };

  const getViewDescription = () => {
    if (selectedFolder) {
      return `Organize bookmarks from ${selectedFolder.name} folder across your custom boards`;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      return `Organize bookmarks tagged with "${selectedCategory}" across your custom boards`;
    }
    return 'Organize your bookmarks across custom boards for better workflow management';
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    const domain = getDomainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const unassignedBookmarks = filteredBookmarks.filter(bookmark => 
    !boards.some(board => board.bookmarkIds.includes(bookmark.id))
  );

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

        {/* Loading Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            onClick={() => setIsAssignmentOpen(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Manage Assignments</span>
          </Button>
        </div>
      </div>

      {/* Kanban Boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => {
          const boardBookmarks = filteredBookmarks.filter(bookmark => 
            board.bookmarkIds.includes(bookmark.id)
          );
          const IconComponent = board.icon;

          return (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-[600px]"
            >
              <Card className={`h-full flex flex-col ${board.color} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                          {board.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {board.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        {boardBookmarks.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBoard(board.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-3 pb-4">
                  <AnimatePresence>
                    {boardBookmarks.map((bookmark, index) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <Card className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
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
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                                  {bookmark.title}
                                </h4>
                                {bookmark.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {bookmark.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {getDomainFromUrl(bookmark.url)}
                                  </span>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onFavorite?.(bookmark);
                                      }}
                                      className={`h-6 w-6 p-0 ${
                                        bookmark.is_favorite 
                                          ? 'text-red-500' 
                                          : 'text-gray-400 hover:text-red-500'
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
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {boardBookmarks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No bookmarks assigned</p>
                      <p className="text-xs">Use "Manage Assignments" to add bookmarks</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Add Board Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: boards.length * 0.1 }}
          className="flex flex-col h-[600px]"
        >
          <Card 
            className="h-full flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
            onClick={() => setIsCreateBoardOpen(true)}
          >
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Plus className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New Board</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create a custom board to organize your bookmarks
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
              <Card key={bookmark.id} className="p-3 bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800">
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
                      {bookmark.title}
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
      <CreateBoardDialog
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onCreateBoard={handleCreateBoard}
      />

      <BookmarkAssignmentDialog
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        bookmarks={filteredBookmarks}
        boards={boards}
        onAssignBookmark={handleAssignBookmark}
        onRemoveBookmark={handleRemoveBookmark}
      />
    </div>
  );
} 