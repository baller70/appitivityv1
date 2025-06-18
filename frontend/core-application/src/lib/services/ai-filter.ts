/**
 * AI-Powered Industry Filter Service
 * Uses AI to categorize and filter bookmarks by industry preferences
 */

export interface IndustryCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  confidence: number;
}

export interface BookmarkAnalysis {
  bookmarkId: string;
  industries: IndustryCategory[];
  primaryIndustry: string;
  confidence: number;
  reasoning: string;
}

export interface IndustryPreferences {
  userId: string;
  preferredIndustries: string[];
  excludedIndustries: string[];
  confidenceThreshold: number;
  autoFilter: boolean;
}

export class AIFilterService {
  private static readonly INDUSTRY_CATEGORIES: IndustryCategory[] = [
    {
      id: 'technology',
      name: 'Technology',
      description: 'Software development, programming, tech tools, and digital innovation',
      keywords: ['programming', 'software', 'development', 'coding', 'tech', 'digital', 'api', 'framework', 'library', 'github', 'stack overflow', 'developer'],
      confidence: 0.8
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX design, graphic design, creative tools, and visual arts',
      keywords: ['design', 'ui', 'ux', 'figma', 'adobe', 'creative', 'visual', 'graphics', 'typography', 'color', 'layout', 'prototype'],
      confidence: 0.8
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Business strategy, entrepreneurship, finance, and management',
      keywords: ['business', 'startup', 'entrepreneur', 'finance', 'marketing', 'strategy', 'management', 'leadership', 'sales', 'revenue', 'profit'],
      confidence: 0.7
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Learning resources, courses, tutorials, and educational content',
      keywords: ['education', 'learning', 'course', 'tutorial', 'training', 'certification', 'university', 'school', 'teach', 'study', 'knowledge'],
      confidence: 0.7
    },
    {
      id: 'productivity',
      name: 'Productivity',
      description: 'Tools and resources for improving efficiency and workflow',
      keywords: ['productivity', 'efficiency', 'workflow', 'automation', 'tools', 'organization', 'time management', 'task', 'project management'],
      confidence: 0.7
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical resources, health information, and wellness content',
      keywords: ['health', 'medical', 'healthcare', 'wellness', 'fitness', 'nutrition', 'medicine', 'doctor', 'patient', 'treatment'],
      confidence: 0.8
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial services, investment, banking, and economic content',
      keywords: ['finance', 'investment', 'banking', 'money', 'trading', 'stocks', 'crypto', 'economics', 'financial', 'portfolio'],
      confidence: 0.8
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Media, gaming, movies, music, and recreational content',
      keywords: ['entertainment', 'gaming', 'movies', 'music', 'streaming', 'media', 'fun', 'leisure', 'recreation', 'hobby'],
      confidence: 0.6
    },
    {
      id: 'news',
      name: 'News & Media',
      description: 'News sources, journalism, and current events',
      keywords: ['news', 'journalism', 'media', 'current events', 'politics', 'world', 'breaking', 'reporter', 'article', 'press'],
      confidence: 0.7
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Online shopping, retail, and commercial platforms',
      keywords: ['ecommerce', 'shopping', 'retail', 'store', 'marketplace', 'buy', 'sell', 'product', 'commerce', 'amazon', 'shopify'],
      confidence: 0.8
    }
  ];

  /**
   * Analyze a bookmark and determine its industry categories
   */
  static async analyzeBookmark(bookmark: {
    title: string;
    description?: string;
    url: string;
    tags?: { name: string }[];
  }): Promise<BookmarkAnalysis> {
    const content = [
      bookmark.title,
      bookmark.description || '',
      bookmark.url,
      ...(bookmark.tags?.map(tag => tag.name) || [])
    ].join(' ').toLowerCase();

    const industryMatches: Array<IndustryCategory & { score: number }> = [];

    // Analyze against each industry category
    for (const industry of this.INDUSTRY_CATEGORIES) {
      let score = 0;
      let matchedKeywords = 0;

      // Check keyword matches
      for (const keyword of industry.keywords) {
        if (content.includes(keyword.toLowerCase())) {
          score += 1;
          matchedKeywords++;
        }
      }

      // Calculate confidence based on matches and keyword density
      const keywordDensity = matchedKeywords / industry.keywords.length;
      const confidence = Math.min(keywordDensity * industry.confidence, 1.0);

      if (confidence > 0.1) { // Only include if there's some confidence
        industryMatches.push({
          ...industry,
          score,
          confidence
        });
      }
    }

    // Sort by confidence and take top matches
    industryMatches.sort((a, b) => b.confidence - a.confidence);
    const topMatches = industryMatches.slice(0, 3);

    const primaryIndustry = topMatches[0]?.name || 'General';
    const overallConfidence = topMatches[0]?.confidence || 0.1;

    // Generate reasoning
    const reasoning = this.generateReasoning(bookmark, topMatches);

    return {
      bookmarkId: bookmark.url, // Using URL as ID for now
      industries: topMatches,
      primaryIndustry,
      confidence: overallConfidence,
      reasoning
    };
  }

  /**
   * Filter bookmarks based on industry preferences
   */
  static async filterByIndustryPreferences(
    bookmarks: Array<{
      id: string;
      title: string;
      description?: string;
      url: string;
      tags?: { name: string }[];
    }>,
    preferences: IndustryPreferences
  ): Promise<Array<{ bookmark: any; analysis: BookmarkAnalysis }>> {
    const results = [];

    for (const bookmark of bookmarks) {
      const analysis = await this.analyzeBookmark(bookmark);

      // Check if bookmark matches preferences
      const matchesPreferences = this.matchesIndustryPreferences(analysis, preferences);

      if (matchesPreferences) {
        results.push({
          bookmark,
          analysis
        });
      }
    }

    // Sort by confidence
    results.sort((a, b) => b.analysis.confidence - a.analysis.confidence);

    return results;
  }

