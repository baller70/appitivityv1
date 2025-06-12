import { createClient } from '@supabase/supabase-js'

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

export async function addMissingColumns() {
  console.log('Starting database migration...')
  
  const migrations = [
    // Folders table migrations
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_description TEXT;',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT \'pending\';',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT \'medium\';',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_notes TEXT;',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();',
    'ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;',
    
    // Bookmarks table migrations
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_description TEXT;',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT \'pending\';',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT \'medium\';',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_notes TEXT;',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();',
    'ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;'
  ]

  let successCount = 0
  let errorCount = 0

  for (const sql of migrations) {
    try {
      console.log(`Executing: ${sql}`)
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql })
      
      if (error) {
        console.error(`Migration failed: ${sql}`, error)
        errorCount++
      } else {
        console.log(`Migration successful: ${sql}`)
        successCount++
      }
    } catch (error) {
      console.error(`Migration error: ${sql}`, error)
      errorCount++
    }
  }

  console.log(`Migration complete. Success: ${successCount}, Errors: ${errorCount}`)
  return { successCount, errorCount, total: migrations.length }
}

export async function checkMissingColumns() {
  console.log('Checking for missing columns...')
  
  try {
    // Check folders table
    const { data: foldersInfo, error: foldersError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'folders')
      .eq('table_schema', 'public')

    if (foldersError) {
      console.error('Error checking folders columns:', foldersError)
    } else {
      const folderColumns = foldersInfo?.map(col => col.column_name) || []
      console.log('Current folder columns:', folderColumns)
    }

    // Check bookmarks table
    const { data: bookmarksInfo, error: bookmarksError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bookmarks')
      .eq('table_schema', 'public')

    if (bookmarksError) {
      console.error('Error checking bookmarks columns:', bookmarksError)
    } else {
      const bookmarkColumns = bookmarksInfo?.map(col => col.column_name) || []
      console.log('Current bookmark columns:', bookmarkColumns)
    }

    return { foldersInfo, bookmarksInfo }
  } catch (error) {
    console.error('Error checking columns:', error)
    return null
  }
} 