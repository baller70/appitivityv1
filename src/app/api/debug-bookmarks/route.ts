// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const startTime = Date.now()
    console.log('Debug: Starting simple bookmark query')
    
    // Minimal query - just count bookmarks
    const { count, error } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121')

    const queryTime = Date.now() - startTime
    console.log(`Debug: Count query took ${queryTime}ms`)

    if (error) {
      console.error('Debug: Count query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Simple select query
    const selectStart = Date.now()
    const { data: bookmarks, error: selectError } = await supabase
      .from('bookmarks')
      .select('id, title, url, created_at')
      .eq('user_id', '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121')
      .limit(10)

    const selectTime = Date.now() - selectStart
    console.log(`Debug: Select query took ${selectTime}ms`)

    if (selectError) {
      console.error('Debug: Select query error:', selectError)
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    const totalTime = Date.now() - startTime
    console.log(`Debug: Total time ${totalTime}ms`)

    return NextResponse.json({
      success: true,
      count,
      bookmarks: bookmarks?.length || 0,
      performance: {
        countQuery: queryTime,
        selectQuery: selectTime,
        total: totalTime
      }
    })

  } catch (error) {
    console.error('Debug: Critical error:', error)
    return NextResponse.json({
      error: 'Debug query failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 