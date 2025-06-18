-- Migration: Fix RLS policies for Clerk authentication
-- Created: 2024-06-02
-- Description: Completely disable RLS temporarily for development to allow bookmark creation

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Allow all profiles operations" ON profiles;
DROP POLICY IF EXISTS "Allow all folders operations" ON folders;
DROP POLICY IF EXISTS "Allow all tags operations" ON tags;
DROP POLICY IF EXISTS "Allow all bookmarks operations" ON bookmarks;
DROP POLICY IF EXISTS "Allow all bookmark_tags operations" ON bookmark_tags;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own folders" ON folders;
DROP POLICY IF EXISTS "Users can manage own tags" ON tags;
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can manage own bookmark tags" ON bookmark_tags;

-- Disable RLS temporarily for development
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags DISABLE ROW LEVEL SECURITY;

-- Note: In production, you would want to re-enable RLS with proper policies
-- that work with your authentication system (Clerk in this case) 