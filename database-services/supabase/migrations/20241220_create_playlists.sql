-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for visual identification
  icon VARCHAR(50) DEFAULT 'list', -- Icon identifier
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_bookmarks junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS playlist_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0, -- For ordering bookmarks within playlist
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, bookmark_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at);
CREATE INDEX IF NOT EXISTS idx_playlist_bookmarks_playlist_id ON playlist_bookmarks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_bookmarks_position ON playlist_bookmarks(playlist_id, position);

-- Enable RLS (Row Level Security)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playlists
CREATE POLICY "Users can view their own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playlist_bookmarks
CREATE POLICY "Users can view their own playlist bookmarks" ON playlist_bookmarks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_bookmarks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add bookmarks to their own playlists" ON playlist_bookmarks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_bookmarks.playlist_id 
      AND playlists.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM bookmarks 
      WHERE bookmarks.id = playlist_bookmarks.bookmark_id 
      AND bookmarks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own playlist bookmarks" ON playlist_bookmarks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_bookmarks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove bookmarks from their own playlists" ON playlist_bookmarks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_bookmarks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Create function to update playlist updated_at timestamp
CREATE OR REPLACE FUNCTION update_playlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE playlists 
  SET updated_at = NOW() 
  WHERE id = COALESCE(NEW.playlist_id, OLD.playlist_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update playlist timestamp when bookmarks are modified
CREATE TRIGGER playlist_bookmarks_update_playlist_timestamp
  AFTER INSERT OR UPDATE OR DELETE ON playlist_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_playlist_updated_at(); 