import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeUserId } from '@/lib/uuid-compat';

// GET /api/playlists - Get all playlists for user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normalizedUserId = normalizeUserId(userId);

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: playlists, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('user_id', normalizedUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }

    // Get bookmark counts for each playlist separately
    const playlistsWithCount = await Promise.all(
      (playlists || []).map(async (playlist) => {
        if (!supabaseAdmin) {
          return { ...playlist, bookmark_count: 0 };
        }
        
        const { count } = await supabaseAdmin
          .from('playlist_bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('playlist_id', playlist.id);
        
        return {
          ...playlist,
          bookmark_count: count || 0
        };
      })
    );

    return NextResponse.json({ playlists: playlistsWithCount });
  } catch (error) {
    console.error('Error in GET /api/playlists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/playlists - Create new playlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normalizedUserId = normalizeUserId(userId);
    const body = await request.json();
    const { name, description, color, icon, is_favorite } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: playlist, error } = await supabaseAdmin
      .from('playlists')
      .insert({
        user_id: normalizedUserId,
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || 'list',
        is_favorite: is_favorite || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating playlist:', error);
      return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/playlists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 