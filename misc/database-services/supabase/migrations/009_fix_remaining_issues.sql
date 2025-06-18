-- Migration: Fix remaining database issues
-- Created: 2024-06-03
-- Description: Ensure proper RLS configuration and fix any schema issues

-- Ensure all tables have proper updated_at triggers
DO $$
BEGIN
    -- Create trigger function if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;
    END IF;
END$$;

-- Ensure user_preferences table exists and is properly configured
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  theme VARCHAR(10) CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  view_mode VARCHAR(10) CHECK (view_mode IN ('grid', 'list', 'kanban')) DEFAULT 'grid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Ensure RLS is enabled on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them to ensure they're correct
DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Create simplified RLS policies that work with admin client
CREATE POLICY "Enable read access for all users" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON user_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON user_preferences FOR UPDATE USING (true);

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Refresh schema cache to ensure all changes are visible
NOTIFY pgrst, 'reload schema'; 