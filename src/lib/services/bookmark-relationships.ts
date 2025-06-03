import { supabaseAdmin } from '../supabase';
import { normalizeUserId } from '../uuid-compat';
import type { BookmarkRelationship as DBBookmarkRelationship } from '../../types/supabase';

export interface BookmarkRelationship {
  id: string;
  bookmark_id: string;
  related_bookmark_id: string;
  relationship_type: 'related' | 'similar' | 'dependency' | 'reference';
  created_at: string | null;
  created_by: string | null;
}

export interface RelatedBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  relationship_type: string;
  similarity_score?: number;
  folder_name?: string;
}

export class BookmarkRelationshipService {
  private userId: string;

  constructor(userId: string) {
    this.userId = normalizeUserId(userId);
  }

  async getRelatedBookmarks(bookmarkId: string): Promise<RelatedBookmark[]> {
    try {
      console.log('Fetching related bookmarks for:', bookmarkId);
      
      const { data, error } = await supabaseAdmin
        .from('bookmark_relationships')
        .select(`
          id,
          relationship_type,
          related_bookmark_id,
          bookmarks!related_bookmark_id (
            id,
            title,
            url,
            description,
            favicon_url,
            folder:folders (
              name
            )
          )
        `)
        .eq('bookmark_id', bookmarkId);

      if (error) {
        console.error('Error fetching related bookmarks:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No related bookmarks found for bookmark:', bookmarkId);
        return [];
      }

      const result = (data || []).map((rel: any) => ({
        id: rel.bookmarks?.id || '',
        title: rel.bookmarks?.title || 'Untitled',
        url: rel.bookmarks?.url || '',
        description: rel.bookmarks?.description,
        favicon_url: rel.bookmarks?.favicon_url,
        relationship_type: rel.relationship_type || 'related',
        folder_name: rel.bookmarks?.folder?.name,
        // Mock similarity score - in real app this would be calculated
        similarity_score: Math.floor(Math.random() * 20) + 80
      })).filter(item => item.id); // Filter out invalid entries

      console.log('Successfully fetched related bookmarks:', result.length);
      return result;
    } catch (error) {
      console.error('Unexpected error in getRelatedBookmarks:', error);
      return [];
    }
  }

  async addRelationship(
    bookmarkId: string, 
    relatedBookmarkId: string, 
    relationshipType: 'related' | 'similar' | 'dependency' | 'reference' = 'related'
  ): Promise<BookmarkRelationship> {
    const { data, error } = await supabaseAdmin
      .from('bookmark_relationships')
      .insert({
        bookmark_id: bookmarkId,
        related_bookmark_id: relatedBookmarkId,
        relationship_type: relationshipType,
        created_by: this.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding bookmark relationship:', error);
      throw error;
    }

    return {
      ...data,
      relationship_type: (data.relationship_type || 'related') as 'related' | 'similar' | 'dependency' | 'reference'
    };
  }

  async removeRelationship(bookmarkId: string, relatedBookmarkId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('bookmark_relationships')
      .delete()
      .eq('bookmark_id', bookmarkId)
      .eq('related_bookmark_id', relatedBookmarkId);

    if (error) {
      console.error('Error removing bookmark relationship:', error);
      throw error;
    }
  }

  async searchBookmarksForRelation(bookmarkId: string, searchTerm: string): Promise<RelatedBookmark[]> {
    try {
      console.log('Searching bookmarks for relation:', { bookmarkId, searchTerm });
      
      const { data, error } = await supabaseAdmin
        .from('bookmarks')
        .select(`
          id,
          title,
          url,
          description,
          favicon_url,
          folder:folders (
            name
          )
        `)
        .eq('user_id', this.userId)
        .neq('id', bookmarkId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,url.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('Error searching bookmarks:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No search results found for:', searchTerm);
        return [];
      }

      const result = (data || []).map((bookmark: any) => ({
        id: bookmark.id,
        title: bookmark.title || 'Untitled',
        url: bookmark.url || '',
        description: bookmark.description,
        favicon_url: bookmark.favicon_url,
        relationship_type: 'related',
        folder_name: bookmark.folder?.name,
        similarity_score: Math.floor(Math.random() * 30) + 70
      })).filter(item => item.id);

      console.log('Search results found:', result.length);
      return result;
    } catch (error) {
      console.error('Unexpected error in searchBookmarksForRelation:', error);
      return [];
    }
  }

  async getBookmarksByIds(bookmarkIds: string[]): Promise<RelatedBookmark[]> {
    if (bookmarkIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .select(`
        id,
        title,
        url,
        description,
        favicon_url,
        folder:folders (
          name
        )
      `)
      .eq('user_id', this.userId)
      .in('id', bookmarkIds);

    if (error) {
      console.error('Error fetching bookmarks by IDs:', error);
      throw error;
    }

    return (data || []).map((bookmark: any) => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      favicon_url: bookmark.favicon_url,
      relationship_type: 'related',
      folder_name: bookmark.folder?.name,
      similarity_score: Math.floor(Math.random() * 20) + 80
    }));
  }
} 