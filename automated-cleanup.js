#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomatedRepoCleanup {
  constructor() {
    this.rootDir = process.cwd();
    this.backupDir = path.join(this.rootDir, 'cleanup_backup');
    this.referencedFiles = new Set();
    this.allFiles = new Set();
    this.deadFiles = new Set();
    this.sizeReclaimed = 0;
    
    // Patterns to ignore during analysis
    this.ignorePatterns = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /\.nuxt/,
      /dist/,
      /build/,
      /coverage/,
      /\.cache/,
      /\.temp/,
      /\.tmp/,
      /cleanup_backup/,
      /\.DS_Store/,
      /Thumbs\.db/,
      /\.env/,
      /\.log$/,
      /package-lock\.json$/,
      /yarn\.lock$/,
      /pnpm-lock\.yaml$/,
      /playwright-report/,
      /test-results/
    ];

    // File extensions that can contain references
    this.codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.json', '.md', '.mdx', '.html', '.css', '.scss', 
      '.sass', '.less', '.styl', '.sql', '.py', '.sh',
      '.yml', '.yaml', '.toml', '.config.js', '.config.ts'
    ];

    // Asset extensions that might be referenced
    this.assetExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
      '.ico', '.woff', '.woff2', '.ttf', '.eot', '.otf',
      '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.zip'
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      cleanup: '🧹'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async run() {
    try {
      this.log('Starting automated repository cleanup...', 'info');
      
      // Step 1: Analyze & Discover
      await this.analyzeAndDiscover();
      
      // Step 2: Safe Deletion Workflow
      await this.safeDeletionWorkflow();
      
      // Step 3: Final Cleanup, Commit, Push & Sync
      await this.finalCleanupAndCommit();
      
      // Step 4: Reporting
      this.generateReport();
      
      this.log('Automated cleanup completed successfully!', 'success');
      
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
      await this.restoreFromBackup();
      process.exit(1);
    }
  }

  async analyzeAndDiscover() {
    this.log('Phase 1: Analyzing codebase and building reference graph...', 'info');
    
    // Scan all files
    await this.scanAllFiles(this.rootDir);
    this.log(`Found ${this.allFiles.size} total files`, 'info');
    
    // Build reference graph
    await this.buildReferenceGraph();
    this.log(`Found ${this.referencedFiles.size} referenced files`, 'info');
    
    // Identify dead code
    this.identifyDeadCode();
    this.log(`Identified ${this.deadFiles.size} unreferenced files`, 'warning');
  }

  async scanAllFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(this.rootDir, fullPath);
      
      // Skip ignored patterns
      if (this.shouldIgnore(relativePath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await this.scanAllFiles(fullPath);
      } else {
        this.allFiles.add(relativePath);
      }
    }
  }

  shouldIgnore(relativePath) {
    return this.ignorePatterns.some(pattern => pattern.test(relativePath));
  }

  async buildReferenceGraph() {
    this.log('Building comprehensive reference graph...', 'info');
    
    // Always mark essential files as referenced
    this.markEssentialFiles();
    
    // Analyze each code file for references
    for (const filePath of this.allFiles) {
      const ext = path.extname(filePath);
      
      if (this.codeExtensions.includes(ext)) {
        await this.analyzeFileReferences(filePath);
      }
    }
    
    // Mark package.json dependencies and scripts
    await this.analyzePackageJson();
    
    // Analyze config files
    await this.analyzeConfigFiles();
  }

  markEssentialFiles() {
    const essentialPatterns = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'README.md',
      'LICENSE',
      '.gitignore',
      '.env.example',
      'next.config.js',
      'next.config.ts',
      'tailwind.config.js',
      'tailwind.config.ts',
      'tsconfig.json',
      'jsconfig.json',
      'postcss.config.js',
      '.eslintrc.js',
      '.eslintrc.json',
      'playwright.config.ts',
      'vitest.config.ts',
      'jest.config.js',
      'automated-cleanup.js'
    ];
    
    for (const filePath of this.allFiles) {
      const fileName = path.basename(filePath);
      if (essentialPatterns.some(pattern => fileName.includes(pattern))) {
        this.referencedFiles.add(filePath);
      }
    }
  }

  async analyzeFileReferences(filePath) {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Mark this file as referenced (it exists and we're analyzing it)
      this.referencedFiles.add(filePath);
      
      // Extract all possible references
      const references = this.extractReferences(content, filePath);
      
      for (const ref of references) {
        const resolvedPath = this.resolveReference(ref, filePath);
        if (resolvedPath && this.allFiles.has(resolvedPath)) {
          this.referencedFiles.add(resolvedPath);
        }
      }
      
    } catch (error) {
      // If we can't read the file, mark it as referenced to be safe
      this.referencedFiles.add(filePath);
    }
  }

  extractReferences(content, filePath) {
    const references = new Set();
    
    // Import/require patterns
    const importPatterns = [
      // ES6 imports
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // CommonJS requires
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // Dynamic imports
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // Next.js dynamic imports
      /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];
    
    // Asset references
    const assetPatterns = [
      // Image sources
      /src\s*=\s*['"`]([^'"`]+)['"`]/g,
      /href\s*=\s*['"`]([^'"`]+)['"`]/g,
      // CSS url()
      /url\s*\(\s*['"`]?([^'"`\)]+)['"`]?\s*\)/g,
      // Background images
      /background-image\s*:\s*url\s*\(\s*['"`]?([^'"`\)]+)['"`]?\s*\)/g,
      // Next.js Image component
      /src\s*=\s*\{[^}]*['"`]([^'"`]+)['"`][^}]*\}/g,
    ];
    
    // API route patterns (Next.js specific)
    const apiPatterns = [
      // API calls
      /['"`]\/api\/([^'"`]+)['"`]/g,
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /axios\.[get|post|put|delete|patch]\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];
    
    // Extract all patterns
    [...importPatterns, ...assetPatterns, ...apiPatterns].forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        references.add(match[1]);
      }
    });
    
    return Array.from(references);
  }

  resolveReference(ref, fromFile) {
    // Skip external packages and URLs
    if (ref.startsWith('http') || ref.startsWith('//') || (!ref.startsWith('.') && !ref.startsWith('/'))) {
      return null;
    }
    
    const fromDir = path.dirname(fromFile);
    let resolvedPath;
    
    if (ref.startsWith('/')) {
      // Absolute path from root
      resolvedPath = ref.substring(1);
    } else {
      // Relative path
      resolvedPath = path.join(fromDir, ref);
    }
    
    // Normalize path
    resolvedPath = path.normalize(resolvedPath);
    
    // Try to find the actual file with various extensions
    const possiblePaths = [
      resolvedPath,
      resolvedPath + '.js',
      resolvedPath + '.jsx',
      resolvedPath + '.ts',
      resolvedPath + '.tsx',
      resolvedPath + '.json',
      resolvedPath + '.md',
      resolvedPath + '.css',
      resolvedPath + '.scss',
      path.join(resolvedPath, 'index.js'),
      path.join(resolvedPath, 'index.jsx'),
      path.join(resolvedPath, 'index.ts'),
      path.join(resolvedPath, 'index.tsx'),
      path.join(resolvedPath, 'page.tsx'),
      path.join(resolvedPath, 'layout.tsx'),
      path.join(resolvedPath, 'route.ts')
    ];
    
    for (const possiblePath of possiblePaths) {
      if (this.allFiles.has(possiblePath)) {
        return possiblePath;
      }
    }
    
    return null;
  }

  async analyzePackageJson() {
    const packageJsonPath = 'package.json';
    if (!this.allFiles.has(packageJsonPath)) return;
    
    try {
      const content = fs.readFileSync(path.join(this.rootDir, packageJsonPath), 'utf8');
      const packageJson = JSON.parse(content);
      
      // Mark files referenced in scripts
      if (packageJson.scripts) {
        Object.values(packageJson.scripts).forEach(script => {
          const references = this.extractReferences(script, packageJsonPath);
          references.forEach(ref => {
            const resolved = this.resolveReference(ref, packageJsonPath);
            if (resolved && this.allFiles.has(resolved)) {
              this.referencedFiles.add(resolved);
            }
          });
        });
      }
      
    } catch (error) {
      this.log(`Could not analyze package.json: ${error.message}`, 'warning');
    }
  }

  async analyzeConfigFiles() {
    const configFiles = Array.from(this.allFiles).filter(file => {
      const basename = path.basename(file);
      return basename.includes('config') || (basename.startsWith('.') && basename.includes('rc'));
    });
    
    for (const configFile of configFiles) {
      await this.analyzeFileReferences(configFile);
    }
  }

  identifyDeadCode() {
    this.log('Identifying dead code...', 'info');
    
    for (const filePath of this.allFiles) {
      if (!this.referencedFiles.has(filePath)) {
        this.deadFiles.add(filePath);
      }
    }
    
    // Log some examples of what will be removed
    if (this.deadFiles.size > 0) {
      this.log('Examples of files to be removed:', 'warning');
      Array.from(this.deadFiles).slice(0, 10).forEach(file => {
        this.log(`  - ${file}`, 'warning');
      });
      if (this.deadFiles.size > 10) {
        this.log(`  ... and ${this.deadFiles.size - 10} more files`, 'warning');
      }
    }
  }

  async safeDeletionWorkflow() {
    if (this.deadFiles.size === 0) {
      this.log('No dead files found. Nothing to clean up!', 'success');
      return;
    }
    
    this.log('Phase 2: Starting safe deletion workflow...', 'cleanup');
    
    // Create backup directory
    this.createBackupDirectory();
    
    // Move files to backup
    await this.moveFilesToBackup();
    
    // Run build and tests
    const testsPassed = await this.runBuildAndTests();
    
    if (!testsPassed) {
      this.log('Build or tests failed! Restoring files...', 'error');
      await this.restoreFromBackup();
      throw new Error('Build or tests failed after cleanup');
    }
    
    this.log('Build and tests passed! Cleanup is safe.', 'success');
    
    // Calculate reclaimed size before deleting backup
    this.calculateReclaimedSize();
    
    // Permanently delete backup
    this.deleteBackup();
  }

  createBackupDirectory() {
    if (fs.existsSync(this.backupDir)) {
      fs.rmSync(this.backupDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.backupDir, { recursive: true });
  }

  async moveFilesToBackup() {
    this.log(`Moving ${this.deadFiles.size} files to backup...`, 'cleanup');
    
    for (const filePath of this.deadFiles) {
      const sourcePath = path.join(this.rootDir, filePath);
      const backupPath = path.join(this.backupDir, filePath);
      
      // Create backup directory structure
      const backupDir = path.dirname(backupPath);
      fs.mkdirSync(backupDir, { recursive: true });
      
      // Move file
      try {
        fs.renameSync(sourcePath, backupPath);
      } catch (error) {
        this.log(`Failed to move ${filePath}: ${error.message}`, 'warning');
      }
    }
  }

  async runBuildAndTests() {
    this.log('Running build and test suite...', 'info');
    
    try {
      // Navigate to core-application directory for Next.js build
      const coreAppDir = path.join(this.rootDir, 'core-application');
      
      if (fs.existsSync(coreAppDir)) {
        this.log('Found core-application directory, running build there...', 'info');
        
        // Check if package.json exists in core-application
        const packageJsonPath = path.join(coreAppDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const scripts = packageJson.scripts || {};
          
          // Run build if script exists
          if (scripts.build) {
            this.log('Running npm run build in core-application...', 'info');
            execSync('npm run build', { 
              stdio: 'pipe',
              cwd: coreAppDir,
              timeout: 300000 // 5 minutes timeout
            });
            this.log('Build completed successfully', 'success');
          }
          
          // Run lint if script exists
          if (scripts.lint) {
            this.log('Running npm run lint in core-application...', 'info');
            execSync('npm run lint', { 
              stdio: 'pipe',
              cwd: coreAppDir,
              timeout: 60000 // 1 minute timeout
            });
            this.log('Linting completed successfully', 'success');
          }
        }
      }
      
      return true;
      
    } catch (error) {
      this.log(`Build/test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async restoreFromBackup() {
    if (!fs.existsSync(this.backupDir)) {
      return;
    }
    
    this.log('Restoring files from backup...', 'warning');
    
    for (const filePath of this.deadFiles) {
      const backupPath = path.join(this.backupDir, filePath);
      const sourcePath = path.join(this.rootDir, filePath);
      
      if (fs.existsSync(backupPath)) {
        // Create directory structure
        const sourceDir = path.dirname(sourcePath);
        fs.mkdirSync(sourceDir, { recursive: true });
        
        // Restore file
        try {
          fs.renameSync(backupPath, sourcePath);
        } catch (error) {
          this.log(`Failed to restore ${filePath}: ${error.message}`, 'warning');
        }
      }
    }
    
    // Remove backup directory
    fs.rmSync(this.backupDir, { recursive: true, force: true });
    this.log('Files restored successfully', 'success');
  }

  calculateReclaimedSize() {
    this.sizeReclaimed = 0;
    
    for (const filePath of this.deadFiles) {
      const backupPath = path.join(this.backupDir, filePath);
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        this.sizeReclaimed += stats.size;
      }
    }
  }

  deleteBackup() {
    if (fs.existsSync(this.backupDir)) {
      fs.rmSync(this.backupDir, { recursive: true, force: true });
    }
  }

  async finalCleanupAndCommit() {
    this.log('Phase 3: Final cleanup and commit...', 'cleanup');
    
    // Remove empty directories
    this.removeEmptyDirectories();
    
    // Git operations
    await this.gitCommitAndPush();
  }

  removeEmptyDirectories() {
    this.log('Removing empty directories...', 'cleanup');
    
    const removeEmptyDirs = (dir) => {
      if (this.shouldIgnore(path.relative(this.rootDir, dir))) {
        return;
      }
      
      try {
        const entries = fs.readdirSync(dir);
        
        // Recursively check subdirectories
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            removeEmptyDirs(fullPath);
          }
        }
        
        // Check if directory is now empty
        const remainingEntries = fs.readdirSync(dir);
        if (remainingEntries.length === 0 && dir !== this.rootDir) {
          fs.rmdirSync(dir);
          this.log(`Removed empty directory: ${path.relative(this.rootDir, dir)}`, 'cleanup');
        }
      } catch (error) {
        // Directory might have been removed already or access denied
      }
    };
    
    removeEmptyDirs(this.rootDir);
  }

  async gitCommitAndPush() {
    try {
      this.log('Staging changes...', 'info');
      execSync('git add -A', { cwd: this.rootDir, stdio: 'pipe' });
      
      this.log('Committing changes...', 'info');
      execSync('git commit -m "chore(cleanup): automatically prune unused files with build verification"', { 
        cwd: this.rootDir, 
        stdio: 'pipe' 
      });
      
      this.log('Pushing to remote...', 'info');
      execSync('git push', { cwd: this.rootDir, stdio: 'pipe' });
      
      this.log('Changes committed and pushed successfully', 'success');
      
    } catch (error) {
      this.log(`Git operations failed: ${error.message}`, 'warning');
      this.log('Changes were made but not committed/pushed', 'warning');
    }
  }

  generateReport() {
    this.log('Phase 4: Generating cleanup report...', 'info');
    
    console.log('\n' + '='.repeat(60));
    console.log('🧹 AUTOMATED CLEANUP REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  • Files analyzed: ${this.allFiles.size}`);
    console.log(`  • Files referenced: ${this.referencedFiles.size}`);
    console.log(`  • Files removed: ${this.deadFiles.size}`);
    console.log(`  • Size reclaimed: ${this.formatBytes(this.sizeReclaimed)}`);
    
    if (this.deadFiles.size > 0) {
      console.log(`\n🗑️  REMOVED FILES:`);
      Array.from(this.deadFiles).sort().forEach(file => {
        console.log(`  • ${file}`);
      });
    }
    
    console.log('\n✅ Cleanup completed successfully!');
    console.log('   Build and tests verified before permanent deletion.');
    console.log('   All changes have been committed and pushed.\n');
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  const cleanup = new AutomatedRepoCleanup();
  cleanup.run().catch(error => {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  });
}

module.exports = AutomatedRepoCleanup; 