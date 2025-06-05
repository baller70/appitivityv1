'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Link2, 
  Users, 
  Clock,
  BarChart3,
  AlertCircle,
  Lightbulb,
  Plus
} from 'lucide-react';
import { BookmarkWithRelations } from '../../lib/services/bookmarks';
import { RelatedBookmark, RelatedBookmarksSettings, DEFAULT_RELATED_SETTINGS } from './related-types';
import { RelatedBookmarksService } from './related-service';
import { RelatedList } from './related-list';
import { Alert, AlertDescription } from '../ui/alert';

interface RelatedManagerProps {
  targetBookmark: BookmarkWithRelations;
  allBookmarks: BookmarkWithRelations[];
  onBookmarkVisit: (bookmark: RelatedBookmark) => void;
  onBookmarkToggleFavorite?: (bookmark: RelatedBookmark) => void;
  onBookmarkViewDetails?: (bookmark: RelatedBookmark) => void;
  onCreateManualLink?: (fromId: string, toId: string) => void;
  compact?: boolean;
  className?: string;
}

export function RelatedManager({
  targetBookmark,
  allBookmarks,
  onBookmarkVisit,
  onBookmarkToggleFavorite,
  onBookmarkViewDetails,
  onCreateManualLink,
  compact = false,
  className = ''
}: RelatedManagerProps) {
  const [relatedBookmarks, setRelatedBookmarks] = useState<RelatedBookmark[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<RelatedBookmarksSettings>(DEFAULT_RELATED_SETTINGS);
  const [activeTab, setActiveTab] = useState('related');
  const [showAddBookmark, setShowAddBookmark] = useState(false);

  // Initialize service
  const relatedService = useMemo(() => new RelatedBookmarksService(settings), [settings]);

  // Find related bookmarks
  const findRelatedBookmarks = useCallback(async () => {
    if (!targetBookmark || allBookmarks.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const related = await relatedService.findRelatedBookmarks(targetBookmark, allBookmarks);
      // const analyticsData = relatedService.generateAnalytics(targetBookmark, related, allBookmarks);
      
      setRelatedBookmarks(related);
      // setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error finding related bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Failed to find related bookmarks');
    } finally {
      setIsLoading(false);
    }
  }, [targetBookmark, allBookmarks, relatedService]);

  // Initial load and when dependencies change
  useEffect(() => {
    findRelatedBookmarks();
  }, [findRelatedBookmarks]);

  // Group bookmarks by relationship type for analytics
  const relationshipStats = useMemo(() => {
    const stats: Record<string, { count: number; avgSimilarity: number }> = {};
    
    relatedBookmarks.forEach(bookmark => {
      const type = bookmark.relationship_type;
      if (!stats[type]) {
        stats[type] = { count: 0, avgSimilarity: 0 };
      }
      stats[type].count++;
      stats[type].avgSimilarity += bookmark.similarity_score;
    });

    // Calculate averages
    Object.keys(stats).forEach(type => {
      stats[type].avgSimilarity = stats[type].avgSimilarity / stats[type].count;
    });

    return stats;
  }, [relatedBookmarks]);

  // Handle manual link creation
  const handleCreateManualLink = useCallback((toBookmarkId: string) => {
    if (onCreateManualLink) {
      onCreateManualLink(targetBookmark.id, toBookmarkId);
      // Refresh related bookmarks after creating manual link
      setTimeout(() => findRelatedBookmarks(), 500);
    }
  }, [targetBookmark.id, onCreateManualLink, findRelatedBookmarks]);

  // Get suggestions for improving relationships
  const suggestions = useMemo(() => {
    if (!analytics) return [];

    const suggestions: string[] = [];

    if (analytics.totalRelated < 3) {
      suggestions.push("Consider adding more tags to help find related bookmarks");
    }

    if (analytics.avgSimilarityScore < 0.3) {
      suggestions.push("Organize bookmarks into folders with similar topics");
    }

    if ((targetBookmark.tags || []).length < 2) {
      suggestions.push("Add more descriptive tags to this bookmark");
    }

    const domainCount = relatedBookmarks.filter(b => b.relationship_type === 'domain_similarity').length;
    if (domainCount === 0 && relatedBookmarks.length > 0) {
      suggestions.push("You might find more related content on the same website");
    }

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }, [analytics, targetBookmark, relatedBookmarks]);

  const getRelationshipTypeLabel = (type: string): string => {
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

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <RelatedList
          bookmarks={relatedBookmarks}
          isLoading={isLoading}
          onRefresh={findRelatedBookmarks}
          onBookmarkVisit={onBookmarkVisit}
          onBookmarkToggleFavorite={onBookmarkToggleFavorite}
          onBookmarkViewDetails={onBookmarkViewDetails}
          compact={true}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="related" className="flex items-center space-x-2">
            <Link2 className="h-4 w-4" />
            <span>Related ({relatedBookmarks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="related" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Related Bookmarks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bookmarks similar to "{targetBookmark.title}"
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="default" size="sm" onClick={() => window.open('/dashboard?action=add-bookmark&related=' + encodeURIComponent(targetBookmark.id), '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
              <Button variant="outline" size="sm" onClick={findRelatedBookmarks} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <RelatedList
            bookmarks={relatedBookmarks}
            isLoading={isLoading}
            onRefresh={findRelatedBookmarks}
            onBookmarkVisit={onBookmarkVisit}
            onBookmarkToggleFavorite={onBookmarkToggleFavorite}
            onBookmarkViewDetails={onBookmarkViewDetails}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overview Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Related</CardTitle>
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalRelated || 0}</div>
                <p className="text-xs text-muted-foreground">
                  from {allBookmarks.length} total bookmarks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Similarity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics ? Math.round(analytics.avgSimilarityScore * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  relationship strength
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relationship Types</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(relationshipStats).length}</div>
                <p className="text-xs text-muted-foreground">
                  different connection types
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Relationship Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Relationship Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(relationshipStats).map(([type, stats]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {getRelationshipTypeLabel(type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {stats.count} bookmark{stats.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {Math.round(stats.avgSimilarity * 100)}% avg
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">{suggestion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Great! Your bookmark organization looks well-connected.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Related */}
          {relatedBookmarks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Similar Bookmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedBookmarks.slice(0, 5).map((bookmark) => (
                    <div key={bookmark.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{bookmark.title}</p>
                        <p className="text-xs text-gray-500 truncate">{bookmark.relationship_reason}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        {Math.round(bookmark.similarity_score * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 