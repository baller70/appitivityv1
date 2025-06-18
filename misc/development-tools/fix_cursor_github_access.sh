#!/bin/bash

echo "🔧 Fixing Cursor GitHub Access Error"
echo "===================================="
echo ""
echo "📋 Error Details:"
echo "   - Location: Cursor Settings > Personal Configuration > GitHub Access"
echo "   - Error: Access Denied: The Cursor app needs to be installed on your repository"
echo "   - Request ID: f9202f4c-48b0-428b-9cd5-4ae7bcb1efa8"
echo ""

# Get repository info
REPO_OWNER="baller70"
REPO_NAME="appitivityv1"

echo "📁 Repository: $REPO_OWNER/$REPO_NAME"
echo ""

echo "🚀 Opening GitHub App Installation Pages..."
echo ""

# Try multiple potential Cursor app URLs
echo "1. Opening Cursor GitHub App (Method 1)..."
open "https://github.com/apps/cursor/installations/new?state=$REPO_OWNER/$REPO_NAME" 2>/dev/null

sleep 2

echo "2. Opening Cursor GitHub App (Method 2)..."
open "https://github.com/apps/cursor" 2>/dev/null

sleep 2

echo "3. Opening your GitHub installations..."
open "https://github.com/settings/installations" 2>/dev/null

sleep 2

echo "4. Opening repository-specific installations..."
open "https://github.com/$REPO_OWNER/$REPO_NAME/settings/installations" 2>/dev/null

echo ""
echo "🎯 IMMEDIATE ACTION REQUIRED:"
echo "============================="
echo ""
echo "1. In Cursor (the app you have open):"
echo "   → Go to Settings > Personal Configuration"
echo "   → Under 'GitHub Access', click the 'Connect GitHub' button"
echo "   → This should open a browser page for GitHub authentication"
echo ""
echo "2. If that doesn't work, use the browser tabs I just opened:"
echo "   → Look for a 'Cursor' app in your GitHub installations"
echo "   → If you find it, make sure it has access to '$REPO_NAME'"
echo "   → If you don't find it, install it from the Cursor app page"
echo ""
echo "3. After connecting/installing:"
echo "   → Return to Cursor"
echo "   → Click 'Refresh' in the GitHub Access section"
echo "   → The error should disappear"
echo ""
echo "✅ Success indicators:"
echo "   - GitHub Access shows 'Connected' or similar"
echo "   - No more 'Access Denied' error"
echo "   - Background agents can access your repository"
echo ""
echo "🔄 If still having issues:"
echo "   - Restart Cursor completely"
echo "   - Try the 'Connect GitHub' button again"
echo "   - Check that you have admin access to the repository" 