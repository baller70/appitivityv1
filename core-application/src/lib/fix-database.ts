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
 * Create a user profile if it doesn't exist and return the actual user ID to use
 */
export async function ensureUserProfile(userId: string, email: string, fullName?: string): Promise<{
  success: boolean
  profile?: { id: string; email: string }
  userId?: string // The actual user ID to use for database operations
  error?: string
  details?: any
}> {
  const normalizedUserId = normalizeUserId(userId)
  console.log('Ensuring profile for user:', normalizedUserId, 'from Clerk ID:', userId, 'email:', email, 'fullName:', fullName)
  
  try {
    // If email is provided, try finding profile by email first
    if (email) {
      const { data: profileByEmail, error: fetchByEmailError } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single()

      if (fetchByEmailError && fetchByEmailError.code !== 'PGRST116') {
        console.error('Error checking profile by email:', fetchByEmailError)
        throw fetchByEmailError
      }

      if (profileByEmail) {
        if (profileByEmail.id !== normalizedUserId) {
          console.log('Found profile with same email but different ID. Expected:', normalizedUserId, 'Found:', profileByEmail.id)
          console.log('Using existing profile ID:', profileByEmail.id)
        } else {
          console.log('Profile already exists for user ID:', normalizedUserId)
        }
        return { 
          success: true, 
          profile: profileByEmail,
          userId: profileByEmail.id // Always use the existing profile ID
        }
      }
    }

    // Then check if profile exists by the normalized user ID
    const { data: profileById, error: fetchByIdError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', normalizedUserId)
      .single()

    if (fetchByIdError && fetchByIdError.code !== 'PGRST116') {
      console.error('Error checking profile by ID:', fetchByIdError)
      throw fetchByIdError
    }

    if (profileById) {
      console.log('Profile already exists for user ID:', normalizedUserId)
      return { 
        success: true, 
        profile: profileById,
        userId: profileById.id
      }
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
      
      // If it's a duplicate key error, try to fetch the existing profile by email again
      if (createError.code === '23505' && createError.message?.includes('email')) {
        console.log('Profile creation failed due to duplicate email, fetching existing profile...')
        const { data: existingProfile, error: refetchError } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single()
        
        if (!refetchError && existingProfile) {
          console.log('Found existing profile after creation failure:', existingProfile.id)
          return { 
            success: true, 
            profile: existingProfile,
            userId: existingProfile.id
          }
        }
      }
      
      throw createError
    }

    console.log('Created new profile for user:', normalizedUserId)
    return { 
      success: true, 
      profile: newProfile,
      userId: newProfile.id
    }

  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', details: error }
  }
}

 