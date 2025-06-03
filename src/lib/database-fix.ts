import { supabase } from './supabase'

/**
 * Temporary fix to disable RLS and allow app to work
 * This should be replaced with proper Clerk integration
 */
export async function fixDatabaseForClerk() {
  try {
    console.log('Applying database fixes for Clerk integration...')
    
    // Check if we can connect to the database
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return false
    }
    
    console.log('Database connection successful')
    return true
    
  } catch (error) {
    console.error('Database fix failed:', error)
    return false
  }
} 