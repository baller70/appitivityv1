'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { 
  ExternalLink, 
  Eye, 
  Calendar, 
  Search,
  Columns3,
  Move3D,
  Globe,
  Heart,
  Bookmark,
  Folder
} from 'lucide-react';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';

interface KanbanViewProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  loading?: boolean;
}

interface KanbanColumn {
  id: string;
  name: string;
  bookmarks: BookmarkWithRelations[];
  color: string;
  count: number;
  bg: string;
  border: string;
  header: string;
  accent: string;
}

export function KanbanView({ bookmarks, onBookmarkClick, onFavorite, loading }: KanbanViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group bookmarks by folder/category for kanban columns
  const columns = useMemo((): KanbanColumn[] => {
    const filtered = bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc, bookmark) => {
      const categoryName = bookmark.folder?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(bookmark);
      return acc;
    }, {} as Record<string, BookmarkWithRelations[]>);

    const colorSchemes = [
      {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
        border: 'border-blue-200 dark:border-blue-800',
        header: 'bg-gradient-to-r from-blue-500 to-blue-600',
        accent: 'text-blue-600 dark:text-blue-400'
      },
      {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50',
        border: 'border-emerald-200 dark:border-emerald-800',
        header: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        accent: 'text-emerald-600 dark:text-emerald-400'
      },
      {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50',
        border: 'border-purple-200 dark:border-purple-800',
        header: 'bg-gradient-to-r from-purple-500 to-purple-600',
        accent: 'text-purple-600 dark:text-purple-400'
      },
      {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50',
        border: 'border-orange-200 dark:border-orange-800',
        header: 'bg-gradient-to-r from-orange-500 to-orange-600',
        accent: 'text-orange-600 dark:text-orange-400'
      },
      {
        bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50',
        border: 'border-pink-200 dark:border-pink-800',
        header: 'bg-gradient-to-r from-pink-500 to-pink-600',
        accent: 'text-pink-600 dark:text-pink-400'
      },
      {
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50',
        border: 'border-indigo-200 dark:border-indigo-800',
        header: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
        accent: 'text-indigo-600 dark:text-indigo-400'
      }
    ];

    return Object.entries(grouped).map(([name, bookmarks], index) => {
      const scheme = colorSchemes[index % colorSchemes.length];
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        bookmarks: bookmarks.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        ),
        color: scheme.bg + ' ' + scheme.border,
        count: bookmarks.length,
        bg: scheme.bg,
        border: scheme.border,
        header: scheme.header,
        accent: scheme.accent
      };
    });
  }, [bookmarks, searchTerm]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const BookmarkCard = ({ bookmark }: { bookmark: BookmarkWithRelations }) => (
    <Card 
      className="group mb-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden"
      onClick={() => onBookmarkClick?.(bookmark)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-lg overflow-hidden flex-shrink-0 mt-0.5">
              {getFaviconUrl(bookmark.url) ? (
                <div 
                  className="w-6 h-6 object-contain rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${getFaviconUrl(bookmark.url)})` }}
                />
              ) : null}
              <Globe className={`w-4 h-4 text-primary ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {bookmark.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {getDomainFromUrl(bookmark.url)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(bookmark);
              }}
              className={`h-6 w-6 p-0 rounded-full ${bookmark.is_favorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
            >
              <Heart className={`h-3 w-3 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                window.open(bookmark.url, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {bookmark.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {bookmark.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{bookmark.visit_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(bookmark.created_at)}</span>
            </div>
          </div>
        </div>

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 rounded-md font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                {tag.name}
              </Badge>
            ))}
            {bookmark.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                +{bookmark.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Loading Header */}
            <div className="text-center space-y-4 animate-pulse">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl w-80 mx-auto"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto"></div>
            </div>

            {/* Loading Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl animate-pulse"></div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-32 bg-white dark:bg-gray-800 rounded-xl border animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-xl">
                <Columns3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent mb-3">
            Kanban Board
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-6">
            Organize your bookmarks by categories
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-600/10 rounded-2xl blur-lg"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm focus:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Columns */}
        {columns.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl">
            <CardContent className="p-12 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full blur-xl opacity-20"></div>
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <Search className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">NO BOOKMARKS FOUND</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className={`${column.bg} ${column.border} border rounded-2xl overflow-hidden shadow-sm`}>
                  <div className={`${column.header} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Folder className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{column.name.toUpperCase()}</h3>
                          <p className="text-white/80 text-sm">{column.count} items</p>
                        </div>
                      </div>
                      <div className="opacity-70 hover:opacity-100 transition-opacity">
                        <Move3D className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Column Content */}
                  <div className="p-4 min-h-[200px] max-h-[600px] overflow-y-auto">
                    {column.bookmarks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 bg-white/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
                          <Bookmark className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">No bookmarks in this category</p>
                      </div>
                    ) : (
                      column.bookmarks.map((bookmark) => (
                        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 