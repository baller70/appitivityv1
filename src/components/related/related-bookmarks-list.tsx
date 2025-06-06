'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List as ListIcon,
  RefreshCw,
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { RelatedBookmark, RelationshipType, RelatedBookmarksFilter } from './related-types';
import { RelatedBookmarkCard } from './related-bookmark-card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface RelatedBookmarksListProps {
  bookmarks: RelatedBookmark[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onBookmarkVisit: (bookmark: RelatedBookmark) => void;
  onBookmarkToggleFavorite?: (bookmark: RelatedBookmark) => void;
  onBookmarkViewDetails?: (bookmark: RelatedBookmark) => void;
  onFilterChange?: (filter: Partial<RelatedBookmarksFilter>) => void;
  showPreviewImages?: boolean;
  showVisitCount?: boolean;
  showLastVisited?: boolean;
  groupByRelationship?: boolean;
  compact?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortField = 'similarity' | 'recent' | 'popular' | 'alphabetical';
type SortOrder = 'asc' | 'desc';

export function RelatedBookmarksList({
  bookmarks,
  isLoading = false,
  onRefresh,
  onBookmarkVisit,
  onBookmarkToggleFavorite,
  onBookmarkViewDetails,
  onFilterChange,
  showPreviewImages = true,
  showVisitCount = true,
  showLastVisited = true,
  groupByRelationship = false,
  compact = false
}: RelatedBookmarksListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('similarity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationshipTypes, setSelectedRelationshipTypes] = useState<RelationshipType[]>([
    'tag_similarity',
    'folder_similarity', 
    'content_similarity',
    'domain_similarity',
    'manual_link'
  ]);
  const [minSimilarityScore, setMinSimilarityScore] = useState(0.1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = useMemo(() => {
    const filtered = bookmarks.filter(bookmark => {
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

      // Relationship type filter
      if (!selectedRelationshipTypes.includes(bookmark.relationship_type)) {
        return false;
      }

      // Similarity score filter
      if (bookmark.similarity_score < minSimilarityScore) {
        return false;
      }

      return true;
    });

    // Sort bookmarks
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'similarity':
          aValue = a.similarity_score;
          bValue = b.similarity_score;
          break;
        case 'recent':
          aValue = new Date(a.last_visited || a.created_at).getTime();
          bValue = new Date(b.last_visited || b.created_at).getTime();
          break;
        case 'popular':
          aValue = a.visit_count;
          bValue = b.visit_count;
          break;
        case 'alphabetical':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.similarity_score;
          bValue = b.similarity_score;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        return sortOrder === 'desc' 
          ? bValue.toString().localeCompare(aValue.toString())
          : aValue.toString().localeCompare(bValue.toString());
      }
    });

    return filtered;
  }, [bookmarks, searchQuery, selectedRelationshipTypes, minSimilarityScore, sortField, sortOrder]);

  // Group bookmarks by relationship type
  const groupedBookmarks = useMemo(() => {
    if (!groupByRelationship) return null;

    const groups: Record<RelationshipType, RelatedBookmark[]> = {
      tag_similarity: [],
      folder_similarity: [],
      content_similarity: [],
      domain_similarity: [],
      temporal_similarity: [],
      behavior_similarity: [],
      manual_link: []
    };

    filteredAndSortedBookmarks.forEach(bookmark => {
      groups[bookmark.relationship_type].push(bookmark);
    });

    // Filter out empty groups and sort them by average similarity score
    const nonEmptyGroups = Object.entries(groups)
      .filter(([_, bookmarks]) => bookmarks.length > 0)
      .map(([type, bookmarks]) => ({
        type: type as RelationshipType,
        bookmarks,
        avgSimilarity: bookmarks.reduce((sum, b) => sum + b.similarity_score, 0) / bookmarks.length
      }))
      .sort((a, b) => b.avgSimilarity - a.avgSimilarity);

    return nonEmptyGroups;
  }, [filteredAndSortedBookmarks, groupByRelationship]);

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
      case 'tag_similarity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'folder_similarity': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'content_similarity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'domain_similarity': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'temporal_similarity': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'behavior_similarity': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'manual_link': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleRelationshipTypeToggle = (type: RelationshipType) => {
    const newTypes = selectedRelationshipTypes.includes(type)
      ? selectedRelationshipTypes.filter(t => t !== type)
      : [...selectedRelationshipTypes, type];
    
    setSelectedRelationshipTypes(newTypes);
    onFilterChange?.({
      relationshipTypes: newTypes,
      minSimilarityScore
    });
  };

  const handleSimilarityScoreChange = (score: number) => {
    setMinSimilarityScore(score);
    onFilterChange?.({
      relationshipTypes: selectedRelationshipTypes,
      minSimilarityScore: score
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRelationshipTypes(['tag_similarity', 'folder_similarity', 'content_similarity', 'domain_similarity', 'manual_link']);
    setMinSimilarityScore(0.1);
    onFilterChange?.({
      relationshipTypes: ['tag_similarity', 'folder_similarity', 'content_similarity', 'domain_similarity', 'manual_link'],
      minSimilarityScore: 0.1
    });
  };

  const renderBookmarkGrid = (bookmarks: RelatedBookmark[]) => (
    <div className={`grid gap-4 ${
      compact 
        ? 'grid-cols-1' 
        : viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
    }`}>
      {bookmarks.map((bookmark) => (
        <RelatedBookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onVisit={onBookmarkVisit}
          onToggleFavorite={onBookmarkToggleFavorite}
          onViewDetails={onBookmarkViewDetails}
          showPreviewImages={showPreviewImages}
          showVisitCount={showVisitCount}
          showLastVisited={showLastVisited}
          compact={compact}
        />
      ))}
    </div>
  );

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
      {/* Header with search and controls */}
      <div className="flex flex-col space-y-4">
        {/* Search and main controls */}
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>

          {!compact && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-1" /> : <SortDesc className="h-4 w-4 mr-1" />}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortField('similarity')}>
                    Similarity Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortField('recent')}>
                    Recently Visited
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortField('popular')}>
                    Most Visited
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortField('alphabetical')}>
                    Alphabetical
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-lg">
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
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <Collapsible open={showFilters}>
          <CollapsibleContent className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* Relationship Types */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Relationship Types
              </label>
              <div className="flex flex-wrap gap-2">
                {(['tag_similarity', 'folder_similarity', 'content_similarity', 'domain_similarity', 'temporal_similarity', 'behavior_similarity', 'manual_link'] as RelationshipType[]).map(type => (
                  <Badge
                    key={type}
                    variant={selectedRelationshipTypes.includes(type) ? 'default' : 'outline'}
                    className={`cursor-pointer ${selectedRelationshipTypes.includes(type) ? getRelationshipTypeColor(type) : ''}`}
                    onClick={() => handleRelationshipTypeToggle(type)}
                  >
                    {getRelationshipTypeLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Similarity Score */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Minimum Similarity: {Math.round(minSimilarityScore * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minSimilarityScore}
                onChange={(e) => handleSimilarityScoreChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <span className="text-sm text-gray-500">
                {filteredAndSortedBookmarks.length} of {bookmarks.length} bookmarks
              </span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results */}
      {filteredAndSortedBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="h-12 w-12 mx-auto mb-4" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {bookmarks.length === 0 
              ? "No related bookmarks found"
              : "No bookmarks match your current filters"
            }
          </p>
          {bookmarks.length > 0 && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters to see all results
            </Button>
          )}
        </div>
      ) : groupByRelationship && groupedBookmarks ? (
        <div className="space-y-6">
          {groupedBookmarks.map(({ type, bookmarks: groupBookmarks }) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className={getRelationshipTypeColor(type)}>
                  {getRelationshipTypeLabel(type)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {groupBookmarks.length} bookmark{groupBookmarks.length !== 1 ? 's' : ''}
                </span>
              </div>
              {renderBookmarkGrid(groupBookmarks)}
            </div>
          ))}
        </div>
      ) : (
        renderBookmarkGrid(filteredAndSortedBookmarks)
      )}
    </div>
  );
} 