-- Database Setup for Apptivity Bookmark Manager
-- This script sets up the complete database schema with RLS policies for Clerk authentication

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7), -- Hex color code
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon_url TEXT,
  thumbnail_url TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ
);

-- Create bookmark_tags junction table
CREATE TABLE IF NOT EXISTS bookmark_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bookmark_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder_id ON bookmarks(folder_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view their own folders" ON folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON folders;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
DROP POLICY IF EXISTS "Users can create their own tags" ON tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;

DROP POLICY IF EXISTS "Users can view their own bookmark_tags" ON bookmark_tags;
DROP POLICY IF EXISTS "Users can create their own bookmark_tags" ON bookmark_tags;
DROP POLICY IF EXISTS "Users can delete their own bookmark_tags" ON bookmark_tags;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'user_id'::text OR id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'user_id'::text OR id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (current_setting('role') = 'service_role');

-- Create RLS policies for folders
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can create their own folders" ON folders
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

-- Create RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can create their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can create their own tags" ON tags
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid OR user_id = current_setting('app.current_user_id', true)::uuid);

-- Create RLS policies for bookmark_tags
CREATE POLICY "Users can view their own bookmark_tags" ON bookmark_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookmarks b 
      WHERE b.id = bookmark_tags.bookmark_id 
      AND (b.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid 
           OR b.user_id = current_setting('app.current_user_id', true)::uuid)
    )
  );

CREATE POLICY "Users can create their own bookmark_tags" ON bookmark_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookmarks b 
      WHERE b.id = bookmark_tags.bookmark_id 
      AND (b.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid 
           OR b.user_id = current_setting('app.current_user_id', true)::uuid)
    )
  );

CREATE POLICY "Users can delete their own bookmark_tags" ON bookmark_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM bookmarks b 
      WHERE b.id = bookmark_tags.bookmark_id 
      AND (b.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'::uuid 
           OR b.user_id = current_setting('app.current_user_id', true)::uuid)
    )
  );

-- Create function to set user context for RLS
CREATE OR REPLACE FUNCTION set_current_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmarks_updated_at ON bookmarks;
CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant specific permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookmark_tags TO authenticated;

-- Grant permissions for anon users (if needed)
GRANT SELECT ON profiles TO anon; 