interface ValidationResult {
  id: string
  url: string
  isValid: boolean
  statusCode?: number
  error?: string
  lastChecked: string
  responseTime?: number
}

interface ValidationOptions {
  timeout?: number
  retryCount?: number
  batchSize?: number
}

class BookmarkValidationService {
  private readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
  private readonly DEFAULT_RETRY_COUNT = 2
  private readonly DEFAULT_BATCH_SIZE = 5 // Reduced for better performance

  async validateBookmark(url: string, options: ValidationOptions = {}): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Use our API endpoint for validation to avoid CORS issues
      const response = await fetch('/api/bookmarks/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const responseTime = Date.now() - startTime
      const result = await response.json()

      if (!response.ok) {
        return {
          id: '',
          url,
          isValid: false,
          error: result.error || 'Validation failed',
          lastChecked: new Date().toISOString(),
          responseTime
        }
      }

      return {
        id: '',
        url,
        isValid: result.isValid,
        statusCode: result.statusCode,
        error: result.error,
        lastChecked: new Date().toISOString(),
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        id: '',
        url,
        isValid: false,
        error: error instanceof Error ? error.message : 'Network error',
        lastChecked: new Date().toISOString(),
        responseTime
      }
    }
  }

  async validateBookmarks(
    bookmarks: Array<{ id: string; url: string }>,
    options: ValidationOptions = {}
  ): Promise<ValidationResult[]> {
    const { batchSize = this.DEFAULT_BATCH_SIZE } = options
    const results: ValidationResult[] = []

    // Process in smaller batches to avoid overwhelming the server
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (bookmark) => {
        try {
          const result = await this.validateBookmark(bookmark.url, options)
          return { ...result, id: bookmark.id }
        } catch (error) {
          return {
            id: bookmark.id,
            url: bookmark.url,
            isValid: false,
            error: error instanceof Error ? error.message : 'Validation failed',
            lastChecked: new Date().toISOString()
          }
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error('Validation failed:', result.reason)
        }
      })

      // Add a delay between batches to be respectful to servers
      if (i + batchSize < bookmarks.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return results
  }

  // Schedule validation for bookmarks
  async scheduleValidation(
    bookmarks: Array<{ id: string; url: string; last_validated?: string }>,
    intervalDays: number = 7
  ): Promise<Array<{ id: string; needsValidation: boolean }>> {
    const now = new Date()
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000

    return bookmarks.map(bookmark => {
      const lastValidated = bookmark.last_validated 
        ? new Date(bookmark.last_validated)
        : new Date(0) // Very old date if never validated

      const needsValidation = (now.getTime() - lastValidated.getTime()) > intervalMs

      return {
        id: bookmark.id,
        needsValidation
      }
    })
  }

  // Create user-friendly notification messages
  createValidationNotification(results: ValidationResult[]): {
    invalidCount: number
    message: string
    details: ValidationResult[]
    summary: {
      total: number
      valid: number
      invalid: number
      avgResponseTime: number
    }
  } {
    const invalidBookmarks = results.filter(result => !result.isValid)
    const validBookmarks = results.filter(result => result.isValid)
    const invalidCount = invalidBookmarks.length
    const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length

    let message = ''
    if (invalidCount === 0) {
      message = '✅ All bookmarks are accessible and working perfectly!'
    } else if (invalidCount === 1) {
      message = '⚠️ 1 bookmark appears to be broken or inaccessible'
    } else {
      message = `⚠️ ${invalidCount} bookmarks appear to be broken or inaccessible`
    }

    return {
      invalidCount,
      message,
      details: invalidBookmarks,
      summary: {
        total: results.length,
        valid: validBookmarks.length,
        invalid: invalidCount,
        avgResponseTime: Math.round(avgResponseTime)
      }
    }
  }

  // Get validation suggestions for user
  getValidationSuggestions(result: ValidationResult): string[] {
    const suggestions: string[] = []

    if (!result.isValid) {
      if (result.statusCode === 404) {
        suggestions.push('The page was not found (404). The content may have been moved or deleted.')
        suggestions.push('Try searching for the content on the website or using an archive service.')
      } else if (result.statusCode === 403) {
        suggestions.push('Access is forbidden (403). The site may require authentication or have access restrictions.')
      } else if (result.statusCode === 500) {
        suggestions.push('The server is experiencing issues (500). Try again later.')
      } else if (result.statusCode === 503) {
        suggestions.push('The service is temporarily unavailable (503). The site may be under maintenance.')
      } else if (result.error?.includes('timeout')) {
        suggestions.push('The request timed out. The site may be slow or temporarily unavailable.')
      } else if (result.error?.includes('network') || result.error?.includes('fetch')) {
        suggestions.push('Network error. Check your internet connection or the URL format.')
      } else if (result.error?.includes('SSL') || result.error?.includes('certificate')) {
        suggestions.push('SSL certificate issue. The site may have security problems.')
      } else {
        suggestions.push('The bookmark appears to be inaccessible. Try opening it manually to verify.')
      }
      
      suggestions.push('Consider updating the URL or removing the bookmark if it\'s permanently broken.')
    }

    return suggestions
  }

  // Get status color for UI
  getStatusColor(result: ValidationResult): string {
    if (result.isValid) {
      return 'green'
    } else if (result.statusCode === 404) {
      return 'red'
    } else if (result.statusCode === 403 || result.statusCode === 401) {
      return 'yellow'
    } else if (result.statusCode && result.statusCode >= 500) {
      return 'orange'
    } else {
      return 'gray'
    }
  }

  // Format response time for display
  formatResponseTime(responseTime?: number): string {
    if (!responseTime) return 'N/A'
    
    if (responseTime < 1000) {
      return `${responseTime}ms`
    } else {
      return `${(responseTime / 1000).toFixed(1)}s`
    }
  }
}

export const bookmarkValidationService = new BookmarkValidationService()
export default bookmarkValidationService 