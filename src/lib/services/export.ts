import { BookmarkWithRelations } from './bookmarks';

export class ExportService {
  async exportToJson(bookmarks: BookmarkWithRelations[]): Promise<string> {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      bookmarks: bookmarks.map(bookmark => ({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        tags: bookmark.tags || [],
        folder: bookmark.folder,
        created_at: bookmark.created_at,
        is_favorited: bookmark.is_favorite
      }))
    };
    return JSON.stringify(exportData, null, 2);
  }

  async exportToCsv(bookmarks: BookmarkWithRelations[]): Promise<string> {
    const headers = ['Title', 'URL', 'Description', 'Tags', 'Folder', 'Created Date', 'Is Favorite'];
    const rows = bookmarks.map(bookmark => [
      bookmark.title,
      bookmark.url,
      bookmark.description || '',
      bookmark.tags?.map((tag: { name: string }) => tag.name).join(', ') || '',
      bookmark.folder?.name || '',
      bookmark.created_at || '',
      bookmark.is_favorite ? 'Yes' : 'No'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  async exportToHtml(bookmarks: BookmarkWithRelations[]): Promise<string> {
    const bookmarkItems = bookmarks.map(bookmark => 
      `<DT><A HREF="${bookmark.url}">${bookmark.title}</A>${bookmark.description ? `\n<DD>${bookmark.description}` : ''}`
    ).join('\n');

    return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${bookmarkItems}
</DL><p>`;
  }

  async exportBookmarks(
    bookmarks: BookmarkWithRelations[],
    format: 'json' | 'csv' | 'html',
    options: {
      includeMetadata?: boolean;
      includeTags?: boolean;
      includeNotes?: boolean;
      includeFolders?: boolean;
    } = {}
  ): Promise<string> {
    let filteredBookmarks = bookmarks;

    // Apply filters based on options
    if (!options.includeTags) {
      filteredBookmarks = filteredBookmarks.map(b => ({ ...b, tags: [] }));
    }
    if (!options.includeNotes) {
      filteredBookmarks = filteredBookmarks.map(b => ({ ...b, description: '' }));
    }
    if (!options.includeFolders) {
      filteredBookmarks = filteredBookmarks.map(b => ({ ...b, folder: null }));
    }

    switch (format) {
      case 'json':
        return this.exportToJson(filteredBookmarks);
      case 'csv':
        return this.exportToCsv(filteredBookmarks);
      case 'html':
        return this.exportToHtml(filteredBookmarks);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  downloadFile(data: string, filename: string, mimeType: string) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async copyToClipboard(data: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(data);
      return true;
    } catch {
      return false;
    }
  }
} 