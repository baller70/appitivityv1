const { createClient } = require('@supabase/supabase-js')

// Read environment variables directly
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration() {
  try {
    console.log('Applying deadline_date migration...')
    console.log('Supabase URL:', SUPABASE_URL)
    
    // Try to add the columns directly using SQL
    const queries = [
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_description TEXT;',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT \'pending\';',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT \'medium\';',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_notes TEXT;',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();',
      'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;',
      
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_description TEXT;',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT \'pending\';',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT \'medium\';',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_notes TEXT;',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();',
      'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;'
    ]
    
    for (const query of queries) {
      console.log('Executing:', query)
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query })
        if (error) {
          console.error('Query failed:', error.message)
        } else {
          console.log('✅ Success')
        }
      } catch (err) {
        console.error('Exception:', err.message)
      }
    }
    
    console.log('✅ Migration completed')
    
  } catch (error) {
    console.error('Migration error:', error)
  }
}

applyMigration().then(() => {
  console.log('Migration script finished')
  process.exit(0)
}) 