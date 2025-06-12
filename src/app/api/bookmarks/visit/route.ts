import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { normalizeUserId } from '../../../../lib/uuid-compat';
import { ensureUserProfile } from '../../../../lib/fix-database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookmarkId } = await request.json();
    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    // Ensure user profile exists and get the actual profile ID
    let actualUserId = userId;
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || '';
      const fullName = user.firstName || '';
      const profileResult = await ensureUserProfile(userId, email, fullName);
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        );
      }
      
      // Use the actual profile ID from the database
      if (profileResult.userId) {
        actualUserId = profileResult.userId;
      }
    } else {
      // For demo mode, still need to ensure we have the right user ID
      const profileResult = await ensureUserProfile(userId, '', '');
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId;
      }
    }

    console.log('POST visit - using actualUserId:', actualUserId, 'for bookmark:', bookmarkId);

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database admin client not available' }, { status: 500 });
    }

    // First get current visit count
    const { data: currentBookmark } = await supabaseAdmin
      .from('bookmarks')
      .select('visit_count')
      .eq('id', bookmarkId)
      .eq('user_id', actualUserId)
      .single();

    const newVisitCount = (currentBookmark?.visit_count || 0) + 1;

    // Update visit count and last visited timestamp
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .update({
        visit_count: newVisitCount,
        last_visited_at: new Date().toISOString()
      })
      .eq('id', bookmarkId)
      .eq('user_id', actualUserId)
      .select('id, visit_count, last_visited_at')
      .single();

    if (error) {
      console.error('Error updating visit count:', error);
      return NextResponse.json({ error: 'Failed to update visit count' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      bookmark: data,
      message: 'Visit tracked successfully' 
    });

  } catch (error) {
    console.error('Error in visit tracking:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 