-- Final migration to disable RLS on all user-related tables
-- Security is handled by the API layer with proper user authentication
-- This resolves all UUID validation issues

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

-- Disable RLS on other user-related tables
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on these tables
DROP POLICY IF EXISTS "Users can manage own folders" ON folders;
DROP POLICY IF EXISTS "Users can manage own tags" ON tags;
DROP POLICY IF EXISTS "Users can manage own bookmark_tags" ON bookmark_tags;

-- Add comments explaining the security model
COMMENT ON TABLE user_preferences IS 'RLS disabled - security handled by API layer with Clerk authentication';
COMMENT ON TABLE bookmarks IS 'RLS disabled - security handled by API layer with Clerk authentication';
COMMENT ON TABLE folders IS 'RLS disabled - security handled by API layer with Clerk authentication';
COMMENT ON TABLE tags IS 'RLS disabled - security handled by API layer with Clerk authentication'; 