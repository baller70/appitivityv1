import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating bookmark_relationships table...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Since we can't execute raw SQL, let's create the table structure manually
    // by attempting to insert a record and handling the error
    
    console.log('Attempting to create table structure...')
    
    // First, let's check if the table exists by trying to select from it
    const { data: existingData, error: selectError } = await supabase
      .from('bookmark_relationships')
      .select('id')
      .limit(1)

    if (selectError && selectError.message.includes('does not exist')) {
      console.log('Table does not exist. Since we cannot create it via SQL, we need to create it manually in Supabase Dashboard.')
      
      return NextResponse.json({ 
        success: false, 
        error: 'Table does not exist and cannot be created programmatically. Please create the bookmark_relationships table manually in Supabase Dashboard with the following structure:\n\nCREATE TABLE bookmark_relationships (\n  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n  bookmark_id UUID NOT NULL,\n  related_bookmark_id UUID NOT NULL,\n  relationship_type TEXT DEFAULT \'related\',\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  created_by UUID,\n  UNIQUE(bookmark_id, related_bookmark_id),\n  CHECK (bookmark_id != related_bookmark_id)\n);',
        instructions: {
          step1: 'Go to your Supabase Dashboard',
          step2: 'Navigate to SQL Editor',
          step3: 'Run the following SQL:',
          sql: `CREATE TABLE bookmark_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bookmark_id UUID NOT NULL,
  related_bookmark_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'related',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(bookmark_id, related_bookmark_id),
  CHECK (bookmark_id != related_bookmark_id)
);`
        }
      }, { status: 400 })
    }

    console.log('✅ Table already exists or was accessible')
    
    return NextResponse.json({ 
      success: true, 
      message: 'bookmark_relationships table is accessible'
    })
    
  } catch (error) {
    console.error('❌ Error checking/creating table:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Try to select from the table
    const { data, error } = await supabase
      .from('bookmark_relationships')
      .select('id')
      .limit(1)

    const tableExists = !error || !error.message.includes('does not exist')
    
    return NextResponse.json({ 
      success: true, 
      tableExists,
      error: tableExists ? null : error?.message,
      message: tableExists ? 'Table exists and is accessible' : 'Table does not exist'
    })
    
  } catch (error) {
    console.error('❌ Error checking table:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 