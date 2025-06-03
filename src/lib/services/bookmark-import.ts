'use client';

export interface ImportedBookmark {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  tags: string[];
  folder: string;
  dateAdded?: Date;
  isFolder?: boolean;
  children?: ImportedBookmark[];
}

export interface ImportResult {
  bookmarks: ImportedBookmark[];
  folders: string[];
  duplicates: ImportedBookmark[];
  errors: string[];
  totalProcessed: number;
  summary: {
    bookmarksFound: number;
    foldersFound: number;
    duplicatesFound: number;
    errorsFound: number;
  };
}

export interface ImportOptions {
  skipDuplicates: boolean;
  mergeFolders: boolean;
  defaultFolder?: string;
  includeSubfolders: boolean;
}

class BookmarkImportService {
  /**
   * Parse HTML bookmark export file (Chrome, Firefox, Safari format)
   */
  parseBookmarkHtml(htmlContent: string, options: ImportOptions = {
    skipDuplicates: true,
    mergeFolders: true,
    includeSubfolders: true
  }): ImportResult {
    const result: ImportResult = {
      bookmarks: [],
      folders: [],
      duplicates: [],
      errors: [],
      totalProcessed: 0,
      summary: {
        bookmarksFound: 0,
        foldersFound: 0,
        duplicatesFound: 0,
        errorsFound: 0
      }
    };

    try {
      // Create a DOM parser to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Find the bookmark structure - typically in a DL (definition list) element
      const bookmarkRoot = doc.querySelector('dl') || doc.querySelector('body');
      
      if (!bookmarkRoot) {
        result.errors.push('No bookmark structure found in HTML file');
        return result;
      }

      // Track processed URLs to detect duplicates
      const processedUrls = new Set<string>();
      
      // Recursively parse the bookmark structure
      this.parseBookmarkNode(bookmarkRoot, '', result, processedUrls, options);
      
      // Update summary
      result.summary = {
        bookmarksFound: result.bookmarks.length,
        foldersFound: result.folders.length,
        duplicatesFound: result.duplicates.length,
        errorsFound: result.errors.length
      };
      
    } catch (error) {
      result.errors.push(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Parse individual bookmark node recursively
   */
  private parseBookmarkNode(
    node: Element, 
    currentPath: string, 
    result: ImportResult, 
    processedUrls: Set<string>,
    options: ImportOptions
  ): void {
    const children = Array.from(node.children);
    
    for (const child of children) {
      try {
        result.totalProcessed++;
        
        // Handle folder (DT with H3)
        if (child.tagName === 'DT') {
          const h3 = child.querySelector('h3');
          const a = child.querySelector('a');
          
          if (h3 && !a) {
            // This is a folder
            const folderName = h3.textContent?.trim() || 'Unnamed Folder';
            const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
            
            if (!result.folders.includes(newPath)) {
              result.folders.push(newPath);
            }
            
            // Look for nested DL containing bookmarks in this folder
            const nextSibling = child.nextElementSibling;
            if (nextSibling && nextSibling.tagName === 'DD') {
              const nestedDl = nextSibling.querySelector('dl');
              if (nestedDl && options.includeSubfolders) {
                this.parseBookmarkNode(nestedDl, newPath, result, processedUrls, options);
              }
            }
          } else if (a) {
            // This is a bookmark
            const bookmark = this.parseBookmarkFromAnchor(a, currentPath || options.defaultFolder || 'Imported');
            
            if (bookmark) {
              // Check for duplicates
              if (processedUrls.has(bookmark.url)) {
                if (!options.skipDuplicates) {
                  result.duplicates.push(bookmark);
                }
              } else {
                processedUrls.add(bookmark.url);
                result.bookmarks.push(bookmark);
              }
            }
          }
        }
        // Handle direct DL elements (nested lists)
        else if (child.tagName === 'DL') {
          this.parseBookmarkNode(child, currentPath, result, processedUrls, options);
        }
        // Handle DD elements that might contain DL
        else if (child.tagName === 'DD') {
          const nestedDl = child.querySelector('dl');
          if (nestedDl) {
            this.parseBookmarkNode(nestedDl, currentPath, result, processedUrls, options);
          }
        }
      } catch (error) {
        result.errors.push(`Error processing node: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Parse bookmark from anchor element
   */
  private parseBookmarkFromAnchor(anchor: Element, folderPath: string): ImportedBookmark | null {
    const url = anchor.getAttribute('href');
    const title = anchor.textContent?.trim();
    
    if (!url || !title) {
      return null;
    }

    // Extract metadata from attributes
    const addDate = anchor.getAttribute('add_date');
    const iconUrl = anchor.getAttribute('icon');
    const tags = anchor.getAttribute('tags');
    
    return {
      title,
      url,
      description: '',
      favicon: iconUrl || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      folder: folderPath,
      dateAdded: addDate ? new Date(parseInt(addDate) * 1000) : undefined,
      isFolder: false
    };
  }

  /**
   * Parse JSON bookmark export (if supported by browser)
   */
  parseBookmarkJson(jsonContent: string, options: ImportOptions): ImportResult {
    const result: ImportResult = {
      bookmarks: [],
      folders: [],
      duplicates: [],
      errors: [],
      totalProcessed: 0,
      summary: {
        bookmarksFound: 0,
        foldersFound: 0,
        duplicatesFound: 0,
        errorsFound: 0
      }
    };

    try {
      const data = JSON.parse(jsonContent);
      const processedUrls = new Set<string>();
      
      // Handle different JSON structures from different browsers
      if (data.roots) {
        // Chrome bookmark format
        this.parseChromiumBookmarkJson(data.roots, '', result, processedUrls, options);
      } else if (Array.isArray(data)) {
        // Simple array format
        this.parseSimpleJsonArray(data, result, processedUrls, options);
      } else {
        result.errors.push('Unsupported JSON bookmark format');
      }
      
      result.summary = {
        bookmarksFound: result.bookmarks.length,
        foldersFound: result.folders.length,
        duplicatesFound: result.duplicates.length,
        errorsFound: result.errors.length
      };
      
    } catch (error) {
      result.errors.push(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Parse Chrome/Chromium JSON bookmark format
   */
  private parseChromiumBookmarkJson(
    roots: any,
    currentPath: string,
    result: ImportResult,
    processedUrls: Set<string>,
    options: ImportOptions
  ): void {
    for (const [rootName, rootData] of Object.entries(roots)) {
      if (rootData && typeof rootData === 'object' && 'children' in rootData) {
        const folderName = rootName === 'bookmark_bar' ? 'Bookmarks Bar' : 
                          rootName === 'other' ? 'Other Bookmarks' : rootName;
        this.parseChromiumNode(rootData, folderName, result, processedUrls, options);
      }
    }
  }

  /**
   * Parse individual Chrome/Chromium node
   */
  private parseChromiumNode(
    node: any,
    currentPath: string,
    result: ImportResult,
    processedUrls: Set<string>,
    options: ImportOptions
  ): void {
    if (!node || typeof node !== 'object') return;

    result.totalProcessed++;

    if (node.type === 'folder') {
      const folderName = node.name || 'Unnamed Folder';
      const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      if (!result.folders.includes(newPath)) {
        result.folders.push(newPath);
      }

      if (node.children && Array.isArray(node.children) && options.includeSubfolders) {
        for (const child of node.children) {
          this.parseChromiumNode(child, newPath, result, processedUrls, options);
        }
      }
    } else if (node.type === 'url') {
      const bookmark: ImportedBookmark = {
        title: node.name || 'Untitled',
        url: node.url,
        description: '',
        favicon: undefined,
        tags: [],
        folder: currentPath || options.defaultFolder || 'Imported',
        dateAdded: node.date_added ? new Date(parseInt(node.date_added) / 1000) : undefined,
        isFolder: false
      };

      // Check for duplicates
      if (processedUrls.has(bookmark.url)) {
        if (!options.skipDuplicates) {
          result.duplicates.push(bookmark);
        }
      } else {
        processedUrls.add(bookmark.url);
        result.bookmarks.push(bookmark);
      }
    }
  }

  /**
   * Parse simple JSON array format
   */
  private parseSimpleJsonArray(
    data: any[],
    result: ImportResult,
    processedUrls: Set<string>,
    options: ImportOptions
  ): void {
    for (const item of data) {
      result.totalProcessed++;
      
      if (item.url && item.title) {
        const bookmark: ImportedBookmark = {
          title: item.title,
          url: item.url,
          description: item.description || '',
          favicon: item.favicon || item.icon,
          tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',')) : [],
          folder: item.folder || options.defaultFolder || 'Imported',
          dateAdded: item.dateAdded ? new Date(item.dateAdded) : undefined,
          isFolder: false
        };

        if (processedUrls.has(bookmark.url)) {
          if (!options.skipDuplicates) {
            result.duplicates.push(bookmark);
          }
        } else {
          processedUrls.add(bookmark.url);
          result.bookmarks.push(bookmark);
        }
      }
    }
  }

  /**
   * Detect file format from content
   */
  detectFileFormat(content: string): 'html' | 'json' | 'unknown' {
    const trimmed = content.trim();
    
    if (trimmed.startsWith('<') && (trimmed.includes('<DL>') || trimmed.includes('<dl>'))) {
      return 'html';
    }
    
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        return 'unknown';
      }
    }
    
    return 'unknown';
  }

  /**
   * Get import preview without processing
   */
  getImportPreview(content: string): { format: string; estimatedBookmarks: number; estimatedFolders: number } {
    const format = this.detectFileFormat(content);
    let estimatedBookmarks = 0;
    let estimatedFolders = 0;

    if (format === 'html') {
      // Quick estimation by counting anchor tags and h3 tags
      const anchorMatches = content.match(/<a[^>]+href=/gi) || [];
      const folderMatches = content.match(/<h3[^>]*>/gi) || [];
      estimatedBookmarks = anchorMatches.length;
      estimatedFolders = folderMatches.length;
    } else if (format === 'json') {
      try {
        const data = JSON.parse(content);
        if (data.roots) {
          // Chrome format - rough estimation
          const jsonStr = JSON.stringify(data);
          const urlMatches = jsonStr.match(/"type":"url"/g) || [];
          const folderMatches = jsonStr.match(/"type":"folder"/g) || [];
          estimatedBookmarks = urlMatches.length;
          estimatedFolders = folderMatches.length;
        } else if (Array.isArray(data)) {
          estimatedBookmarks = data.filter(item => item.url).length;
          estimatedFolders = 0;
        }
      } catch {
        // Invalid JSON
      }
    }

    return {
      format: format === 'unknown' ? 'Unknown format' : format.toUpperCase(),
      estimatedBookmarks,
      estimatedFolders
    };
  }

  /**
   * Validate bookmark data before import
   */
  validateBookmark(bookmark: ImportedBookmark): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!bookmark.title || bookmark.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!bookmark.url || bookmark.url.trim() === '') {
      errors.push('URL is required');
    } else {
      try {
        new URL(bookmark.url);
      } catch {
        errors.push('Invalid URL format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate import summary report
   */
  generateImportReport(result: ImportResult): string {
    const { summary } = result;
    
    let report = `# Bookmark Import Report\n\n`;
    report += `## Summary\n`;
    report += `- **Bookmarks found**: ${summary.bookmarksFound}\n`;
    report += `- **Folders found**: ${summary.foldersFound}\n`;
    report += `- **Duplicates found**: ${summary.duplicatesFound}\n`;
    report += `- **Errors encountered**: ${summary.errorsFound}\n`;
    report += `- **Total processed**: ${result.totalProcessed}\n\n`;
    
    if (result.folders.length > 0) {
      report += `## Folders\n`;
      result.folders.forEach(folder => {
        report += `- ${folder}\n`;
      });
      report += '\n';
    }
    
    if (result.errors.length > 0) {
      report += `## Errors\n`;
      result.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
    
    if (result.duplicates.length > 0) {
      report += `## Duplicates (Skipped)\n`;
      result.duplicates.slice(0, 10).forEach(duplicate => {
        report += `- ${duplicate.title} (${duplicate.url})\n`;
      });
      if (result.duplicates.length > 10) {
        report += `- ... and ${result.duplicates.length - 10} more\n`;
      }
    }
    
    return report;
  }

  /**
   * Convert imported bookmarks to app format
   */
  convertToAppFormat(importedBookmarks: ImportedBookmark[], userId: string): any[] {
    return importedBookmarks.map(bookmark => ({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || '',
      notes: '',
      tags: bookmark.tags,
      folder_path: bookmark.folder,
      is_favorite: false,
      created_at: bookmark.dateAdded || new Date(),
      updated_at: new Date(),
      user_id: userId
    }));
  }
}

// Export singleton instance
export const bookmarkImportService = new BookmarkImportService(); 