import { NextResponse } from 'next/server'
import { TagServiceLite } from '../../../lib/services/tags-lite'
import { ensureUserProfile } from '../../../lib/fix-database'

export async function GET() {
  try {
    console.log('Debug Tags - Starting')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Debug Tags - Environment check:')
    console.log('- SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('- SERVICE_KEY:', supabaseKey ? 'SET' : 'NOT SET')
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Environment variables not set',
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!supabaseKey
      }, { status: 500 })
    }
    
    // Get proper user ID using ensureUserProfile
    console.log('Debug Tags - Getting user profile')
    const userProfile = await ensureUserProfile('demo-user', 'demo@example.com', 'Demo User')
    if (!userProfile.success) {
      throw new Error('Failed to ensure user profile: ' + userProfile.error)
    }
    console.log('Debug Tags - User profile resolved to:', userProfile.userId)
    
    // Create TagServiceLite
    console.log('Debug Tags - Creating TagServiceLite')
    const tagService = new TagServiceLite(userProfile.userId!)
    
    // Test getting tags
    console.log('Debug Tags - Getting tags')
    const tags = await tagService.getTags()
    
    console.log('Debug Tags - Success, found', tags.length, 'tags')
    
    return NextResponse.json({
      success: true,
      tagsCount: tags.length,
      tags: tags
    })
  } catch (error) {
    console.error('Debug Tags - Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('Debug Tags POST - Starting')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Debug Tags POST - Environment check:')
    console.log('- SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('- SERVICE_KEY:', supabaseKey ? 'SET' : 'NOT SET')
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Environment variables not set',
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!supabaseKey
      }, { status: 500 })
    }
    
    // Get proper user ID using ensureUserProfile
    console.log('Debug Tags POST - Getting user profile')
    const userProfile = await ensureUserProfile('demo-user', 'demo@example.com', 'Demo User')
    if (!userProfile.success) {
      throw new Error('Failed to ensure user profile: ' + userProfile.error)
    }
    console.log('Debug Tags POST - User profile resolved to:', userProfile.userId)
    
    // Create TagServiceLite
    console.log('Debug Tags POST - Creating TagServiceLite')
    const tagService = new TagServiceLite(userProfile.userId!)
    
    // Test creating a tag
    console.log('Debug Tags POST - Creating tag')
    const tag = await tagService.createTag({
      name: 'debug-test-tag-' + Date.now(),
      color: '#00FF00'
    })
    
    console.log('Debug Tags POST - Success, created tag:', tag)
    
    return NextResponse.json({
      success: true,
      tag: tag
    })
  } catch (error) {
    console.error('Debug Tags POST - Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
} 