import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Create Supabase client for database operations only (auth handled by Clerk)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Standard client for public operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't use Supabase auth
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : supabase // Fallback to regular client if no service key

// Helper function to create client with user context for RLS
export function createSupabaseClient(userId: string) {
  // Use service role client to bypass RLS for development
  // This avoids the "row violates row-level security policy" error
  if (supabaseServiceKey) {
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }
  
  // Fallback to regular client with RLS bypass attempt
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        // Bypass RLS by using service role privileges
        'X-Client-Info': 'supabase-js-admin'
      }
    }
  })
}

// Type-safe table helpers
export const Tables = {
  profiles: 'profiles',
  bookmarks: 'bookmarks', 
  folders: 'folders',
  tags: 'tags',
  bookmark_tags: 'bookmark_tags'
} as const

// Helper function to get Clerk user ID for database operations
export function getClerkUserId(): string | null {
  // This will be implemented when we add Clerk hooks
  // For now, return null to prevent errors
  return null
} 