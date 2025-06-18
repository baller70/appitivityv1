'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Download, FileText, Check } from 'lucide-react'
import { Label } from '../ui/label'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'
import { type BookmarkWithRelations } from '../../lib/services/bookmarks'

interface SimpleExportModalProps {
  trigger: React.ReactNode
  bookmarks: BookmarkWithRelations[]
}

type ExportFormat = 'json' | 'csv' | 'html'

// Simple export service
const exportService = {
  exportBookmarks: async (
    bookmarks: BookmarkWithRelations[], 
    format: ExportFormat
  ): Promise<string> => {
    switch (format) {
      case 'json':
        return JSON.stringify(bookmarks, null, 2)
      case 'csv':
        const headers = ['Title', 'URL', 'Description', 'Created']
        const rows = bookmarks.map(b => [
          b.title,
          b.url, 
          b.description || '',
          b.created_at
        ])
        return [headers, ...rows].map(row => row.join(',')).join('\n')
      case 'html':
        const htmlContent = bookmarks.map(b => 
          `<li><a href="${b.url}">${b.title}</a> - ${b.description || ''}</li>`
        ).join('\n')
        return `<html><body><ul>\n${htmlContent}\n</ul></body></html>`
      default:
        throw new Error('Unsupported format')
    }
  }
}

export function SimpleExportModal({ trigger, bookmarks }: SimpleExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!selectedFormat) {
      toast.error('Please select an export format')
      return
    }

    setIsExporting(true)
    
    try {
      const data = await exportService.exportBookmarks(
        bookmarks,
        selectedFormat
      )

      // Create and download file
      const blob = new Blob([data], { 
        type: selectedFormat === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${bookmarks.length} bookmarks as ${selectedFormat.toUpperCase()}`)
      setIsOpen(false)
    } catch (exportError) {
      console.error('Export failed:', exportError)
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const formats = [
    { id: 'json', name: 'JSON', description: 'Machine-readable format with full data' },
    { id: 'csv', name: 'CSV', description: 'Spreadsheet-compatible format' },
    { id: 'html', name: 'HTML', description: 'Browser bookmarks format' },
  ] as const

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Bookmarks
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Export {bookmarks.length} bookmarks to your preferred format.
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            {formats.map((format) => (
              <div
                key={format.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedFormat === format.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 mt-0.5",
                  selectedFormat === format.id
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {selectedFormat === format.id && (
                    <Check className="w-2 h-2 text-white ml-0.5 mt-0.5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{format.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format.description}
                  </div>
                </div>
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || !selectedFormat}
              className="flex-1"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 