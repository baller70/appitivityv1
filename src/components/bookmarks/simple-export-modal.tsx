'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Download, Copy, Share2 } from 'lucide-react'
import bookmarkExportService, { ExportOptions } from '../../lib/services/export'

interface SimpleExportModalProps {
  trigger?: React.ReactNode
}

export function SimpleExportModal({ trigger }: SimpleExportModalProps) {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('json')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Simple notification fallback
    alert(`${type.toUpperCase()}: ${message}`)
  }

  const handleExport = async (action: 'download' | 'copy' | 'share') => {
    if (!user?.id) {
      showToast('Please sign in to export bookmarks', 'error')
      return
    }

    setIsExporting(true)

    try {
      const options: ExportOptions = {
        format: exportFormat
      }

      const result = await bookmarkExportService.exportBookmarks(user.id, options)

      switch (action) {
        case 'download':
          bookmarkExportService.downloadFile(result)
          showToast(`Downloaded ${result.filename}`)
          break
        case 'copy':
          await bookmarkExportService.copyToClipboard(result)
          showToast('Copied to clipboard')
          break
        case 'share':
          try {
            await bookmarkExportService.shareBookmarks(result)
            showToast('Shared successfully')
          } catch (error) {
            showToast('Share not supported on this device', 'error')
          }
          break
      }

      setOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      showToast('Export failed. Please try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Bookmarks</DialogTitle>
          <DialogDescription>
            Choose your export format and download your bookmarks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (structured data)</SelectItem>
                <SelectItem value="csv">CSV (spreadsheet)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => handleExport('download')}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Download File'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('copy')}
                disabled={isExporting}
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('share')}
                disabled={isExporting}
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 