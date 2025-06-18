#!/bin/bash

echo "🔍 Verifying Cursor GitHub Installation"
echo "======================================"
echo ""

# Repository information
REPO_OWNER="baller70"
REPO_NAME="appitivityv1"

echo "📁 Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Check if we can access GitHub API
echo "🌐 Checking GitHub API access..."
if command -v curl >/dev/null 2>&1; then
    GITHUB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME")
    if [ "$GITHUB_STATUS" = "200" ]; then
        echo "✅ GitHub API is accessible"
    else
        echo "❌ GitHub API returned status: $GITHUB_STATUS"
    fi
else
    echo "⚠️  curl not found, skipping API check"
fi

echo ""
echo "📋 MANUAL VERIFICATION STEPS:"
echo "============================="
echo ""
echo "1. Check Cursor IDE:"
echo "   → Open Cursor IDE"
echo "   → Go to Settings → Personal Configuration"
echo "   → Look for 'GitHub Access' section"
echo "   → Status should show 'Connected' or similar"
echo ""
echo "2. Check GitHub Installations:"
echo "   → Visit: https://github.com/settings/installations"
echo "   → Look for 'Cursor' in the list of installed apps"
echo "   → Click on it to see which repositories it has access to"
echo "   → Verify '$REPO_NAME' is in the list"
echo ""
echo "3. Test Repository Access:"
echo "   → In Cursor, try using GitHub features"
echo "   → Background agents should work without errors"
echo "   → No 'Access Denied' messages should appear"
echo ""
echo "✅ SUCCESS INDICATORS:"
echo "====================="
echo "- Cursor GitHub Access shows 'Connected'"
echo "- No authentication errors in Cursor"
echo "- Background agents can access repository"
echo "- GitHub features work normally"
echo ""
echo "❌ FAILURE INDICATORS:"
echo "======================"
echo "- 'Access Denied' errors in Cursor"
echo "- GitHub Access shows 'Disconnected'"
echo "- Background agents fail with authentication errors"
echo "- Request ID errors in Cursor logs"
echo ""
echo "🔧 If verification fails, run:"
echo "   ./fix_cursor_github_access.sh" 