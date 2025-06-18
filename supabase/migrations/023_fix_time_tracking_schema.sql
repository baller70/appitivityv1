-- Fix Time Tracking Schema Issues
-- Migration: 023_fix_time_tracking_schema.sql

-- 1. Add missing clerk_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- 2. Create index on clerk_id for performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);

-- 3. Update existing profiles to have clerk_id based on email pattern
-- This is a temporary fix - in production you'd want to populate this properly
UPDATE profiles 
SET clerk_id = COALESCE(clerk_id, 'user_' || substr(md5(email), 1, 20))
WHERE clerk_id IS NULL;

-- 4. Drop existing RLS policies for bookmark_sessions
DROP POLICY IF EXISTS "Users can manage their own bookmark sessions" ON bookmark_sessions;
DROP POLICY IF EXISTS "Users can view their own bookmark sessions" ON bookmark_sessions;
DROP POLICY IF EXISTS "Users can insert their own bookmark sessions" ON bookmark_sessions;
DROP POLICY IF EXISTS "Users can update their own bookmark sessions" ON bookmark_sessions;

-- 5. Create new RLS policies for bookmark_sessions that work with the current user system
CREATE POLICY "Users can view their own bookmark sessions" ON bookmark_sessions
    FOR SELECT USING (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their own bookmark sessions" ON bookmark_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can update their own bookmark sessions" ON bookmark_sessions
    FOR UPDATE USING (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete their own bookmark sessions" ON bookmark_sessions
    FOR DELETE USING (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

-- 6. Fix time_tracking_stats table RLS policies
DROP POLICY IF EXISTS "Users can manage their own time tracking stats" ON time_tracking_stats;
DROP POLICY IF EXISTS "Users can view their own time tracking stats" ON time_tracking_stats;
DROP POLICY IF EXISTS "Users can insert their own time tracking stats" ON time_tracking_stats;
DROP POLICY IF EXISTS "Users can update their own time tracking stats" ON time_tracking_stats;

CREATE POLICY "Users can view their own time tracking stats" ON time_tracking_stats
    FOR SELECT USING (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their own time tracking stats" ON time_tracking_stats
    FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can update their own time tracking stats" ON time_tracking_stats
    FOR UPDATE USING (user_id = auth.uid()::text OR user_id IN (
        SELECT id::text FROM profiles WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    ));

-- 7. Ensure RLS is enabled on both tables
ALTER TABLE bookmark_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_stats ENABLE ROW LEVEL SECURITY;

-- 8. Grant necessary permissions
GRANT ALL ON bookmark_sessions TO authenticated;
GRANT ALL ON time_tracking_stats TO authenticated;

-- 9. Create a function to help with user ID resolution
CREATE OR REPLACE FUNCTION get_user_profile_id(clerk_user_id TEXT DEFAULT NULL, user_email TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_id TEXT;
BEGIN
    -- Try to find by clerk_id first
    IF clerk_user_id IS NOT NULL THEN
        SELECT id::text INTO profile_id 
        FROM profiles 
        WHERE clerk_id = clerk_user_id
        LIMIT 1;
        
        IF profile_id IS NOT NULL THEN
            RETURN profile_id;
        END IF;
    END IF;
    
    -- Fallback to email lookup
    IF user_email IS NOT NULL THEN
        SELECT id::text INTO profile_id 
        FROM profiles 
        WHERE email = user_email
        LIMIT 1;
        
        IF profile_id IS NOT NULL THEN
            RETURN profile_id;
        END IF;
    END IF;
    
    -- If no profile found, return null
    RETURN NULL;
END;
$$; 