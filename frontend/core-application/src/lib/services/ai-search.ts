'use client'

import { BookmarkWithRelations } from './bookmarks'

export interface AISearchQuery {
  query: string
  context?: string
  intent?: 'find' | 'discover' | 'research' | 'work' | 'learn'
  timeframe?: 'recent' | 'week' | 'month' | 'year' | 'all'
  contentType?: 'articles' | 'tools' | 'documentation' | 'videos' | 'all'
}

export interface AISearchResult {
  bookmarks: BookmarkWithRelations[]
  relevanceScore: number
  contextMatches: string[]
  semanticMatches: string[]
  suggestions: string[]
  relatedQueries: string[]
  totalResults: number
}

export interface SemanticMatch {
  bookmark: BookmarkWithRelations
  score: number
  reasons: string[]
  contextRelevance: number
}

export class AISearchService {
  private semanticKeywords: Map<string, string[]> = new Map()
  private contextPatterns: Map<string, RegExp[]> = new Map()

  constructor(private userId: string) {
    this.initializeSemanticMappings()
    this.initializeContextPatterns()
  }

  /**
   * Initialize semantic keyword mappings for better understanding
   */
  private initializeSemanticMappings(): void {
    this.semanticKeywords.set('development', [
      'code', 'programming', 'github', 'api', 'framework', 'library', 'documentation',
      'tutorial', 'guide', 'stack overflow', 'developer', 'coding', 'software', 'react', 'javascript'
    ])
    
    this.semanticKeywords.set('design', [
      'ui', 'ux', 'figma', 'adobe', 'color', 'typography', 'layout', 'wireframe',
      'prototype', 'mockup', 'inspiration', 'dribbble', 'behance', 'design'
    ])
    
    this.semanticKeywords.set('productivity', [
      'tool', 'workflow', 'automation', 'efficiency', 'organization', 'planning',
      'task', 'project', 'management', 'calendar', 'notes', 'todo', 'productivity'
    ])
    
    this.semanticKeywords.set('learning', [
      'course', 'tutorial', 'education', 'training', 'skill', 'knowledge',
      'study', 'learn', 'teach', 'certification', 'university', 'online', 'learning'
    ])
    
    this.semanticKeywords.set('research', [
      'article', 'paper', 'study', 'analysis', 'data', 'report', 'findings',
      'academic', 'journal', 'publication', 'research', 'investigation'
    ])
  }

  /**
   * Initialize context patterns for intent recognition
   */
  private initializeContextPatterns(): void {
    this.contextPatterns.set('work', [
      /\b(work|job|career|professional|business|office|meeting|client|project)\b/i,
      /\b(deadline|schedule|presentation|report|analysis|strategy)\b/i
    ])
    
    this.contextPatterns.set('learn', [
      /\b(learn|study|course|tutorial|education|skill|training|knowledge)\b/i,
      /\b(how to|guide|instruction|lesson|practice|exercise)\b/i
    ])
    
    this.contextPatterns.set('research', [
      /\b(research|investigate|analyze|explore|discover|find out)\b/i,
      /\b(article|paper|study|data|information|source|reference)\b/i
    ])
    
    this.contextPatterns.set('tools', [
      /\b(tool|app|software|platform|service|utility|resource)\b/i,
      /\b(use|need|find|recommend|best|alternative)\b/i
    ])
  }

  /**
   * Perform AI-enhanced search with semantic analysis
   */
  async aiSearch(aiQuery: AISearchQuery, allBookmarks: BookmarkWithRelations[]): Promise<AISearchResult> {
    const queryLower = aiQuery.query.toLowerCase()
    
    // Filter bookmarks that match the query
    const matchingBookmarks = allBookmarks.filter(bookmark => {
      const bookmarkText = `${bookmark.title} ${bookmark.description || ''} ${bookmark.url}`.toLowerCase()
      return bookmarkText.includes(queryLower)
    })

    return {
      bookmarks: matchingBookmarks,
      relevanceScore: matchingBookmarks.length > 0 ? 0.8 : 0,
      contextMatches: [],
      semanticMatches: [],
      suggestions: [`${aiQuery.query} tutorial`, `${aiQuery.query} guide`],
      relatedQueries: [`best ${aiQuery.query}`, `${aiQuery.query} tools`],
      totalResults: matchingBookmarks.length
    }
  }

