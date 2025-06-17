'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ExternalLink, 
  Heart, 
  Eye, 
  Globe,
  Clock,
  Tag,
  Folder,
  MoreHorizontal,
  Star
} from 'lucide-react';
import { RelatedBookmark, RelationshipType } from './related-types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface RelatedBookmarkCardProps {
  bookmark: RelatedBookmark;
  onVisit: (bookmark: RelatedBookmark) => void;
  onToggleFavorite?: (bookmark: RelatedBookmark) => void;
  onViewDetails?: (bookmark: RelatedBookmark) => void;
  showPreviewImages?: boolean;
  showVisitCount?: boolean;
  showLastVisited?: boolean;
  compact?: boolean;
}

export function RelatedBookmarkCard({
  bookmark,
  onVisit,
  onToggleFavorite,
  onViewDetails,
  showPreviewImages = true,
  showVisitCount = true,
  showLastVisited = true,
  compact = false
}: RelatedBookmarkCardProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      // Skip favicon for localhost domains since they won't work
      if (domain === 'localhost' || domain.includes('127.0.0.1') || domain.includes('192.168.')) {
        return null;
      }
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getRelationshipColor = (type: RelationshipType): string => {
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

  const getRelationshipIcon = (type: RelationshipType) => {
    switch (type) {
      case 'tag_similarity': return <Tag className="h-3 w-3" />;
      case 'folder_similarity': return <Folder className="h-3 w-3" />;
      case 'content_similarity': return <Globe className="h-3 w-3" />;
      case 'domain_similarity': return <ExternalLink className="h-3 w-3" />;
      case 'temporal_similarity': return <Clock className="h-3 w-3" />;
      case 'behavior_similarity': return <Eye className="h-3 w-3" />;
      case 'manual_link': return <Star className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  const formatLastVisited = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const similarityPercentage = Math.round(bookmark.similarity_score * 100);

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onVisit(bookmark)}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {/* Favicon */}
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
              {getFaviconUrl(bookmark.url) ? (
                <img 
                  src={getFaviconUrl(bookmark.url) || ''} 
                  alt="Site favicon" 
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Globe className={`w-4 h-4 text-gray-500 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {bookmark.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={`text-xs ${getRelationshipColor(bookmark.relationship_type)}`}>
                    {getRelationshipIcon(bookmark.relationship_type)}
                    <span className="ml-1">{similarityPercentage}%</span>
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVisit(bookmark);
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                {bookmark.relationship_reason}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onVisit(bookmark)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with favicon, title, and actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Favicon */}
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {getFaviconUrl(bookmark.url) ? (
                  <img 
                    src={getFaviconUrl(bookmark.url) || ''} 
                    alt="Site favicon" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Globe className={`w-5 h-5 text-gray-500 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
              </div>
              
              {/* Title and URL */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {bookmark.url}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              {bookmark.is_favorite && (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onVisit(bookmark);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(bookmark); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onToggleFavorite && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark); }}>
                      <Heart className="h-4 w-4 mr-2" />
                      {bookmark.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(bookmark.url); }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Preview Image */}
          {showPreviewImages && bookmark.preview_image && (
            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={bookmark.preview_image} 
                alt="Bookmark preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {bookmark.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {bookmark.description}
            </p>
          )}

          {/* Relationship Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${getRelationshipColor(bookmark.relationship_type)}`}>
                {getRelationshipIcon(bookmark.relationship_type)}
                <span className="ml-1">{similarityPercentage}% similarity</span>
              </Badge>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {bookmark.relationship_reason}
            </p>
          </div>

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-xs"
                  style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                >
                  {tag.name}
                </Badge>
              ))}
              {bookmark.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bookmark.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Folder */}
          {bookmark.folder && (
            <div className="flex items-center space-x-1">
              <Folder className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {bookmark.folder.name}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              {showVisitCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{bookmark.visit_count} visits</span>
                </div>
              )}
              {showLastVisited && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatLastVisited(bookmark.last_visited)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 