import { NextRequest, NextResponse } from 'next/server'

interface MetadataResult {
  title?: string
  description?: string
  favicon?: string
  error?: string
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
        error: 'Invalid URL format'
      })
    }

    try {
      // Fetch the webpage with proper headers
      const response = await fetch(validUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookmarkHub/1.0; +https://bookmarkhub.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        return NextResponse.json({
          error: `HTTP ${response.status}: ${response.statusText}`,
          title: extractDomainFromUrl(url),
          favicon: `https://www.google.com/s2/favicons?domain=${extractDomainFromUrl(url)}&sz=32`
        })
      }

      const html = await response.text()
      const metadata = extractMetadataFromHtml(html, validUrl)

      return NextResponse.json({
        title: metadata.title || extractDomainFromUrl(url),
        description: metadata.description || `Content from ${extractDomainFromUrl(url)}`,
        favicon: metadata.favicon || `https://www.google.com/s2/favicons?domain=${extractDomainFromUrl(url)}&sz=32`
      })

    } catch (error) {
      console.error('Error fetching metadata:', error)
      
      // Return fallback metadata
      const domain = extractDomainFromUrl(url)
      return NextResponse.json({
        title: domain,
        description: `Content from ${domain}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        error: 'Failed to fetch metadata, using fallback'
      })
    }

  } catch (error) {
    console.error('Metadata API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function extractMetadataFromHtml(html: string, baseUrl: URL): MetadataResult {
  const metadata: MetadataResult = {}

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (titleMatch) {
    metadata.title = titleMatch[1].trim()
  }

  // Extract Open Graph title (preferred)
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
  if (ogTitleMatch) {
    metadata.title = ogTitleMatch[1].trim()
  }

  // Extract description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  if (descMatch) {
    metadata.description = descMatch[1].trim()
  }

  // Extract Open Graph description (preferred)
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)
  if (ogDescMatch) {
    metadata.description = ogDescMatch[1].trim()
  }

  // Extract favicon
  const faviconPatterns = [
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
    /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i
  ]

  for (const pattern of faviconPatterns) {
    const match = html.match(pattern)
    if (match) {
      let faviconUrl = match[1]
      
      // Handle relative URLs
      if (faviconUrl.startsWith('/')) {
        faviconUrl = `${baseUrl.protocol}//${baseUrl.host}${faviconUrl}`
      } else if (!faviconUrl.startsWith('http')) {
        faviconUrl = `${baseUrl.protocol}//${baseUrl.host}/${faviconUrl}`
      }
      
      metadata.favicon = faviconUrl
      break
    }
  }

  // Fallback to Google's favicon service if no favicon found
  if (!metadata.favicon) {
    metadata.favicon = `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=32`
  }

  return metadata
} 