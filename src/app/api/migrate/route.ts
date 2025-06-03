import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST() {
  try {
    console.log('Running bookmark relationships migration...');

    // Create bookmark_relationships table if it doesn't exist
    const { error: createError } = await supabaseAdmin.from('bookmark_relationships').select('id').limit(1);

    if (createError && createError.code === '42P01') {
      // Table doesn't exist, we need to create it via SQL
      // For now, let's just log that the table is missing
      console.log('bookmark_relationships table does not exist');
      
      return NextResponse.json({ 
        success: false,
        message: 'bookmark_relationships table does not exist. Please run migrations manually.',
        error: 'Table missing'
      }, { status: 400 });
    }

    if (createError) {
      console.error('Error checking table:', createError);
      return NextResponse.json({ 
        success: false,
        message: 'Error checking table existence',
        error: createError.message
      }, { status: 500 });
    }

    console.log('bookmark_relationships table exists');
    
    return NextResponse.json({ 
      success: true, 
      message: 'bookmark_relationships table is ready' 
    });

  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json(
      { error: 'Migration check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 