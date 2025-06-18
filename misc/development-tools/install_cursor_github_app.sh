#!/bin/bash

echo "🚀 Installing Cursor GitHub App"
echo "==============================="
echo ""

# Get repository information
REPO_OWNER="baller70"
REPO_NAME="appitivityv1"

echo "📁 Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to open URL
open_url() {
    local url="$1"
    echo "🌐 Opening: $url"
    
    if command_exists open; then
        open "$url"
    elif command_exists xdg-open; then
        xdg-open "$url"
    elif command_exists start; then
        start "$url"
    else
        echo "❌ Cannot open URL automatically. Please visit: $url"
    fi
}

echo "🔧 Step 1: Opening Cursor GitHub App Installation"
echo "================================================="

# Primary Cursor app installation URL
CURSOR_APP_URL="https://github.com/apps/cursor"
open_url "$CURSOR_APP_URL"

sleep 3

echo ""
echo "🔧 Step 2: Opening Repository-Specific Installation"
echo "=================================================="

# Repository-specific installation
REPO_INSTALL_URL="https://github.com/$REPO_OWNER/$REPO_NAME/settings/installations"
open_url "$REPO_INSTALL_URL"

sleep 3

echo ""
echo "🔧 Step 3: Opening GitHub Installations Settings"
echo "==============================================="

# GitHub installations settings
GITHUB_INSTALLS_URL="https://github.com/settings/installations"
open_url "$GITHUB_INSTALLS_URL"

sleep 2

echo ""
echo "📋 INSTALLATION INSTRUCTIONS:"
echo "============================="
echo ""
echo "1. In the first browser tab (Cursor App):"
echo "   → Click 'Install' button"
echo "   → Select '$REPO_OWNER' as the account"
echo "   → Choose 'Selected repositories'"
echo "   → Select '$REPO_NAME' repository"
echo "   → Click 'Install'"
echo ""
echo "2. If you see a permissions screen:"
echo "   → Review the permissions (they should be reasonable)"
echo "   → Click 'Authorize' or 'Accept'"
echo ""
echo "3. In Cursor IDE:"
echo "   → Go to Settings → Personal Configuration"
echo "   → Find 'GitHub Access' section"
echo "   → Click 'Connect GitHub' or 'Refresh'"
echo "   → You should see 'Connected' status"
echo ""
echo "✅ Verification:"
echo "==============="
echo "- GitHub Access in Cursor shows 'Connected'"
echo "- No 'Access Denied' errors"
echo "- Background agents can access your repository"
echo ""
echo "🔄 If still having issues:"
echo "========================="
echo "- Restart Cursor completely"
echo "- Try disconnecting and reconnecting GitHub in Cursor"
echo "- Check that you have admin access to the repository"
echo "- Verify the Cursor app appears in your GitHub installations"
echo ""
echo "🎯 Done! Your Cursor GitHub integration should now be working." 