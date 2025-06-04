'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
// Progress component implementation
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)
import { Badge } from '../ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Shield,
  Clock
} from 'lucide-react'
import bookmarkValidationService from '../../lib/services/bookmark-validation'
import type { BookmarkWithRelations } from '../../lib/services/bookmarks'
import { useUser } from '@clerk/nextjs'

interface ValidationResult {
  id: string
  url: string
  isValid: boolean
  statusCode?: number
  error?: string
  lastChecked: string
}

interface BookmarkValidationModalProps {
  bookmarks: BookmarkWithRelations[]
  trigger?: React.ReactNode
}

export function BookmarkValidationModal({ bookmarks, trigger }: BookmarkValidationModalProps) {
  const [open, setOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [results, setResults] = useState<ValidationResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  const { user } = useUser()

  const handleValidateAll = async () => {
    if (!user) return
    
    setIsValidating(true)
    setProgress(0)
    setResults([])
    setCurrentBatch(0)

    try {
      const batchSize = 10
      
      for (let i = 0; i < bookmarks.length; i += batchSize) {
        const batch = bookmarks.slice(i, i + batchSize)
        setCurrentBatch(Math.floor(i / batchSize) + 1)
        
        const batchResults = await bookmarkValidationService.validateBookmarks(batch, {
          batchSize: batchSize,
          timeout: 8000
        })
        
        setResults(prev => [...prev, ...batchResults])
        setProgress(((i + batch.length) / bookmarks.length) * 100)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const getBookmarkTitle = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId)
    return bookmark?.title || 'Unknown Bookmark'
  }

  const getStatusIcon = (result: ValidationResult) => {
    if (result.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (result.statusCode === 404) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (result: ValidationResult) => {
    if (result.isValid) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Accessible</Badge>
    } else if (result.statusCode === 404) {
      return <Badge variant="destructive">Not Found (404)</Badge>
    } else if (result.statusCode === 403) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Access Denied (403)</Badge>
    } else if (result.statusCode === 500) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Server Error (500)</Badge>
    } else if (result.error?.includes('timeout')) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Timeout</Badge>
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Unreachable</Badge>
    }
  }

  const validResults = results.filter(r => r.isValid)
  const invalidResults = results.filter(r => !r.isValid)
  const notification = bookmarkValidationService.createValidationNotification(results)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Check Links
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bookmark Validation</DialogTitle>
          <DialogDescription>
            Check your bookmarks for broken links and accessibility issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Start Validation */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Link Health Check</h3>
                <p className="text-sm text-gray-500">
                  Validate {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                onClick={handleValidateAll}
                disabled={isValidating || bookmarks.length === 0}
                className="min-w-[120px]"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Start Check
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {isValidating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>Batch {currentBatch} • {Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>

          {/* Results Summary */}
          {results.length > 0 && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Validation Results</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">{validResults.length}</div>
                  <div className="text-sm text-gray-500">Accessible</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600">{invalidResults.length}</div>
                  <div className="text-sm text-gray-500">Issues Found</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                  <div className="text-sm text-gray-500">Total Checked</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          )}

          {/* Detailed Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Detailed Results</h3>
              
              {/* Show problematic bookmarks first */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[...invalidResults, ...validResults].map((result) => (
                  <div key={result.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getStatusIcon(result)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{getBookmarkTitle(result.id)}</p>
                          <p className="text-sm text-gray-500 truncate">{result.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(result)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Show suggestions for invalid bookmarks */}
                    {!result.isValid && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-xs font-medium text-yellow-800 mb-1">Suggestions:</p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          {bookmarkValidationService.getValidationSuggestions(result).map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Checked: {new Date(result.lastChecked).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {bookmarks.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900">No bookmarks to validate</h3>
              <p className="text-gray-500">Add some bookmarks first to check their validity.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 