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

const sqlStatements = [
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_description TEXT;",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT 'pending';",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT 'medium';",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_notes TEXT;",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();",
  "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_description TEXT;",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50);",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_status VARCHAR(20) DEFAULT 'pending';",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_priority VARCHAR(10) DEFAULT 'medium';",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_progress INTEGER DEFAULT 0;",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_notes TEXT;",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_created_at TIMESTAMPTZ DEFAULT NOW();",
  "ALTER TABLE folders ADD COLUMN IF NOT EXISTS goal_completed_at TIMESTAMPTZ;"
]

async function applySqlMigration() {
  console.log('Applying SQL migration...')
  
  try {
    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}: ${statement}`)
      
      try {
        // Use rpc to execute raw SQL
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
          sql: statement 
        })
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error)
          // Continue with other statements even if one fails
        } else {
          console.log(`Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err)
        // Try alternative approach using direct query
        try {
          const { data, error } = await supabaseAdmin
            .from('_sql')
            .select('*')
            .eq('query', statement)
            .single()
          
          if (error && error.code !== 'PGRST116') {
            console.error(`Alternative approach failed for statement ${i + 1}:`, error)
          }
        } catch (altErr) {
          console.error(`Both approaches failed for statement ${i + 1}:`, altErr)
        }
      }
    }
    
    console.log('Migration completed. Verifying results...')
    
    // Verify the migration by checking if columns exist
    const { data: bookmarkSample } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .limit(1)
    
    const { data: folderSample } = await supabaseAdmin
      .from('folders')
      .select('*')
      .limit(1)
    
    const bookmarkColumns = bookmarkSample && bookmarkSample[0] ? Object.keys(bookmarkSample[0]) : []
    const folderColumns = folderSample && folderSample[0] ? Object.keys(folderSample[0]) : []
    
    console.log('Bookmark columns after migration:', bookmarkColumns)
    console.log('Folder columns after migration:', folderColumns)
    
    const requiredFields = [
      'deadline_date', 'goal_description', 'goal_type', 'goal_status', 
      'goal_priority', 'goal_progress', 'goal_notes', 'goal_created_at', 'goal_completed_at'
    ]
    
    const missingBookmarkFields = requiredFields.filter(field => !bookmarkColumns.includes(field))
    const missingFolderFields = requiredFields.filter(field => !folderColumns.includes(field))
    
    if (missingBookmarkFields.length === 0 && missingFolderFields.length === 0) {
      console.log('✅ Migration completed successfully! All required columns are present.')
    } else {
      console.log('⚠️ Migration partially completed.')
      if (missingBookmarkFields.length > 0) {
        console.log('Missing bookmark fields:', missingBookmarkFields)
      }
      if (missingFolderFields.length > 0) {
        console.log('Missing folder fields:', missingFolderFields)
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

applySqlMigration() 