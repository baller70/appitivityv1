import { createClient } from '@supabase/supabase-js'

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)

export async function applyDeadlineMigration() {
  try {
    console.log('Applying deadline_date migration...')
    
    // Check if columns already exist
    const { data: bookmarkColumns, error: bookmarkError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'bookmarks' })
    
    if (bookmarkError) {
      console.log('Cannot check existing columns, proceeding with migration...')
    }
    
    // Apply the migration SQL
    const migrationSQL = `
      -- Add deadline and goal fields to bookmarks table
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'deadline_date') THEN
          ALTER TABLE bookmarks 
          ADD COLUMN deadline_date TIMESTAMPTZ,
          ADD COLUMN goal_description TEXT,
          ADD COLUMN goal_type VARCHAR(50) CHECK (goal_type IN ('read', 'review', 'complete', 'learn', 'research', 'custom')),
          ADD COLUMN goal_status VARCHAR(20) DEFAULT 'pending' CHECK (goal_status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
          ADD COLUMN goal_priority VARCHAR(10) DEFAULT 'medium' CHECK (goal_priority IN ('low', 'medium', 'high', 'urgent')),
          ADD COLUMN goal_progress INTEGER DEFAULT 0 CHECK (goal_progress >= 0 AND goal_progress <= 100),
          ADD COLUMN goal_notes TEXT,
          ADD COLUMN goal_created_at TIMESTAMPTZ DEFAULT NOW(),
          ADD COLUMN goal_completed_at TIMESTAMPTZ;
        END IF;
      END $$;

      -- Add deadline and goal fields to folders table
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'folders' AND column_name = 'deadline_date') THEN
          ALTER TABLE folders 
          ADD COLUMN deadline_date TIMESTAMPTZ,
          ADD COLUMN goal_description TEXT,
          ADD COLUMN goal_type VARCHAR(50) CHECK (goal_type IN ('organize', 'complete_all', 'review_all', 'learn_category', 'research_topic', 'custom')),
          ADD COLUMN goal_status VARCHAR(20) DEFAULT 'pending' CHECK (goal_status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
          ADD COLUMN goal_priority VARCHAR(10) DEFAULT 'medium' CHECK (goal_priority IN ('low', 'medium', 'high', 'urgent')),
          ADD COLUMN goal_progress INTEGER DEFAULT 0 CHECK (goal_progress >= 0 AND goal_progress <= 100),
          ADD COLUMN goal_notes TEXT,
          ADD COLUMN goal_created_at TIMESTAMPTZ DEFAULT NOW(),
          ADD COLUMN goal_completed_at TIMESTAMPTZ;
        END IF;
      END $$;

      -- Create indexes if they don't exist
      CREATE INDEX IF NOT EXISTS idx_bookmarks_deadline_date ON bookmarks(deadline_date) WHERE deadline_date IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_bookmarks_goal_status ON bookmarks(goal_status) WHERE goal_status IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_folders_deadline_date ON folders(deadline_date) WHERE deadline_date IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_folders_goal_status ON folders(goal_status) WHERE goal_status IS NOT NULL;
    `
    
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration failed:', error)
      return false
    }
    
    console.log('✅ Deadline migration applied successfully')
    return true
    
  } catch (error) {
    console.error('Migration error:', error)
    return false
  }
} 