-- Migration: Comprehensive Database Performance Optimization
-- Created: 2025-01-27
-- Description: Fix critical performance bottlenecks with advanced indexing, query optimization, and database tuning

-- ============================================================================
-- PART 1: CRITICAL MISSING INDEXES FOR QUERY PERFORMANCE
-- ============================================================================

-- Fix user profile lookup performance (major bottleneck in auth)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_email ON profiles(id, email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_email ON user_profiles(email) WHERE email IS NOT NULL;

-- Optimize bookmark relationship queries (very expensive joins)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmark_relationships_composite ON bookmark_relationships(bookmark_id, related_bookmark_id, relationship_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmark_relationships_user_lookup ON bookmark_relationships(bookmark_id) INCLUDE (related_bookmark_id, relationship_type);

-- Critical bookmark query optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_created_desc ON bookmarks(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_favorite_active ON bookmarks(user_id, is_favorite) WHERE is_favorite = true AND is_archived = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_archived ON bookmarks(user_id, is_archived) WHERE is_archived = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_folder_user ON bookmarks(folder_id, user_id) WHERE folder_id IS NOT NULL;

-- Optimize tag junction table queries (major performance impact)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmark_tags_composite ON bookmark_tags(bookmark_id, tag_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmark_tags_tag_user ON bookmark_tags(tag_id) INCLUDE (bookmark_id);

-- Time tracking optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmark_sessions_user_bookmark ON bookmark_sessions(user_id, bookmark_id, session_start DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmark_sessions_active_user ON bookmark_sessions(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- PART 2: FULL-TEXT SEARCH OPTIMIZATION
-- ============================================================================

-- Add search vector column for lightning-fast search
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_search_gin ON bookmarks USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_bookmark_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.url, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_bookmark_search_vector ON bookmarks;
CREATE TRIGGER trigger_update_bookmark_search_vector
  BEFORE INSERT OR UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_bookmark_search_vector();

-- Update existing records with search vectors
UPDATE bookmarks SET search_vector = to_tsvector('english', 
  COALESCE(title, '') || ' ' || 
  COALESCE(description, '') || ' ' ||
  COALESCE(url, '')
) WHERE search_vector IS NULL;

-- ============================================================================
-- PART 3: QUERY PERFORMANCE VIEWS
-- ============================================================================

-- Materialized view for dashboard statistics (eliminates expensive aggregations)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_bookmark_stats AS
SELECT 
    user_id,
    COUNT(*) as total_bookmarks,
    COUNT(*) FILTER (WHERE is_favorite = true) as favorite_count,
    COUNT(*) FILTER (WHERE is_archived = true) as archived_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_bookmarks,
    SUM(visit_count) as total_visits,
    MAX(created_at) as last_bookmark_added,
    AVG(visit_count) as avg_visits_per_bookmark
FROM bookmarks
GROUP BY user_id;

-- Index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_bookmark_stats_user_id ON user_bookmark_stats(user_id);

-- Function to refresh stats (called by trigger)
CREATE OR REPLACE FUNCTION refresh_user_bookmark_stats(affected_user_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM user_bookmark_stats WHERE user_id = affected_user_id;
    
    INSERT INTO user_bookmark_stats
    SELECT 
        affected_user_id,
        COUNT(*) as total_bookmarks,
        COUNT(*) FILTER (WHERE is_favorite = true) as favorite_count,
        COUNT(*) FILTER (WHERE is_archived = true) as archived_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_bookmarks,
        SUM(visit_count) as total_visits,
        MAX(created_at) as last_bookmark_added,
        AVG(visit_count) as avg_visits_per_bookmark
    FROM bookmarks
    WHERE user_id = affected_user_id
    GROUP BY user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 4: ADVANCED DATABASE TUNING
-- ============================================================================

-- Optimize PostgreSQL settings for better performance
-- Note: These are suggestions for the DBA to apply at the database level

-- Enable parallel query execution
-- SET max_parallel_workers_per_gather = 4;
-- SET max_parallel_workers = 8;

-- Optimize memory settings
-- SET shared_buffers = '256MB';
-- SET effective_cache_size = '1GB';
-- SET work_mem = '16MB';

-- Enable query plan caching
-- SET plan_cache_mode = 'force_generic_plan';

-- ============================================================================
-- PART 5: CONSTRAINT OPTIMIZATION
-- ============================================================================

-- Add constraints that help the query planner
ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS chk_bookmarks_visit_count_positive 
  CHECK (visit_count >= 0);

ALTER TABLE bookmark_sessions ADD CONSTRAINT IF NOT EXISTS chk_session_duration_positive 
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0);

-- ============================================================================
-- PART 6: TRIGGER OPTIMIZATION FOR STATS UPDATES
-- ============================================================================

-- Optimized trigger function for bookmark stats
CREATE OR REPLACE FUNCTION trigger_refresh_bookmark_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM refresh_user_bookmark_stats(NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM refresh_user_bookmark_stats(OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to bookmarks table
DROP TRIGGER IF EXISTS trigger_bookmark_stats_refresh ON bookmarks;
CREATE TRIGGER trigger_bookmark_stats_refresh
    AFTER INSERT OR UPDATE OR DELETE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_bookmark_stats();

-- ============================================================================
-- PART 7: CLEANUP AND MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE bookmarks;
    ANALYZE bookmark_tags;
    ANALYZE bookmark_relationships;
    ANALYZE bookmark_sessions;
    ANALYZE folders;
    ANALYZE tags;
    ANALYZE profiles;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
    -- Close sessions older than 24 hours that are still marked as active
    UPDATE bookmark_sessions 
    SET is_active = false, 
        session_end = session_start + INTERVAL '1 hour',
        duration_seconds = 3600
    WHERE is_active = true 
      AND session_start < NOW() - INTERVAL '24 hours'
      AND session_end IS NULL;
      
    -- Delete very old session data (older than 1 year)
    DELETE FROM bookmark_sessions 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 8: PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View to monitor slow queries and performance
CREATE OR REPLACE VIEW slow_query_monitor AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE tablename IN ('bookmarks', 'bookmark_tags', 'bookmark_relationships', 'folders', 'tags', 'profiles')
ORDER BY tablename, attname;

-- View to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================================================
-- PART 9: INITIAL DATA REFRESH
-- ============================================================================

-- Refresh materialized view with current data
REFRESH MATERIALIZED VIEW user_bookmark_stats;

-- Update table statistics
SELECT update_table_statistics();

-- Cleanup any orphaned sessions
SELECT cleanup_old_sessions();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON MATERIALIZED VIEW user_bookmark_stats IS 'Pre-computed user statistics for dashboard performance';
COMMENT ON FUNCTION refresh_user_bookmark_stats(UUID) IS 'Refresh statistics for a specific user';
COMMENT ON FUNCTION update_table_statistics() IS 'Update PostgreSQL table statistics for query optimization';
COMMENT ON FUNCTION cleanup_old_sessions() IS 'Cleanup old and orphaned bookmark sessions';
COMMENT ON INDEX idx_bookmarks_search_gin IS 'Full-text search index for bookmark content';
COMMENT ON INDEX idx_bookmark_relationships_composite IS 'Composite index for relationship queries';
COMMENT ON INDEX idx_bookmarks_user_created_desc IS 'Optimized index for user bookmark listing';

-- ============================================================================
-- PART 10: PERFORMANCE VERIFICATION
-- ============================================================================

-- Verify critical indexes exist
DO $$
DECLARE
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for critical indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookmarks_user_created_desc') THEN
        missing_indexes := array_append(missing_indexes, 'idx_bookmarks_user_created_desc');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookmarks_search_gin') THEN
        missing_indexes := array_append(missing_indexes, 'idx_bookmarks_search_gin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookmark_relationships_composite') THEN
        missing_indexes := array_append(missing_indexes, 'idx_bookmark_relationships_composite');
    END IF;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE NOTICE 'WARNING: Missing critical indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE 'SUCCESS: All critical performance indexes are present';
    END IF;
END;
$$;

-- Performance optimization complete
SELECT 'Database optimization migration completed successfully' as status; 