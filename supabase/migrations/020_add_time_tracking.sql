-- Migration: Add time tracking fields to bookmarks table
-- Created: 2025-01-27
-- Description: Add comprehensive time tracking for individual bookmark sessions

-- Add time tracking columns to bookmarks table
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0; -- Total seconds spent
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS session_count INTEGER DEFAULT 0; -- Number of sessions
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS average_session_time INTEGER DEFAULT 0; -- Average session length in seconds
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS last_session_time INTEGER DEFAULT 0; -- Last session duration in seconds
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS longest_session_time INTEGER DEFAULT 0; -- Longest session duration in seconds

-- Create bookmark_sessions table for detailed session tracking
CREATE TABLE IF NOT EXISTS bookmark_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_seconds INTEGER, -- Calculated when session ends
    is_active BOOLEAN DEFAULT true, -- Whether session is currently active
    session_type VARCHAR(50) DEFAULT 'view', -- 'view', 'focus', 'timer', etc.
    metadata JSONB DEFAULT '{}', -- Additional session data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_total_time_spent ON bookmarks(total_time_spent DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_session_count ON bookmarks(session_count DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_average_session_time ON bookmarks(average_session_time DESC);

CREATE INDEX IF NOT EXISTS idx_bookmark_sessions_bookmark_id ON bookmark_sessions(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_sessions_user_id ON bookmark_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_sessions_active ON bookmark_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookmark_sessions_start_time ON bookmark_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_bookmark_sessions_duration ON bookmark_sessions(duration_seconds DESC) WHERE duration_seconds IS NOT NULL;

-- Enable RLS for bookmark_sessions
ALTER TABLE bookmark_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookmark_sessions
CREATE POLICY "Users can view their own bookmark sessions" ON bookmark_sessions
    FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create their own bookmark sessions" ON bookmark_sessions
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own bookmark sessions" ON bookmark_sessions
    FOR UPDATE USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own bookmark sessions" ON bookmark_sessions
    FOR DELETE USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

-- Function to calculate and update bookmark time statistics
CREATE OR REPLACE FUNCTION update_bookmark_time_stats(bookmark_uuid UUID)
RETURNS void AS $$
DECLARE
    total_time INTEGER;
    session_count_val INTEGER;
    avg_time INTEGER;
    last_session INTEGER;
    longest_session INTEGER;
BEGIN
    -- Calculate aggregated statistics
    SELECT 
        COALESCE(SUM(duration_seconds), 0),
        COUNT(*),
        COALESCE(AVG(duration_seconds), 0)::INTEGER,
        COALESCE(MAX(duration_seconds) FILTER (WHERE session_end = (SELECT MAX(session_end) FROM bookmark_sessions WHERE bookmark_id = bookmark_uuid AND duration_seconds IS NOT NULL)), 0),
        COALESCE(MAX(duration_seconds), 0)
    INTO total_time, session_count_val, avg_time, last_session, longest_session
    FROM bookmark_sessions 
    WHERE bookmark_id = bookmark_uuid AND duration_seconds IS NOT NULL;
    
    -- Update bookmark statistics
    UPDATE bookmarks 
    SET 
        total_time_spent = total_time,
        session_count = session_count_val,
        average_session_time = avg_time,
        last_session_time = last_session,
        longest_session_time = longest_session,
        updated_at = NOW()
    WHERE id = bookmark_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update bookmark stats when sessions are modified
CREATE OR REPLACE FUNCTION trigger_update_bookmark_time_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_bookmark_time_stats(NEW.bookmark_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_bookmark_time_stats(OLD.bookmark_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_bookmark_session_stats ON bookmark_sessions;
CREATE TRIGGER trigger_bookmark_session_stats
    AFTER INSERT OR UPDATE OR DELETE ON bookmark_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_bookmark_time_stats();

-- Add comments for documentation
COMMENT ON COLUMN bookmarks.total_time_spent IS 'Total time spent on this bookmark in seconds';
COMMENT ON COLUMN bookmarks.session_count IS 'Number of tracking sessions for this bookmark';
COMMENT ON COLUMN bookmarks.average_session_time IS 'Average session duration in seconds';
COMMENT ON COLUMN bookmarks.last_session_time IS 'Duration of the most recent session in seconds';
COMMENT ON COLUMN bookmarks.longest_session_time IS 'Duration of the longest session in seconds';

COMMENT ON TABLE bookmark_sessions IS 'Detailed tracking of individual bookmark viewing/interaction sessions';
COMMENT ON COLUMN bookmark_sessions.session_type IS 'Type of session: view, focus, timer, etc.';
COMMENT ON COLUMN bookmark_sessions.is_active IS 'Whether this session is currently ongoing';
COMMENT ON COLUMN bookmark_sessions.metadata IS 'Additional session data (timer settings, focus mode, etc.)'; 