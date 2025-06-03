import { supabase } from '../supabase';
import type { BookmarkWithRelations } from './bookmarks';

interface RelationshipMetrics {
  similarity: number;
  sharedTags: number;
  domainMatch: boolean;
  temporalProximity: number;
  contentSimilarity: number;
}

interface BookmarkRelationship {
  id: string;
  from_bookmark_id: string;
  to_bookmark_id: string;
  relationship_type: 'similar' | 'related' | 'duplicate' | 'sequential' | 'thematic' | 'temporal';
  strength: number;
  metadata: RelationshipMetrics;
  created_at: string;
  updated_at: string;
}

interface SimilarityResult {
  bookmark: BookmarkWithRelations;
  similarity: number;
  reasons: string[];
}

interface ClusterResult {
  id: string;
  name: string;
  bookmarks: BookmarkWithRelations[];
  keywords: string[];
  avgSimilarity: number;
}

export class BookmarkRelationshipService {
  constructor(private userId: string) {}

  async analyzeBookmarkRelationships(): Promise<{ success: boolean; relationships: number }> {
    try {
      // Get all user bookmarks
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          title,
          url,
          description,
          tags:bookmark_tags(tag:tags(name)),
          created_at
        `)
        .eq('user_id', this.userId);

      if (error || !bookmarks) {
        throw error || new Error('No bookmarks found');
      }

      // Clear existing relationships
      await supabase
        .from('bookmark_relationships')
        .delete()
        .eq('from_bookmark_id', this.userId);

      let relationshipsCreated = 0;

      // Analyze relationships between all pairs
      for (let i = 0; i < bookmarks.length; i++) {
        for (let j = i + 1; j < bookmarks.length; j++) {
          const bookmark1 = bookmarks[i];
          const bookmark2 = bookmarks[j];
          
          const metrics = this.calculateSimilarity(bookmark1, bookmark2);
          
          if (metrics.similarity > 0.3) { // Threshold for creating relationship
            await this.createRelationship(
              bookmark1.id,
              bookmark2.id,
              this.determineRelationshipType(metrics),
              metrics.similarity,
              metrics
            );
            relationshipsCreated++;
          }
        }
      }

      return { success: true, relationships: relationshipsCreated };
    } catch (error) {
      console.error('Error analyzing relationships:', error);
      return { success: false, relationships: 0 };
    }
  }

  private calculateSimilarity(bookmark1: BookmarkWithRelations, bookmark2: BookmarkWithRelations): RelationshipMetrics {
    const metrics: RelationshipMetrics = {
      similarity: 0,
      sharedTags: 0,
      domainMatch: false,
      temporalProximity: 0,
      contentSimilarity: 0
    };

    // Calculate shared tags
    const tags1 = bookmark1.tags?.map(t => t.name) || [];
    const tags2 = bookmark2.tags?.map(t => t.name) || [];
    const sharedTags = tags1.filter(tag => tags2.includes(tag));
    metrics.sharedTags = sharedTags.length;

    // Check domain match
    try {
      const domain1 = new URL(bookmark1.url).hostname;
      const domain2 = new URL(bookmark2.url).hostname;
      metrics.domainMatch = domain1 === domain2;
    } catch {
      metrics.domainMatch = false;
    }

    // Calculate temporal proximity
    if (bookmark1.created_at && bookmark2.created_at) {
      const date1 = new Date(bookmark1.created_at);
      const date2 = new Date(bookmark2.created_at);
      const daysDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
      metrics.temporalProximity = Math.max(0, 1 - daysDiff / 30); // Similarity decreases over 30 days
    }

    // Calculate content similarity
    metrics.contentSimilarity = this.calculateTextSimilarity(
      `${bookmark1.title} ${bookmark1.description || ''}`,
      `${bookmark2.title} ${bookmark2.description || ''}`
    );

    // Calculate overall similarity
    const weights = {
      tags: 0.4,
      domain: 0.2,
      temporal: 0.1,
      content: 0.3
    };

    metrics.similarity = 
      (metrics.sharedTags > 0 ? weights.tags : 0) +
      (metrics.domainMatch ? weights.domain : 0) +
      (metrics.temporalProximity * weights.temporal) +
      (metrics.contentSimilarity * weights.content);

    return metrics;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple word-based similarity calculation
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private determineRelationshipType(metrics: RelationshipMetrics): BookmarkRelationship['relationship_type'] {
    if (metrics.domainMatch && metrics.contentSimilarity > 0.7) {
      return 'duplicate';
    } else if (metrics.sharedTags > 2) {
      return 'thematic';
    } else if (metrics.temporalProximity > 0.8) {
      return 'temporal';
    } else if (metrics.contentSimilarity > 0.5) {
      return 'similar';
    } else {
      return 'related';
    }
  }

  private async createRelationship(
    fromBookmarkId: string,
    toBookmarkId: string,
    type: BookmarkRelationship['relationship_type'],
    strength: number,
    metadata: RelationshipMetrics
  ): Promise<void> {
    const { error } = await supabase
      .from('bookmark_relationships')
      .insert({
        from_bookmark_id: fromBookmarkId,
        to_bookmark_id: toBookmarkId,
        relationship_type: type,
        strength,
        metadata: metadata as unknown as Record<string, unknown>
      });

    if (error) {
      console.warn('Failed to create relationship:', error);
    }
  }

  async getRelatedBookmarks(bookmarkId: string, limit = 10): Promise<SimilarityResult[]> {
    try {
      const { data: relationships, error } = await supabase
        .from('bookmark_relationships')
        .select(`
          to_bookmark_id,
          relationship_type,
          strength,
          metadata,
          bookmark:bookmarks!to_bookmark_id(
            id,
            title,
            url,
            description,
            created_at,
            tags:bookmark_tags(tag:tags(name))
          )
        `)
        .eq('from_bookmark_id', bookmarkId)
        .order('strength', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (relationships || [])
        .filter(rel => rel.bookmark)
        .map(rel => ({
          bookmark: rel.bookmark as BookmarkWithRelations,
          similarity: rel.strength,
          reasons: this.generateSimilarityReasons(rel.metadata as RelationshipMetrics, rel.relationship_type)
        }));
    } catch (error) {
      console.error('Error getting related bookmarks:', error);
      return [];
    }
  }

  private generateSimilarityReasons(metadata: RelationshipMetrics, type: string): string[] {
    const reasons: string[] = [];
    
    if (metadata.sharedTags > 0) {
      reasons.push(`${metadata.sharedTags} shared tag${metadata.sharedTags > 1 ? 's' : ''}`);
    }
    
    if (metadata.domainMatch) {
      reasons.push('Same website domain');
    }
    
    if (metadata.temporalProximity > 0.5) {
      reasons.push('Bookmarked around the same time');
    }
    
    if (metadata.contentSimilarity > 0.5) {
      reasons.push('Similar content');
    }
    
    if (type === 'thematic') {
      reasons.push('Similar topic');
    }
    
    return reasons;
  }

  async findSimilarBookmarks(bookmarkId: string, threshold = 0.3): Promise<SimilarityResult[]> {
    try {
      // Get the target bookmark
      const { data: targetBookmark, error: targetError } = await supabase
        .from('bookmarks')
        .select(`
          id,
          title,
          url,
          description,
          tags:bookmark_tags(tag:tags(name)),
          created_at
        `)
        .eq('id', bookmarkId)
        .single();

      if (targetError || !targetBookmark) {
        throw targetError || new Error('Bookmark not found');
      }

      // Get all other bookmarks for comparison
      const { data: allBookmarks, error: allError } = await supabase
        .from('bookmarks')
        .select(`
          id,
          title,
          url,
          description,
          tags:bookmark_tags(tag:tags(name)),
          created_at
        `)
        .eq('user_id', this.userId)
        .neq('id', bookmarkId);

      if (allError || !allBookmarks) {
        throw allError || new Error('No bookmarks found');
      }

      const similarities: SimilarityResult[] = [];

      for (const bookmark of allBookmarks) {
        const metrics = this.calculateSimilarity(targetBookmark as BookmarkWithRelations, bookmark as BookmarkWithRelations);
        
        if (metrics.similarity >= threshold) {
          similarities.push({
            bookmark: bookmark as BookmarkWithRelations,
            similarity: metrics.similarity,
            reasons: this.generateSimilarityReasons(metrics, this.determineRelationshipType(metrics))
          });
        }
      }

      return similarities.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error finding similar bookmarks:', error);
      return [];
    }
  }

  async clusterBookmarks(): Promise<ClusterResult[]> {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          title,
          url,
          description,
          tags:bookmark_tags(tag:tags(name)),
          created_at
        `)
        .eq('user_id', this.userId);

      if (error || !bookmarks) {
        throw error || new Error('No bookmarks found');
      }

      // Simple clustering based on shared tags
      const clusters = new Map<string, ClusterResult>();
      
      for (const bookmark of bookmarks) {
        const tags = bookmark.tags?.map(t => t.name) || [];
        
        if (tags.length === 0) {
          // Add to "untagged" cluster
          const clusterId = 'untagged';
          if (!clusters.has(clusterId)) {
            clusters.set(clusterId, {
              id: clusterId,
              name: 'Untagged',
              bookmarks: [],
              keywords: [],
              avgSimilarity: 0
            });
          }
          clusters.get(clusterId)!.bookmarks.push(bookmark as BookmarkWithRelations);
        } else {
          // Create cluster for primary tag
          const primaryTag = tags[0];
          if (!clusters.has(primaryTag)) {
            clusters.set(primaryTag, {
              id: primaryTag,
              name: primaryTag,
              bookmarks: [],
              keywords: tags,
              avgSimilarity: 0
            });
          }
          clusters.get(primaryTag)!.bookmarks.push(bookmark as BookmarkWithRelations);
        }
      }

      // Filter out clusters with less than 2 bookmarks
      return Array.from(clusters.values())
        .filter(cluster => cluster.bookmarks.length >= 2)
        .sort((a, b) => b.bookmarks.length - a.bookmarks.length);
    } catch (error) {
      console.error('Error clustering bookmarks:', error);
      return [];
    }
  }

  async findDuplicates(): Promise<BookmarkWithRelations[][]> {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          title,
          url,
          description,
          tags:bookmark_tags(tag:tags(name)),
          created_at
        `)
        .eq('user_id', this.userId);

      if (error || !bookmarks) {
        throw error || new Error('No bookmarks found');
      }

      const duplicateGroups: BookmarkWithRelations[][] = [];
      const processed = new Set<string>();

      for (let i = 0; i < bookmarks.length; i++) {
        if (processed.has(bookmarks[i].id)) continue;
        
        const duplicates: BookmarkWithRelations[] = [bookmarks[i] as BookmarkWithRelations];
        processed.add(bookmarks[i].id);

        for (let j = i + 1; j < bookmarks.length; j++) {
          if (processed.has(bookmarks[j].id)) continue;

          // Check for URL match or very high similarity
          if (
            bookmarks[i].url === bookmarks[j].url ||
            this.calculateSimilarity(bookmarks[i] as BookmarkWithRelations, bookmarks[j] as BookmarkWithRelations).similarity > 0.9
          ) {
            duplicates.push(bookmarks[j] as BookmarkWithRelations);
            processed.add(bookmarks[j].id);
          }
        }

        if (duplicates.length > 1) {
          duplicateGroups.push(duplicates);
        }
      }

      return duplicateGroups;
    } catch (error) {
      console.error('Error finding duplicates:', error);
      return [];
    }
  }

  async getRelationshipStats(): Promise<{
    totalRelationships: number;
    strongRelationships: number;
    clusters: number;
    duplicates: number;
  }> {
    try {
      const [
        relationshipsResult,
        strongRelationshipsResult,
        clusters,
        duplicates
      ] = await Promise.all([
        supabase
          .from('bookmark_relationships')
          .select('id', { count: 'exact' })
          .eq('from_bookmark_id', this.userId),
        supabase
          .from('bookmark_relationships')
          .select('id', { count: 'exact' })
          .eq('from_bookmark_id', this.userId)
          .gt('strength', 0.7),
        this.clusterBookmarks(),
        this.findDuplicates()
      ]);

      return {
        totalRelationships: relationshipsResult.count || 0,
        strongRelationships: strongRelationshipsResult.count || 0,
        clusters: clusters.length,
        duplicates: duplicates.length
      };
    } catch (error) {
      console.error('Error getting relationship stats:', error);
      return {
        totalRelationships: 0,
        strongRelationships: 0,
        clusters: 0,
        duplicates: 0
      };
    }
  }
} 