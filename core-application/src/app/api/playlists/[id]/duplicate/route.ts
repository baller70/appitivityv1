import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PlaylistService } from '@/lib/services/playlist';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;

    const duplicatedPlaylist = await PlaylistService.duplicatePlaylist(playlistId);

    return NextResponse.json({ playlist: duplicatedPlaylist });
  } catch (error) {
    console.error('Error duplicating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate playlist' },
      { status: 500 }
    );
  }
} 