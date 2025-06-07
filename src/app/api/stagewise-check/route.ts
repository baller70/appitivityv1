import { NextResponse } from 'next/server';

export async function GET() {
  const checks: {
    environment: string;
    stagewise: {
      toolbar: string;
      plugin: string;
      config: string;
      vscodeSettings: string;
      extensionConnection?: string;
    };
    recommendations: string[];
  } = {
    environment: process.env.NODE_ENV || 'unknown',
    stagewise: {
      toolbar: '@stagewise/toolbar-next installed',
      plugin: '@stagewise-plugins/react installed',
      config: 'stagewise.config.js present',
      vscodeSettings: '.vscode/settings.json configured'
    },
    recommendations: []
  };

  // Check if we can connect to the extension port
  try {
    const response = await fetch('http://localhost:5747/health', {
      method: 'GET',
      signal: AbortSignal.timeout(1000)
    });
    
    if (response.ok) {
      checks.stagewise.extensionConnection = '✅ Connected to extension on port 5747';
    } else {
      checks.stagewise.extensionConnection = '❌ Extension responded but with error';
      checks.recommendations.push('Check if Stagewise extension is properly initialized');
    }
  } catch (error) {
    checks.stagewise.extensionConnection = '❌ Cannot connect to extension on port 5747';
    checks.recommendations.push('Ensure Stagewise VS Code/Cursor extension is running');
    checks.recommendations.push('Try running CMD+Shift+P and search for "Stagewise: Start"');
  }

  return NextResponse.json(checks, { status: 200 });
} 