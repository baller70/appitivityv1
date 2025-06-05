// Related Bookmarks Types
export interface RelatedBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  preview_image?: string;
  visit_count: number;
  last_visited?: string;
  created_at: string;
  updated_at: string;
  folder?: {
    id: string;
    name: string;
    color?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  is_favorite: boolean;
  similarity_score: number;
  relationship_type: RelationshipType;
  relationship_reason: string;
}

export type RelationshipType = 
  | 'tag_similarity'      // Same/similar tags
  | 'folder_similarity'   // Same folder
  | 'content_similarity'  // Similar content/keywords
  | 'domain_similarity'   // Same domain/subdomain
  | 'temporal_similarity' // Visited around the same time
  | 'behavior_similarity' // Similar usage patterns
  | 'manual_link';        // Manually linked by user

export interface RelationshipCriteria {
  type: RelationshipType;
  enabled: boolean;
  weight: number; // 0-1, how much this criteria affects similarity score
  threshold: number; // Minimum score required for this criteria
}

export interface RelatedBookmarksFilter {
  relationshipTypes: RelationshipType[];
  minSimilarityScore: number;
  maxResults: number;
  excludeFolders: string[];
  includeFolders: string[];
  excludeTags: string[];
  includeTags: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  favoriteOnly: boolean;
}

export interface RelatedBookmarksSettings {
  criteria: RelationshipCriteria[];
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  showPreviewImages: boolean;
  showVisitCount: boolean;
  showLastVisited: boolean;
  groupByRelationship: boolean;
  sortBy: 'similarity' | 'recent' | 'popular' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

export interface ManualLink {
  id: string;
  source_bookmark_id: string;
  target_bookmark_id: string;
  relationship_note?: string;
  created_at: string;
  created_by: string;
}

export interface SimilarityAnalysis {
  tagSimilarity: number;
  contentSimilarity: number;
  domainSimilarity: number;
  temporalSimilarity: number;
  behaviorSimilarity: number;
  overallScore: number;
  topReasons: string[];
}

// Default settings
export const DEFAULT_RELATED_SETTINGS: RelatedBookmarksSettings = {
  criteria: [
    { type: 'tag_similarity', enabled: true, weight: 0.3, threshold: 0.2 },
    { type: 'folder_similarity', enabled: true, weight: 0.25, threshold: 0.1 },
    { type: 'content_similarity', enabled: true, weight: 0.2, threshold: 0.15 },
    { type: 'domain_similarity', enabled: true, weight: 0.15, threshold: 0.5 },
    { type: 'temporal_similarity', enabled: false, weight: 0.05, threshold: 0.1 },
    { type: 'behavior_similarity', enabled: false, weight: 0.05, threshold: 0.1 },
    { type: 'manual_link', enabled: true, weight: 1.0, threshold: 0.0 },
  ],
  autoRefresh: true,
  refreshInterval: 30,
  showPreviewImages: true,
  showVisitCount: true,
  showLastVisited: true,
  groupByRelationship: false,
  sortBy: 'similarity',
  sortOrder: 'desc',
};

export const DEFAULT_FILTER: RelatedBookmarksFilter = {
  relationshipTypes: ['tag_similarity', 'folder_similarity', 'content_similarity', 'domain_similarity', 'manual_link'],
  minSimilarityScore: 0.1,
  maxResults: 20,
  excludeFolders: [],
  includeFolders: [],
  excludeTags: [],
  includeTags: [],
  favoriteOnly: false,
}; 