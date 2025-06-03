// Content Extraction Service for Enhanced Bookmark Search
// Provides content-based keywords and metadata extraction from URLs

export interface ContentMetadata {
  title?: string;
  description?: string;
  keywords: string[];
  contentType: string;
  domain: string;
  extractedText?: string;
  readingTime?: number;
  language?: string;
}

export interface ContentExtractionResult {
  success: boolean;
  metadata?: ContentMetadata;
  error?: string;
  cached?: boolean;
}

export class ContentExtractionService {
  private cache = new Map<string, ContentMetadata>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Extract content metadata from a URL
   */
  async extractContent(url: string): Promise<ContentExtractionResult> {
    try {
      // Check cache first
      const cached = this.getCachedContent(url);
      if (cached) {
        return { success: true, metadata: cached, cached: true };
      }

      // Try different extraction methods
      const metadata = await this.tryExtractionMethods(url);
      
      if (metadata) {
        this.cacheContent(url, metadata);
        return { success: true, metadata };
      }

      return { success: false, error: 'Unable to extract content' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Try multiple extraction methods in priority order
   */
  private async tryExtractionMethods(url: string): Promise<ContentMetadata | null> {
    // Method 1: Try browser fetch (for CORS-enabled sites)
    try {
      const browserResult = await this.extractViaBrowserFetch(url);
      if (browserResult) return browserResult;
    } catch (error) {
      console.debug('Browser fetch failed:', error);
    }

    // Method 2: Parse domain and create basic metadata
    return this.createBasicMetadata(url);
  }

  /**
   * Extract content via browser fetch (limited by CORS)
   */
  private async extractViaBrowserFetch(url: string): Promise<ContentMetadata | null> {
    try {
      // For security reasons, we can only fetch from CORS-enabled endpoints
      // Most websites block this, but some APIs and documentation sites allow it
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      return this.parseHtmlContent(html, url);
    } catch (error) {
      // CORS blocked or network error - this is expected for most sites
      throw error;
    }
  }

  /**
   * Parse HTML content to extract metadata
   */
  private parseHtmlContent(html: string, url: string): ContentMetadata {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title
    const title = doc.querySelector('title')?.textContent?.trim() ||
                  doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                  doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || 
                  '';

    // Extract description
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
                       '';

    // Extract keywords
    const keywordsContent = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const keywords = this.extractKeywordsFromContent(title + ' ' + description + ' ' + keywordsContent);

    // Extract main content text (simplified)
    const mainContent = this.extractMainContent(doc);
    const readingTime = this.calculateReadingTime(mainContent);

    return {
      title: title || undefined,
      description: description || undefined,
      keywords,
      contentType: this.detectContentType(url, doc),
      domain: this.extractDomain(url),
      extractedText: mainContent.substring(0, 500), // Limit to 500 chars
      readingTime,
      language: doc.documentElement.lang || 'en'
    };
  }

  /**
   * Create basic metadata from URL analysis
   */
  private createBasicMetadata(url: string): ContentMetadata {
    const domain = this.extractDomain(url);
    const pathSegments = new URL(url).pathname.split('/').filter(Boolean);
    
    // Generate keywords from URL structure
    const urlKeywords = [
      domain.split('.').filter(part => part !== 'www' && part.length > 2),
      pathSegments.map(segment => segment.replace(/[_-]/g, ' ').split(/[^a-zA-Z0-9]+/))
    ].flat(2).filter(word => word.length > 2);

    // Detect content type from URL
    const contentType = this.detectContentTypeFromUrl(url);

    return {
      keywords: this.cleanKeywords(urlKeywords),
      contentType,
      domain,
      language: 'en'
    };
  }

  /**
   * Extract main content from HTML document
   */
  private extractMainContent(doc: Document): string {
    // Try to find main content areas
    const contentSelectors = [
      'main',
      'article', 
      '.content',
      '.post-content',
      '.entry-content',
      '#content',
      '.markdown-body', // GitHub-style
      '.documentation', // Documentation sites
      'body'
    ];

    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        // Remove script and style elements
        const scripts = element.querySelectorAll('script, style, nav, header, footer, aside');
        scripts.forEach(el => el.remove());
        
        const text = element.textContent || '';
        if (text.length > 100) {
          return text.replace(/\s+/g, ' ').trim();
        }
      }
    }

    return '';
  }

  /**
   * Extract keywords from text content
   */
  private extractKeywordsFromContent(content: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'
    ]);

    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));

    // Count word frequency and return top keywords
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Clean and deduplicate keywords
   */
  private cleanKeywords(keywords: string[]): string[] {
    const cleaned = new Set<string>();
    
    keywords.forEach(keyword => {
      const clean = keyword.toLowerCase().trim();
      if (clean.length > 2 && /^[a-z0-9]+$/i.test(clean)) {
        cleaned.add(clean);
      }
    });

    return Array.from(cleaned).slice(0, 15); // Limit to 15 keywords
  }

  /**
   * Detect content type from URL and HTML
   */
  private detectContentType(url: string, doc?: Document): string {
    // Check URL patterns
    const urlType = this.detectContentTypeFromUrl(url);
    if (urlType !== 'webpage') return urlType;

    // Check HTML meta tags
    if (doc) {
      const type = doc.querySelector('meta[property="og:type"]')?.getAttribute('content');
      if (type) return type;

      // Check for specific content indicators
      if (doc.querySelector('code, pre, .highlight')) return 'documentation';
      if (doc.querySelector('.video, video')) return 'video';
      if (doc.querySelector('article')) return 'article';
    }

    return 'webpage';
  }

  /**
   * Detect content type from URL patterns
   */
  private detectContentTypeFromUrl(url: string): string {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('github.com')) return 'repository';
    if (urlLower.includes('docs.') || urlLower.includes('/docs/')) return 'documentation';
    if (urlLower.includes('api.') || urlLower.includes('/api/')) return 'api';
    if (urlLower.includes('blog')) return 'blog';
    if (urlLower.includes('tutorial')) return 'tutorial';
    if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com')) return 'video';
    if (urlLower.includes('medium.com') || urlLower.includes('dev.to')) return 'article';
    if (urlLower.includes('stackoverflow.com')) return 'qa';
    if (urlLower.includes('news') || urlLower.includes('hn.')) return 'news';
    
    return 'webpage';
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  /**
   * Calculate estimated reading time
   */
  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Get cached content if available and not expired
   */
  private getCachedContent(url: string): ContentMetadata | null {
    const expiry = this.cacheExpiry.get(url);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(url);
      this.cacheExpiry.delete(url);
      return null;
    }
    return this.cache.get(url) || null;
  }

  /**
   * Cache content metadata
   */
  private cacheContent(url: string, metadata: ContentMetadata): void {
    this.cache.set(url, metadata);
    this.cacheExpiry.set(url, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [url, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(url);
        this.cacheExpiry.delete(url);
      }
    }
  }

  /**
   * Get content extraction statistics
   */
  getStats(): { cacheSize: number; cacheHitRate: number } {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0 // Would need to track hits/misses to calculate
    };
  }

  /**
   * Bulk extract content for multiple URLs
   */
  async bulkExtract(urls: string[]): Promise<Map<string, ContentExtractionResult>> {
    const results = new Map<string, ContentExtractionResult>();
    
    // Process in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(async url => {
        const result = await this.extractContent(url);
        return [url, result] as const;
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const [url, extractionResult] = result.value;
          results.set(url, extractionResult);
        }
      });
      
      // Small delay between batches
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const contentExtractionService = new ContentExtractionService(); 