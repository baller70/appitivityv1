'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Filter, RefreshCw, X } from 'lucide-react';
import { RelatedBookmark, RelationshipType } from './related-types';
import { RelatedBookmarkCard } from './related-bookmark-card';

interface RelatedListProps {
  bookmarks: RelatedBookmark[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onBookmarkVisit: (bookmark: RelatedBookmark) => void;
  onBookmarkToggleFavorite?: (bookmark: RelatedBookmark) => void;
  onBookmarkViewDetails?: (bookmark: RelatedBookmark) => void;
  compact?: boolean;
}

export function RelatedList({
  bookmarks,
  isLoading = false,
  onRefresh,
  onBookmarkVisit,
  onBookmarkToggleFavorite,
  onBookmarkViewDetails,
  compact = false
}: RelatedListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<RelationshipType[]>([
    'tag_similarity',
    'folder_similarity',
    'content_similarity',
    'domain_similarity',
    'manual_link'
  ]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          bookmark.title.toLowerCase().includes(query) ||
          bookmark.url.toLowerCase().includes(query) ||
          (bookmark.description?.toLowerCase().includes(query)) ||
          bookmark.tags.some(tag => tag.name.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (!selectedTypes.includes(bookmark.relationship_type)) {
        return false;
      }

      return true;
    }).sort((a, b) => b.similarity_score - a.similarity_score);
  }, [bookmarks, searchQuery, selectedTypes]);

  const getRelationshipTypeLabel = (type: RelationshipType): string => {
    switch (type) {
      case 'tag_similarity': return 'Similar Tags';
      case 'folder_similarity': return 'Same Folder';
      case 'content_similarity': return 'Similar Content';
      case 'domain_similarity': return 'Same Domain';
      case 'temporal_similarity': return 'Similar Timing';
      case 'behavior_similarity': return 'Usage Patterns';
      case 'manual_link': return 'Manually Linked';
      default: return 'Related';
    }
  };

  const getRelationshipTypeColor = (type: RelationshipType): string => {
    switch (type) {
      case 'tag_similarity': return 'bg-blue-100 text-blue-800';
      case 'folder_similarity': return 'bg-green-100 text-green-800';
      case 'content_similarity': return 'bg-purple-100 text-purple-800';
      case 'domain_similarity': return 'bg-orange-100 text-orange-800';
      case 'temporal_similarity': return 'bg-yellow-100 text-yellow-800';
      case 'behavior_similarity': return 'bg-pink-100 text-pink-800';
      case 'manual_link': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Finding related bookmarks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search related bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter by relationship type */}
      <div className="flex flex-wrap gap-2">
        {(['tag_similarity', 'folder_similarity', 'content_similarity', 'domain_similarity', 'manual_link'] as RelationshipType[]).map(type => (
          <Badge
            key={type}
            variant={selectedTypes.includes(type) ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedTypes.includes(type) ? getRelationshipTypeColor(type) : ''}`}
            onClick={() => {
              const newTypes = selectedTypes.includes(type)
                ? selectedTypes.filter(t => t !== type)
                : [...selectedTypes, type];
              setSelectedTypes(newTypes);
            }}
          >
            {getRelationshipTypeLabel(type)}
          </Badge>
        ))}
      </div>

      {/* Results */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="h-12 w-12 mx-auto mb-4" />
          </div>
          <p className="text-gray-500">
            {bookmarks.length === 0 
              ? "No related bookmarks found"
              : "No bookmarks match your current filters"
            }
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredBookmarks.map((bookmark) => (
            <RelatedBookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onVisit={onBookmarkVisit}
              onToggleFavorite={onBookmarkToggleFavorite}
              onViewDetails={onBookmarkViewDetails}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
} 