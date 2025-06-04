import { createSupabaseClient } from '../supabase'
import { normalizeUserId } from '../uuid-compat'
import type { 
  Profile, 
  ProfileInsert, 
  ProfileUpdate 
} from '../../types/supabase'

export class ProfileService {
  private supabase
  private userId: string

  constructor(userId: string) {
    // Normalize the user ID to UUID format for database operations
    this.userId = normalizeUserId(userId)
    this.supabase = createSupabaseClient(this.userId)
  }

  // Get the current user's profile
  async getProfile(): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data
  }

  // Create a new profile for the user
  async createProfile(profile: Omit<ProfileInsert, 'id'>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        ...profile,
        id: this.userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`)
    }

    return data
  }

  // Update the user's profile
  async updateProfile(updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
  }

  // Create or update profile (upsert)
  async upsertProfile(profile: Omit<ProfileInsert, 'id'>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        ...profile,
        id: this.userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert profile: ${error.message}`)
    }

    return data
  }

  // Get or create profile (useful for first-time login)
  async getOrCreateProfile(defaultProfile: Omit<ProfileInsert, 'id'>): Promise<Profile> {
    const existingProfile = await this.getProfile()
    
    if (existingProfile) {
      return existingProfile
    }

    return this.createProfile(defaultProfile)
  }

  // Delete the user's profile
  async deleteProfile(): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', this.userId)

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`)
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    bookmarkCount: number
    folderCount: number
    tagCount: number
    favoriteCount: number
    archivedCount: number
  }> {
    const [
      bookmarks,
      folders,
      tags,
      favorites,
      archived
    ] = await Promise.all([
      this.supabase
        .from('bookmarks')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId),
      this.supabase
        .from('folders')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId),
      this.supabase
        .from('tags')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId),
      this.supabase
        .from('bookmarks')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId)
        .eq('is_favorite', true),
      this.supabase
        .from('bookmarks')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId)
        .eq('is_archived', true)
    ])

    return {
      bookmarkCount: bookmarks.count || 0,
      folderCount: folders.count || 0,
      tagCount: tags.count || 0,
      favoriteCount: favorites.count || 0,
      archivedCount: archived.count || 0
    }
  }
} 