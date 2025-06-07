'use client';

import { useEffect, useState } from 'react';

export default function StagewiseDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [extensionStatus, setExtensionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [stagewiseLoaded, setStagewiseLoaded] = useState(false);

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('Stagewise')) {
        setLogs(prev => [...prev, `[LOG] ${new Date().toLocaleTimeString()}: ${message}`]);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('Stagewise')) {
        setLogs(prev => [...prev, `[WARN] ${new Date().toLocaleTimeString()}: ${message}`]);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('Stagewise') || message.includes('stagewise')) {
        setLogs(prev => [...prev, `[ERROR] ${new Date().toLocaleTimeString()}: ${message}`]);
      }
    };

    // Check extension connection
    const checkExtension = async () => {
      try {
        const response = await fetch('http://localhost:5747/health', {
          method: 'GET',
          mode: 'no-cors'
        });
        setExtensionStatus('connected');
        setLogs(prev => [...prev, `[INFO] ${new Date().toLocaleTimeString()}: Extension check completed`]);
      } catch (error) {
        setExtensionStatus('disconnected');
        setLogs(prev => [...prev, `[ERROR] ${new Date().toLocaleTimeString()}: Cannot connect to extension on port 5747`]);
      }
    };

    checkExtension();

    // Check if Stagewise components are loaded
    const checkStagewise = () => {
      // @ts-ignore
      if (window.__STAGEWISE_LOADED__) {
        setStagewiseLoaded(true);
        setLogs(prev => [...prev, `[INFO] ${new Date().toLocaleTimeString()}: Stagewise components detected`]);
      }
    };

    const interval = setInterval(checkStagewise, 1000);

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stagewise Debug Dashboard</h1>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Extension Status</h2>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${
                extensionStatus === 'connected' ? 'bg-green-500' : 
                extensionStatus === 'disconnected' ? 'bg-red-500' : 
                'bg-yellow-500 animate-pulse'
              }`} />
              <span className="text-sm">
                {extensionStatus === 'connected' ? 'Connected to port 5747' :
                 extensionStatus === 'disconnected' ? 'Not connected' :
                 'Checking...'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Toolbar Status</h2>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${
                stagewiseLoaded ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                {stagewiseLoaded ? 'Components loaded' : 'Not loaded'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Environment</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {process.env.NODE_ENV}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">To Enable Stagewise:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open Command Palette: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">CMD+Shift+P</code></li>
            <li>Type "Stagewise" and look for:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Stagewise: Start</code></li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Stagewise: Initialize</code></li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Stagewise: Setup Toolbar</code></li>
              </ul>
            </li>
            <li>After running the command, refresh this page</li>
          </ol>
        </div>

        {/* Console Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stagewise Console Logs</h2>
          <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 h-64 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">No Stagewise-related logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.includes('[ERROR]') ? 'text-red-600' :
                  log.includes('[WARN]') ? 'text-yellow-600' :
                  log.includes('[LOG]') && log.includes('✅') ? 'text-green-600' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Elements */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test Elements</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            If Stagewise is working, hovering over these elements should show a toolbar:
          </p>
          <div className="space-y-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Test Button
            </button>
            <input 
              type="text" 
              placeholder="Test Input Field" 
              className="px-4 py-2 border rounded w-full max-w-md"
            />
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p>Test paragraph element - hover over this text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 