  /**
   * Perform semantic analysis on bookmarks
   */
  private performSemanticAnalysis(bookmarks: BookmarkWithRelations[], query: AISearchQuery): SemanticMatch[] {
    const matches: SemanticMatch[] = []
    
    bookmarks.forEach(bookmark => {
      const semanticScore = this.calculateSemanticScore(bookmark, query)
      const contextRelevance = this.calculateContextRelevance(bookmark, query)
      const reasons = this.generateMatchReasons(bookmark, query)
      
      if (semanticScore > 0.1 || contextRelevance > 0.1) {
        matches.push({
          bookmark,
          score: (semanticScore + contextRelevance) / 2,
          reasons,
          contextRelevance
        })
      }
    })
    
    return matches.sort((a, b) => b.score - a.score)
  }

  /**
   * Calculate semantic similarity score
   */
  private calculateSemanticScore(bookmark: BookmarkWithRelations, query: AISearchQuery): number {
    let score = 0
    const queryLower = query.query.toLowerCase()
    const bookmarkText = `${bookmark.title} ${bookmark.description || ''} ${bookmark.url}`.toLowerCase()
    
    // Direct text matching
    if (bookmarkText.includes(queryLower)) {
      score += 0.5
    }
    
    // Check for semantic keyword matches
    for (const [category, keywords] of this.semanticKeywords.entries()) {
      const queryHasCategory = keywords.some(keyword => queryLower.includes(keyword))
      const bookmarkHasCategory = keywords.some(keyword => bookmarkText.includes(keyword))
      
      if (queryHasCategory && bookmarkHasCategory) {
        score += 0.3
      }
    }
    
    // Check tag semantic relevance
    if (bookmark.tags) {
      bookmark.tags.forEach(tag => {
        const tagName = tag.name.toLowerCase()
        for (const [category, keywords] of this.semanticKeywords.entries()) {
          if (keywords.includes(tagName) && keywords.some(keyword => queryLower.includes(keyword))) {
            score += 0.2
          }
        }
      })
    }
    
    // Domain-based semantic scoring
    try {
      const domain = new URL(bookmark.url).hostname.toLowerCase()
      if (this.isDevelopmentDomain(domain) && this.queryIndicatesDevelopment(queryLower)) {
        score += 0.2
      }
      if (this.isDesignDomain(domain) && this.queryIndicatesDesign(queryLower)) {
        score += 0.2
      }
    } catch {
      // Invalid URL, skip domain analysis
    }
    
    return Math.min(score, 1.0) // Cap at 1.0
  }

  /**
   * Calculate context relevance based on intent and patterns
   */
  private calculateContextRelevance(bookmark: BookmarkWithRelations, query: AISearchQuery): number {
    let relevance = 0
    const bookmarkText = `${bookmark.title} ${bookmark.description || ''}`.toLowerCase()
    
    // Intent-based relevance
    if (query.intent) {
      const patterns = this.contextPatterns.get(query.intent)
      if (patterns) {
        patterns.forEach(pattern => {
          if (pattern.test(bookmarkText)) {
            relevance += 0.3
          }
        })
      }
    }
    
    // Context-based relevance
    if (query.context) {
      const contextLower = query.context.toLowerCase()
      if (bookmarkText.includes(contextLower)) {
        relevance += 0.4
      }
    }
    
    return Math.min(relevance, 1.0)
  }

