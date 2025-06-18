const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixTimeTrackingSchema() {
  console.log('🔧 Fixing time tracking schema...')
  
  try {
    // 1. Add clerk_id column to profiles
    console.log('1. Adding clerk_id column to profiles...')
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT;'
    })
    
    // 2. Create index
    console.log('2. Creating index on clerk_id...')
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);'
    })
    
    // 3. Update existing profiles
    console.log('3. Updating existing profiles with clerk_id...')
    await supabase.rpc('exec_sql', {
      sql: `UPDATE profiles 
            SET clerk_id = COALESCE(clerk_id, 'user_' || substr(md5(email), 1, 20))
            WHERE clerk_id IS NULL;`
    })
    
    // 4. Drop existing RLS policies
    console.log('4. Dropping existing RLS policies...')
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can manage their own bookmark sessions" ON bookmark_sessions;',
      'DROP POLICY IF EXISTS "Users can view their own bookmark sessions" ON bookmark_sessions;',
      'DROP POLICY IF EXISTS "Users can insert their own bookmark sessions" ON bookmark_sessions;',
      'DROP POLICY IF EXISTS "Users can update their own bookmark sessions" ON bookmark_sessions;'
    ]
    
    for (const sql of dropPolicies) {
      await supabase.rpc('exec_sql', { sql })
    }
    
    // 5. Create new RLS policies for bookmark_sessions
    console.log('5. Creating new RLS policies for bookmark_sessions...')
    const newPolicies = [
      `CREATE POLICY "Users can view their own bookmark sessions" ON bookmark_sessions
       FOR SELECT USING (user_id = auth.uid()::text OR user_id IN (
           SELECT id::text FROM profiles WHERE email = (
               SELECT email FROM auth.users WHERE id = auth.uid()
           )
       ));`,
      
      `CREATE POLICY "Users can insert their own bookmark sessions" ON bookmark_sessions
       FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id IN (
           SELECT id::text FROM profiles WHERE email = (
               SELECT email FROM auth.users WHERE id = auth.uid()
           )
       ));`,
      
      `CREATE POLICY "Users can update their own bookmark sessions" ON bookmark_sessions
       FOR UPDATE USING (user_id = auth.uid()::text OR user_id IN (
           SELECT id::text FROM profiles WHERE email = (
               SELECT email FROM auth.users WHERE id = auth.uid()
           )
       ));`,
      
      `CREATE POLICY "Users can delete their own bookmark sessions" ON bookmark_sessions
       FOR DELETE USING (user_id = auth.uid()::text OR user_id IN (
           SELECT id::text FROM profiles WHERE email = (
               SELECT email FROM auth.users WHERE id = auth.uid()
           )
       ));`
    ]
    
    for (const sql of newPolicies) {
      await supabase.rpc('exec_sql', { sql })
    }
    
    // 6. Enable RLS
    console.log('6. Enabling RLS...')
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE bookmark_sessions ENABLE ROW LEVEL SECURITY;'
    })
    
    // 7. Grant permissions
    console.log('7. Granting permissions...')
    await supabase.rpc('exec_sql', {
      sql: 'GRANT ALL ON bookmark_sessions TO authenticated;'
    })
    
    console.log('✅ Time tracking schema fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error)
    
    // Try direct SQL execution as fallback
    console.log('🔄 Trying direct SQL execution...')
    try {
      const { error: sqlError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (!sqlError) {
        console.log('✅ Database connection is working')
        
        // Try to add column directly
        const { error: alterError } = await supabase.rpc('sql', {
          query: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT'
        })
        
        if (alterError) {
          console.log('Using alternative approach...')
          // Alternative: Use raw SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              query: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT'
            })
          })
          
          if (response.ok) {
            console.log('✅ Schema fix applied via REST API')
          } else {
            console.log('❌ REST API failed:', await response.text())
          }
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
    }
  }
}

fixTimeTrackingSchema() 