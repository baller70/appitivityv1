-- Disable RLS on all user-related tables to resolve UUID validation issues
-- Security is handled at the API layer with proper authentication

-- Disable RLS on user_preferences
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Drop all policies on user_preferences
DROP POLICY IF EXISTS "Allow all preferences operations" ON user_preferences;
DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Disable RLS on bookmarks
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- Drop all policies on bookmarks
DROP POLICY IF EXISTS "Allow all bookmarks operations" ON bookmarks;
DROP POLICY IF EXISTS "Users can read own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- Disable RLS on folders
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;

-- Drop all policies on folders
DROP POLICY IF EXISTS "Allow all folders operations" ON folders;
DROP POLICY IF EXISTS "Users can read own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

-- Disable RLS on tags
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;

-- Drop all policies on tags
DROP POLICY IF EXISTS "Allow all tags operations" ON tags;
DROP POLICY IF EXISTS "Users can read own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
DROP POLICY IF EXISTS "Users can update own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON tags;

-- Disable RLS on bookmark_tags
ALTER TABLE bookmark_tags DISABLE ROW LEVEL SECURITY;

-- Drop all policies on bookmark_tags
DROP POLICY IF EXISTS "Allow all bookmark_tags operations" ON bookmark_tags;
DROP POLICY IF EXISTS "Users can manage own bookmark_tags" ON bookmark_tags;

-- Add comments to track this change
COMMENT ON TABLE user_preferences IS 'RLS disabled - security handled at API layer';
COMMENT ON TABLE bookmarks IS 'RLS disabled - security handled at API layer';
COMMENT ON TABLE folders IS 'RLS disabled - security handled at API layer';
COMMENT ON TABLE tags IS 'RLS disabled - security handled at API layer';
COMMENT ON TABLE bookmark_tags IS 'RLS disabled - security handled at API layer'; 