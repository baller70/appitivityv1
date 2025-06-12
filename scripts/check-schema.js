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

async function checkSchema() {
  console.log('Checking database schema...')
  
  try {
    // Test basic connection
    const { data: testBookmarks, error: testError } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Cannot access bookmarks table:', testError)
      return
    }
    
    console.log('✅ Database connection successful')
    
    if (testBookmarks && testBookmarks.length > 0) {
      console.log('Sample bookmark structure:')
      console.log('Columns:', Object.keys(testBookmarks[0]))
      
      const requiredColumns = [
        'deadline_date', 'goal_description', 'goal_type', 'goal_status', 
        'goal_priority', 'goal_progress', 'goal_notes', 'goal_created_at', 
        'goal_completed_at', 'visit_count', 'last_visited_at'
      ]
      
      const existingColumns = Object.keys(testBookmarks[0])
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
      
      console.log('\nRequired columns:', requiredColumns)
      console.log('Missing columns:', missingColumns)
      
      if (missingColumns.length > 0) {
        console.log('\n❌ Missing columns detected!')
        console.log('The application is trying to use columns that don\'t exist in the database.')
        console.log('\nTo fix this, run the following SQL in your Supabase SQL editor:')
        console.log('https://supabase.com/dashboard/project/bpmixidxyljfvenukcun/sql/new')
        console.log('\n--- SQL TO RUN ---')
        
        missingColumns.forEach(col => {
          let sqlType = 'TEXT'
          let defaultValue = ''
          
          switch(col) {
            case 'deadline_date':
            case 'goal_created_at':
            case 'goal_completed_at':
            case 'last_visited_at':
              sqlType = 'TIMESTAMPTZ'
              break
            case 'goal_status':
              sqlType = 'VARCHAR(20)'
              defaultValue = " DEFAULT 'pending'"
              break
            case 'goal_priority':
              sqlType = 'VARCHAR(10)'
              defaultValue = " DEFAULT 'medium'"
              break
            case 'goal_progress':
            case 'visit_count':
              sqlType = 'INTEGER'
              defaultValue = ' DEFAULT 0'
              break
            case 'goal_type':
              sqlType = 'VARCHAR(50)'
              break
          }
          
          console.log(`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS ${col} ${sqlType}${defaultValue};`)
        })
        
        console.log('\n-- Also add to folders table:')
        const folderColumns = missingColumns.filter(col => !['visit_count', 'last_visited_at'].includes(col))
        folderColumns.forEach(col => {
          let sqlType = 'TEXT'
          let defaultValue = ''
          
          switch(col) {
            case 'deadline_date':
            case 'goal_created_at':
            case 'goal_completed_at':
              sqlType = 'TIMESTAMPTZ'
              break
            case 'goal_status':
              sqlType = 'VARCHAR(20)'
              defaultValue = " DEFAULT 'pending'"
              break
            case 'goal_priority':
              sqlType = 'VARCHAR(10)'
              defaultValue = " DEFAULT 'medium'"
              break
            case 'goal_progress':
              sqlType = 'INTEGER'
              defaultValue = ' DEFAULT 0'
              break
            case 'goal_type':
              sqlType = 'VARCHAR(50)'
              break
          }
          
          console.log(`ALTER TABLE folders ADD COLUMN IF NOT EXISTS ${col} ${sqlType}${defaultValue};`)
        })
        
        console.log('\n--- END SQL ---')
      } else {
        console.log('✅ All required columns exist!')
      }
    } else {
      console.log('No bookmarks found, but connection is working')
    }
    
    // Also check folders
    const { data: testFolders, error: folderError } = await supabaseAdmin
      .from('folders')
      .select('*')
      .limit(1)
    
    if (!folderError && testFolders && testFolders.length > 0) {
      console.log('\nFolder columns:', Object.keys(testFolders[0]))
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSchema() 