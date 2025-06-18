#!/bin/bash

echo "🔍 Cursor Environment Diagnostic Tool"
echo "====================================="
echo ""

# Check Cursor installation and version
echo "1. 📦 Cursor Installation Check"
echo "------------------------------"
if command -v cursor >/dev/null 2>&1; then
    echo "✅ Cursor CLI found"
    cursor --version 2>/dev/null || echo "⚠️  Could not get Cursor version"
else
    echo "❌ Cursor CLI not found in PATH"
fi

# Check if Cursor app is running
echo ""
echo "2. 🏃 Cursor Process Check"
echo "-------------------------"
if pgrep -f "Cursor" >/dev/null; then
    echo "✅ Cursor app is running"
    echo "   Processes:"
    pgrep -fl "Cursor" | head -3
else
    echo "❌ Cursor app is not running"
fi

# Check GitHub integration
echo ""
echo "3. 🐙 GitHub Integration Check"
echo "------------------------------"
if [ -f "$HOME/.cursor/github_auth" ]; then
    echo "✅ GitHub auth file exists"
else
    echo "❌ GitHub auth file missing"
fi

# Check MCP configuration
echo ""
echo "4. 🤖 MCP Configuration Check"
echo "-----------------------------"
if [ -f "configuration/claude_desktop_config.json" ]; then
    echo "✅ Claude Desktop config found"
    if grep -q "mcpServers" "configuration/claude_desktop_config.json" 2>/dev/null; then
        echo "✅ MCP servers configured"
    else
        echo "⚠️  No MCP servers found in config"
    fi
else
    echo "❌ Claude Desktop config not found"
fi

# Check workspace configuration
echo ""
echo "5. 🏢 Workspace Configuration"
echo "-----------------------------"
if [ -f "project.code-workspace" ]; then
    echo "✅ VS Code workspace file exists"
else
    echo "❌ VS Code workspace file missing"
fi

# Check for common issues
echo ""
echo "6. ⚠️  Common Issues Check"
echo "--------------------------"

# Check for terminal command issues
echo "Terminal command test:"
if ls >/dev/null 2>&1; then
    echo "✅ Basic terminal commands work"
else
    echo "❌ Terminal commands failing"
fi

# Check file permissions
echo "File permissions test:"
if touch test_file.tmp 2>/dev/null && rm test_file.tmp 2>/dev/null; then
    echo "✅ File operations work"
else
    echo "❌ File operations failing"
fi

# Check Node.js and npm
echo "Node.js environment:"
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found"
fi

if command -v npm >/dev/null 2>&1; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found"
fi

# Check Git
echo "Git environment:"
if command -v git >/dev/null 2>&1; then
    echo "✅ Git found: $(git --version)"
    if git status >/dev/null 2>&1; then
        echo "✅ Git repository is valid"
    else
        echo "⚠️  Git repository issues detected"
    fi
else
    echo "❌ Git not found"
fi

echo ""
echo "7. 🔧 Recommended Fixes"
echo "----------------------"
echo ""

# Provide specific recommendations based on findings
echo "Based on the diagnostic, here are the recommended fixes:"
echo ""
echo "A. For terminal command issues:"
echo "   - Restart Cursor completely"
echo "   - Check if running as administrator/sudo"
echo "   - Verify PATH environment variable"
echo ""
echo "B. For GitHub integration issues:"
echo "   - Run: ./development-tools/fix_cursor_github_access.sh"
echo "   - Or: ./development-tools/install_cursor_github_app.sh"
echo ""
echo "C. For MCP issues:"
echo "   - Run: ./development-tools/activate-mcp.sh"
echo "   - Check: ./development-tools/test_mcp_installation.sh"
echo ""
echo "D. For workspace issues:"
echo "   - Open project.code-workspace in VS Code/Cursor"
echo "   - Reload window (Cmd/Ctrl + Shift + P -> 'Reload Window')"
echo ""
echo "E. General troubleshooting:"
echo "   - Clear Cursor cache: rm -rf ~/.cursor/cache"
echo "   - Reset Cursor settings: rm -rf ~/.cursor/User/settings.json"
echo "   - Reinstall Cursor if issues persist"

echo ""
echo "🎯 Run specific fix scripts based on the issues found above."
echo "💡 If problems persist, try running Cursor with verbose logging:"
echo "   cursor --verbose --log-level=debug" 