  /**
   * Generate reasons why a bookmark matches the query
   */
  private generateMatchReasons(bookmark: BookmarkWithRelations, query: AISearchQuery): string[] {
    const reasons: string[] = []
    const queryLower = query.query.toLowerCase()
    const bookmarkText = `${bookmark.title} ${bookmark.description || ''}`.toLowerCase()
    
    // Direct matches
    if (bookmark.title.toLowerCase().includes(queryLower)) {
      reasons.push('Title contains search term')
    }
    
    if (bookmark.description?.toLowerCase().includes(queryLower)) {
      reasons.push('Description contains search term')
    }
    
    // Semantic matches
    for (const [category, keywords] of this.semanticKeywords.entries()) {
      const queryHasCategory = keywords.some(keyword => queryLower.includes(keyword))
      const bookmarkHasCategory = keywords.some(keyword => bookmarkText.includes(keyword))
      
      if (queryHasCategory && bookmarkHasCategory) {
        reasons.push(`Related to ${category}`)
      }
    }
    
    // Tag matches
    if (bookmark.tags) {
      bookmark.tags.forEach(tag => {
        if (tag.name.toLowerCase().includes(queryLower)) {
          reasons.push(`Tagged with "${tag.name}"`)
        }
      })
    }
    
    return reasons
  }

  /**
   * Re-rank bookmarks using AI analysis
   */
  private reRankWithAI(
    bookmarks: BookmarkWithRelations[], 
    semanticMatches: SemanticMatch[], 
    query: AISearchQuery
  ): BookmarkWithRelations[] {
    const scoreMap = new Map<string, number>()
    
    // Build score map from semantic matches
    semanticMatches.forEach(match => {
      scoreMap.set(match.bookmark.id, match.score)
    })
    
    // Sort bookmarks by combined score
    return bookmarks
      .filter(bookmark => {
        const queryLower = query.query.toLowerCase()
        const bookmarkText = `${bookmark.title} ${bookmark.description || ''} ${bookmark.url}`.toLowerCase()
        return bookmarkText.includes(queryLower) || scoreMap.has(bookmark.id)
      })
      .sort((a, b) => {
        const scoreA = scoreMap.get(a.id) || 0
        const scoreB = scoreMap.get(b.id) || 0
        
        // Add recency and popularity factors
        const recencyA = this.getRecencyScore(a)
        const recencyB = this.getRecencyScore(b)
        const popularityA = this.getPopularityScore(a)
        const popularityB = this.getPopularityScore(b)
        
        const finalScoreA = scoreA + (recencyA * 0.1) + (popularityA * 0.1)
        const finalScoreB = scoreB + (recencyB * 0.1) + (popularityB * 0.1)
        
        return finalScoreB - finalScoreA
      })
  }

