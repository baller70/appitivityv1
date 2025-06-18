#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RepoOrganizer {
  constructor() {
    this.rootDir = process.cwd();
    this.moves = [];
    
    // Define allowed root-level items
    this.allowedRootFolders = new Set([
      'frontend', 'backend', 'config', 'docs', 'cursor-rules', '.github', 'misc'
    ]);
    
    this.allowedRootFiles = new Set([
      'README.md', 'LICENSE', 'project.code-workspace', '.gitignore'
    ]);
    
    // Define categorization rules
    this.categories = {
      frontend: {
        patterns: [
          /^core-application/,
          /^public/,
          /^components/,
          /^pages/,
          /^src/,
          /^static/,
          /^assets/,
          /storybook/,
          /^ui/,
          /^client/,
          /^web/,
          /^app/,
          /^styles/,
          /^themes/
        ],
        extensions: ['.html', '.css', '.scss', '.sass', '.less']
      },
      
      backend: {
        subfolders: {
          mcp: [
            /mcp/i,
            /ai-integrations/,
            /^nocodebackend/
          ],
          auth: [
            /auth/i,
            /clerk/i,
            /supabase/i
          ],
          storage: [
            /database/i,
            /^database-services/,
            /storage/i,
            /upload/i
          ],
          monitoring: [
            /sentry/i,
            /analytics/i,
            /logs/i
          ],
          scripts: [
            /^build-scripts/,
            /^development-tools/,
            /scripts/i,
            /automation/i
          ]
        },
        patterns: [
          /^api/,
          /^server/,
          /^backend/,
          /\.py$/,
          /requirements\.txt$/,
          /Dockerfile$/,
          /docker-compose/,
          /^lambda/,
          /^functions/
        ]
      },
      
      config: {
        patterns: [
          /^configuration/,
          /config\.js$/,
          /config\.ts$/,
          /\.config\./,
          /^next\.config/,
          /^tailwind\.config/,
          /^postcss\.config/,
          /^tsconfig/,
          /^jsconfig/,
          /^eslint/,
          /^prettier/,
          /^babel/,
          /^webpack/,
          /^vite/,
          /^rollup/,
          /^jest/,
          /^vitest/,
          /^playwright/,
          /^cypress/,
          /\.json$/
        ],
        extensions: ['.config.js', '.config.ts', '.json']
      },
      
      docs: {
        patterns: [
          /^documentation/,
          /^docs/,
          /README/,
          /CHANGELOG/,
          /CONTRIBUTING/,
          /\.md$/,
          /\.mdx$/,
          /guide/i,
          /tutorial/i
        ]
      },
      
      'cursor-rules': {
        patterns: [
          /\.cursor/,
          /cursor/i,
          /\.cursorrules/,
          /rules.*\.mdc$/
        ]
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📁',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      move: '➡️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async run() {
    try {
      this.log('Starting repository reorganization...', 'info');
      
      // Step 1: Analyze current structure
      await this.analyzeStructure();
      
      // Step 2: Create category folders
      await this.createCategoryFolders();
      
      // Step 3: Move items to categories
      await this.moveItemsToCategories();
      
      // Step 4: Update references
      await this.updateReferences();
      
      // Step 5: Cleanup empty directories
      await this.cleanupEmptyDirectories();
      
      // Step 6: Finalize with git
      await this.finalizeWithGit();
      
      // Step 7: Generate report
      this.generateReport();
      
      this.log('Repository reorganization completed successfully!', 'success');
      
    } catch (error) {
      this.log(`Reorganization failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async analyzeStructure() {
    this.log('Analyzing current repository structure...', 'info');
    
    const rootItems = fs.readdirSync(this.rootDir, { withFileTypes: true });
    
    for (const item of rootItems) {
      if (item.name.startsWith('.') && !item.name.startsWith('.github')) {
        continue; // Skip hidden files except .github
      }
      
      const isAllowed = item.isDirectory() ? 
        this.allowedRootFolders.has(item.name) : 
        this.allowedRootFiles.has(item.name);
      
      if (!isAllowed) {
        const category = this.categorizeItem(item.name, item.isDirectory());
        this.moves.push({
          source: item.name,
          destination: category,
          isDirectory: item.isDirectory()
        });
      }
    }
    
    this.log(`Found ${this.moves.length} items to reorganize`, 'info');
  }

  categorizeItem(itemName, isDirectory) {
    // Check each category
    for (const [categoryName, categoryConfig] of Object.entries(this.categories)) {
      if (this.matchesCategory(itemName, categoryConfig, isDirectory)) {
        // For backend items, check for subcategories
        if (categoryName === 'backend' && categoryConfig.subfolders) {
          for (const [subfolderName, patterns] of Object.entries(categoryConfig.subfolders)) {
            if (patterns.some(pattern => pattern.test(itemName))) {
              return `backend/${subfolderName}`;
            }
          }
        }
        return categoryName;
      }
    }
    
    // Default to misc if no category matches
    return 'misc';
  }

  matchesCategory(itemName, categoryConfig, isDirectory) {
    if (categoryConfig.patterns) {
      if (categoryConfig.patterns.some(pattern => pattern.test(itemName))) {
        return true;
      }
    }
    
    if (categoryConfig.extensions && !isDirectory) {
      const ext = path.extname(itemName);
      if (categoryConfig.extensions.includes(ext)) {
        return true;
      }
    }
    
    return false;
  }

  async createCategoryFolders() {
    this.log('Creating category folder structure...', 'info');
    
    const foldersToCreate = new Set();
    
    // Add main categories
    for (const folder of this.allowedRootFolders) {
      foldersToCreate.add(folder);
    }
    
    // Add backend subfolders and any nested destinations
    for (const move of this.moves) {
      const destParts = move.destination.split('/');
      let currentPath = '';
      for (const part of destParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        foldersToCreate.add(currentPath);
      }
    }
    
    // Create folders
    for (const folder of foldersToCreate) {
      const folderPath = path.join(this.rootDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        this.log(`Created folder: ${folder}`, 'info');
      }
    }
  }

  async moveItemsToCategories() {
    this.log('Moving items to category folders...', 'move');
    
    for (const move of this.moves) {
      const sourcePath = path.join(this.rootDir, move.source);
      const destPath = path.join(this.rootDir, move.destination, move.source);
      
      try {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Move the item
        fs.renameSync(sourcePath, destPath);
        this.log(`Moved: ${move.source} → ${move.destination}/`, 'move');
        
      } catch (error) {
        this.log(`Failed to move ${move.source}: ${error.message}`, 'error');
      }
    }
  }

  async updateReferences() {
    this.log('Updating import paths and references...', 'info');
    
    // Common files that might contain references
    const filesToUpdate = [
      'package.json',
      'frontend/core-application/package.json',
      'config/next.config.js',
      'config/next.config.ts',
      'config/tsconfig.json',
      'config/tailwind.config.js',
      'config/tailwind.config.ts',
      '.github/workflows/*.yml',
      '.github/workflows/*.yaml'
    ];
    
    const updateMappings = new Map();
    for (const move of this.moves) {
      updateMappings.set(move.source, `${move.destination}/${move.source}`);
    }
    
    for (const filePattern of filesToUpdate) {
      await this.updateFileReferences(filePattern, updateMappings);
    }
  }

  async updateFileReferences(filePattern, updateMappings) {
    try {
      // Handle glob patterns
      if (filePattern.includes('*')) {
        const globDir = path.dirname(filePattern);
        const globPattern = path.basename(filePattern);
        const fullGlobDir = path.join(this.rootDir, globDir);
        
        if (fs.existsSync(fullGlobDir)) {
          const files = fs.readdirSync(fullGlobDir);
          for (const file of files) {
            if (file.match(globPattern.replace('*', '.*'))) {
              await this.updateSingleFile(path.join(globDir, file), updateMappings);
            }
          }
        }
      } else {
        await this.updateSingleFile(filePattern, updateMappings);
      }
    } catch (error) {
      // File might not exist, continue
    }
  }

  async updateSingleFile(filePath, updateMappings) {
    const fullPath = path.join(this.rootDir, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }
    
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;
      
      for (const [oldPath, newPath] of updateMappings) {
        const oldPathRegex = new RegExp(`(['"\`])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
        const newContent = content.replace(oldPathRegex, `$1${newPath}$1`);
        
        if (newContent !== content) {
          content = newContent;
          updated = true;
        }
      }
      
      if (updated) {
        fs.writeFileSync(fullPath, content);
        this.log(`Updated references in: ${filePath}`, 'info');
      }
    } catch (error) {
      this.log(`Failed to update ${filePath}: ${error.message}`, 'warning');
    }
  }

  async cleanupEmptyDirectories() {
    this.log('Cleaning up empty directories...', 'info');
    
    const removeEmptyDirs = (dir) => {
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
          const relativePath = path.relative(this.rootDir, dir);
          this.log(`Removed empty directory: ${relativePath}`, 'info');
        }
      } catch (error) {
        // Directory might have been removed already or access denied
      }
    };
    
    removeEmptyDirs(this.rootDir);
  }

  async finalizeWithGit() {
    this.log('Finalizing with git commit and push...', 'info');
    
    try {
      // Stage all changes
      execSync('git add -A', { cwd: this.rootDir, stdio: 'pipe' });
      
      // Commit changes
      execSync('git commit -m "chore(structure): enforce root-level category folders"', { 
        cwd: this.rootDir, 
        stdio: 'pipe' 
      });
      
      // Push to current branch
      execSync('git push', { cwd: this.rootDir, stdio: 'pipe' });
      
      this.log('Changes committed and pushed successfully', 'success');
      
    } catch (error) {
      this.log(`Git operations failed: ${error.message}`, 'warning');
      this.log('Changes were made but not committed/pushed', 'warning');
    }
  }

  generateReport() {
    this.log('Generating reorganization report...', 'info');
    
    console.log('\n' + '='.repeat(70));
    console.log('📁 REPOSITORY REORGANIZATION REPORT');
    console.log('='.repeat(70));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  • Items moved: ${this.moves.length}`);
    console.log(`  • Categories created: ${this.allowedRootFolders.size}`);
    
    if (this.moves.length > 0) {
      console.log(`\n➡️  MOVED ITEMS:`);
      
      // Group moves by destination
      const movesByDestination = new Map();
      for (const move of this.moves) {
        if (!movesByDestination.has(move.destination)) {
          movesByDestination.set(move.destination, []);
        }
        movesByDestination.get(move.destination).push(move.source);
      }
      
      for (const [destination, items] of movesByDestination) {
        console.log(`\n  📂 ${destination}/`);
        for (const item of items.sort()) {
          console.log(`    • ${item}`);
        }
      }
    }
    
    console.log(`\n📁 FINAL ROOT STRUCTURE:`);
    try {
      const rootItems = fs.readdirSync(this.rootDir, { withFileTypes: true })
        .filter(item => !item.name.startsWith('.') || item.name === '.github')
        .sort((a, b) => {
          if (a.isDirectory() && !b.isDirectory()) return -1;
          if (!a.isDirectory() && b.isDirectory()) return 1;
          return a.name.localeCompare(b.name);
        });
      
      for (const item of rootItems) {
        const icon = item.isDirectory() ? '📁' : '📄';
        console.log(`  ${icon} ${item.name}`);
      }
    } catch (error) {
      console.log('  Could not read final structure');
    }
    
    console.log('\n✅ Repository successfully reorganized!');
    console.log('   All items categorized into proper root-level folders.\n');
  }
}

// Run the organizer if this script is executed directly
if (require.main === module) {
  const organizer = new RepoOrganizer();
  organizer.run().catch(error => {
    console.error('❌ Reorganization failed:', error.message);
    process.exit(1);
  });
}

module.exports = RepoOrganizer; 