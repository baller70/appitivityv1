import { BookmarkWithRelations } from '../../lib/services/bookmarks';
import {
  RelatedBookmark,
  RelationshipType,
  RelatedBookmarksFilter,
  RelatedBookmarksSettings,
  SimilarityAnalysis,
  DEFAULT_RELATED_SETTINGS,
} from './related-types';

export class RelatedBookmarksService {
  private settings: RelatedBookmarksSettings;

  constructor(settings?: Partial<RelatedBookmarksSettings>) {
    this.settings = { ...DEFAULT_RELATED_SETTINGS, ...settings };
  }

  /**
   * Find related bookmarks for a given bookmark
   */
  async findRelatedBookmarks(
    targetBookmark: BookmarkWithRelations,
    allBookmarks: BookmarkWithRelations[],
    filter?: Partial<RelatedBookmarksFilter>
  ): Promise<RelatedBookmark[]> {
    const appliedFilter = { ...this.getDefaultFilter(), ...filter };
    
    // Filter out the target bookmark and apply basic filters
    const candidateBookmarks = allBookmarks.filter(bookmark => {
      if (bookmark.id === targetBookmark.id) return false;
      if (appliedFilter.favoriteOnly && !bookmark.is_favorite) return false;
      if (appliedFilter.excludeFolders.includes(bookmark.folder?.id || '')) return false;
      if (appliedFilter.includeFolders.length > 0 && 
          !appliedFilter.includeFolders.includes(bookmark.folder?.id || '')) return false;
      
      // Check tag filters
      const bookmarkTagIds = bookmark.tags?.map(tag => tag.id) || [];
      if (appliedFilter.excludeTags.some(tagId => bookmarkTagIds.includes(tagId))) return false;
      if (appliedFilter.includeTags.length > 0 && 
          !appliedFilter.includeTags.some(tagId => bookmarkTagIds.includes(tagId))) return false;
      
      return true;
    });

    // Analyze similarity for each candidate
    const relatedBookmarks: RelatedBookmark[] = [];
    
    for (const candidate of candidateBookmarks) {
      const analysis = this.analyzeSimilarity(targetBookmark, candidate);
      
      if (analysis.overallScore >= appliedFilter.minSimilarityScore) {
        const primaryRelationship = this.getPrimaryRelationshipType(analysis);
        
        if (appliedFilter.relationshipTypes.includes(primaryRelationship)) {
          relatedBookmarks.push({
            ...candidate,
            similarity_score: analysis.overallScore,
            relationship_type: primaryRelationship,
            relationship_reason: this.getRelationshipReason(analysis, primaryRelationship),
          });
        }
      }
    }

    // Sort and limit results
    return this.sortAndLimitResults(relatedBookmarks, appliedFilter);
  }

  /**
   * Analyze similarity between two bookmarks
   */
  private analyzeSimilarity(
    bookmark1: BookmarkWithRelations,
    bookmark2: BookmarkWithRelations
  ): SimilarityAnalysis {
    const analysis: SimilarityAnalysis = {
      tagSimilarity: this.calculateTagSimilarity(bookmark1, bookmark2),
      contentSimilarity: this.calculateContentSimilarity(bookmark1, bookmark2),
      domainSimilarity: this.calculateDomainSimilarity(bookmark1, bookmark2),
      temporalSimilarity: this.calculateTemporalSimilarity(bookmark1, bookmark2),
      behaviorSimilarity: this.calculateBehaviorSimilarity(bookmark1, bookmark2),
      overallScore: 0,
      topReasons: [],
    };

    // Calculate weighted overall score
    analysis.overallScore = this.calculateOverallScore(analysis);
    analysis.topReasons = this.getTopReasons(analysis);

    return analysis;
  }

