import { supabaseAdmin } from './supabase'
import { normalizeUserId } from './uuid-compat'

/**
 * Create a user profile if it doesn't exist
 */
export async function ensureUserProfile(userId: string, email: string, fullName?: string) {
  const normalizedUserId = normalizeUserId(userId)
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', normalizedUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected
      console.error('Error fetching user profile:', fetchError)
      return false
    }

    if (!existingProfile) {
      // Create the profile using admin client to bypass RLS
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: normalizedUserId,
          email,
          full_name: fullName
        })

      if (error) {
        console.error('Failed to create user profile:', error)
        return false
      }
      console.log('User profile created for:', userId)
    }

    return true
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return false
  }
} 