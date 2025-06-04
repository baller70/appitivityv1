import { createClient } from '@supabase/supabase-js'
import { normalizeUserId } from './uuid-compat'
import type { Database } from '../types/supabase'

// Create admin client directly with proper configuration
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
)

/**
 * Create a user profile if it doesn't exist
 */
export async function ensureUserProfile(userId: string, email: string, fullName?: string) {
  const normalizedUserId = normalizeUserId(userId)
  console.log('Ensuring profile for user:', normalizedUserId, 'from Clerk ID:', userId)
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', normalizedUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error - that's expected for new users
      console.error('Error checking profile:', fetchError)
      throw fetchError
    }

    if (existingProfile) {
      console.log('Profile already exists for user:', normalizedUserId)
      return { success: true, profile: existingProfile }
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: normalizedUserId,
        email: email,
        full_name: fullName || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      throw createError
    }

    console.log('Created new profile for user:', normalizedUserId)
    return { success: true, profile: newProfile }

  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

 