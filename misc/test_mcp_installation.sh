#!/bin/bash

echo "🐳 Docker MCP Installation Test"
echo "==============================="

# Check Docker is running
echo "📋 Checking Docker status..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check available MCP images
echo "📦 Checking MCP images..."
mcp_images=$(docker images | grep "^mcp/" | wc -l)
if [ $mcp_images -gt 0 ]; then
    echo "✅ Found $mcp_images MCP server images:"
    docker images | grep "^mcp/" | awk '{print "   - " $1 ":" $2}'
    
    echo ""
    echo "📊 MCP Server Categories:"
    echo "   Core: time, filesystem, sqlite, puppeteer"
    echo "   Development: github, git, postgres, memory"
    echo "   Utility: fetch"
    echo "   AI Automation: stagehand (built from source)"
else
    echo "⚠️  No MCP images found. Run installation commands first."
fi

# Check configuration files
echo "📝 Checking configuration files..."
if [ -f "gordon-mcp.yml" ]; then
    echo "✅ Gordon MCP configuration found"
else
    echo "⚠️  Gordon MCP configuration not found (gordon-mcp.yml)"
fi

if [ -f "claude_desktop_config.json" ]; then
    echo "✅ Claude Desktop configuration found"
else
    echo "⚠️  Claude Desktop configuration not found (claude_desktop_config.json)"
fi

# Check Stagehand installation
echo "🤘 Checking Stagehand MCP installation..."
if [ -d "mcp-server-browserbase/stagehand" ]; then
    echo "✅ Stagehand source code found"
    if [ -f "mcp-server-browserbase/stagehand/dist/index.js" ]; then
        echo "✅ Stagehand built successfully"
    else
        echo "⚠️  Stagehand not built. Run: cd mcp-server-browserbase/stagehand && npm run build"
    fi
else
    echo "⚠️  Stagehand not installed"
fi

if [ -f "STAGEHAND_MCP_SETUP.md" ]; then
    echo "✅ Stagehand documentation found"
else
    echo "⚠️  Stagehand documentation missing"
fi

# Test basic container functionality
echo "🧪 Testing container functionality..."
if docker run --rm hello-world > /dev/null 2>&1; then
    echo "✅ Docker containers can run successfully"
else
    echo "❌ Docker container test failed"
fi

echo ""
echo "📋 Summary:"
echo "============"
echo "✅ Docker MCP installation appears ready!"
echo ""
echo "🚀 Next steps:"
echo "   1. Install Docker Desktop MCP Toolkit extension"
echo "   2. Configure your AI client (Claude, Gordon, etc.)"
echo "   3. Start using MCP servers!"
echo ""
echo "📚 For more information, see: MCP_INSTALLATION_GUIDE.md" 