  /**
   * Calculate tag similarity (Jaccard coefficient)
   */
  private calculateTagSimilarity(
    bookmark1: BookmarkWithRelations,
    bookmark2: BookmarkWithRelations
  ): number {
    const tags1 = new Set(bookmark1.tags?.map(tag => tag.id.toLowerCase()) || []);
    const tags2 = new Set(bookmark2.tags?.map(tag => tag.id.toLowerCase()) || []);
    
    if (tags1.size === 0 && tags2.size === 0) return 0;
    
    const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
    const union = new Set([...tags1, ...tags2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate content similarity based on title and description
   */
  private calculateContentSimilarity(
    bookmark1: BookmarkWithRelations,
    bookmark2: BookmarkWithRelations
  ): number {
    const text1 = `${bookmark1.title} ${bookmark1.description || ''}`.toLowerCase();
    const text2 = `${bookmark2.title} ${bookmark2.description || ''}`.toLowerCase();
    
    // Simple keyword overlap calculation
    const words1 = new Set(text1.split(/\s+/).filter(word => word.length > 3));
    const words2 = new Set(text2.split(/\s+/).filter(word => word.length > 3));
    
    if (words1.size === 0 && words2.size === 0) return 0;
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate domain similarity
   */
  private calculateDomainSimilarity(
    bookmark1: BookmarkWithRelations,
    bookmark2: BookmarkWithRelations
  ): number {
    try {
      const domain1 = new URL(bookmark1.url).hostname.toLowerCase();
      const domain2 = new URL(bookmark2.url).hostname.toLowerCase();
      
      if (domain1 === domain2) return 1.0;
      
      // Check for subdomain similarity
      const parts1 = domain1.split('.');
      const parts2 = domain2.split('.');
      
      // Check if they share the same root domain
      if (parts1.length >= 2 && parts2.length >= 2) {
        const root1 = parts1.slice(-2).join('.');
        const root2 = parts2.slice(-2).join('.');
        if (root1 === root2) return 0.7;
      }
      
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate temporal similarity based on creation/visit dates
   */
  private calculateTemporalSimilarity(
    bookmark1: BookmarkWithRelations,
    bookmark2: BookmarkWithRelations
  ): number {
    try {
      const date1 = new Date(bookmark1.last_visited || bookmark1.created_at);
      const date2 = new Date(bookmark2.last_visited || bookmark2.created_at);
      
      const timeDiff = Math.abs(date1.getTime() - date2.getTime());
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      // Higher similarity for bookmarks created/visited closer in time
      if (daysDiff <= 1) return 1.0;
      if (daysDiff <= 7) return 0.8;
      if (daysDiff <= 30) return 0.5;
      if (daysDiff <= 90) return 0.2;
      
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate behavior similarity based on visit count and patterns
   */
  private calculateBehaviorSimilarity(
    bookmark1: BookmarkWithRelations,
    bookmark2: BookmarkWithRelations
  ): number {
    const visits1 = bookmark1.visit_count || 0;
    const visits2 = bookmark2.visit_count || 0;
    
    if (visits1 === 0 && visits2 === 0) return 0.5;
    
    // Normalize visit counts to 0-1 range and calculate similarity
    const maxVisits = Math.max(visits1, visits2);
    const minVisits = Math.min(visits1, visits2);
    
    return maxVisits > 0 ? minVisits / maxVisits : 0;
  }

  /**
   * Calculate weighted overall similarity score
   */
  private calculateOverallScore(analysis: SimilarityAnalysis): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const criteria of this.settings.criteria) {
      if (!criteria.enabled) continue;

      let score = 0;
      switch (criteria.type) {
        case 'tag_similarity':
          score = analysis.tagSimilarity;
          break;
        case 'content_similarity':
          score = analysis.contentSimilarity;
          break;
        case 'domain_similarity':
          score = analysis.domainSimilarity;
          break;
        case 'temporal_similarity':
          score = analysis.temporalSimilarity;
          break;
        case 'behavior_similarity':
          score = analysis.behaviorSimilarity;
          break;
        case 'folder_similarity':
          // This would be calculated separately if needed
          score = 0;
          break;
        case 'manual_link':
          // This would be checked separately
          score = 0;
          break;
      }

      if (score >= criteria.threshold) {
        totalScore += score * criteria.weight;
        totalWeight += criteria.weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Get the primary relationship type based on highest individual score
   */
  private getPrimaryRelationshipType(analysis: SimilarityAnalysis): RelationshipType {
    const scores = [
      { type: 'tag_similarity' as RelationshipType, score: analysis.tagSimilarity },
      { type: 'content_similarity' as RelationshipType, score: analysis.contentSimilarity },
      { type: 'domain_similarity' as RelationshipType, score: analysis.domainSimilarity },
      { type: 'temporal_similarity' as RelationshipType, score: analysis.temporalSimilarity },
      { type: 'behavior_similarity' as RelationshipType, score: analysis.behaviorSimilarity },
    ];

    return scores.reduce((max, current) => 
      current.score > max.score ? current : max
    ).type;
  }

  /**
   * Get human-readable relationship reason
   */
  private getRelationshipReason(analysis: SimilarityAnalysis, primaryType: RelationshipType): string {
    const score = Math.round(analysis.overallScore * 100);
    
    switch (primaryType) {
      case 'tag_similarity':
        return `Shares ${Math.round(analysis.tagSimilarity * 100)}% of tags (${score}% overall similarity)`;
      case 'content_similarity':
        return `Similar content and keywords (${score}% overall similarity)`;
      case 'domain_similarity':
        return `Same domain or website (${score}% overall similarity)`;
      case 'temporal_similarity':
        return `Created or visited around the same time (${score}% overall similarity)`;
      case 'behavior_similarity':
        return `Similar usage patterns (${score}% overall similarity)`;
      case 'folder_similarity':
        return `In the same folder (${score}% overall similarity)`;
      case 'manual_link':
        return `Manually linked bookmark (${score}% overall similarity)`;
      default:
        return `${score}% similarity`;
    }
  }

  /**
   * Get top reasons for similarity
   */
  private getTopReasons(analysis: SimilarityAnalysis): string[] {
    const reasons: Array<{ reason: string; score: number }> = [];

    if (analysis.tagSimilarity > 0.1) {
      reasons.push({ reason: 'Shared tags', score: analysis.tagSimilarity });
    }
    if (analysis.contentSimilarity > 0.1) {
      reasons.push({ reason: 'Similar content', score: analysis.contentSimilarity });
    }
    if (analysis.domainSimilarity > 0.1) {
      reasons.push({ reason: 'Same domain', score: analysis.domainSimilarity });
    }
    if (analysis.temporalSimilarity > 0.1) {
      reasons.push({ reason: 'Similar timing', score: analysis.temporalSimilarity });
    }
    if (analysis.behaviorSimilarity > 0.1) {
      reasons.push({ reason: 'Usage patterns', score: analysis.behaviorSimilarity });
    }

    return reasons
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.reason);
  }

  /**
   * Sort and limit results based on filter
   */
  private sortAndLimitResults(
    relatedBookmarks: RelatedBookmark[],
    filter: RelatedBookmarksFilter
  ): RelatedBookmark[] {
    // Sort by the specified criteria
    relatedBookmarks.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (this.settings.sortBy) {
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
        return this.settings.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        return this.settings.sortOrder === 'desc' 
          ? bValue.toString().localeCompare(aValue.toString())
          : aValue.toString().localeCompare(bValue.toString());
      }
    });

    // Limit results
    return relatedBookmarks.slice(0, filter.maxResults);
  }

  /**
   * Get default filter
   */
  private getDefaultFilter(): RelatedBookmarksFilter {
    return {
      relationshipTypes: ['tag_similarity', 'folder_similarity', 'content_similarity', 'domain_similarity', 'manual_link'],
      minSimilarityScore: 0.1,
      maxResults: 20,
      excludeFolders: [],
      includeFolders: [],
      excludeTags: [],
      includeTags: [],
      favoriteOnly: false,
    };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<RelatedBookmarksSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): RelatedBookmarksSettings {
    return { ...this.settings };
  }
} 