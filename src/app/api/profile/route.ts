import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log('Profile API: Starting request')
    const startTime = Date.now()
    
    const { userId } = await auth()
    
    if (!userId) {
      console.log('Profile API: No auth, using fallback user')
      return NextResponse.json({
        id: '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121',
        email: 'fallback@example.com',
        fullName: 'Demo User',
        createdAt: new Date().toISOString(),
        responseTime: Date.now() - startTime
      })
    }

    const user = await currentUser()
    
    if (!user) {
      console.log('Profile API: No user found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const email = user.emailAddresses?.[0]?.emailAddress
    if (!email) {
      console.log('Profile API: No email found')
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    // Quick database lookup with minimal fields
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('email', email)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Profile API: Database error:', error)
      // Return user data even if profile lookup fails
      return NextResponse.json({
        id: userId,
        email,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        createdAt: user.createdAt,
        responseTime: Date.now() - startTime,
        source: 'clerk_fallback'
      })
    }

    const responseTime = Date.now() - startTime
    console.log(`Profile API: Completed in ${responseTime}ms`)

    // For Clerk users without profiles, return Clerk ID but don't store it in DB
    const responseId = profile?.id || userId
    
    return NextResponse.json({
      id: responseId,
      email: profile?.email || email,
      fullName: profile?.full_name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      createdAt: profile?.created_at || user.createdAt,
      responseTime,
      source: profile ? 'database' : 'clerk'
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Profile API: Critical error:', errorMessage)
    
    return NextResponse.json({
      error: 'Profile request failed',
      message: errorMessage,
      responseTime: Date.now()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Profile API POST: Starting request')
    const startTime = Date.now()
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, email } = body

    // Generate a UUID for Clerk users or use existing profile
    let profileId = userId
    
    // Check if this is a Clerk user ID (starts with 'user_')
    if (userId.startsWith('user_')) {
      // Look up existing profile by email first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
      
      if (existingProfile) {
        profileId = existingProfile.id
      } else {
        // Generate a new UUID for this Clerk user
        const { data: uuidData } = await supabase
          .rpc('gen_random_uuid')
        profileId = uuidData || crypto.randomUUID()
      }
    }

    // Quick update
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profileId,
        email,
        full_name: fullName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select('id, email, full_name')
      .single()

    if (error) {
      console.error('Profile API POST: Update failed:', error)
      return NextResponse.json({ 
        error: 'Update failed',
        responseTime: Date.now() - startTime 
      }, { status: 500 })
    }

    const responseTime = Date.now() - startTime
    console.log(`Profile API POST: Completed in ${responseTime}ms`)

    return NextResponse.json({
      ...data,
      responseTime
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Profile API POST: Critical error:', errorMessage)
    
    return NextResponse.json({
      error: 'Profile update failed',
      message: errorMessage,
      responseTime: Date.now()
    }, { status: 500 })
  }
} 