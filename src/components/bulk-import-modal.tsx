'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  X, Upload, Tag, Folder, FileText, AlertTriangle, CheckCircle, 
  Copy, Eye, Sparkles, Zap, Globe, Link, Download, RefreshCw,
  ArrowRight, Check, AlertCircle, Info, ExternalLink
} from 'lucide-react'
import type { Folder as FolderType, Tag as TagType } from '@/types/supabase'
import Image from 'next/image'
import { toast } from 'sonner'

// Enhanced Progress component with gradient and animation
const EnhancedProgress = ({ value, className, showPercentage = true }: { 
  value: number; 
  className?: string; 
  showPercentage?: boolean;
}) => (
  <div className={`relative w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full h-4 shadow-inner overflow-hidden ${className}`}>
    <div 
      className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-4 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">
          {Math.round(value)}%
        </div>
      )}
    </div>
  </div>
)

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
  const [selectedTagValue, setSelectedTagValue] = useState<string>('')
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
  const normalizeUrl = useCallback((url: string): string => {
    try {
      const normalized = new URL(url.trim())
      if (normalized.pathname === '/') {
        normalized.pathname = ''
      }
      return normalized.toString()
    } catch {
      return url.trim()
    }
  }, [])

  // Check for duplicates
  const checkDuplicates = useCallback((url: string): { isDuplicate: boolean; existingId?: string } => {
    const normalizedUrl = normalizeUrl(url)
    const existing = existingBookmarks.find(bookmark => 
      normalizeUrl(bookmark.url) === normalizedUrl
    )
    return {
      isDuplicate: !!existing,
      existingId: existing?.id
    }
  }, [existingBookmarks, normalizeUrl])

  // Extract domain from URL
  const extractDomainFromUrl = useCallback((url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }, [])

  // Enhanced URL extraction with better parsing
  const extractUrlsFromText = useCallback((text: string): ParsedBookmark[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const results: ParsedBookmark[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      let url = line
      let title = ''
      let description = ''
      const id = generateId()

      // Enhanced parsing patterns
      const patterns = [
        // HTML bookmark format: <a href="url">title</a>
        {
          regex: /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/i,
          urlIndex: 1,
          titleIndex: 2,
          process: (match: RegExpMatchArray) => ({
            url: match[1],
            title: match[2].replace(/<[^>]*>/g, '').trim()
          })
        },
        // Markdown format: [title](url)
        {
          regex: /\[([^\]]*)\]\(([^)]*)\)/,
          urlIndex: 2,
          titleIndex: 1,
          process: (match: RegExpMatchArray) => ({
            url: match[2],
            title: match[1]
          })
        },
        // Chrome bookmark export format
        {
          regex: /^(\s*)<DT><A HREF="([^"]*)"[^>]*>([^<]*)<\/A>/,
          urlIndex: 2,
          titleIndex: 3,
          process: (match: RegExpMatchArray) => ({
            url: match[2],
            title: match[3]
          })
        }
      ]

      // Try each pattern
      let matched = false
      for (const pattern of patterns) {
        const match = line.match(pattern.regex)
        if (match) {
          const result = pattern.process(match)
          url = result.url
          title = result.title
          matched = true
          break
        }
      }

      // JSON format: {"url": "...", "title": "..."}
      if (!matched) {
        try {
          const jsonMatch = JSON.parse(line)
          if (jsonMatch.url) {
            url = jsonMatch.url
            title = jsonMatch.title || ''
            description = jsonMatch.description || ''
            matched = true
          }
        } catch {
          // Not JSON, continue
        }
      }

      // Validate URL with enhanced pattern
      const urlPattern = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/
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
          selected: !isDuplicate,
          status: 'pending',
          retryCount: 0
        })
      } else if (line.length > 0) {
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
  }, [normalizeUrl, checkDuplicates, extractDomainFromUrl])

  // Enhanced metadata fetching with real API call
  const fetchMetadata = useCallback(async (bookmark: ParsedBookmark): Promise<Partial<ParsedBookmark>> => {
    try {
      // Call our metadata API endpoint
      const response = await fetch('/api/bookmarks/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: bookmark.url })
      })

      if (response.ok) {
        const metadata = await response.json()
        return {
          title: metadata.title || bookmark.title,
          description: metadata.description || bookmark.description,
          favicon: metadata.favicon || `https://www.google.com/s2/favicons?domain=${extractDomainFromUrl(bookmark.url)}&sz=32`
        }
      }
    } catch (error) {
      console.warn('Failed to fetch metadata for', bookmark.url, error)
    }

    // Fallback to basic metadata
    const domain = extractDomainFromUrl(bookmark.url)
    return {
      title: bookmark.title || `${domain}`,
      description: bookmark.description || `Content from ${domain}`,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    }
  }, [extractDomainFromUrl])

  // Enhanced parsing with progress tracking
  const parseBookmarks = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some URLs to import')
      return
    }

    setIsProcessing(true)
    const extracted = extractUrlsFromText(inputText)
    
    // Process metadata in batches for better performance
    const batchSize = 5
    for (let i = 0; i < extracted.length; i += batchSize) {
      const batch = extracted.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (bookmark, index) => {
          if (bookmark.isValid) {
            const metadata = await fetchMetadata(bookmark)
            extracted[i + index] = { ...bookmark, ...metadata }
          }
        })
      )
      
      // Update progress
      const progress = ((i + batchSize) / extracted.length) * 100
      setImportProgress(prev => ({ ...prev, percentage: Math.min(100, progress) }))
    }

    setParsedBookmarks(extracted)
    setStep('preview')
    setIsProcessing(false)
    setImportProgress({ total: 0, processed: 0, successful: 0, failed: 0, percentage: 0 })
    
    const validCount = extracted.filter(b => b.isValid).length
    const duplicateCount = extracted.filter(b => b.isDuplicate).length
    
    toast.success(`✨ Parsed ${validCount} valid bookmarks${duplicateCount > 0 ? ` (${duplicateCount} duplicates found)` : ''}`)
  }

  // Handle file upload with drag and drop support
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setInputText(text)
      setImportMode('file')
      
      // Auto-parse if it looks like a bookmark export
      if (file.name.endsWith('.html') || text.includes('<DT><A HREF') || text.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>')) {
        toast.success(`📁 File "${file.name}" loaded successfully`)
        setTimeout(() => parseBookmarks(), 500) // Small delay for better UX
      } else {
        toast.success(`📄 File "${file.name}" loaded - click Preview to parse`)
      }
    } catch (error) {
      toast.error('Failed to read file')
      console.error('File upload error:', error)
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

  // Enhanced import with better progress tracking
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

    try {
      const bookmarkData: BulkBookmarkData[] = []

      // Process bookmarks with progress updates
      for (let i = 0; i < selectedBookmarks.length; i++) {
        const bookmark = selectedBookmarks[i]
        
        // Update progress
        setImportProgress(prev => ({
          ...prev,
          processed: i + 1,
          percentage: ((i + 1) / selectedBookmarks.length) * 100
        }))

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
              ? { ...b, status: 'success' as const }
              : b
          )
        )

        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await onImport(bookmarkData)
      
      setImportProgress(prev => ({
        ...prev,
        successful: selectedBookmarks.length,
        percentage: 100
      }))
      
      setStep('completed')
      toast.success(`🎉 Successfully imported ${selectedBookmarks.length} bookmarks!`)
    } catch (error) {
      toast.error('Failed to import bookmarks')
      console.error('Import error:', error)
      setStep('preview')
    }
  }

  // Reset modal state
  const resetState = () => {
    setInputText('')
    setDefaultFolderId('')
    setDefaultTagIds([])
    setSelectedTagValue('')
    setParsedBookmarks([])
    setIsProcessing(false)
    setStep('input')
    setShowDuplicates(true)
    setShowInvalid(true)
    setImportProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      percentage: 0
    })
    setImportMode('text')
  }

  // Handle close
  const handleClose = () => {
    resetState()
    onClose()
  }

  // Tag management
  const removeTag = (tagId: string) => {
    setDefaultTagIds(prev => prev.filter(id => id !== tagId))
  }

  const addTag = (tagId: string) => {
    if (!defaultTagIds.includes(tagId)) {
      setDefaultTagIds(prev => [...prev, tagId])
    }
    setSelectedTagValue('') // Reset the select value
  }

  // Get filtered bookmarks for display
  const getFilteredBookmarks = () => {
    return parsedBookmarks.filter(bookmark => {
      if (!showDuplicates && bookmark.isDuplicate) return false
      if (!showInvalid && !bookmark.isValid) return false
      return true
    })
  }

  // Calculate statistics
  const stats = {
    total: parsedBookmarks.length,
    valid: parsedBookmarks.filter(b => b.isValid).length,
    invalid: parsedBookmarks.filter(b => !b.isValid).length,
    duplicates: parsedBookmarks.filter(b => b.isDuplicate).length,
    selected: parsedBookmarks.filter(b => b.selected).length
  }

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Step Indicator */}
      <div className="flex items-center justify-center p-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          {(['input', 'preview', 'importing', 'completed'] as const).map((stepName, index) => {
            const currentStepIndex = ['input', 'preview', 'importing', 'completed'].indexOf(step)
            const isActive = step === stepName
            const isCompleted = currentStepIndex > index
            
            return (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }
                `}>
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <ArrowRight className={`h-4 w-4 mx-2 transition-colors duration-300 ${
                    isCompleted ? 'text-green-500' : 'text-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {step === 'input' && (
          <div className="h-full p-3 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-3">
              {/* Header */}
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Import Your Bookmarks
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Paste URLs, upload files, or drag and drop bookmark exports
                </p>
              </div>

              {/* Import Tabs */}
              <Tabs value={importMode} onValueChange={(value) => setImportMode(value as 'text' | 'file')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <TabsTrigger value="text" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Paste Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload File</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span>Paste bookmark data</span>
                    </Label>
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your bookmark export data here...

✨ Supported formats:
• Plain URLs (one per line)
• Chrome HTML export
• Firefox JSON export  
• Markdown links [title](url)
• HTML anchors <a href='url'>title</a>
• JSON objects {&quot;url&quot;: &quot;...&quot;, &quot;title&quot;: &quot;...&quot;}

Example:
https://github.com
[GitHub](https://github.com)
<a href=&quot;https://stackoverflow.com&quot;>Stack Overflow</a>"
                      className="min-h-[200px] font-mono text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-dashed border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition-colors duration-200"
                      disabled={isProcessing}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <span>{inputText.split('\n').filter(line => line.trim()).length} lines</span>
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.readText().then(text => {
                            setInputText(text)
                            toast.success('📋 Pasted from clipboard')
                          }).catch(() => {
                            toast.error('Failed to read clipboard')
                          })
                        }}
                        className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Paste from Clipboard
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4 mt-6">
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100/50 hover:to-purple-100/50 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 transition-all duration-300">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.json,.txt,.csv,.xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <div className="mx-auto w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upload bookmark file</h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-xs">
                          Supports HTML exports from Chrome, Firefox, Safari, Edge, and more
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Example data for demo
                            const exampleData = `https://github.com
[Stack Overflow](https://stackoverflow.com)
<a href="https://developer.mozilla.org">MDN Web Docs</a>
{"url": "https://react.dev", "title": "React Documentation"}`
                            setInputText(exampleData)
                            setImportMode('text')
                            toast.success('📝 Example data loaded')
                          }}
                          className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Try Example
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>📁 Supported: .html, .json, .txt, .csv, .xml</p>
                        <p>🔒 Files are processed locally and securely</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Default Settings */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Default Settings</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-blue-500" />
                      <span>Default Folder</span>
                    </Label>
                    <Select value={defaultFolderId} onValueChange={setDefaultFolderId}>
                      <SelectTrigger className="bg-white/80 dark:bg-gray-800/80">
                        <SelectValue placeholder="Select a folder (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No folder</SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: folder.color || '#3b82f6' }}
                              />
                              <span>{folder.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-500" />
                      <span>Default Tags</span>
                    </Label>
                    <div className="space-y-2">
                      <Select onValueChange={addTag} value={selectedTagValue}>
                        <SelectTrigger className="bg-white/80 dark:bg-gray-800/80">
                          <SelectValue placeholder="Add tags (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {tags.filter(tag => !defaultTagIds.includes(tag.id)).map(tag => (
                            <SelectItem key={tag.id} value={tag.id}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: tag.color || '#10b981' }}
                                />
                                <span>{tag.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {defaultTagIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {defaultTagIds.map(tagId => {
                            const tag = tags.find(t => t.id === tagId)
                            if (!tag) return null
                            return (
                              <Badge 
                                key={tagId} 
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                {tag.name}
                                <button
                                  onClick={() => removeTag(tagId)}
                                  className="ml-2 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="h-full flex flex-col">
            {/* Stats Header */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">{stats.total} Total</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200 text-sm">{stats.valid} Valid</span>
                </div>
                {stats.invalid > 0 && (
                  <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-red-800 dark:text-red-200 text-sm">{stats.invalid} Invalid</span>
                  </div>
                )}
                {stats.duplicates > 0 && (
                  <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">{stats.duplicates} Duplicates</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg">
                  <Check className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-800 dark:text-purple-200 text-sm">{stats.selected} Selected</span>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-duplicates"
                      checked={showDuplicates}
                      onCheckedChange={(checked) => setShowDuplicates(checked === true)}
                    />
                    <Label htmlFor="show-duplicates" className="text-sm font-medium">Show duplicates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-invalid"
                      checked={showInvalid}
                      onCheckedChange={(checked) => setShowInvalid(checked === true)}
                    />
                    <Label htmlFor="show-invalid" className="text-sm font-medium">Show invalid</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllSelection(true)}
                    className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllSelection(false)}
                    className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                  >
                    Select None
                  </Button>
                </div>
              </div>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1.5">
                {getFilteredBookmarks().map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className={`
                      p-2.5 rounded-lg border transition-all duration-200 hover:shadow-md
                      ${bookmark.selected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700'
                      }
                      ${!bookmark.isValid ? 'opacity-60' : ''}
                      ${bookmark.isDuplicate ? 'border-l-4 border-l-yellow-400' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-1.5">
                      <Checkbox
                        checked={bookmark.selected}
                        onCheckedChange={() => toggleBookmarkSelection(bookmark.id)}
                        disabled={!bookmark.isValid}
                        className="mt-1"
                      />
                      
                      {bookmark.favicon && (
                        <div className="flex-shrink-0 mt-1">
                          <Image
                            src={bookmark.favicon}
                            alt=""
                            width={16}
                            height={16}
                            className="rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {bookmark.title || 'Untitled'}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {bookmark.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            {bookmark.isDuplicate && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Duplicate
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-blue-600 dark:text-blue-400 truncate mb-1">
                          {bookmark.url}
                        </div>
                        
                        {bookmark.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {bookmark.description}
                          </p>
                        )}
                        
                        {bookmark.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            ❌ {bookmark.error}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(bookmark.url, '_blank')}
                        disabled={!bookmark.isValid}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Importing Bookmarks
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Processing {importProgress.total} bookmarks...
                </p>
              </div>
              
              <div className="space-y-3">
                <EnhancedProgress value={importProgress.percentage} className="w-full" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{importProgress.processed} / {importProgress.total}</span>
                  <span>{Math.round(importProgress.percentage)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <div className="font-semibold text-green-800 dark:text-green-200">Successful</div>
                  <div className="text-green-600 dark:text-green-400">{importProgress.successful}</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <div className="font-semibold text-red-800 dark:text-red-200">Failed</div>
                  <div className="text-red-600 dark:text-red-400">{importProgress.failed}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Import Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Successfully imported {importProgress.successful} bookmarks
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-800 dark:text-green-200">Total Processed</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{importProgress.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-800 dark:text-green-200">Success Rate</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round((importProgress.successful / importProgress.total) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Check className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Processing URLs...</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Extracting metadata and checking for duplicates</div>
              </div>
              <EnhancedProgress value={importProgress.percentage} className="w-64" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={step === 'preview' ? () => setStep('input') : handleClose}
            disabled={isLoading || isProcessing}
            className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
          >
            {step === 'preview' ? 'Back' : 'Cancel'}
          </Button>
          
          <div className="flex items-center space-x-2">
            {step === 'input' && (
              <Button 
                onClick={parseBookmarks} 
                disabled={!inputText.trim() || isProcessing}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview & Parse
                  </>
                )}
              </Button>
            )}
            
            {step === 'preview' && (
              <Button 
                onClick={handleImport} 
                disabled={stats.selected === 0 || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {stats.selected} Bookmarks
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 