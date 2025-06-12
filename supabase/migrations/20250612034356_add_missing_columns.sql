-- Add missing columns to bookmarks and folders tables

-- Add deadline and goal fields to bookmarks table
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_description TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_notes TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;

-- Ensure visit tracking columns exist
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS last_visited_at TIMESTAMPTZ;

-- Add deadline and goal fields to folders table
ALTER TABLE folders ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_description TEXT;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_notes TEXT;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_deadline_date ON bookmarks(deadline_date) WHERE deadline_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookmarks_goal_status ON bookmarks(goal_status) WHERE goal_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_folders_deadline_date ON folders(deadline_date) WHERE deadline_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_folders_goal_status ON folders(goal_status) WHERE goal_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookmarks_visit_count ON bookmarks(visit_count);
CREATE INDEX IF NOT EXISTS idx_bookmarks_last_visited ON bookmarks(last_visited_at);

-- Add constraints for goal fields
ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS chk_bookmarks_goal_type 
  CHECK (goal_type IS NULL OR goal_type IN ('read', 'review', 'complete', 'learn', 'research', 'custom'));

ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS chk_bookmarks_goal_status 
  CHECK (goal_status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled'));

ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS chk_bookmarks_goal_priority 
  CHECK (goal_priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS chk_bookmarks_goal_progress 
  CHECK (goal_progress >= 0 AND goal_progress <= 100);

ALTER TABLE folders ADD CONSTRAINT IF NOT EXISTS chk_folders_goal_type 
  CHECK (goal_type IS NULL OR goal_type IN ('organize', 'complete_all', 'review_all', 'learn_category', 'research_topic', 'custom'));

ALTER TABLE folders ADD CONSTRAINT IF NOT EXISTS chk_folders_goal_status 
  CHECK (goal_status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled'));

ALTER TABLE folders ADD CONSTRAINT IF NOT EXISTS chk_folders_goal_priority 
  CHECK (goal_priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE folders ADD CONSTRAINT IF NOT EXISTS chk_folders_goal_progress 
  CHECK (goal_progress >= 0 AND goal_progress <= 100);
