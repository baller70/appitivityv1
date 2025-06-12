/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DnaProfileService } from '@/lib/services/dna-profile';
import { normalizeUserId } from '../../../lib/uuid-compat';

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

    const profile = await dnaService.getDnaProfile();
    
    if (!profile) {
      return NextResponse.json({ error: 'DNA profile not found' }, { status: 404 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }

    return NextResponse.json(profile);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error fetching DNA profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DNA profile' },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }

    const normalizedUserId = normalizeUserId(userId);
    const dnaService = new DnaProfileService(normalizedUserId);

    // Trigger a new analysis
    const analysis = await dnaService.analyzeProfile();

    return NextResponse.json(analysis);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.error('Error analyzing DNA profile:', error);
    return NextResponse.json(
      { error: 'Failed to analyze DNA profile' },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { status: 500 }
    );
  }
} 