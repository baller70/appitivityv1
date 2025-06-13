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

    const result = await PlaylistService.launchPlaylist(playlistId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error launching playlist:', error);
    return NextResponse.json(
      { error: 'Failed to launch playlist' },
      { status: 500 }
    );
  }
} 