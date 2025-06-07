interface ValidationResult {
  id: string
  url: string
  isValid: boolean
  statusCode?: number
  error?: string
  lastChecked: string
}

interface ValidationOptions {
  timeout?: number
  retryCount?: number
  batchSize?: number
}

class BookmarkValidationService {
  private readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
  private readonly DEFAULT_RETRY_COUNT = 2
  private readonly DEFAULT_BATCH_SIZE = 10

  async validateBookmark(url: string, options: ValidationOptions = {}): Promise<ValidationResult> {
    const { timeout = this.DEFAULT_TIMEOUT } = options
    
    try {
      // Use a HEAD request first for efficiency
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // To avoid CORS issues
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)

      return {
        id: '',
        url,
        isValid: response.ok,
        statusCode: response.status,
        lastChecked: new Date().toISOString()
      }
    } catch {
      // If HEAD fails, try GET with a smaller timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout / 2)

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          mode: 'no-cors',
          cache: 'no-cache'
        })

        clearTimeout(timeoutId)

        return {
          id: '',
          url,
          isValid: response.ok,
          statusCode: response.status,
          lastChecked: new Date().toISOString()
        }
      } catch {
        return {
          id: '',
          url,
          isValid: false,
          error: 'Unexpected validation error',
          lastChecked: new Date().toISOString()
        };
      }
    }
  }

  async validateBookmarks(
    bookmarks: Array<{ id: string; url: string }>,
    options: ValidationOptions = {}
  ): Promise<ValidationResult[]> {
    const { batchSize = this.DEFAULT_BATCH_SIZE } = options
    const results: ValidationResult[] = []

    // Process in batches to avoid overwhelming the browser/network
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (bookmark) => {
        const result = await this.validateBookmark(bookmark.url, options)
        return { ...result, id: bookmark.id }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          // Handle rejected promises
          console.error('Validation failed:', result.reason)
        }
      })

      // Add a small delay between batches to be respectful
      if (i + batchSize < bookmarks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
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
  } {
    const invalidBookmarks = results.filter(result => !result.isValid)
    const invalidCount = invalidBookmarks.length

    let message = ''
    if (invalidCount === 0) {
      message = '✅ All bookmarks are accessible!'
    } else if (invalidCount === 1) {
      message = '⚠️ 1 bookmark appears to be broken or inaccessible'
    } else {
      message = `⚠️ ${invalidCount} bookmarks appear to be broken or inaccessible`
    }

    return {
      invalidCount,
      message,
      details: invalidBookmarks
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
        suggestions.push('Access is forbidden (403). The site may require authentication.')
      } else if (result.statusCode === 500) {
        suggestions.push('The server is experiencing issues (500). Try again later.')
      } else if (result.error?.includes('timeout')) {
        suggestions.push('The request timed out. The site may be slow or temporarily unavailable.')
      } else if (result.error?.includes('network')) {
        suggestions.push('Network error. Check your internet connection.')
      } else {
        suggestions.push('The bookmark appears to be inaccessible. Try opening it manually.')
      }
      
      suggestions.push('Consider updating the URL or removing the bookmark if it\'s permanently broken.')
    }

    return suggestions
  }
}

export const bookmarkValidationService = new BookmarkValidationService()
export default bookmarkValidationService 