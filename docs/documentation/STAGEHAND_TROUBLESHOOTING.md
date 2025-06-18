# Stagehand MCP Troubleshooting Guide

## Current Status ✅

Stagehand MCP server is properly installed and configured:

- ✅ Server built successfully
- ✅ Dependencies installed  
- ✅ Environment variables configured
- ✅ MCP server responds to requests
- ✅ Tools are available (`stagehand_navigate`, `stagehand_act`, `stagehand_extract`, `stagehand_observe`)

## Configuration

**Location**: `/Users/kevinhouston/.cursor/mcp.json`

```json
"stagehand": {
  "command": "node",
  "args": ["/Volumes/Softwaare%20Program/apptivity%20final%20v1/mcp-server-browserbase/stagehand/dist/index.js"],
  "env": {
    "OPENAI_API_KEY": "your-openai-api-key-here",
    "BROWSERBASE_API_KEY": "your-browserbase-api-key-here",
    "BROWSERBASE_PROJECT_ID": "your-browserbase-project-id-here"
  }
}
```

## If Tools Still Don't Show

### 1. Restart Cursor Completely
```bash
# Close Cursor completely
# Then reopen it
```

### 2. Test Server Manually
```bash
cd "/Volumes/Softwaare Program/apptivity final v1/mcp-server-browserbase/stagehand"

# Test server responds
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | node dist/index.js

# Test tools list
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | node dist/index.js
```

### 3. Check Cursor MCP Status
- Look for MCP status in Cursor's status bar
- Check if there are any error messages in Cursor's console

### 4. Verify File Paths
Ensure these files exist:
- `/Volumes/Softwaare Program/apptivity final v1/mcp-server-browserbase/stagehand/dist/index.js`
- `/Users/kevinhouston/.cursor/mcp.json`

### 5. Alternative Configuration (Local Browser)
If Browserbase doesn't work, try local Chrome:

1. Open Chrome in debug mode:
```bash
open -a "Google Chrome" --args --remote-debugging-port=9222
```

2. Update MCP config:
```json
"stagehand": {
  "command": "node",
  "args": ["/Volumes/Softwaare%20Program/apptivity%20final%20v1/mcp-server-browserbase/stagehand/dist/index.js"],
  "env": {
    "OPENAI_API_KEY": "your-openai-api-key-here",
    "LOCAL_CDP_URL": "http://localhost:9222"
  }
}
```

## Available Tools

Once working, you should have access to:

1. **stagehand_navigate** - Navigate to URLs
2. **stagehand_act** - Perform actions on web elements  
3. **stagehand_extract** - Extract data from web pages
4. **stagehand_observe** - Observe elements on the page

## Next Steps

1. **Restart Cursor completely** - This is the most likely fix
2. If still not working, try the local Chrome configuration
3. Check Cursor's MCP status indicators 

## Common Issues and Solutions

### Issue: Stagehand MCP shows 0 tools

**Problem**: The Stagehand MCP server appears in Cursor but shows 0 tools available.

**Root Causes**:
1. **File path encoding**: Spaces in file paths need URL encoding (`%20`)
2. **Environment variables**: Missing or incorrect API keys
3. **Build issues**: The TypeScript wasn't compiled properly

**Solutions**:

#### ✅ FIXED: File Path Encoding
The issue was that spaces in the file path were not properly encoded. 

**Before (broken)**:
```json
"args": ["/Volumes/Softwaare Program/apptivity final v1/mcp-server-browserbase/stagehand/dist/index.js"]
```

**After (working)**:
```json
"args": ["/Volumes/Softwaare%20Program/apptivity%20final%20v1/mcp-server-browserbase/stagehand/dist/index.js"]
```

#### Environment Variables Check
Ensure all required environment variables are set in the Cursor MCP configuration:

```json
"env": {
  "OPENAI_API_KEY": "your-openai-api-key-here",
  "BROWSERBASE_API_KEY": "your-browserbase-api-key-here", 
  "BROWSERBASE_PROJECT_ID": "your-browserbase-project-id-here"
}
```

#### Verification Steps

1. **Test the server manually**:
   ```bash
   cd "/Volumes/Softwaare Program/apptivity final v1/mcp-server-browserbase/stagehand"
   node test_stagehand_mcp.js
   ```

2. **Expected output**:
   ```
   ✅ SUCCESS: Found 5 tools:
   - stagehand_navigate: Navigate to a URL in the browser
   - stagehand_act: Performs an action on a web page element
   - stagehand_extract: Extracts all of the text from the current page
   - stagehand_observe: Observes elements on the web page
   - screenshot: Takes a screenshot of the current page
   ```

3. **Restart Cursor** to reload MCP configuration

## Available Tools

Now that Stagehand MCP is working, you have access to these 5 powerful browser automation tools:

1. **stagehand_navigate** - Navigate to any URL
2. **stagehand_act** - Click buttons, fill forms, interact with elements
3. **stagehand_extract** - Extract all text content from a page
4. **stagehand_observe** - Find and observe specific elements
5. **screenshot** - Capture visual state of the page

## Testing Browserbase Integration

The server is configured to use Browserbase for remote browser sessions. When you use the tools, you can view the live session at:
`https://browserbase.com/sessions/[session-id]`

## Status: ✅ RESOLVED
The Stagehand MCP is now working properly with 5 tools available in Cursor! 