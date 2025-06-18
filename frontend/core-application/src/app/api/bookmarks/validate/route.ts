import { NextRequest, NextResponse } from 'next/server'

interface ValidationResult {
  isValid: boolean
  statusCode?: number
  error?: string
  responseTime: number
  redirectUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({
        isValid: false,
        error: 'Invalid URL format',
        responseTime: 0
      })
    }

    const startTime = Date.now()
    
    try {
      // Use fetch with proper headers and timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(validUrl.toString(), {
        method: 'HEAD', // Use HEAD first for efficiency
        signal: controller.signal,
        headers: {
          'User-Agent': 'BookmarkHub-LinkChecker/1.0',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow'
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      const result: ValidationResult = {
        isValid: response.ok,
        statusCode: response.status,
        responseTime,
        redirectUrl: response.url !== validUrl.toString() ? response.url : undefined
      }

      if (!response.ok) {
        result.error = `HTTP ${response.status} ${response.statusText}`
      }

      return NextResponse.json(result)

    } catch (error) {
      // If HEAD fails, try GET request
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // Shorter timeout for GET

        const response = await fetch(validUrl.toString(), {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'BookmarkHub-LinkChecker/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          redirect: 'follow'
        })

        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime

        const result: ValidationResult = {
          isValid: response.ok,
          statusCode: response.status,
          responseTime,
          redirectUrl: response.url !== validUrl.toString() ? response.url : undefined
        }

        if (!response.ok) {
          result.error = `HTTP ${response.status} ${response.statusText}`
        }

        return NextResponse.json(result)

      } catch (secondError) {
        const responseTime = Date.now() - startTime
        
        let errorMessage = 'Unknown error'
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timeout'
          } else if (error.message.includes('fetch')) {
            errorMessage = 'Network error'
          } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
            errorMessage = 'SSL certificate error'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          isValid: false,
          error: errorMessage,
          responseTime
        })
      }
    }

  } catch (error) {
    console.error('Validation API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        isValid: false,
        responseTime: 0
      },
      { status: 500 }
    )
  }
} 