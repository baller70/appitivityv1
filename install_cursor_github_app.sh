#!/bin/bash

echo "🚀 Cursor GitHub App Installation Script"
echo "========================================"
echo ""

# Get repository info
REPO_URL=$(git remote get-url origin)
REPO_NAME=$(basename -s .git "$REPO_URL")
REPO_OWNER=$(basename -s .git "$(dirname "$REPO_URL")" | sed 's/.*://')

echo "📁 Repository: $REPO_OWNER/$REPO_NAME"
echo "🔗 Repository URL: $REPO_URL"
echo "🏠 Official Cursor Repo: https://github.com/getcursor/cursor"
echo ""

echo "🌐 Opening GitHub pages for Cursor app installation..."
echo ""

# Open multiple potential Cursor GitHub App pages
echo "1. Opening Cursor GitHub App page (primary)..."
open "https://github.com/apps/cursor" 2>/dev/null || echo "   Please visit: https://github.com/apps/cursor"

sleep 2

echo "2. Opening Cursor AI GitHub App page (alternative)..."
open "https://github.com/apps/cursor-ai" 2>/dev/null || echo "   Please visit: https://github.com/apps/cursor-ai"

sleep 2

echo "3. Opening GitHub Apps marketplace search..."
open "https://github.com/marketplace?query=cursor&type=apps" 2>/dev/null || echo "   Please visit: https://github.com/marketplace?query=cursor&type=apps"

sleep 2

# Open repository settings
echo "4. Opening repository installation settings..."
open "https://github.com/$REPO_OWNER/$REPO_NAME/settings/installations" 2>/dev/null || echo "   Please visit: https://github.com/$REPO_OWNER/$REPO_NAME/settings/installations"

sleep 2

# Open official Cursor repository for reference
echo "5. Opening official Cursor repository..."
open "https://github.com/getcursor/cursor" 2>/dev/null || echo "   Please visit: https://github.com/getcursor/cursor"

echo ""
echo "📋 Installation Instructions:"
echo "=============================="
echo ""
echo "🔍 First, find the correct Cursor GitHub App:"
echo "   - Check tabs 1-3 for the official Cursor GitHub App"
echo "   - Look for an app published by 'getcursor' or 'Cursor'"
echo "   - The app should have permissions for code analysis and AI features"
echo ""
echo "📦 Once you find the correct app:"
echo "   - Click 'Install' or 'Configure'"
echo "   - Select your account ($REPO_OWNER)"
echo "   - Choose 'Selected repositories'"
echo "   - Select '$REPO_NAME'"
echo "   - Click 'Install & Authorize'"
echo ""
echo "✅ Grant the following permissions:"
echo "   ✓ Read access to code"
echo "   ✓ Read access to metadata"
echo "   ✓ Read access to pull requests"
echo "   ✓ Read access to issues"
echo "   ✓ Write access to checks"
echo "   ✓ Read access to repository contents"
echo ""
echo "🔄 After installation:"
echo "   - Return to Cursor and try the action again"
echo "   - If still getting errors, restart Cursor completely"
echo ""
echo "🔍 Troubleshooting:"
echo "=================="
echo "If you can't find a Cursor GitHub App:"
echo "- The integration might be built into Cursor itself"
echo "- Check Cursor's settings for GitHub authentication"
echo "- Try signing into GitHub directly within Cursor"
echo ""
echo "If you still get the error after installation:"
echo "- Restart Cursor completely"
echo "- Check that the app is installed on the correct repository"
echo "- Verify you have admin access to the repository"
echo "- Check Cursor's GitHub integration settings"
echo ""
echo "✅ Installation complete when you see 'Cursor' in your repository's"
echo "   Settings > Integrations > GitHub Apps section" 