const http = require('http');
const url = require('url');

const PORT = 5747;

// Create a simple HTTP server that mimics Stagewise extension
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[Stagewise Mock] ${req.method} ${pathname}`);

  // Handle different endpoints
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Stagewise mock server is running',
      port: PORT,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
  } else if (pathname === '/connect' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('[Stagewise Mock] Connection request:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        connected: true,
        sessionId: 'mock-session-' + Date.now(),
        capabilities: ['toolbar', 'react-plugin'],
        message: 'Connected to mock Stagewise server'
      }));
    });
  } else if (pathname === '/toolbar' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('[Stagewise Mock] Toolbar data received:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        received: true,
        processed: true,
        message: 'Toolbar data processed'
      }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not found',
      availableEndpoints: [
        'GET /health',
        'POST /connect',
        'POST /toolbar'
      ]
    }));
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          Stagewise Mock Server Running                     ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                            ║
║  URL: http://localhost:${PORT}                            ║
║                                                            ║
║  This simulates the Stagewise VS Code extension server.   ║
║  The real extension should handle these connections.      ║
║                                                            ║
║  Available endpoints:                                      ║
║  - GET  /health   - Check server status                   ║
║  - POST /connect  - Connect toolbar to extension          ║
║  - POST /toolbar  - Send toolbar data                     ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`
╔════════════════════════════════════════════════════════════╗
║                    ERROR                                   ║
╠════════════════════════════════════════════════════════════╣
║  Port ${PORT} is already in use!                          ║
║                                                            ║
║  This might mean:                                          ║
║  1. The real Stagewise extension is running (good!)       ║
║  2. Another process is using this port                    ║
║                                                            ║
║  Check with: lsof -i :${PORT}                             ║
╚════════════════════════════════════════════════════════════╝
    `);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
}); 