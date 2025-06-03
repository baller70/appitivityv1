'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { 
  ExternalLink, 
  Heart, 
  Calendar, 
  Globe, 
  Search,
  Bookmark,
  TrendingUp,
  Eye,
  Folder,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';

interface ListViewProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  loading?: boolean;
}

export function ListView({ bookmarks, onBookmarkClick, onFavorite, loading }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'visit_count' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterTag, setFilterTag] = useState('');

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(bookmark => 
      !filterTag || bookmark.tags?.some(tag => tag.name === filterTag)
    )
    .sort((a, b) => {
      let aValue: string | number | Date = a[sortBy] || '';
      let bValue: string | number | Date = b[sortBy] || '';
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue as string || 0).getTime();
        bValue = new Date(bValue as string || 0).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get all unique tags for filtering
  const allTags = Array.from(
    new Set(bookmarks.flatMap(b => b.tags?.map(t => t.name) || []))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

            {/* Loading Cards */}
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
                        <div className="flex space-x-2 pt-2">
                          <div className="h-6 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full w-16"></div>
                          <div className="h-6 bg-gradient-to-r from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 rounded-full w-20"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl">
                <Bookmark className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3">
            Your Personal Library
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Discover and organize your curated collection
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold rounded-xl shadow-lg">
            <TrendingUp className="h-4 w-4 mr-2" />
            {filteredBookmarks.length} bookmarks
          </Badge>
        </div>

        {/* Enhanced Control Panel */}
        <Card className="mb-8 border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5"></div>
          <CardContent className="relative p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl blur-lg"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search your bookmarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 h-12 text-base border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm focus:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-44 h-12 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm text-base">
                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                    <SelectItem value="">All Tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                >
                  <SelectTrigger className="w-48 h-12 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm text-base">
                    <ArrowUpDown className="h-4 w-4 mr-2 text-purple-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                    <SelectItem value="visit_count-desc">Most Visited</SelectItem>
                    <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookmarks Grid */}
        <div className="space-y-4">
          {filteredBookmarks.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full blur-xl opacity-20"></div>
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No bookmarks found</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <Card 
                key={bookmark.id} 
                className="group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer"
                onClick={() => onBookmarkClick?.(bookmark)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-purple-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center space-x-4">
                    {/* Favicon */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        {getFaviconUrl(bookmark.url) ? (
                          <div 
                            className="w-8 h-8 rounded-lg bg-cover bg-center"
                            style={{ backgroundImage: `url(${getFaviconUrl(bookmark.url)})` }}
                          />
                        ) : null}
                        <Globe className={`h-6 w-6 text-gray-400 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-1">
                            {bookmark.title}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span className="flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {getDomainFromUrl(bookmark.url)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(bookmark.created_at)}
                            </span>
                            {(bookmark.visit_count ?? 0) > 0 && (
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {bookmark.visit_count} visits
                              </span>
                            )}
                          </div>
                          
                          {/* Description */}
                          {bookmark.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                              {bookmark.description}
                            </p>
                          )}

                          {/* Tags & Folder */}
                          <div className="flex flex-wrap gap-2">
                            {bookmark.folder && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-lg text-xs">
                                <Folder className="h-3 w-3 mr-1" />
                                {bookmark.folder.name}
                              </Badge>
                            )}
                            {bookmark.tags?.slice(0, 3).map(tag => (
                              <Badge 
                                key={tag.id} 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.name}
                              </Badge>
                            ))}
                            {bookmark.tags && bookmark.tags.length > 3 && (
                              <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-2 py-1 rounded-lg text-xs">
                                +{bookmark.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFavorite?.(bookmark);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl p-2"
                          >
                            <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(bookmark.url, '_blank');
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl p-2"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 