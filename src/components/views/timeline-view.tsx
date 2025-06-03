'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  ExternalLink, 
  Heart, 
  Clock, 
  Globe, 
  Filter, 
  Search,
  Eye,
  Folder,
  Tag,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';

interface TimelineViewProps {
  bookmarks: BookmarkWithRelations[];
  onBookmarkClick?: (bookmark: BookmarkWithRelations) => void;
  onFavorite?: (bookmark: BookmarkWithRelations) => void;
  loading?: boolean;
}

interface TimelineGroup {
  date: string;
  displayDate: string;
  bookmarks: BookmarkWithRelations[];
  isToday?: boolean;
  isThisWeek?: boolean;
  isThisMonth?: boolean;
}

export function TimelineView({ bookmarks, onBookmarkClick, onFavorite, loading }: TimelineViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // Group bookmarks by date for timeline
  const timelineGroups = useMemo((): TimelineGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const filtered = bookmarks
      .filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(bookmark => {
        if (timeFilter === 'all') return true;
        if (!bookmark.created_at) return false;
        
        const bookmarkDate = new Date(bookmark.created_at);
        
        switch (timeFilter) {
          case 'today':
            return bookmarkDate >= today;
          case 'week':
            return bookmarkDate >= thisWeek;
          case 'month':
            return bookmarkDate >= thisMonth;
          case 'year':
            return bookmarkDate >= thisYear;
          default:
            return true;
        }
      });

    const grouped = filtered.reduce((acc, bookmark) => {
      if (!bookmark.created_at) return acc;
      
      const date = new Date(bookmark.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(bookmark);
      return acc;
    }, {} as Record<string, BookmarkWithRelations[]>);

    return Object.entries(grouped)
      .map(([dateKey, bookmarks]) => {
        const date = new Date(dateKey);
        const isToday = dateKey === today.toISOString().split('T')[0];
        const isThisWeek = date >= thisWeek;
        const isThisMonth = date >= thisMonth;
        
        return {
          date: dateKey,
          displayDate: formatDisplayDate(date, isToday),
          bookmarks: bookmarks.sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          ),
          isToday,
          isThisWeek,
          isThisMonth
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookmarks, searchTerm, timeFilter]);

  const formatDisplayDate = (date: Date, isToday: boolean) => {
    if (isToday) return 'Today';
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
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

  const getTimelineColor = (group: TimelineGroup) => {
    if (group.isToday) return 'from-blue-500 to-blue-600';
    if (group.isThisWeek) return 'from-green-500 to-green-600';
    if (group.isThisMonth) return 'from-purple-500 to-purple-600';
    return 'from-gray-400 to-gray-500';
  };

  const BookmarkTimelineItem = ({ bookmark, isLast }: { bookmark: BookmarkWithRelations; isLast: boolean }) => (
    <div className="flex items-start space-x-4 pb-6 relative">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-3 border-2 border-white dark:border-gray-900 shadow-sm z-10"></div>
        {!isLast && <div className="w-px h-full bg-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 mt-2"></div>}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <Card 
          className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onBookmarkClick?.(bookmark)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-purple-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl overflow-hidden flex-shrink-0 mt-1">
                  {getFaviconUrl(bookmark.url) ? (
                    <div 
                      className="w-6 h-6 object-contain rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${getFaviconUrl(bookmark.url)})` }}
                    />
                  ) : null}
                  <Globe className={`w-5 h-5 text-primary ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-base text-foreground mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {bookmark.title}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center">
                      <Globe className="h-3 w-3 mr-1" />
                      {getDomainFromUrl(bookmark.url)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(bookmark.created_at)}
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
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
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
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
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

            {/* Loading Timeline */}
            <div className="max-w-4xl mx-auto space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full mt-3 animate-pulse"></div>
                  <div className="flex-1">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                      <CardContent className="p-5">
                        <div className="animate-pulse flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
                            <div className="flex space-x-2 pt-2">
                              <div className="h-5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full w-16"></div>
                              <div className="h-5 bg-gradient-to-r from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 rounded-full w-20"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent mb-3">
            Timeline View
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-6">
            Explore your bookmarks chronologically
          </p>
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold rounded-xl shadow-lg">
            <TrendingUp className="h-4 w-4 mr-2" />
            {timelineGroups.reduce((total, group) => total + group.bookmarks.length, 0)} bookmarks
          </Badge>
        </div>

        {/* Enhanced Control Panel */}
        <Card className="mb-8 border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5"></div>
          <CardContent className="relative p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-2xl blur-lg"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search timeline..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 h-12 text-base border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm focus:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              
              {/* Time Filter */}
              <div className="flex gap-3">
                <Select value={timeFilter} onValueChange={(value: 'all' | 'today' | 'week' | 'month' | 'year') => setTimeFilter(value)}>
                  <SelectTrigger className="w-44 h-12 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm text-base">
                    <Filter className="h-4 w-4 mr-2 text-indigo-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {timelineGroups.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full blur-xl opacity-20"></div>
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No bookmarks found</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">Try adjusting your search or time filter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {timelineGroups.map((group, groupIndex) => (
                <div key={group.date} className="relative">
                  {/* Date Header */}
                  <div className="sticky top-20 z-20 mb-6">
                    <div className="flex items-center justify-center">
                      <div className={`px-6 py-3 bg-gradient-to-r ${getTimelineColor(group)} text-white rounded-2xl shadow-lg backdrop-blur-xl`}>
                        <div className="flex items-center space-x-3">
                          <CalendarDays className="h-5 w-5" />
                          <span className="font-semibold text-lg">{group.displayDate}</span>
                          <Badge className="bg-white/20 text-white px-2 py-1 rounded-lg text-sm">
                            {group.bookmarks.length} items
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Items */}
                  <div className="space-y-4">
                    {group.bookmarks.map((bookmark, index) => (
                      <BookmarkTimelineItem 
                        key={bookmark.id} 
                        bookmark={bookmark} 
                        isLast={index === group.bookmarks.length - 1 && groupIndex === timelineGroups.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 