import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client – requires service role key (env already present for other admin routes)
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

// POST /api/maintenance/fix-tags
// Calls the `automate_tag_column` function in Supabase which:
//   1. Adds `tags JSONB` column to bookmarks if missing
//   2. Sends NOTIFY to PostgREST to reload schema
// The function must be created once in Supabase SQL editor (see docs).
export async function POST () {
  const { error } = await supabaseAdmin.rpc('automate_tag_column')

  if (error) {
    console.error('[fix-tags] RPC error', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 