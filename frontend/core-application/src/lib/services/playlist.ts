import { supabase } from '@/lib/supabase';
import { 
  Playlist, 
  PlaylistBookmark, 
  CreatePlaylistData, 
  UpdatePlaylistData, 
  AddBookmarkToPlaylistData,
  ReorderPlaylistBookmarkData,
  PlaylistStats,
  PlaylistLaunchOptions
} from '@/types/playlist';

export class PlaylistService {
  // Create a new playlist
  static async createPlaylist(userId: string, data: CreatePlaylistData): Promise<Playlist> {
    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        color: data.color || '#3B82F6',
        icon: data.icon || 'list',
        is_favorite: data.is_favorite || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create playlist: ${error.message}`);
    }

    return playlist;
  }

  // Get all playlists for a user
  static async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_bookmarks(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch playlists: ${error.message}`);
    }

    return playlists.map(playlist => ({
      ...playlist,
      bookmark_count: playlist.playlist_bookmarks?.[0]?.count || 0
    }));
  }

  // Get a specific playlist with bookmarks
  static async getPlaylistWithBookmarks(playlistId: string): Promise<Playlist | null> {
    const { data: playlist, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_bookmarks(
          id,
          position,
          added_at,
          bookmark:bookmarks(
            id,
            title,
            url,
            description,
            favicon_url,
            folder_id,
            tags,
            is_favorite,
            visit_count,
            last_visited_at,
            created_at
          )
        )
      `)
      .eq('id', playlistId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch playlist: ${error.message}`);
    }

    // Sort bookmarks by position
    const sortedBookmarks = playlist.playlist_bookmarks
      .sort((a: any, b: any) => a.position - b.position);

    return {
      ...playlist,
      bookmarks: sortedBookmarks,
      bookmark_count: sortedBookmarks.length
    };
  }

  // Update a playlist
  static async updatePlaylist(playlistId: string, data: UpdatePlaylistData): Promise<Playlist> {
    const { data: playlist, error } = await supabase
      .from('playlists')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update playlist: ${error.message}`);
    }

    return playlist;
  }

  // Delete a playlist
  static async deletePlaylist(playlistId: string): Promise<void> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      throw new Error(`Failed to delete playlist: ${error.message}`);
    }
  }

  // Add bookmark to playlist
  static async addBookmarkToPlaylist(data: AddBookmarkToPlaylistData): Promise<PlaylistBookmark> {
    // Get the next position if not specified
    let position = data.position;
    if (position === undefined) {
      const { data: maxPosition } = await supabase
        .from('playlist_bookmarks')
        .select('position')
        .eq('playlist_id', data.playlist_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();
      
      position = (maxPosition?.position || 0) + 1;
    }

    const { data: playlistBookmark, error } = await supabase
      .from('playlist_bookmarks')
      .insert({
        playlist_id: data.playlist_id,
        bookmark_id: data.bookmark_id,
        position
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add bookmark to playlist: ${error.message}`);
    }

    return playlistBookmark;
  }

  // Remove bookmark from playlist
  static async removeBookmarkFromPlaylist(playlistId: string, bookmarkId: string): Promise<void> {
    const { error } = await supabase
      .from('playlist_bookmarks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('bookmark_id', bookmarkId);

    if (error) {
      throw new Error(`Failed to remove bookmark from playlist: ${error.message}`);
    }
  }

  // Reorder bookmarks in playlist
  static async reorderPlaylistBookmarks(
    playlistId: string, 
    bookmarkIds: string[]
  ): Promise<void> {
    const updates = bookmarkIds.map((bookmarkId, index) => ({
      playlist_id: playlistId,
      bookmark_id: bookmarkId,
      position: index + 1
    }));

    const { error } = await supabase
      .from('playlist_bookmarks')
      .upsert(updates, { 
        onConflict: 'playlist_id,bookmark_id',
        ignoreDuplicates: false 
      });

    if (error) {
      throw new Error(`Failed to reorder playlist bookmarks: ${error.message}`);
    }
  }

  // Launch all bookmarks in a playlist
  static async launchPlaylist(
    playlistId: string, 
    options: PlaylistLaunchOptions = {}
  ): Promise<{ success: boolean; opened: number; failed: number }> {
    const playlist = await this.getPlaylistWithBookmarks(playlistId);
    if (!playlist || !playlist.bookmarks) {
      throw new Error('Playlist not found or has no bookmarks');
    }

    const {
      open_in_new_window = false,
      delay_between_tabs = 100,
      max_tabs_per_batch = 10,
      confirm_before_launch = true
    } = options;

    // Confirm launch if requested
    if (confirm_before_launch) {
      const confirmed = window.confirm(
        `Launch ${playlist.bookmarks.length} bookmarks from "${playlist.name}"?`
      );
      if (!confirmed) {
        return { success: false, opened: 0, failed: 0 };
      }
    }

    let opened = 0;
    let failed = 0;
    const bookmarks = playlist.bookmarks.slice(0, max_tabs_per_batch);

    for (let i = 0; i < bookmarks.length; i++) {
      const bookmark = bookmarks[i];
      if (!bookmark.bookmark?.url) {
        failed++;
        continue;
      }

      try {
        // Add delay between tabs to prevent browser blocking
        if (i > 0 && delay_between_tabs > 0) {
          await new Promise(resolve => setTimeout(resolve, delay_between_tabs));
        }

        const windowFeatures = open_in_new_window 
          ? 'noopener,noreferrer,width=1200,height=800' 
          : undefined;

        const newWindow = window.open(bookmark.bookmark.url, '_blank', windowFeatures);
        
        if (newWindow) {
          opened++;
          // Track bookmark visit
          await this.trackBookmarkVisit(bookmark.bookmark.id);
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to open bookmark ${bookmark.bookmark.url}:`, error);
        failed++;
      }
    }

    return { success: opened > 0, opened, failed };
  }

  // Track bookmark visit (integrate with existing analytics)
  private static async trackBookmarkVisit(bookmarkId: string): Promise<void> {
    try {
      await fetch('/api/bookmarks/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId })
      });
    } catch (error) {
      console.error('Failed to track bookmark visit:', error);
    }
  }

  // Get playlist statistics
  static async getPlaylistStats(userId: string): Promise<PlaylistStats> {
    const [playlistsResult, bookmarksResult, recentResult, favoritesResult] = await Promise.all([
      // Total playlists
      supabase
        .from('playlists')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      
      // Total bookmarks in playlists
      supabase
        .from('playlist_bookmarks')
        .select('id', { count: 'exact' })
        .eq('playlists.user_id', userId),
      
      // Recent playlists
      supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5),
      
      // Favorite playlists
      supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('name')
    ]);

    // Most used playlist (placeholder - would need visit tracking)
    const mostUsedPlaylist = recentResult.data?.[0] || null;

    return {
      total_playlists: playlistsResult.count || 0,
      total_bookmarks_in_playlists: bookmarksResult.count || 0,
      most_used_playlist: mostUsedPlaylist,
      recent_playlists: recentResult.data || [],
      favorite_playlists: favoritesResult.data || []
    };
  }

  // Duplicate a playlist
  static async duplicatePlaylist(playlistId: string, newName?: string): Promise<Playlist> {
    const originalPlaylist = await this.getPlaylistWithBookmarks(playlistId);
    if (!originalPlaylist) {
      throw new Error('Playlist not found');
    }

    // Create new playlist
    const newPlaylist = await this.createPlaylist(originalPlaylist.user_id, {
      name: newName || `${originalPlaylist.name} (Copy)`,
      description: originalPlaylist.description,
      color: originalPlaylist.color,
      icon: originalPlaylist.icon,
      is_favorite: false
    });

    // Add all bookmarks to new playlist
    if (originalPlaylist.bookmarks) {
      for (const playlistBookmark of originalPlaylist.bookmarks) {
        if (playlistBookmark.bookmark) {
          await this.addBookmarkToPlaylist({
            playlist_id: newPlaylist.id,
            bookmark_id: playlistBookmark.bookmark.id,
            position: playlistBookmark.position
          });
        }
      }
    }

    return newPlaylist;
  }
} 