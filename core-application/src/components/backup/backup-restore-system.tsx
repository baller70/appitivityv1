'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Download, 
  Upload, 
  Shield, 
  Clock, 
  FileText, 
  Database,
  Archive,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  Globe,
  Calendar,
  Folder,
  Tag,
  Star,
  ExternalLink
} from 'lucide-react'

interface BackupData {
  metadata: {
    version: string
    createdAt: string
    totalBookmarks: number
    totalFolders: number
    totalTags: number
    exportFormat: 'json' | 'csv' | 'html'
  }
  bookmarks: Array<{
    id: string
    title: string
    url: string
    description?: string
    favicon?: string
    is_favorite: boolean
    visit_count: number
    created_at: string
    updated_at: string
    folder?: string
    tags: string[]
  }>
  folders: Array<{
    id: string
    name: string
    description?: string
    color?: string
    created_at: string
  }>
  tags: Array<{
    id: string
    name: string
    color?: string
    created_at: string
  }>
}

interface BackupHistory {
  id: string
  name: string
  createdAt: string
  size: string
  bookmarkCount: number
  format: string
  status: 'completed' | 'failed' | 'in_progress'
}

export function BackupRestoreSystem() {
  const [activeTab, setActiveTab] = useState('backup')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'html'>('json')
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([])
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock backup history
  const mockBackupHistory: BackupHistory[] = [
    {
      id: '1',
      name: 'Daily Backup - Dec 20, 2024',
      createdAt: '2024-12-20T10:30:00Z',
      size: '2.4 MB',
      bookmarkCount: 247,
      format: 'JSON',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Weekly Backup - Dec 15, 2024',
      createdAt: '2024-12-15T09:00:00Z',
      size: '2.1 MB',
      bookmarkCount: 231,
      format: 'JSON',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Manual Export - Dec 10, 2024',
      createdAt: '2024-12-10T14:22:00Z',
      size: '1.8 MB',
      bookmarkCount: 198,
      format: 'HTML',
      status: 'completed'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Mock export functionality
      const mockData = {
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          totalBookmarks: 247,
          exportFormat
        },
        bookmarks: []
      }

      const fileContent = JSON.stringify(mockData, null, 2)
      const fileName = `bookmarks-backup-${new Date().toISOString().split('T')[0]}.json`
      
      const blob = new Blob([fileContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const generateCSV = (bookmarks: any[]) => {
    const headers = ['Title', 'URL', 'Description', 'Folder', 'Tags', 'Favorite', 'Visits', 'Created']
    const rows = bookmarks.map(bookmark => [
      bookmark.title,
      bookmark.url,
      bookmark.description || '',
      bookmark.folder || '',
      bookmark.tags.join(';'),
      bookmark.is_favorite ? 'Yes' : 'No',
      bookmark.visit_count,
      bookmark.created_at
    ])
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  const generateHTML = (data: BackupData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Bookmark Export - ${data.metadata.createdAt}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .folder { margin: 20px 0; }
        .bookmark { margin: 5px 0 5px 20px; }
        .bookmark a { text-decoration: none; color: #0066cc; }
        .bookmark .description { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Bookmarks Export</h1>
    <p>Exported on: ${new Date(data.metadata.createdAt).toLocaleString()}</p>
    <p>Total Bookmarks: ${data.metadata.totalBookmarks}</p>
    
    ${data.folders.map(folder => `
        <div class="folder">
            <h2>${folder.name}</h2>
            ${data.bookmarks
              .filter(b => b.folder === folder.name)
              .map(bookmark => `
                <div class="bookmark">
                    <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
                    ${bookmark.description ? `<div class="description">${bookmark.description}</div>` : ''}
                </div>
              `).join('')}
        </div>
    `).join('')}
</body>
</html>`
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      previewImportFile(file)
    }
  }

  const previewImportFile = async (file: File) => {
    try {
      const text = await file.text()
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        setImportPreview({
          format: 'JSON',
          bookmarks: data.bookmarks?.length || 0,
          folders: data.folders?.length || 0,
          tags: data.tags?.length || 0,
          valid: true
        })
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim())
        setImportPreview({
          format: 'CSV',
          bookmarks: lines.length - 1, // Subtract header
          folders: 0,
          tags: 0,
          valid: lines.length > 1
        })
      } else if (file.name.endsWith('.html')) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const links = doc.querySelectorAll('a[href]')
        setImportPreview({
          format: 'HTML',
          bookmarks: links.length,
          folders: 0,
          tags: 0,
          valid: links.length > 0
        })
      }
    } catch (error) {
      setImportPreview({
        format: 'Unknown',
        bookmarks: 0,
        folders: 0,
        tags: 0,
        valid: false,
        error: 'Invalid file format'
      })
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    // Mock import functionality
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsImporting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'json': return <FileJson className="h-4 w-4 text-blue-600" />
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case 'html': return <Globe className="h-4 w-4 text-orange-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Backup & Restore</h2>
          <p className="text-sm text-gray-600">Export and import your bookmarks safely</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">Export Backup</TabsTrigger>
          <TabsTrigger value="restore">Import Restore</TabsTrigger>
          <TabsTrigger value="history">Backup History</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`cursor-pointer transition-all ${exportFormat === 'json' ? 'ring-2 ring-blue-500' : ''}`} 
                      onClick={() => setExportFormat('json')}>
                  <CardContent className="p-4 text-center">
                    <FileJson className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold">JSON Format</h3>
                    <p className="text-xs text-gray-600">Complete data with metadata</p>
                  </CardContent>
                </Card>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Exporting bookmarks...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Bookmarks (JSON)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Select backup file</Label>
                  <Input
                    ref={fileInputRef}
                    id="import-file"
                    type="file"
                    accept=".json,.csv,.html"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Supports JSON, CSV, and HTML bookmark files
                  </p>
                </div>

                {importPreview && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        {getFormatIcon(importPreview.format)}
                        Import Preview
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Format</div>
                          <div className="font-medium">{importPreview.format}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Bookmarks</div>
                          <div className="font-medium">{importPreview.bookmarks}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Folders</div>
                          <div className="font-medium">{importPreview.folders}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Tags</div>
                          <div className="font-medium">{importPreview.tags}</div>
                        </div>
                      </div>
                      {importPreview.error && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {importPreview.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Importing bookmarks...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                )}

                <Button 
                  onClick={handleImport} 
                  disabled={!importFile || !importPreview?.valid || isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Bookmarks
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Backup History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Backup History</h3>
                <p className="text-gray-600 mb-4">
                  Your backup history will appear here once you create backups.
                </p>
                <Button variant="outline">
                  Create First Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 