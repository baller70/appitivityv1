-- Migration: Fix user references for Clerk authentication
-- Created: 2024-06-02
-- Description: Update table structure to use text user IDs from Clerk instead of UUID references to auth.users

-- First, drop foreign key constraints that reference auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE folders DROP CONSTRAINT IF EXISTS folders_user_id_fkey;
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_user_id_fkey;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;

-- Change user_id columns to TEXT to accommodate Clerk user IDs
-- Note: This assumes you have no existing data, or you need to migrate the data first

-- For profiles, change the primary key
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Update other tables to use TEXT for user_id
ALTER TABLE folders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE tags ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE bookmarks ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraints to reference profiles(id) instead of auth.users(id)
ALTER TABLE folders ADD CONSTRAINT folders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tags ADD CONSTRAINT tags_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; 