'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Tag, Folder } from 'lucide-react'
import type { Folder as FolderType, Tag as TagType } from '@/types/supabase'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (bookmarks: BulkBookmarkData[]) => Promise<void>
  folders: FolderType[]
  tags: TagType[]
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
  url: string
  title?: string
  description?: string
  favicon?: string
  isValid: boolean
  error?: string
}

export function BulkImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  folders, 
  tags, 
  isLoading = false 
}: BulkImportModalProps) {
  const [inputText, setInputText] = useState('')
  const [defaultFolderId, setDefaultFolderId] = useState<string>('')
  const [defaultTagIds, setDefaultTagIds] = useState<string[]>([])
  const [parsedBookmarks, setParsedBookmarks] = useState<ParsedBookmark[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'input' | 'preview' | 'importing'>('input')

  // Parse URLs and fetch metadata
  const parseBookmarks = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    const lines = inputText.trim().split('\n')
    const parsed: ParsedBookmark[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Extract URL from various formats
      let url = trimmed
      let title = ''
      const description = ''

      // Handle browser bookmark export format: <a href="url">title</a>
      const htmlMatch = trimmed.match(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/i)
      if (htmlMatch) {
        url = htmlMatch[1]
        title = htmlMatch[2]
      }

      // Handle markdown format: [title](url)
      const markdownMatch = trimmed.match(/\[([^\]]*)\]\(([^)]*)\)/)
      if (markdownMatch) {
        title = markdownMatch[1]
        url = markdownMatch[2]
      }

      // Validate URL
      const isValidUrl = /^https?:\/\/.+\..+/.test(url)
      
      if (isValidUrl) {
        try {
          // Fetch metadata (in real app, this would be a server-side function)
          const metadata = await fetchMetadata(url)
          parsed.push({
            url,
            title: title || metadata.title || extractDomainFromUrl(url),
            description: description || metadata.description || '',
            favicon: metadata.favicon,
            isValid: true
          })
        } catch {
          parsed.push({
            url,
            title: title || extractDomainFromUrl(url),
            description: description,
            isValid: true
          })
        }
      } else {
        parsed.push({
          url: trimmed,
          isValid: false,
          error: 'Invalid URL format'
        })
      }
    }

    setParsedBookmarks(parsed)
    setStep('preview')
    setIsProcessing(false)
  }

  // Mock metadata fetching (in real app, this would be server-side)
  const fetchMetadata = async (url: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      const domain = new URL(url).hostname
      return {
        title: `${domain} - Website`,
        description: `Content from ${domain}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      }
    } catch {
      return {
        title: url,
        description: '',
        favicon: undefined
      }
    }
  }

  const extractDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const handleImport = async () => {
    const validBookmarks = parsedBookmarks.filter(b => b.isValid)
    const bookmarkData: BulkBookmarkData[] = validBookmarks.map(bookmark => ({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      folderId: defaultFolderId || undefined,
      tagIds: defaultTagIds.length > 0 ? defaultTagIds : undefined,
      favicon: bookmark.favicon
    }))

    setStep('importing')
    try {
      await onImport(bookmarkData)
      onClose()
      resetState()
    } catch (error) {
      console.error('Import failed:', error)
      setStep('preview')
    }
  }

  const resetState = () => {
    setInputText('')
    setDefaultFolderId('')
    setDefaultTagIds([])
    setParsedBookmarks([])
    setStep('input')
    setIsProcessing(false)
  }

  const handleClose = () => {
    onClose()
    resetState()
  }

  const removeTag = (tagId: string) => {
    setDefaultTagIds(prev => prev.filter(id => id !== tagId))
  }

  const addTag = (tagId: string) => {
    if (!defaultTagIds.includes(tagId)) {
      setDefaultTagIds(prev => [...prev, tagId])
    }
  }

  const validBookmarkCount = parsedBookmarks.filter(b => b.isValid).length
  const invalidBookmarkCount = parsedBookmarks.filter(b => !b.isValid).length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Bookmarks
          </DialogTitle>
          <DialogDescription>
            Import multiple bookmarks at once with automatic metadata detection
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-input">Paste URLs or bookmark data</Label>
                <Textarea
                  id="bulk-input"
                  placeholder={`Paste URLs, one per line. Supports:
• Plain URLs: https://example.com
• Markdown links: [Title](https://example.com)
• HTML bookmarks: <a href="https://example.com">Title</a>
• Browser bookmark exports`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-folder">Default Folder (Optional)</Label>
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
                      <SelectItem value="">No folder</SelectItem>
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
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-green-600">
                    ✓ {validBookmarkCount} valid bookmarks
                  </div>
                  {invalidBookmarkCount > 0 && (
                    <div className="text-sm text-red-600">
                      ✗ {invalidBookmarkCount} invalid entries
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => setStep('input')}>
                  Edit Input
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {parsedBookmarks.map((bookmark, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded-lg ${
                      bookmark.isValid 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {bookmark.isValid ? (
                        <>
                          {bookmark.favicon && (
                            <img 
                              src={bookmark.favicon} 
                              alt="" 
                              className="w-4 h-4 mt-1"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {bookmark.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {bookmark.url}
                            </div>
                            {bookmark.description && (
                              <div className="text-xs text-gray-600 mt-1">
                                {bookmark.description}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1">
                          <div className="text-sm text-red-700">{bookmark.url}</div>
                          <div className="text-xs text-red-600">{bookmark.error}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <div className="text-lg font-medium">Importing bookmarks...</div>
              <div className="text-sm text-gray-500">
                Creating {validBookmarkCount} bookmarks
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
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
                disabled={validBookmarkCount === 0 || isLoading}
              >
                Import {validBookmarkCount} Bookmarks
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 