const { createClient } = require('@supabase/supabase-js')

// Environment variables
const SUPABASE_URL = 'https://bpmixidxyljfvenukcun.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbWl4aWR4eWxqZnZlbnVrY3VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4MDAyMiwiZXhwIjoyMDY0NDU2MDIyfQ.dWZq22pDeGl60Bq1mGkfsszXdhZ8xGLiMK4Ksurfk90'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

async function applySchemaFix() {
  console.log('Applying database schema fixes...')
  
  try {
    // Check current schema first
    console.log('Checking current schema...')
    
    const { data: bookmarkColumns, error: bookmarkError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bookmarks')
      .eq('table_schema', 'public')
    
    if (bookmarkError) {
      console.error('Error checking bookmark columns:', bookmarkError)
      return
    }
    
    const currentColumns = bookmarkColumns.map(c => c.column_name)
    console.log('Current bookmark columns:', currentColumns.sort())
    
    const requiredColumns = [
      'deadline_date', 'goal_description', 'goal_type', 'goal_status', 
      'goal_priority', 'goal_progress', 'goal_notes', 'goal_created_at', 
      'goal_completed_at', 'visit_count', 'last_visited_at'
    ]
    
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col))
    console.log('Missing columns:', missingColumns)
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!')
      return
    }
    
    // Apply the schema changes using a simple approach
    console.log('Applying schema changes...')
    
    // Since we can't use exec_sql, let's try to add columns one by one using a workaround
    // We'll create a temporary table and then copy data
    
    // First, let's check if we can at least read from the tables
    const { data: testBookmarks, error: testError } = await supabaseAdmin
      .from('bookmarks')
      .select('id, title')
      .limit(1)
    
    if (testError) {
      console.error('Cannot access bookmarks table:', testError)
      return
    }
    
    console.log('✅ Database connection successful')
    console.log('Sample bookmark:', testBookmarks?.[0])
    
    // Since we can't modify the schema directly through the client,
    // let's create a script that can be run in the Supabase SQL editor
    const sqlScript = `
-- Add missing columns to bookmarks table
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_description TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_notes TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS last_visited_at TIMESTAMPTZ;

-- Add missing columns to folders table
ALTER TABLE folders ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_description TEXT;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_notes TEXT;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_visit_count ON bookmarks(visit_count);
CREATE INDEX IF NOT EXISTS idx_bookmarks_last_visited ON bookmarks(last_visited_at);
`
    
    console.log('\n=== SQL SCRIPT TO RUN IN SUPABASE SQL EDITOR ===')
    console.log(sqlScript)
    console.log('=== END OF SQL SCRIPT ===\n')
    
    console.log('Please run the above SQL script in your Supabase SQL editor to add the missing columns.')
    console.log('Go to: https://supabase.com/dashboard/project/bpmixidxyljfvenukcun/sql/new')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

applySchemaFix() 