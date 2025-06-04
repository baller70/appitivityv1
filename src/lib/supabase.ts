import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Service role key is available in server environments
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client for public operations (uses RLS with Clerk user ID)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't use Supabase auth
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Admin client for server-side operations (bypasses RLS)
// Always create the admin client - it will only be used on the server
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })

// Helper function to create client with user context for RLS
export function createSupabaseClient(userId: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        // Set the user ID for RLS policies
        'x-user-id': userId
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