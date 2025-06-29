/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DnaProfileService } from '@/lib/services/dna-profile';
import { normalizeUserId } from '../../../../lib/uuid-compat';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }

    const normalizedUserId = normalizeUserId(userId);
    const dnaService = new DnaProfileService(normalizedUserId);

    const stats = await dnaService.getProfileStats();

    return NextResponse.json(stats);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error fetching DNA profile stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    );
  }
} 