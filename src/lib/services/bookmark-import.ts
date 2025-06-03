'use client';

import { supabase } from '../supabase';

interface ImportedBookmark {
  title: string;
  url: string;
  description?: string;
  folder?: string;
  tags?: string[];
  is_favorite?: boolean;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

interface ImportOptions {
  overwriteExisting?: boolean;
  createFolders?: boolean;
  createTags?: boolean;
}

export class BookmarkImportService {
  constructor(private userId: string) {}

  async importFromFile(file: File, options: ImportOptions = {}): Promise<ImportResult> {
    try {
      const content = await this.readFileContent(file);
      const bookmarks = await this.parseFileContent(content, file.type);
      return await this.importBookmarks(bookmarks, options);
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  private async parseFileContent(content: string, fileType: string): Promise<ImportedBookmark[]> {
    switch (fileType) {
      case 'application/json':
        return this.parseJSON(content);
      case 'text/html':
        return this.parseHTML(content);
      case 'text/csv':
        return this.parseCSV(content);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private parseJSON(content: string): ImportedBookmark[] {
    try {
      const data: unknown = JSON.parse(content);
      
      // Handle different JSON structures
      if (Array.isArray(data)) {
        return data.map(this.normalizeBookmarkData);
      } else if (typeof data === 'object' && data !== null && 'bookmarks' in data) {
        const bookmarksData = (data as { bookmarks: unknown }).bookmarks;
        if (Array.isArray(bookmarksData)) {
          return bookmarksData.map(this.normalizeBookmarkData);
        }
      }
      
      throw new Error('Invalid JSON structure');
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseHTML(content: string): ImportedBookmark[] {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const links = doc.querySelectorAll('a[href]');
      
      return Array.from(links).map(link => ({
        title: link.textContent?.trim() || link.getAttribute('href') || 'Untitled',
        url: link.getAttribute('href') || '',
        description: link.getAttribute('title') || undefined
      }));
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseCSV(content: string): ImportedBookmark[] {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length === 0) throw new Error('Empty CSV file');
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const bookmarks: ImportedBookmark[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const bookmark: ImportedBookmark = {
          title: '',
          url: ''
        };
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'title':
            case 'name':
              bookmark.title = value;
              break;
            case 'url':
            case 'link':
              bookmark.url = value;
              break;
            case 'description':
            case 'notes':
              bookmark.description = value || undefined;
              break;
            case 'folder':
            case 'category':
              bookmark.folder = value || undefined;
              break;
            case 'tags':
              bookmark.tags = value ? value.split(';').map(t => t.trim()) : undefined;
              break;
            case 'favorite':
            case 'is_favorite':
              bookmark.is_favorite = value.toLowerCase() === 'true';
              break;
          }
        });
        
        if (bookmark.title && bookmark.url) {
          bookmarks.push(bookmark);
        }
      }
      
      return bookmarks;
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private normalizeBookmarkData(data: unknown): ImportedBookmark {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid bookmark data');
    }
    
    const bookmarkData = data as Record<string, unknown>;
    
    return {
      title: String(bookmarkData.title || bookmarkData.name || 'Untitled'),
      url: String(bookmarkData.url || bookmarkData.link || ''),
      description: bookmarkData.description ? String(bookmarkData.description) : undefined,
      folder: bookmarkData.folder ? String(bookmarkData.folder) : undefined,
      tags: Array.isArray(bookmarkData.tags) 
        ? bookmarkData.tags.map(t => String(t))
        : bookmarkData.tags 
          ? String(bookmarkData.tags).split(',').map(t => t.trim())
          : undefined,
      is_favorite: Boolean(bookmarkData.is_favorite || bookmarkData.favorite)
    };
  }

  private async importBookmarks(bookmarks: ImportedBookmark[], options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    const folderMap = new Map<string, string>();
    const tagMap = new Map<string, string>();

    // Create folders if needed
    if (options.createFolders) {
      const uniqueFolders = [...new Set(bookmarks.map(b => b.folder).filter(Boolean))];
      for (const folderName of uniqueFolders) {
        try {
          const folderId = await this.createFolder(folderName as string);
          folderMap.set(folderName as string, folderId);
        } catch (error) {
          result.errors.push(`Failed to create folder "${folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Create tags if needed
    if (options.createTags) {
      const uniqueTags = [...new Set(bookmarks.flatMap(b => b.tags || []))];
      for (const tagName of uniqueTags) {
        try {
          const tagId = await this.createTag(tagName);
          tagMap.set(tagName, tagId);
        } catch (error) {
          result.errors.push(`Failed to create tag "${tagName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Import bookmarks
    for (const bookmark of bookmarks) {
      try {
        await this.createBookmark(bookmark, folderMap, tagMap, options);
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import "${bookmark.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  private async createFolder(name: string): Promise<string> {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        user_id: this.userId
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async createTag(name: string): Promise<string> {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name,
        user_id: this.userId
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async createBookmark(
    bookmark: ImportedBookmark, 
    folderMap: Map<string, string>, 
    tagMap: Map<string, string>,
    options: ImportOptions
  ): Promise<void> {
    // Check if bookmark already exists
    if (!options.overwriteExisting) {
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('url', bookmark.url)
        .eq('user_id', this.userId)
        .single();

      if (existing) {
        throw new Error('Bookmark already exists');
      }
    }

    // Create the bookmark
    const bookmarkData = {
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      folder_id: bookmark.folder ? folderMap.get(bookmark.folder) : null,
      is_favorite: bookmark.is_favorite || false,
      user_id: this.userId
    };

    const { data: createdBookmark, error } = await supabase
      .from('bookmarks')
      .insert(bookmarkData)
      .select('id')
      .single();

    if (error) throw error;

    // Create tag associations
    if (bookmark.tags && bookmark.tags.length > 0) {
      const tagAssociations = bookmark.tags
        .map(tagName => tagMap.get(tagName))
        .filter(Boolean)
        .map(tagId => ({
          bookmark_id: createdBookmark.id,
          tag_id: tagId
        }));

      if (tagAssociations.length > 0) {
        const { error: tagError } = await supabase
          .from('bookmark_tags')
          .insert(tagAssociations);

        if (tagError) {
          console.warn('Failed to create tag associations:', tagError);
        }
      }
    }
  }

  async exportToJSON(bookmarkIds?: string[]): Promise<string> {
    try {
      let query = supabase
        .from('bookmarks')
        .select(`
          title,
          url,
          description,
          is_favorite,
          folder:folders(name),
          tags:bookmark_tags(tag:tags(name))
        `)
        .eq('user_id', this.userId);

      if (bookmarkIds && bookmarkIds.length > 0) {
        query = query.in('id', bookmarkIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const exportData = data?.map(bookmark => ({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        is_favorite: bookmark.is_favorite,
        folder: bookmark.folder?.name,
        tags: bookmark.tags?.map((t: { tag: { name: string } }) => t.tag.name)
      }));

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const bookmarkImportService = new BookmarkImportService(); 