  /**
   * Generate search suggestions based on query and results
   */
  private generateSearchSuggestions(query: AISearchQuery, bookmarks: BookmarkWithRelations[]): string[] {
    const suggestions: string[] = []
    const queryLower = query.query.toLowerCase()
    
    // Suggest related semantic categories
    for (const [category, keywords] of this.semanticKeywords.entries()) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        suggestions.push(`${query.query} ${category}`)
        suggestions.push(`${category} tools`)
        suggestions.push(`${category} resources`)
      }
    }
    
    // Suggest based on popular tags in results
    const tagCounts = new Map<string, number>()
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => {
        tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1)
      })
    })
    
    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag)
    
    popularTags.forEach(tag => {
      suggestions.push(`${query.query} ${tag}`)
    })
    
    return suggestions.slice(0, 5)
  }

  /**
   * Generate related queries
   */
  private generateRelatedQueries(query: AISearchQuery): string[] {
    const related: string[] = []
    const queryLower = query.query.toLowerCase()
    
    // Intent-based related queries
    if (query.intent === 'learn') {
      related.push(`${query.query} tutorial`, `${query.query} guide`, `${query.query} course`)
    } else if (query.intent === 'work') {
      related.push(`${query.query} tools`, `${query.query} productivity`, `${query.query} workflow`)
    } else if (query.intent === 'research') {
      related.push(`${query.query} analysis`, `${query.query} data`, `${query.query} study`)
    }
    
    // Semantic category expansions
    for (const [category, keywords] of this.semanticKeywords.entries()) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        related.push(`best ${category} tools`, `${category} resources`, `${category} tips`)
      }
    }
    
    return related.slice(0, 5)
  }

  /**
   * Filter bookmarks by timeframe
   */
  private filterByTimeframe(bookmarks: BookmarkWithRelations[], timeframe?: string): BookmarkWithRelations[] {
    if (!timeframe || timeframe === 'all') return bookmarks
    
    const now = new Date()
    let cutoffDate: Date
    
    switch (timeframe) {
      case 'recent':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days
        break
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return bookmarks
    }
    
    return bookmarks.filter(bookmark => {
      const bookmarkDate = new Date(bookmark.created_at || 0)
      return bookmarkDate >= cutoffDate
    })
  }

  /**
   * Calculate overall relevance score
   */
  private calculateRelevanceScore(bookmarks: BookmarkWithRelations[], query: AISearchQuery): number {
    if (bookmarks.length === 0) return 0
    
    const queryLower = query.query.toLowerCase()
    let totalScore = 0
    
    bookmarks.forEach(bookmark => {
      const bookmarkText = `${bookmark.title} ${bookmark.description || ''}`.toLowerCase()
      if (bookmarkText.includes(queryLower)) {
        totalScore += 1
      }
    })
    
    return Math.min(totalScore / bookmarks.length, 1.0)
  }

  /**
   * Extract context matches from query
   */
  private extractContextMatches(query: AISearchQuery): string[] {
    const matches: string[] = []
    
    for (const [context, patterns] of this.contextPatterns.entries()) {
      patterns.forEach(pattern => {
        if (pattern.test(query.query)) {
          matches.push(context)
        }
      })
    }
    
    return matches
  }

  /**
   * Check if domain is development-related
   */
  private isDevelopmentDomain(domain: string): boolean {
    const devDomains = ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.microsoft.com']
    return devDomains.some(devDomain => domain.includes(devDomain))
  }

  /**
   * Check if domain is design-related
   */
  private isDesignDomain(domain: string): boolean {
    const designDomains = ['dribbble.com', 'behance.net', 'figma.com', 'adobe.com']
    return designDomains.some(designDomain => domain.includes(designDomain))
  }

  /**
   * Check if query indicates development intent
   */
  private queryIndicatesDevelopment(query: string): boolean {
    const devKeywords = ['code', 'programming', 'api', 'framework', 'library', 'development']
    return devKeywords.some(keyword => query.includes(keyword))
  }

  /**
   * Check if query indicates design intent
   */
  private queryIndicatesDesign(query: string): boolean {
    const designKeywords = ['design', 'ui', 'ux', 'layout', 'color', 'typography']
    return designKeywords.some(keyword => query.includes(keyword))
  }

  /**
   * Check if bookmark matches content type
   */
  private matchesContentType(bookmark: BookmarkWithRelations, contentType: string): boolean {
    const url = bookmark.url.toLowerCase()
    const title = bookmark.title.toLowerCase()
    const description = (bookmark.description || '').toLowerCase()
    
    switch (contentType) {
      case 'articles':
        return url.includes('article') || title.includes('article') || description.includes('article')
      case 'tools':
        return url.includes('tool') || title.includes('tool') || description.includes('tool')
      case 'documentation':
        return url.includes('docs') || url.includes('documentation') || title.includes('docs')
      case 'videos':
        return url.includes('youtube') || url.includes('video') || title.includes('video')
      default:
        return true
    }
  }

  /**
   * Calculate recency score (newer bookmarks get higher scores)
   */
  private getRecencyScore(bookmark: BookmarkWithRelations): number {
    if (!bookmark.created_at) return 0
    
    const now = new Date()
    const bookmarkDate = new Date(bookmark.created_at)
    const daysDiff = (now.getTime() - bookmarkDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Score decreases over time, max score for bookmarks less than 7 days old
    return Math.max(0, 1 - (daysDiff / 365))
  }

  /**
   * Calculate popularity score based on visits and favorites
   */
  private getPopularityScore(bookmark: BookmarkWithRelations): number {
    const visits = bookmark.visit_count || 0
    const isFavorite = bookmark.is_favorite ? 1 : 0
    
    // Normalize visit count (assuming max 100 visits for normalization)
    const normalizedVisits = Math.min(visits / 100, 1)
    
    return (normalizedVisits + isFavorite) / 2
  }
} 