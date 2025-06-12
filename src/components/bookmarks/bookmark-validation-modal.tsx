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
// Enhanced Progress component with gradient and animation
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner ${className}`}>
    <div 
      className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
    </div>
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
  Clock,
  Zap,
  TrendingUp,
  Activity,
  Globe,
  AlertCircle,
  CheckCircle2,
  Timer,
  Wifi,
  WifiOff
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
  responseTime?: number
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
  const [currentUrl, setCurrentUrl] = useState('')
  const { user } = useUser()

  const handleValidateAll = async () => {
    if (!user) return
    
    setIsValidating(true)
    setProgress(0)
    setResults([])
    setCurrentBatch(0)
    setCurrentUrl('')

    try {
      const batchSize = 5
      
      for (let i = 0; i < bookmarks.length; i += batchSize) {
        const batch = bookmarks.slice(i, i + batchSize)
        setCurrentBatch(Math.floor(i / batchSize) + 1)
        
        // Update current URL being checked
        for (const bookmark of batch) {
          setCurrentUrl(bookmark.url)
          await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UI update
        }
        
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
      setCurrentUrl('')
    }
  }

  const getBookmarkTitle = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId)
    return bookmark?.title || 'Unknown Bookmark'
  }

  const getStatusIcon = (result: ValidationResult) => {
    if (result.isValid) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    } else if (result.statusCode === 404) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else if (result.statusCode === 403 || result.statusCode === 401) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    } else {
      return <WifiOff className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (result: ValidationResult) => {
    if (result.isValid) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      )
    } else if (result.statusCode === 404) {
      return (
        <Badge variant="destructive" className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Not Found
        </Badge>
      )
    } else if (result.statusCode === 403) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200">
          <Shield className="h-3 w-3 mr-1" />
          Restricted
        </Badge>
      )
    } else if (result.statusCode === 500) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Server Error
        </Badge>
      )
    } else if (result.error?.includes('timeout')) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200">
          <Timer className="h-3 w-3 mr-1" />
          Timeout
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )
    }
  }

  const validResults = results.filter(r => r.isValid)
  const invalidResults = results.filter(r => !r.isValid)
  const notification = bookmarkValidationService.createValidationNotification(results)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 transition-all duration-200">
            <Shield className="h-4 w-4 mr-2" />
            Check Links
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Link Health Monitor
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Comprehensive validation of your bookmark collection for broken links and accessibility issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Enhanced Start Validation Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Link Health Check</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Ready to validate {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleValidateAll}
                disabled={isValidating || bookmarks.length === 0}
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>

            {/* Enhanced Progress Section */}
            {isValidating && (
              <div className="space-y-4 bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-700">Scanning Progress</span>
                  <span className="text-blue-600">Batch {currentBatch} • {Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                {currentUrl && (
                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded p-2">
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    <span className="truncate">Checking: {currentUrl}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Results Summary */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Validation Results
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">{validResults.length}</div>
                    <div className="text-sm text-green-700 font-medium flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Accessible
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-1">{invalidResults.length}</div>
                    <div className="text-sm text-red-700 font-medium flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Issues Found
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{results.length}</div>
                    <div className="text-sm text-blue-700 font-medium flex items-center justify-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Total Checked
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {notification.summary?.avgResponseTime || 0}ms
                    </div>
                    <div className="text-sm text-purple-700 font-medium flex items-center justify-center">
                      <Timer className="h-4 w-4 mr-1" />
                      Avg Response
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Detailed Results */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Detailed Analysis
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...invalidResults, ...validResults].map((result) => (
                    <div key={result.id} className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                      result.isValid 
                        ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                        : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getStatusIcon(result)}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{getBookmarkTitle(result.id)}</p>
                            <p className="text-sm text-gray-600 truncate flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {result.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {result.responseTime && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                              {bookmarkValidationService.formatResponseTime(result.responseTime)}
                            </span>
                          )}
                          {getStatusBadge(result)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            className="hover:bg-white/50"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Enhanced suggestions for invalid bookmarks */}
                      {!result.isValid && (
                        <div className="bg-white/70 border border-yellow-200 rounded-lg p-3 mt-3">
                          <p className="text-xs font-semibold text-yellow-800 mb-2 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Recommendations:
                          </p>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {bookmarkValidationService.getValidationSuggestions(result).map((suggestion, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-yellow-500 mr-2">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Checked: {new Date(result.lastChecked).toLocaleString()}
                        </div>
                        {result.statusCode && (
                          <div className="flex items-center">
                            <Activity className="h-3 w-3 mr-1" />
                            Status: {result.statusCode}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Empty State */}
          {bookmarks.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookmarks to Validate</h3>
              <p className="text-gray-600 mb-4">Add some bookmarks first to check their validity and health status.</p>
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                <Globe className="h-4 w-4 mr-2" />
                Add Your First Bookmark
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 