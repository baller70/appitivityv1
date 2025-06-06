import { NextRequest, NextResponse } from 'next/server';
import { createTestData } from '@/lib/test-data';

export async function POST(request: NextRequest) {
  try {
    const result = await createTestData();
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Test data created successfully!', 
        data: result 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to create test data', 
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test-data API:', error);
    return NextResponse.json({ 
      error: 'Failed to create test data', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 