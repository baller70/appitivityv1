import { NextResponse } from 'next/server'
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

export async function POST() {
  try {
    console.log('Applying database migration...')
    
    // SQL statements to add missing columns
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
      "ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS tags JSONB;",
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
    
    // Try to execute each statement individually
    const results = []
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}: ${statement}`)
      
      try {
        // Use a simple approach - try to select from the table to see if column exists
        const tableName = statement.includes('bookmarks') ? 'bookmarks' : 'folders'
        const columnName = statement.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1]
        
        if (columnName) {
          // Check if column exists by trying to select it
          const { data, error } = await supabaseAdmin
            .from(tableName)
            .select(columnName)
            .limit(1)
          
          if (error && error.message.includes('column') && error.message.includes('does not exist')) {
            console.log(`Column ${columnName} does not exist in ${tableName}, needs to be added`)
            results.push({ statement, status: 'needs_manual_execution', columnName, tableName })
          } else {
            console.log(`Column ${columnName} already exists in ${tableName}`)
            results.push({ statement, status: 'already_exists', columnName, tableName })
          }
        }
      } catch (err) {
        console.error(`Error checking statement ${i + 1}:`, err)
        results.push({ statement, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }
    
    // Check current schema
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
    
    const requiredFields = [
      'deadline_date', 'goal_description', 'goal_type', 'goal_status', 
      'goal_priority', 'goal_progress', 'goal_notes', 'goal_created_at', 'goal_completed_at'
    ]
    
    const missingBookmarkFields = requiredFields.filter(field => !bookmarkColumns.includes(field))
    const missingFolderFields = requiredFields.filter(field => !folderColumns.includes(field))
    
    return NextResponse.json({
      success: true,
      message: 'Migration analysis complete',
      currentBookmarkColumns: bookmarkColumns,
      currentFolderColumns: folderColumns,
      missingBookmarkFields,
      missingFolderFields,
      results,
      sqlScript: sqlStatements.join('\n'),
      note: 'Please execute the SQL script manually in Supabase SQL editor to add missing columns'
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }, 
      { status: 500 }
    )
  }
} 