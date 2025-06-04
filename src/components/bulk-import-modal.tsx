'use client'

import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Upload, Tag, Folder, FileText, AlertTriangle, CheckCircle, Copy, Eye } from 'lucide-react'
import type { Folder as FolderType, Tag as TagType } from '@/types/supabase'
import Image from 'next/image'
import { toast } from 'sonner'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (bookmarks: BulkBookmarkData[]) => Promise<void>
  folders: FolderType[]
  tags: TagType[]
  existingBookmarks?: { url: string; id: string; title: string }[]
  isLoading?: boolean
}

interface BulkBookmarkData {
  url: string
  title?: string
  description?: string
  folderId?: string
  tagIds?: string[]
  favicon?: string
}

interface ParsedBookmark {
  id: string
  url: string
  originalUrl: string
  title?: string
  description?: string
  favicon?: string
  isValid: boolean
  error?: string
  isDuplicate?: boolean
  existingBookmarkId?: string
  selected: boolean
  status: 'pending' | 'processing' | 'success' | 'failed'
  retryCount: number
}

interface ImportProgress {
  total: number
  processed: number
  successful: number
  failed: number
  percentage: number
}

export function BulkImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  folders, 
  tags, 
  existingBookmarks = [],
  isLoading = false 
}: BulkImportModalProps) {
  const [inputText, setInputText] = useState('')
  const [defaultFolderId, setDefaultFolderId] = useState<string>('')
  const [defaultTagIds, setDefaultTagIds] = useState<string[]>([])
  const [parsedBookmarks, setParsedBookmarks] = useState<ParsedBookmark[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'completed'>('input')
  const [showDuplicates, setShowDuplicates] = useState(true)
  const [showInvalid, setShowInvalid] = useState(true)
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    percentage: 0
  })
  const [importMode, setImportMode] = useState<'text' | 'file'>('text')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate unique ID for bookmarks
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Normalize URL
  const normalizeUrl = (url: string): string => {
    try {
      const normalized = new URL(url.trim())
      // Remove trailing slash from pathname
      if (normalized.pathname === '/') {
        normalized.pathname = ''
      }
      return normalized.toString()
    } catch {
      return url.trim()
    }
  }

  // Check for duplicates
  const checkDuplicates = (url: string): { isDuplicate: boolean; existingId?: string } => {
    const normalizedUrl = normalizeUrl(url)
    const existing = existingBookmarks.find(bookmark => 
      normalizeUrl(bookmark.url) === normalizedUrl
    )
    return {
      isDuplicate: !!existing,
      existingId: existing?.id
    }
  }

  // Extract URLs from various formats
  const extractUrlsFromText = (text: string): ParsedBookmark[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const results: ParsedBookmark[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      let url = line
      let title = ''
      let description = ''
      const id = generateId()

      // HTML bookmark format: <a href="url">title</a>
      const htmlMatch = line.match(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/i)
      if (htmlMatch) {
        url = htmlMatch[1]
        title = htmlMatch[2].replace(/<[^>]*>/g, '').trim()
      }

      // Markdown format: [title](url)
      const markdownMatch = line.match(/\[([^\]]*)\]\(([^)]*)\)/)
      if (markdownMatch) {
        title = markdownMatch[1]
        url = markdownMatch[2]
      }

      // JSON format: {"url": "...", "title": "..."}
      try {
        const jsonMatch = JSON.parse(line)
        if (jsonMatch.url) {
          url = jsonMatch.url
          title = jsonMatch.title || ''
          description = jsonMatch.description || ''
        }
      } catch {
        // Not JSON, continue with other formats
      }

      // Chrome bookmark export format
      const chromeMatch = line.match(/^(\s*)<DT><A HREF="([^"]*)"[^>]*>([^<]*)<\/A>/)
      if (chromeMatch) {
        url = chromeMatch[2]
        title = chromeMatch[3]
      }

      // Validate URL
      const urlPattern = /^https?:\/\/.+\..+/
      const isValid = urlPattern.test(url)
      
      if (isValid) {
        const normalizedUrl = normalizeUrl(url)
        const { isDuplicate, existingId } = checkDuplicates(normalizedUrl)
        
        results.push({
          id,
          url: normalizedUrl,
          originalUrl: line,
          title: title || extractDomainFromUrl(normalizedUrl),
          description,
          isValid: true,
          isDuplicate,
          existingBookmarkId: existingId,
          selected: !isDuplicate, // Don't select duplicates by default
          status: 'pending',
          retryCount: 0
        })
      } else {
        results.push({
          id,
          url: line,
          originalUrl: line,
          isValid: false,
          error: 'Invalid URL format',
          selected: false,
          status: 'failed',
          retryCount: 0
        })
      }
    }

    return results
  }

  // Extract domain from URL
  const extractDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // Fetch metadata for URL
  const fetchMetadata = async (bookmark: ParsedBookmark): Promise<Partial<ParsedBookmark>> => {
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate metadata fetching
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const domain = extractDomainFromUrl(bookmark.url)
      return {
        title: bookmark.title || `${domain}`,
        description: bookmark.description || `Content from ${domain}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      }
          } catch {
        return {
          error: 'Failed to fetch metadata'
        }
      }
  }

  // Parse and validate bookmarks
  const parseBookmarks = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some URLs to import')
      return
    }

    setIsProcessing(true)
    const extracted = extractUrlsFromText(inputText)
    
    // Update progress
    for (let i = 0; i < extracted.length; i++) {
      const bookmark = extracted[i]
      if (bookmark.isValid) {
        const metadata = await fetchMetadata(bookmark)
        extracted[i] = { ...bookmark, ...metadata }
      }
      
      // Update progress
      const progress = ((i + 1) / extracted.length) * 100
      setImportProgress(prev => ({ ...prev, percentage: progress }))
    }

    setParsedBookmarks(extracted)
    setStep('preview')
    setIsProcessing(false)
    setImportProgress({ total: 0, processed: 0, successful: 0, failed: 0, percentage: 0 })
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setInputText(text)
    setImportMode('text')
    
    // Auto-parse if it looks like a bookmark export
    if (file.name.endsWith('.html') || text.includes('<DT><A HREF')) {
      await parseBookmarks()
    }
  }

  // Toggle bookmark selection
  const toggleBookmarkSelection = (id: string) => {
    setParsedBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === id 
          ? { ...bookmark, selected: !bookmark.selected }
          : bookmark
      )
    )
  }

  // Select/deselect all bookmarks
  const toggleAllSelection = (selected: boolean) => {
    setParsedBookmarks(prev => 
      prev.map(bookmark => ({ ...bookmark, selected }))
    )
  }

  // Import selected bookmarks
  const handleImport = async () => {
    const selectedBookmarks = parsedBookmarks.filter(b => b.selected && b.isValid)
    if (selectedBookmarks.length === 0) {
      toast.error('Please select at least one bookmark to import')
      return
    }

    setStep('importing')
    setImportProgress({
      total: selectedBookmarks.length,
      processed: 0,
      successful: 0,
      failed: 0,
      percentage: 0
    })

    const bookmarkData: BulkBookmarkData[] = []
    let processed = 0
    let successful = 0
    let failed = 0

    for (const bookmark of selectedBookmarks) {
      try {
        // Update bookmark status
        setParsedBookmarks(prev => 
          prev.map(b => 
            b.id === bookmark.id 
              ? { ...b, status: 'processing' }
              : b
          )
        )

              bookmarkData.push({
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description,
        folderId: defaultFolderId && defaultFolderId !== 'none' ? defaultFolderId : undefined,
        tagIds: defaultTagIds.length > 0 ? defaultTagIds : undefined,
        favicon: bookmark.favicon
      })

        // Update status to success
        setParsedBookmarks(prev => 
          prev.map(b => 
            b.id === bookmark.id 
              ? { ...b, status: 'success' }
              : b
          )
        )
        
        successful++
      } catch (error) {
        // Update status to failed
        setParsedBookmarks(prev => 
          prev.map(b => 
            b.id === bookmark.id 
              ? { ...b, status: 'failed', error: error instanceof Error ? error.message : 'Import failed' }
              : b
          )
        )
        
        failed++
      }

      processed++
      const percentage = (processed / selectedBookmarks.length) * 100
      setImportProgress({
        total: selectedBookmarks.length,
        processed,
        successful,
        failed,
        percentage
      })
    }

    try {
      await onImport(bookmarkData)
      setStep('completed')
      toast.success(`Successfully imported ${successful} bookmarks${failed > 0 ? ` (${failed} failed)` : ''}`)
    } catch (error) {
      toast.error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setStep('preview')
    }
  }

  // Reset state
  const resetState = () => {
    setInputText('')
    setDefaultFolderId('')
    setDefaultTagIds([])
    setParsedBookmarks([])
    setStep('input')
    setIsProcessing(false)
    setImportProgress({ total: 0, processed: 0, successful: 0, failed: 0, percentage: 0 })
    setImportMode('text')
  }

  // Handle close
  const handleClose = () => {
    onClose()
    resetState()
  }

  // Tag management
  const removeTag = (tagId: string) => {
    setDefaultTagIds(prev => prev.filter(id => id !== tagId))
  }

  const addTag = (tagId: string) => {
    if (!defaultTagIds.includes(tagId)) {
      setDefaultTagIds(prev => [...prev, tagId])
    }
  }

  // Get filtered bookmarks for display
  const getFilteredBookmarks = () => {
    return parsedBookmarks.filter(bookmark => {
      if (!bookmark.isValid && !showInvalid) return false
      if (bookmark.isDuplicate && !showDuplicates) return false
      return true
    })
  }

  // Statistics
  const stats = {
    total: parsedBookmarks.length,
    valid: parsedBookmarks.filter(b => b.isValid).length,
    invalid: parsedBookmarks.filter(b => !b.isValid).length,
    duplicates: parsedBookmarks.filter(b => b.isDuplicate).length,
    selected: parsedBookmarks.filter(b => b.selected).length
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Robust Bookmark Import Tool
          </DialogTitle>
          <DialogDescription>
            Advanced bulk bookmark import with duplicate detection, metadata extraction, and progress tracking
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'input' && (
            <Tabs value={importMode} onValueChange={(value) => setImportMode(value as 'text' | 'file')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text Input
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="bulk-input">Paste URLs or bookmark data</Label>
                  <Textarea
                    id="bulk-input"
                    placeholder={`Supports multiple formats:
• Plain URLs: https://example.com
• Markdown: [Title](https://example.com)
• HTML: <a href="https://example.com">Title</a>
• JSON: {"url": "https://example.com", "title": "Title"}
• Chrome exports: <DT><A HREF="https://example.com">Title</A>`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                      {inputText.split('\n').filter(line => line.trim()).length} lines
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.readText().then(text => {
                          setInputText(text)
                          toast.success('Pasted from clipboard')
                        }).catch(() => {
                          toast.error('Failed to read clipboard')
                        })
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Paste from Clipboard
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.json,.txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Upload bookmark file</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports HTML exports from Chrome, Firefox, Safari, and more
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Default settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Default Folder (Optional)</Label>
                  <Select value={defaultFolderId} onValueChange={setDefaultFolderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          <span>Choose folder...</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Default Tags (Optional)</Label>
                  <Select onValueChange={addTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add tags">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span>Add tags...</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tags
                        .filter(tag => !defaultTagIds.includes(tag.id))
                        .map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: tag.color || '#gray' }}
                              />
                              {tag.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {defaultTagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {defaultTagIds.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId)
                        return tag ? (
                          <Badge key={tag.id} variant="secondary" className="gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: tag.color || '#gray' }}
                            />
                            {tag.name}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTag(tag.id)}
                            />
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Tabs>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Statistics and controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {stats.valid} valid
                  </Badge>
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {stats.invalid} invalid
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Copy className="h-3 w-3" />
                    {stats.duplicates} duplicates
                  </Badge>
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {stats.selected} selected
                  </Badge>
                </div>
                <Button variant="outline" onClick={() => setStep('input')}>
                  Edit Input
                </Button>
              </div>

              {/* Filters and bulk actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllSelection(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllSelection(false)}
                  >
                    Deselect All
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-duplicates"
                      checked={showDuplicates}
                      onCheckedChange={(checked) => setShowDuplicates(checked === true)}
                    />
                    <Label htmlFor="show-duplicates" className="text-sm">Show duplicates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-invalid"
                      checked={showInvalid}
                      onCheckedChange={(checked) => setShowInvalid(checked === true)}
                    />
                    <Label htmlFor="show-invalid" className="text-sm">Show invalid</Label>
                  </div>
                </div>
              </div>

              {/* Bookmark list */}
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {getFilteredBookmarks().map((bookmark) => (
                  <div 
                    key={bookmark.id} 
                    className={`p-3 border rounded-lg ${
                      bookmark.isDuplicate 
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' 
                        : bookmark.isValid 
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={bookmark.selected}
                        onCheckedChange={() => toggleBookmarkSelection(bookmark.id)}
                        disabled={!bookmark.isValid}
                      />
                      
                      {bookmark.isValid && bookmark.favicon && (
                        <Image
                          src={bookmark.favicon}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 mt-0.5"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm truncate">
                            {bookmark.title || bookmark.url}
                          </div>
                          {bookmark.isDuplicate && (
                            <Badge variant="secondary" className="text-xs">
                              Duplicate
                            </Badge>
                          )}
                          {!bookmark.isValid && (
                            <Badge variant="destructive" className="text-xs">
                              Invalid
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {bookmark.url}
                        </div>
                        {bookmark.description && (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {bookmark.description}
                          </div>
                        )}
                        {bookmark.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {bookmark.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-full max-w-md space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium">Importing bookmarks...</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {importProgress.processed} of {importProgress.total} processed
                  </div>
                </div>
                <Progress value={importProgress.percentage} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>✓ {importProgress.successful} successful</span>
                  <span>✗ {importProgress.failed} failed</span>
                </div>
              </div>
            </div>
          )}

          {step === 'completed' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="text-center">
                <div className="text-lg font-medium">Import completed!</div>
                <div className="text-sm text-gray-500 mt-1">
                  Successfully imported {importProgress.successful} bookmarks
                  {importProgress.failed > 0 && ` (${importProgress.failed} failed)`}
                </div>
              </div>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div className="text-center">
                <div className="text-lg font-medium">Processing URLs...</div>
                <div className="text-sm text-gray-500">Extracting metadata and checking for duplicates</div>
              </div>
              <Progress value={importProgress.percentage} className="w-full max-w-md" />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading || isProcessing}>
            Cancel
          </Button>
          
          <div className="space-x-2">
            {step === 'input' && (
              <Button 
                onClick={parseBookmarks} 
                disabled={!inputText.trim() || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Parse & Preview'}
              </Button>
            )}
            
            {step === 'preview' && (
              <Button 
                onClick={handleImport} 
                disabled={stats.selected === 0 || isLoading}
              >
                Import {stats.selected} Bookmarks
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 