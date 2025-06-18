#!/bin/bash

echo "🚀 Composio MCP Setup for Cursor"
echo "Following: https://docs.composio.dev/mcp/clients/cursor"
echo "=================================================="

# Step 1: Check Node.js Installation
echo "📝 Step 1: Checking Node.js Installation"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION is installed"

# Check if version is 10 or higher
MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
if [ "$MAJOR_VERSION" -lt 10 ]; then
    echo "❌ Node.js version 10 or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version meets requirements"
echo ""

# Step 2: Install MCP Tools
echo "📝 Step 2: Installing Composio MCP Package"
echo "Installing @composio/mcp package..."

if npm install @composio/mcp@latest; then
    echo "✅ @composio/mcp package installed successfully"
else
    echo "❌ Failed to install @composio/mcp package"
    exit 1
fi

echo ""

# Step 3: Create Cursor MCP Configuration
echo "📝 Step 3: Creating Cursor MCP Configuration"

# Get absolute path to the working Python server
SERVER_PATH="$(pwd)/composio-mcp-server-enhanced.py"

if [ ! -f "$SERVER_PATH" ]; then
    echo "❌ composio-mcp-server-enhanced.py not found"
    exit 1
fi

# Make sure the server is executable
chmod +x "$SERVER_PATH"

# Create Cursor MCP configuration following the documentation
cat > cursor-mcp-config.json << EOF
{
  "mcpServers": {
    "composio": {
      "command": "python3",
      "args": ["$SERVER_PATH"],
      "env": {
        "COMPOSIO_API_KEY": "3nf218shuwbcvquot6mznn"
      }
    }
  }
}
EOF

echo "✅ Cursor MCP configuration created: cursor-mcp-config.json"
echo ""

# Step 4: Display setup instructions
echo "📝 Step 4: Cursor Setup Instructions"
echo "====================================="
echo ""
echo "1. Open Cursor settings:"
echo "   • Mac: Cursor → Preferences → Extensions → MCP" 
echo "   • Windows/Linux: File → Preferences → Extensions → MCP"
echo ""
echo "2. Add this configuration to your Cursor MCP settings:"
echo ""
cat cursor-mcp-config.json
echo ""
echo "3. Restart Cursor to load the MCP server"
echo ""

# Step 5: Authentication information
echo "🔐 Authentication Methods (from documentation):"
echo "==============================================="
echo ""
echo "OAuth Authentication:"
echo "1. Ask the LLM if there is any active connection"
echo "2. If no connection exists, ask LLM to initiate connection"
echo "3. Click the authentication link and complete OAuth in browser"
echo "4. Execute actions once authenticated"
echo ""
echo "API Key Authentication:"
echo "1. Ask the LLM if there is any active connection"
echo "2. If no connection exists, ask LLM to initiate connection"
echo "3. Enter your API key when prompted in chat interface"
echo "4. Execute actions after successful authentication"
echo ""

# Step 6: Troubleshooting
echo "🔧 Troubleshooting (from documentation):"
echo "========================================"
echo ""
echo "Missing Authentication Link:"
echo '• Ask: "Connect to [App name] first and output the auth link"'
echo '• Or: "Run COMPOSIO_INITIATE_CONNECTION for [App name] and output the auth link"'
echo ""
echo "Connection Verification Issues:"
echo '• Ask: "Run COMPOSIO_INITIATE_CONNECTION for [app name] and provide the authentication link"'
echo ""

# Step 7: Available tools and best practices
echo "🛠️  Available Tools:"
echo "==================="
echo "✅ Gmail (send, read, manage emails)"
echo "✅ GitHub (repos, issues, PRs, code)"
echo "✅ Slack (messages, channels, users)"
echo "✅ Notion (pages, databases, blocks)"
echo "✅ Google Drive (files, folders, sharing)"
echo "✅ HubSpot (contacts, deals, companies)"
echo "✅ Jira (issues, projects, boards)"
echo "✅ Discord (messages, servers, channels)"
echo ""
echo "⚠️  Best Practices:"
echo "=================="
echo "• Use no more than 3 MCP servers simultaneously"
echo "• This ensures stable connectivity and proper functionality"
echo "• Connecting more servers may result in authentication/connection issues"
echo ""
echo "🎉 Setup Complete!"
echo "Follow the steps above to configure Cursor with Composio MCP tools." 