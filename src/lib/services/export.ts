import { createSupabaseClient } from '../supabase'
import type { Database } from '../../types/supabase'

export interface ExportOptions {
  format: 'csv' | 'json'
  includeFields?: string[]
  filterBy?: {
    folders?: string[]
    tags?: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
}

export interface ExportResult {
  data: string
  filename: string
  mimeType: string
}

class BookmarkExportService {
  private getSupabaseClient(userId: string) {
    return createSupabaseClient(userId)
  }

  async exportBookmarks(
    userId: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<ExportResult> {
    try {
      // Fetch bookmarks with related data
      const supabase = this.getSupabaseClient(userId)
      let query = supabase
        .from('bookmarks')
        .select(`
          *,
          folders(name),
          bookmark_tags(tags(name, color))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Apply filters if provided
      if (options.filterBy?.folders?.length) {
        query = query.in('folder_id', options.filterBy.folders)
      }

      if (options.filterBy?.dateRange) {
        query = query
          .gte('created_at', options.filterBy.dateRange.start)
          .lte('created_at', options.filterBy.dateRange.end)
      }

      const { data: bookmarks, error } = await query

      if (error) throw error

      // Transform data for export
      const exportData = this.transformBookmarksForExport(bookmarks || [])

      if (options.format === 'csv') {
        return this.generateCSV(exportData)
      } else {
        return this.generateJSON(exportData)
      }
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error('Failed to export bookmarks')
    }
  }

  private transformBookmarksForExport(bookmarks: any[]) {
    return bookmarks.map(bookmark => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || '',
      notes: bookmark.notes || '',
      folder: bookmark.folders?.name || 'Uncategorized',
      tags: bookmark.bookmark_tags?.map((bt: any) => bt.tags?.name).filter(Boolean).join(', ') || '',
      is_favorite: bookmark.is_favorite,
      is_archived: bookmark.is_archived,
      created_at: bookmark.created_at,
      updated_at: bookmark.updated_at,
      visit_count: bookmark.visit_count || 0,
      last_visited: bookmark.last_visited || '',
      favicon_url: bookmark.favicon_url || ''
    }))
  }

  private generateCSV(data: any[]): ExportResult {
    if (data.length === 0) {
      return {
        data: 'No data to export',
        filename: `bookmarks-${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv'
      }
    }

    // Generate CSV headers
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')

    // Generate CSV rows
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )

    const csvContent = [csvHeaders, ...csvRows].join('\n')
    
    return {
      data: csvContent,
      filename: `bookmarks-${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    }
  }

  private generateJSON(data: any[]): ExportResult {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalBookmarks: data.length,
      bookmarks: data
    }

    return {
      data: JSON.stringify(jsonData, null, 2),
      filename: `bookmarks-${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json'
    }
  }

  // Utility method to trigger download in browser
  downloadFile(result: ExportResult) {
    const blob = new Blob([result.data], { type: result.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Method to copy to clipboard
  async copyToClipboard(result: ExportResult): Promise<void> {
    try {
      await navigator.clipboard.writeText(result.data)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      throw new Error('Failed to copy to clipboard')
    }
  }

  // Share via Web Share API (if supported)
  async shareBookmarks(result: ExportResult): Promise<void> {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'My Bookmarks',
          text: 'Exported bookmarks from AppOrganizer',
          url: window.location.origin
        })
      } catch (error) {
        console.error('Failed to share:', error)
        throw new Error('Failed to share bookmarks')
      }
    } else {
      throw new Error('Web Share API not supported')
    }
  }
}

export const bookmarkExportService = new BookmarkExportService()
export default bookmarkExportService 