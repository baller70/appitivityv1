#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Path to the Python MCP server
const pythonScript = path.join(__dirname, 'nocodebackend-mcp-server.py');

// Spawn the Python process
const pythonProcess = spawn('python3', [pythonScript], {
    stdio: 'inherit'
});

// Handle process exit
pythonProcess.on('exit', (code) => {
    process.exit(code);
});

// Handle errors
pythonProcess.on('error', (err) => {
    console.error('Failed to start Python MCP server:', err);
    process.exit(1);
}); 