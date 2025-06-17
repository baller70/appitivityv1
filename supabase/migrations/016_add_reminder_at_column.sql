-- Migration: Add reminder_at column to bookmarks table
-- Created: 2025-06-17
-- Description: Add reminder_at column for bookmark reminders functionality
-- Fixes: JAVASCRIPT-NEXTJS-M - Could not find the 'reminder_at' column

-- Add reminder_at column to bookmarks table
ALTER TABLE bookmarks 
ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN bookmarks.reminder_at IS 'Timestamp for when user wants to be reminded about this bookmark';

-- Add index for efficient querying of upcoming reminders
CREATE INDEX IF NOT EXISTS idx_bookmarks_reminder_at 
ON bookmarks(reminder_at) 
WHERE reminder_at IS NOT NULL; 