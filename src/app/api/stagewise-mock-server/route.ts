import { NextResponse } from 'next/server';

// This is a mock endpoint to help debug Stagewise connection issues
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';

  // Simulate Stagewise extension server responses
  if (path === 'health') {
    return NextResponse.json({ 
      status: 'ok',
      message: 'Mock Stagewise server is running',
      port: 5747,
      version: '1.0.0'
    });
  }

  if (path === 'connect') {
    return NextResponse.json({
      connected: true,
      sessionId: 'mock-session-' + Date.now(),
      capabilities: ['toolbar', 'react-plugin']
    });
  }

  return NextResponse.json({
    message: 'Mock Stagewise server endpoint',
    availableEndpoints: ['/health', '/connect'],
    note: 'This is a mock server for debugging. The real Stagewise extension should run on port 5747'
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  console.log('Mock Stagewise server received:', body);
  
  return NextResponse.json({
    received: true,
    message: 'Mock server received your data',
    timestamp: new Date().toISOString()
  });
} 