  /**
   * Get industry recommendations based on user's bookmark history
   */
  static async getIndustryRecommendations(
    bookmarks: Array<{
      title: string;
      description?: string;
      url: string;
      tags?: { name: string }[];
    }>
  ): Promise<{ industry: string; count: number; confidence: number }[]> {
    const industryStats: Record<string, { count: number; totalConfidence: number }> = {};

    // Analyze all bookmarks
    for (const bookmark of bookmarks) {
      const analysis = await this.analyzeBookmark(bookmark);
      
      for (const industry of analysis.industries) {
        if (!industryStats[industry.name]) {
          industryStats[industry.name] = { count: 0, totalConfidence: 0 };
        }
        industryStats[industry.name].count++;
        industryStats[industry.name].totalConfidence += industry.confidence;
      }
    }

    // Convert to recommendations
    const recommendations = Object.entries(industryStats)
      .map(([industry, stats]) => ({
        industry,
        count: stats.count,
        confidence: stats.totalConfidence / stats.count
      }))
      .sort((a, b) => b.count - a.count);

    return recommendations;
  }

  /**
   * Create smart folders based on industry analysis
   */
  static async createIndustryFolders(
    bookmarks: Array<{
      id: string;
      title: string;
      description?: string;
      url: string;
      tags?: { name: string }[];
    }>
  ): Promise<Array<{
    folderName: string;
    description: string;
    bookmarkIds: string[];
    confidence: number;
  }>> {
    const industryGroups: Record<string, {
      bookmarks: string[];
      totalConfidence: number;
      count: number;
    }> = {};

    // Group bookmarks by primary industry
    for (const bookmark of bookmarks) {
      const analysis = await this.analyzeBookmark(bookmark);
      const primaryIndustry = analysis.primaryIndustry;

      if (!industryGroups[primaryIndustry]) {
        industryGroups[primaryIndustry] = {
          bookmarks: [],
          totalConfidence: 0,
          count: 0
        };
      }

      industryGroups[primaryIndustry].bookmarks.push(bookmark.id);
      industryGroups[primaryIndustry].totalConfidence += analysis.confidence;
      industryGroups[primaryIndustry].count++;
    }

    // Create folder suggestions
    const folders = Object.entries(industryGroups)
      .filter(([_, group]) => group.count >= 2) // Only suggest folders with 2+ bookmarks
      .map(([industry, group]) => {
        const industryInfo = this.INDUSTRY_CATEGORIES.find(cat => cat.name === industry);
        return {
          folderName: industry.toUpperCase(),
          description: industryInfo?.description || `${industry} related bookmarks`,
          bookmarkIds: group.bookmarks,
          confidence: group.totalConfidence / group.count
        };
      })
      .sort((a, b) => b.confidence - a.confidence);

    return folders;
  }

  /**
   * Generate human-readable reasoning for industry classification
   */
  private static generateReasoning(
    bookmark: { title: string; description?: string; url: string },
    matches: Array<IndustryCategory & { score: number }>
  ): string {
    if (matches.length === 0) {
      return 'No clear industry match found based on content analysis.';
    }

    const topMatch = matches[0];
    const domain = new URL(bookmark.url).hostname.replace('www.', '');

    let reasoning = `Classified as ${topMatch.name} based on `;
    
    const reasons = [];
    
    if (topMatch.score > 0) {
      reasons.push(`${topMatch.score} keyword matches`);
    }
    
    if (domain.includes('github') || domain.includes('stackoverflow')) {
      reasons.push('developer-focused domain');
    }
    
    if (bookmark.title.toLowerCase().includes('tutorial') || bookmark.title.toLowerCase().includes('guide')) {
      reasons.push('educational content indicators');
    }

    reasoning += reasons.join(', ');
    reasoning += `. Confidence: ${Math.round(topMatch.confidence * 100)}%`;

    return reasoning;
  }

  /**
   * Check if bookmark analysis matches user preferences
   */
  private static matchesIndustryPreferences(
    analysis: BookmarkAnalysis,
    preferences: IndustryPreferences
  ): boolean {
    // Check confidence threshold
    if (analysis.confidence < preferences.confidenceThreshold) {
      return false;
    }

    // Check excluded industries
    if (preferences.excludedIndustries.includes(analysis.primaryIndustry)) {
      return false;
    }

    // Check preferred industries (if any specified)
    if (preferences.preferredIndustries.length > 0) {
      return preferences.preferredIndustries.includes(analysis.primaryIndustry) ||
             analysis.industries.some(industry => 
               preferences.preferredIndustries.includes(industry.name)
             );
    }

    return true;
  }

  /**
   * Get available industry categories
   */
  static getIndustryCategories(): IndustryCategory[] {
    return [...this.INDUSTRY_CATEGORIES];
  }

  /**
   * Batch analyze multiple bookmarks efficiently
   */
  static async batchAnalyzeBookmarks(
    bookmarks: Array<{
      id: string;
      title: string;
      description?: string;
      url: string;
      tags?: { name: string }[];
    }>
  ): Promise<BookmarkAnalysis[]> {
    const analyses = [];
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(bookmark => this.analyzeBookmark(bookmark))
      );
      analyses.push(...batchResults);
    }

    return analyses;
  }
} 