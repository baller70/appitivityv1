import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create authenticated Supabase client for storage operations
export async function createAuthenticatedSupabaseClient() {
  const { getToken } = await auth()
  
  // Get Supabase JWT token from Clerk
  const supabaseAccessToken = await getToken({
    template: 'supabase'
  })

  if (!supabaseAccessToken) {
    throw new Error('No Supabase access token available')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`
      }
    }
  })
}

// Client-side authenticated Supabase client
export function createClientAuthenticatedSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
} 