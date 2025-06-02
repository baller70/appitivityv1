import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client for database operations only
// Authentication is handled by Clerk
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable Supabase auth session management
    autoRefreshToken: false, // Disable auto token refresh
    detectSessionInUrl: false // Disable session detection in URL
  }
})

// Helper function to get Clerk user ID for database operations
export function getClerkUserId(): string | null {
  // This will be implemented when we add Clerk hooks
  // For now, return null to prevent errors
  return null
} 