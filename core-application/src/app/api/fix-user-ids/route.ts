import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

if (!supabaseAdmin) {
  throw new Error('Supabase admin client not initialized')
}

export async function POST() {
  try {
    console.log('Starting user ID fix process...')
    
    // Get all profiles to understand the current state
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: profiles, error: profileError } = await supabaseAdmin!
      .from('profiles')
      .select('id, email')
    
    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`)
    }
    
    console.log('Found profiles:', profiles?.length)
    
    // Get all bookmarks to see which ones need fixing
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: bookmarks, error: bookmarkError } = await supabaseAdmin!
      .from('bookmarks')
      .select('id, user_id, title')
    
    if (bookmarkError) {
      throw new Error(`Failed to fetch bookmarks: ${bookmarkError.message}`)
    }
    
    console.log('Found bookmarks:', bookmarks?.length)
    
    // Get all folders to see which ones need fixing
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: folders, error: folderError } = await supabaseAdmin!
      .from('folders')
      .select('id, user_id, name')
    
    if (folderError) {
      throw new Error(`Failed to fetch folders: ${folderError.message}`)
    }
    
    console.log('Found folders:', folders?.length)
    
    // Find the correct mapping
    // From the logs, we know:
    // - Bookmarks have user_id: "eabfb59b-45dd-5bec-a2f3-6a23ab7f0b4f" (normalized Clerk ID)
    // - Folders have user_id: "085b8f63-7a51-5b8a-8e7f-4c6da6ab0121" (actual profile ID)
    // - The profile ID that should be used is: "085b8f63-7a51-5b8a-8e7f-4c6da6ab0121"
    
    const incorrectUserId = "eabfb59b-45dd-5bec-a2f3-6a23ab7f0b4f"
    const correctUserId = "085b8f63-7a51-5b8a-8e7f-4c6da6ab0121"
    
    // Update all bookmarks to use the correct user ID
    const bookmarksToUpdate = bookmarks?.filter(b => b.user_id === incorrectUserId) || []
    console.log('Bookmarks to update:', bookmarksToUpdate.length)
    
    if (bookmarksToUpdate.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { data: updatedBookmarks, error: updateError } = await supabaseAdmin!
        .from('bookmarks')
        .update({ user_id: correctUserId })
        .eq('user_id', incorrectUserId)
        .select('id, user_id, title')
      
      if (updateError) {
        throw new Error(`Failed to update bookmarks: ${updateError.message}`)
      }
      
      console.log('Updated bookmarks:', updatedBookmarks?.length)
    }
    
    // Check if there are any other tables that might need updating
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: tags, error: tagError } = await supabaseAdmin!
      .from('tags')
      .select('id, user_id, name')
    
    if (!tagError && tags) {
      const tagsToUpdate = tags.filter(t => t.user_id === incorrectUserId)
      console.log('Tags to update:', tagsToUpdate.length)
      
      if (tagsToUpdate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { data: updatedTags, error: updateTagError } = await supabaseAdmin!
          .from('tags')
          .update({ user_id: correctUserId })
          .eq('user_id', incorrectUserId)
          .select('id, user_id, name')
        
        if (updateTagError) {
          console.error('Failed to update tags:', updateTagError.message)
        } else {
          console.log('Updated tags:', updatedTags?.length)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'User ID fix completed',
      details: {
        profiles: profiles?.length || 0,
        bookmarks: bookmarks?.length || 0,
        folders: folders?.length || 0,
        bookmarksUpdated: bookmarksToUpdate.length,
        incorrectUserId,
        correctUserId
      }
    })
    
  } catch (error) {
    console.error('Error fixing user IDs:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 