#!/bin/bash

echo "🔧 Cursor Environment Fix Tool"
echo "=============================="
echo ""

# Function to ask for user confirmation
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

echo "This script will attempt to fix common Cursor environment issues."
echo ""

# 1. Fix terminal command execution issues
echo "1. 🖥️  Fixing Terminal Command Issues"
echo "------------------------------------"
if confirm "Clear Cursor terminal cache and reset shell environment?"; then
    echo "Clearing terminal cache..."
    rm -rf ~/.cursor/terminal_cache 2>/dev/null
    rm -rf ~/.cursor/shell_integration 2>/dev/null
    echo "✅ Terminal cache cleared"
fi

# 2. Fix GitHub integration
echo ""
echo "2. 🐙 Fixing GitHub Integration"
echo "-------------------------------"
if confirm "Reset and reconfigure GitHub integration?"; then
    echo "Clearing GitHub auth cache..."
    rm -rf ~/.cursor/github_auth 2>/dev/null
    rm -rf ~/.cursor/User/globalStorage/github.* 2>/dev/null
    echo "✅ GitHub cache cleared"
    echo "💡 You'll need to reconnect GitHub in Cursor settings"
fi

# 3. Fix MCP configuration
echo ""
echo "3. 🤖 Fixing MCP Configuration"
echo "------------------------------"
if confirm "Reconfigure MCP servers?"; then
    if [ -f "development-tools/activate-mcp.sh" ]; then
        echo "Running MCP activation script..."
        chmod +x development-tools/activate-mcp.sh
        ./development-tools/activate-mcp.sh
    else
        echo "⚠️  MCP activation script not found"
    fi
fi

# 4. Fix workspace configuration
echo ""
echo "4. 🏢 Fixing Workspace Configuration"
echo "------------------------------------"
if confirm "Reset workspace and extension cache?"; then
    echo "Clearing workspace cache..."
    rm -rf ~/.cursor/User/workspaceStorage 2>/dev/null
    rm -rf ~/.cursor/CachedExtensions 2>/dev/null
    echo "✅ Workspace cache cleared"
fi

# 5. Fix general Cursor issues
echo ""
echo "5. 🔄 General Cursor Reset"
echo "--------------------------"
if confirm "Perform full Cursor cache reset (recommended)?"; then
    echo "Performing full cache reset..."
    
    # Close Cursor if running
    echo "Attempting to close Cursor..."
    pkill -f "Cursor" 2>/dev/null
    sleep 2
    
    # Clear all caches
    rm -rf ~/.cursor/cache 2>/dev/null
    rm -rf ~/.cursor/logs 2>/dev/null
    rm -rf ~/.cursor/User/logs 2>/dev/null
    rm -rf ~/.cursor/User/CachedExtensions 2>/dev/null
    
    echo "✅ Full cache reset completed"
fi

# 6. Fix file permissions
echo ""
echo "6. 📁 Fixing File Permissions"
echo "-----------------------------"
if confirm "Fix file permissions in project directory?"; then
    echo "Fixing permissions..."
    find . -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null
    chmod -R u+rw . 2>/dev/null
    echo "✅ File permissions fixed"
fi

# 7. Environment variables check
echo ""
echo "7. 🌍 Environment Variables"
echo "---------------------------"
echo "Checking critical environment variables..."

if [ -z "$PATH" ]; then
    echo "❌ PATH variable is empty"
else
    echo "✅ PATH variable is set"
fi

if [ -z "$HOME" ]; then
    echo "❌ HOME variable is empty"
else
    echo "✅ HOME variable is set"
fi

# 8. Final recommendations
echo ""
echo "8. 🎯 Final Steps"
echo "----------------"
echo ""
echo "After running this script:"
echo ""
echo "1. 🔄 Restart Cursor completely"
echo "2. 🏢 Open the project.code-workspace file"
echo "3. 🔌 Reconnect GitHub in Cursor settings"
echo "4. 🤖 Test AI assistant functionality"
echo "5. 🖥️  Test terminal commands"
echo ""
echo "If issues persist:"
echo "- Run: ./cursor-environment-diagnostic.sh"
echo "- Check Cursor logs: ~/.cursor/logs/"
echo "- Consider reinstalling Cursor"
echo ""

# Test basic functionality
echo "9. 🧪 Testing Basic Functionality"
echo "---------------------------------"
echo "Testing file operations..."
if touch test_cursor_fix.tmp 2>/dev/null && rm test_cursor_fix.tmp 2>/dev/null; then
    echo "✅ File operations working"
else
    echo "❌ File operations still failing"
fi

echo ""
echo "🎉 Cursor environment fix completed!"
echo "Please restart Cursor and test the functionality." 