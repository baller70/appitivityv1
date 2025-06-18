import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    const startTime = Date.now()
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        url: !!supabaseUrl,
        key: !!supabaseKey
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test different tables to see what exists
    const tables = ['bookmarks', 'tags', 'folders', 'user_profiles', 'profiles']
    const results = []
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        results.push({
          table,
          exists: !error,
          error: error?.message,
          count: data?.length || 0
        })
      } catch (err) {
        results.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    const responseTime = Date.now() - startTime
    console.log(`Supabase test completed in ${responseTime}ms`)
    
    return NextResponse.json({
      success: true,
      responseTime,
      url: supabaseUrl.substring(0, 30) + '...',
      tables: results
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 