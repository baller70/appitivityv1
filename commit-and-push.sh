#!/bin/bash

echo "🚀 Committing Repository Organization to GitHub"
echo "==============================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Show current status
echo "📊 Current Git Status:"
git status --short

echo ""
echo "📝 Staging all changes..."
git add -A

echo ""
echo "💾 Committing with detailed message..."
git commit -m "Complete repository reorganization into logical categories

✅ MAJOR REORGANIZATION COMPLETED:
- 🎯 Moved all source code to core-application/
- 🤖 Organized AI tools into ai-integrations/  
- 🗄️ Placed database files in database-services/
- 📚 Consolidated documentation in documentation/
- 🧪 Moved tests to testing-automation/
- 🔧 Organized build scripts in build-scripts/
- ⚙️ Placed configs in configuration/
- 🛠️ Moved dev tools to development-tools/
- 🔗 Created external-integrations/ for future use
- 📋 Created VS Code workspace for optimal development

BENEFITS ACHIEVED:
- Clean root directory with professional structure
- Improved developer experience and navigation
- Better maintainability and code organization
- Scalable architecture ready for team development
- Industry-standard project organization

FILES MOVED: 100+ files reorganized into logical categories
STRUCTURE: 9 main directories with clear purposes
WORKSPACE: VS Code workspace created with optimizations"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
    
    echo ""
    echo "🌐 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Repository organization is now live on GitHub!"
        echo "📁 Your codebase is beautifully organized and ready for development."
    else
        echo "❌ Push failed. You may need to:"
        echo "   - Check your GitHub authentication"
        echo "   - Verify the remote repository URL"
        echo "   - Handle any merge conflicts"
        echo ""
        echo "Try: git push origin main --force-with-lease"
    fi
else
    echo "❌ Commit failed. Check for any issues above."
fi 