export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  is_favorite?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  bookmark_count?: number; // Computed field
  bookmarks?: PlaylistBookmark[]; // Populated when needed
}

export interface PlaylistBookmark {
  id: string;
  playlist_id?: string;
  bookmark_id?: string;
  position: number | null;
  added_at: string | null;
  bookmark?: {
    id: string;
    title: string;
    url: string;
    description?: string | null;
    favicon_url?: string | null;
    folder_id?: string | null;
    tags?: unknown[] | null;
    is_favorite?: boolean | null;
    visit_count: number | null;
    last_visited_at?: string | null;
    created_at?: string | null;
  };
}

export interface CreatePlaylistData {
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  is_favorite?: boolean | null;
}

export interface UpdatePlaylistData {
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  is_favorite?: boolean | null;
}

export interface AddBookmarkToPlaylistData {
  playlist_id: string;
  bookmark_id: string;
  position?: number | null;
}

export interface ReorderPlaylistBookmarkData {
  playlist_bookmark_id: string;
  new_position: number;
}

export interface PlaylistLaunchOptions {
  open_in_new_window?: boolean;
  delay_between_tabs?: number; // milliseconds
  max_tabs_per_batch?: number;
  confirm_before_launch?: boolean;
}

export interface PlaylistStats {
  total_playlists: number;
  total_bookmarks_in_playlists: number;
  most_used_playlist: Playlist | null;
  recent_playlists: Playlist[];
  favorite_playlists: Playlist[];
}

// Playlist icon options
export const PLAYLIST_ICONS = [
  'list',
  'bookmark',
  'star',
  'heart',
  'folder',
  'tag',
  'globe',
  'code',
  'design',
  'music',
  'video',
  'image',
  'document',
  'shopping',
  'work',
  'learning',
  'entertainment',
  'social',
  'news',
  'tools'
] as const;

export type PlaylistIcon = typeof PLAYLIST_ICONS[number];

// Playlist color options
export const PLAYLIST_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#DC2626', // Red-600
  '#059669', // Green-600
  '#7C3AED', // Violet-600
  '#DB2777', // Pink-600
  '#0891B2', // Cyan-600
] as const;

export type PlaylistColor = typeof PLAYLIST_COLORS[number]; 