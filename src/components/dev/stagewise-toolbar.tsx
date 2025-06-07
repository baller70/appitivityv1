'use client';

import { useEffect, useState } from 'react';

const StagewiseToolbarWrapper = () => {
  const [isClient, setIsClient] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || process.env.NODE_ENV !== 'development') return;

    // Try to connect to the Stagewise extension server
    const checkConnection = async () => {
      try {
        console.log('🔌 Stagewise: Attempting to connect to extension on port 5747...');
        const response = await fetch('http://localhost:5747/health');
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Stagewise: Connected to extension!', data);
          setConnectionStatus('connected');
          
          // Now try to establish a toolbar connection
          const connectResponse = await fetch('http://localhost:5747/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'toolbar',
              url: window.location.href,
              timestamp: new Date().toISOString()
            })
          });
          
          if (connectResponse.ok) {
            const connectData = await connectResponse.json();
            console.log('✅ Stagewise: Toolbar connected!', connectData);
          }
        } else {
          throw new Error('Extension not responding');
        }
      } catch (error) {
        console.error('❌ Stagewise: Failed to connect to extension on port 5747', error);
        setConnectionStatus('failed');
      }
    };

    checkConnection();
    
    // Retry connection every 5 seconds if failed
    const interval = setInterval(() => {
      if (connectionStatus === 'failed') {
        checkConnection();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isClient, connectionStatus]);

  // Only render on client side in development
  if (!isClient || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <StagewiseClientOnly connectionStatus={connectionStatus} />;
};

// Separate component that loads Stagewise
const StagewiseClientOnly = ({ connectionStatus }: { connectionStatus: string }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadStagewise = async () => {
      try {
        const { StagewiseToolbar } = await import('@stagewise/toolbar-next');
        const { ReactPlugin } = await import('@stagewise-plugins/react');
        
        const ToolbarComponent = () => (
          <StagewiseToolbar 
            config={{ 
              plugins: [ReactPlugin]
            }} 
          />
        );
        
        // Create a container for the toolbar
        const container = document.createElement('div');
        container.id = 'stagewise-toolbar-root';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        
        // Add connection status indicator
        if (connectionStatus !== 'connected') {
          container.innerHTML = `
            <div style="
              background: ${connectionStatus === 'connecting' ? '#FFA500' : '#FF0000'};
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              font-family: system-ui;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            ">
              Stagewise: ${connectionStatus === 'connecting' ? 'Connecting to extension...' : 'Extension not found on port 5747'}
            </div>
          `;
        }
        
        document.body.appendChild(container);
        
        if (connectionStatus === 'connected') {
          // Only render the actual toolbar if connected
          const { createRoot } = await import('react-dom/client');
          const root = createRoot(container);
          root.render(<ToolbarComponent />);
          console.log('✅ Stagewise: Toolbar rendered successfully!');
        }
        
        setLoaded(true);
        
        // Set global flag
        (window as any).__STAGEWISE_LOADED__ = true;
        (window as any).__STAGEWISE_CONNECTION__ = connectionStatus;
      } catch (error) {
        console.error('❌ Stagewise: Failed to load toolbar', error);
        (window as any).__STAGEWISE_LOADED__ = false;
        (window as any).__STAGEWISE_ERROR__ = error;
      }
    };

    loadStagewise();
    
    // Cleanup
    return () => {
      const container = document.getElementById('stagewise-toolbar-root');
      if (container) {
        container.remove();
      }
    };
  }, [connectionStatus]);

  return null;
};

export default StagewiseToolbarWrapper; 