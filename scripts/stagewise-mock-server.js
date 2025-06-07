const http = require('http');

// Create servers for the range of ports Stagewise tries to connect to
const ports = [5747, 5748, 5749, 5750, 5751, 5752, 5753, 5754, 5755];
const servers = [];

ports.forEach(port => {
  const server = http.createServer((req, res) => {
    console.log(`Mock Stagewise server received request on port ${port}: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.url === '/ping/stagewise' || req.url === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        service: 'stagewise-mock',
        port: port,
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
  
  server.listen(port, 'localhost', () => {
    console.log(`Mock Stagewise server running on http://localhost:${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use (good! Real service might be running)`);
    } else {
      console.error(`Server error on port ${port}:`, err);
    }
  });
  
  servers.push(server);
});

console.log('Mock Stagewise servers started. Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down mock servers...');
  servers.forEach(server => server.close());
  process.exit(0);
}); 