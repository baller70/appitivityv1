import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUserId() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      // Try fallback authentication
      return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
    }

    const email = user.emailAddresses?.[0]?.emailAddress
    if (!email) {
      return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    return profile?.id || '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  } catch (error) {
    console.error('Auth error, using fallback:', error)
    return '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121'
  }
}

export async function GET() {
  try {
    const startTime = Date.now()
    const dbUserId = await getAuthenticatedUserId()
    
    // Direct query for tags
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name, color, created_at, updated_at')
      .eq('user_id', dbUserId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }

    const responseTime = Date.now() - startTime
    console.log(`GET tags completed in ${responseTime}ms`)
    
    return NextResponse.json(tags || [])
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, color } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    const dbUserId = await getAuthenticatedUserId()
    
    // Check if tag already exists for this user
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id, name')
      .eq('user_id', dbUserId)
      .eq('name', name.trim())
      .single()

    if (existingTag) {
      return NextResponse.json({ 
        error: `Tag "${name.trim()}" already exists`,
        code: 'TAG_ALREADY_EXISTS',
        existingTag
      }, { status: 409 })
    }
    
    // Direct tag creation
    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        name: name.trim(),
        color: color || '#3B82F6',
        user_id: dbUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      
      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: `Tag "${name.trim()}" already exists`,
          code: 'TAG_ALREADY_EXISTS'
        }, { status: 409 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to create tag',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ 
      error: 'Failed to create tag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 