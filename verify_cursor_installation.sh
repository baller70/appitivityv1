#!/bin/bash

echo "🔍 Verifying Cursor GitHub App Installation"
echo "==========================================="
echo ""

# Get repository info
REPO_OWNER="baller70"
REPO_NAME="appitivityv1"

echo "📁 Checking repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Check if GitHub CLI can see the installation
echo "🔧 Checking GitHub CLI access..."
if gh auth status &>/dev/null; then
    echo "✅ GitHub CLI is authenticated"
    
    # Try to list repository installations
    echo "🔍 Checking repository installations..."
    gh api "/repos/$REPO_OWNER/$REPO_NAME/installation" 2>/dev/null && echo "✅ GitHub App installation detected" || echo "❌ No GitHub App installation found"
    
else
    echo "❌ GitHub CLI not authenticated"
fi

echo ""
echo "🌐 Manual verification:"
echo "======================"
echo "1. Visit: https://github.com/$REPO_OWNER/$REPO_NAME/settings/installations"
echo "2. Look for 'Cursor' in the installed apps list"
echo "3. If you see it, the installation was successful!"
echo ""

echo "🔄 If installation is complete, restart Cursor and try your action again."
echo ""

# Check if we can access the repository through API
echo "🔗 Testing repository access..."
if gh api "/repos/$REPO_OWNER/$REPO_NAME" &>/dev/null; then
    echo "✅ Repository is accessible via GitHub API"
else
    echo "❌ Repository access issues detected"
fi

echo ""
echo "📋 Summary:"
echo "==========="
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "GitHub CLI: $(gh auth status &>/dev/null && echo "✅ Authenticated" || echo "❌ Not authenticated")"
echo "Next step: Complete the installation in your browser tabs" 