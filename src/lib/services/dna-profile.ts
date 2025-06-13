// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js';
import { normalizeUserId } from '../uuid-compat';
import type { Database } from '@/types/supabase';
import type { 
  UserDnaProfile, 
  UserDnaProfileInsert, 
  UserDnaProfileUpdate,
  DnaProfileEvent,
  DnaProfileEventInsert,
  DnaProfileInsight,
  DnaProfileInsightInsert,
  DnaProfileRecommendation,
  DnaProfileRecommendationInsert
} from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export interface BehavioralAnalysis {
  browsingPattern: {
    peakHours: number[];
    sessionDuration: number;
    frequencyPattern: 'daily' | 'weekly' | 'sporadic';
    devicePreference: 'mobile' | 'desktop' | 'mixed';
  };
  categoryPreferences: {
    topCategories: string[];
    categoryDistribution: Record<string, number>;
    emergingInterests: string[];
  };
  interactionStyle: {
    organizationLevel: 'minimal' | 'moderate' | 'extensive';
    taggingBehavior: 'none' | 'basic' | 'detailed';
    folderUsage: 'flat' | 'hierarchical' | 'mixed';
  };
  personalityTraits: {
    curiosity: number; // 0-100
    focus: number; // 0-100
    organization: number; // 0-100
    exploration: number; // 0-100
  };
}

export interface DnaProfileAnalysis {
  profile: UserDnaProfile;
  insights: DnaProfileInsight[];
  recommendations: DnaProfileRecommendation[];
  confidenceScore: number;
}

export class DnaProfileService {
  private userId: string;

  constructor(_userId: string) {
    // Normalize Clerk-style IDs to UUID for DB
    this.userId = normalizeUserId(_userId);
  }

  /**
   * Track a behavioral event for DNA profile analysis
   */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async trackEvent(eventType: string, eventData: any, context?: any): Promise<void> {
    try {
      const event: DnaProfileEventInsert = {
        user_id: this.userId,
        event_type: eventType,
        event_data: eventData,
        context: context || {},
      };

      const { error } = await supabase
        .from('dna_profile_events')
        .insert(event);

      if (error) throw error;

      // Trigger analysis if we have enough events
      await this.checkAndTriggerAnalysis();
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error tracking DNA profile _event:', error);
      throw error;
    }
  }

  /**
   * Get the current DNA profile for the user
   */
  async getDnaProfile(): Promise<UserDnaProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_dna_profiles')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { _ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error fetching DNA _profile:', error);
      throw error;
    }
  }

  /**
   * Get active insights for the user
   */
  async getActiveInsights(): Promise<DnaProfileInsight[]> {
    try {
      const { data, error } = await supabase
        .from('dna_profile_insights')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('confidence_score', { _ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error fetching DNA profile _insights:', error);
      throw error;
    }
  }

  /**
   * Get active recommendations for the user
   */
  async getActiveRecommendations(): Promise<DnaProfileRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('dna_profile_recommendations')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_dismissed', false)
        .eq('is_applied', false)
        .order('priority_score', { _ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error fetching DNA profile _recommendations:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive DNA profile analysis
   */
  async analyzeProfile(): Promise<DnaProfileAnalysis> {
    try {
      // Get recent behavioral events
      const events = await this.getRecentEvents();
      
      // Get user's bookmarks and folders for analysis
      const bookmarks = await this.getUserBookmarks();
      const folders = await this.getUserFolders();

      // Perform behavioral analysis
      const analysis = await this.performBehavioralAnalysis(events, bookmarks, folders);

      // Generate or update DNA profile
      const profile = await this.generateDnaProfile(analysis);

      // Generate insights
      const insights = await this.generateInsights(analysis, profile);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(analysis, profile);

      return {
        profile,
        insights,
        recommendations,
        confidenceScore: analysis.personalityTraits.focus // Use focus as overall confidence
      };
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error analyzing DNA _profile:', error);
      throw error;
    }
  }

  /**
   * Apply a recommendation
   */
  async applyRecommendation(_recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dna_profile_recommendations')
        .update({
          _is_applied: true,
          applied_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error applying _recommendation:', error);
      throw error;
    }
  }

  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(_recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dna_profile_recommendations')
        .update({
          _is_dismissed: true,
          dismissed_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error dismissing _recommendation:', error);
      throw error;
    }
  }

  /**
   * Get DNA profile statistics
   */
  async getProfileStats(): Promise<{
    totalEvents: number;
    profileAge: number;
    lastAnalysis: string | null;
    confidenceScore: number;
    activeInsights: number;
    pendingRecommendations: number;
  }> {
    try {
      const [eventsResult, profile, insights, recommendations] = await Promise.all([
        supabase
          .from('dna_profile_events')
          .select('id', { _count: 'exact' })
          .eq('user_id', this.userId),
        this.getDnaProfile(),
        this.getActiveInsights(),
        this.getActiveRecommendations()
      ]);

      const totalEvents = eventsResult.count || 0;
      const profileAge = profile ? 
        Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        totalEvents,
        profileAge,
        lastAnalysis: profile?.last_analyzed_at || null,
        confidenceScore: profile?.confidence_score || 0,
        activeInsights: insights.length,
        pendingRecommendations: recommendations.length
      };
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error fetching profile _stats:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getRecentEvents(_days: number = 30): Promise<DnaProfileEvent[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('dna_profile_events')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { _ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async getUserBookmarks() {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', this.userId);

    if (error) throw error;
    return data || [];
  }

  private async getUserFolders() {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', this.userId);

    if (error) throw error;
    return data || [];
  }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async performBehavioralAnalysis(_events: DnaProfileEvent[], bookmarks: any[], folders: any[]): Promise<BehavioralAnalysis> {
    // Analyze browsing patterns
    const browsingPattern = this.analyzeBrowsingPattern(events);
    
    // Analyze category preferences
    const categoryPreferences = this.analyzeCategoryPreferences(bookmarks, events);
    
    // Analyze interaction style
    const interactionStyle = this.analyzeInteractionStyle(bookmarks, folders, events);
    
    // Calculate personality traits
    const personalityTraits = this.calculatePersonalityTraits(events, bookmarks, folders);

    return {
      browsingPattern,
      categoryPreferences,
      interactionStyle,
      personalityTraits
    };
  }

  private analyzeBrowsingPattern(_events: DnaProfileEvent[]) {
    const hourCounts: Record<number, number> = {};
    let totalDuration = 0;
    const sessionGaps: number[] = [];

    events.forEach((event, index) => {
      const hour = new Date(event.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;

      if (index > 0) {
        const gap = new Date(event.created_at).getTime() - new Date(events[index - 1].created_at).getTime();
        sessionGaps.push(gap);
      }
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const avgSessionDuration = sessionGaps.length > 0 ? 
      sessionGaps.reduce((a, b) => a + b, 0) / sessionGaps.length : 0;

    return {
      peakHours,
      sessionDuration: avgSessionDuration,
      frequencyPattern: this.determineFrequencyPattern(events),
      devicePreference: 'mixed' as const // Would need device info from events
    };
  }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private analyzeCategoryPreferences(_bookmarks: any[], events: DnaProfileEvent[]) {
    const categoryCount: Record<string, number> = {};
    
    // Analyze bookmark URLs to infer categories
    bookmarks.forEach(bookmark => {
      const category = this.inferCategoryFromUrl(bookmark.url);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const total = Object.values(categoryCount).reduce((a, b) => a + b, 0);
    const categoryDistribution: Record<string, number> = {};
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      categoryDistribution[category] = total > 0 ? (count / total) * 100 : 0;
    });

    const topCategories = Object.entries(categoryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    return {
      topCategories,
      categoryDistribution,
      emergingInterests: this.identifyEmergingInterests(events)
    };
  }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private analyzeInteractionStyle(_bookmarks: any[], folders: any[], events: DnaProfileEvent[]): BehavioralAnalysis['interactionStyle'] {
    const folderCount = folders.length;
    const bookmarkCount = bookmarks.length;
    const avgBookmarksPerFolder = folderCount > 0 ? bookmarkCount / folderCount : bookmarkCount;

    const organizationLevel: 'minimal' | 'moderate' | 'extensive' = folderCount === 0 ? 'minimal' :
      avgBookmarksPerFolder > 10 ? 'moderate' : 'extensive';

    const taggingEvents = events.filter(e => e.event_type === 'tag_added' || e.event_type === 'tag_removed');
    const taggingBehavior: 'none' | 'basic' | 'detailed' = taggingEvents.length === 0 ? 'none' :
      taggingEvents.length < 10 ? 'basic' : 'detailed';

    const nestedFolders = folders.filter(f => f.parent_id !== null);
    const folderUsage: 'flat' | 'hierarchical' | 'mixed' = folderCount === 0 ? 'flat' :
      nestedFolders.length === 0 ? 'flat' :
      nestedFolders.length / folderCount > 0.3 ? 'hierarchical' : 'mixed';

    return {
      organizationLevel,
      taggingBehavior,
      folderUsage
    };
  }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculatePersonalityTraits(_events: DnaProfileEvent[], bookmarks: any[], folders: any[]) {
    // Calculate curiosity based on bookmark diversity and exploration events
    const uniqueDomains = new Set(bookmarks.map(b => new URL(b.url).hostname)).size;
    const curiosity = Math.min(100, (uniqueDomains / bookmarks.length) * 200);

    // Calculate focus based on session patterns and revisit behavior
    const revisitEvents = events.filter(e => e.event_type === 'bookmark_visited');
    const focus = Math.min(100, (revisitEvents.length / events.length) * 150);

    // Calculate organization based on folder structure and tagging
    const organizationScore = (folders.length * 10) + (events.filter(e => e.event_type.includes('tag')).length * 5);
    const organization = Math.min(100, organizationScore);

    // Calculate exploration based on new bookmark additions and category diversity
    const newBookmarkEvents = events.filter(e => e.event_type === 'bookmark_added');
    const exploration = Math.min(100, (newBookmarkEvents.length / 30) * 100); // 30 days

    return {
      curiosity: Math.round(curiosity),
      focus: Math.round(focus),
      organization: Math.round(organization),
      exploration: Math.round(exploration)
    };
  }

  private async generateDnaProfile(_analysis: BehavioralAnalysis): Promise<UserDnaProfile> {
    const profileData: UserDnaProfileInsert = {
      user_id: this.userId,
      profile_name: this.generateProfileName(analysis),
      browsing_pattern: analysis.browsingPattern,
      category_preferences: analysis.categoryPreferences,
      interaction_style: analysis.interactionStyle,
      organization_style: {
        level: analysis.interactionStyle.organizationLevel,
        folderUsage: analysis.interactionStyle.folderUsage,
        taggingBehavior: analysis.interactionStyle.taggingBehavior
      },
      personality_traits: analysis.personalityTraits,
      learning_style: this.inferLearningStyle(analysis),
      productivity_patterns: this.analyzeProductivityPatterns(analysis),
      content_affinity: analysis.categoryPreferences,
      confidence_score: this.calculateConfidenceScore(analysis),
      last_analyzed_at: new Date().toISOString(),
      analysis_version: '1.0'
    };

    // Check if profile exists
    const existingProfile = await this.getDnaProfile();
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_dna_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_dna_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  private async generateInsights(_analysis: BehavioralAnalysis, profile: UserDnaProfile): Promise<DnaProfileInsight[]> {
    const insights: DnaProfileInsightInsert[] = [];

    // Generate insights based on analysis
    if (analysis.personalityTraits.curiosity > 80) {
      insights.push({
        _user_id: this.userId,
        insight_type: 'curiosity',
        title: 'High Curiosity Explorer',
        description: 'You show strong exploratory behavior with diverse bookmark interests.',
        insight_data: { score: analysis.personalityTraits.curiosity },
        confidence_score: 0.9
      });
    }

    if (analysis.personalityTraits.organization > 70) {
      insights.push({
        _user_id: this.userId,
        insight_type: 'organization',
        title: 'Highly Organized',
        description: 'You maintain excellent organization with folders and tags.',
        insight_data: { score: analysis.personalityTraits.organization },
        confidence_score: 0.85
      });
    }

    if (analysis.browsingPattern.peakHours.length > 0) {
      insights.push({
        _user_id: this.userId,
        insight_type: 'timing',
        title: 'Peak Activity Pattern',
        description: `You're most active during ${analysis.browsingPattern.peakHours.join(', ')}:00 hours.`,
        insight_data: { peakHours: analysis.browsingPattern.peakHours },
        confidence_score: 0.75
      });
    }

    // Insert insights
    if (insights.length > 0) {
      const { data, error } = await supabase
        .from('dna_profile_insights')
        .insert(insights)
        .select();

      if (error) throw error;
      return data;
    }

    return [];
  }

  private async generateRecommendations(_analysis: BehavioralAnalysis, profile: UserDnaProfile): Promise<DnaProfileRecommendation[]> {
    const recommendations: DnaProfileRecommendationInsert[] = [];

    // Generate recommendations based on analysis
    if (analysis.personalityTraits.organization < 50) {
      recommendations.push({
        _user_id: this.userId,
        recommendation_type: 'organization',
        title: 'Improve Organization',
        description: 'Consider creating folders to better organize your bookmarks.',
        action_data: { action: 'create_folders', suggested_count: 3 },
        priority_score: 80
      });
    }

    if (analysis.interactionStyle.taggingBehavior === 'none') {
      recommendations.push({
        _user_id: this.userId,
        recommendation_type: 'tagging',
        title: 'Start Using Tags',
        description: 'Tags can help you find bookmarks faster and organize by topics.',
        action_data: { action: 'add_tags', suggested_tags: analysis.categoryPreferences.topCategories },
        priority_score: 60
      });
    }

    if (analysis.categoryPreferences.topCategories.length < 3) {
      recommendations.push({
        _user_id: this.userId,
        recommendation_type: 'exploration',
        title: 'Explore New Categories',
        description: 'Diversify your bookmarks to discover new interests.',
        action_data: { action: 'explore_categories', suggested_categories: ['productivity', 'learning', 'tools'] },
        priority_score: 40
      });
    }

    // Insert recommendations
    if (recommendations.length > 0) {
      const { data, error } = await supabase
        .from('dna_profile_recommendations')
        .insert(recommendations)
        .select();

      if (error) throw error;
      return data;
    }

    return [];
  }

  private async checkAndTriggerAnalysis(): Promise<void> {
    const events = await this.getRecentEvents(7); // Last 7 days
    
    // Trigger analysis if we have enough recent activity
    if (events.length >= 10) {
      const profile = await this.getDnaProfile();
      const lastAnalysis = profile?.last_analyzed_at;
      
      if (!lastAnalysis || 
          Date.now() - new Date(lastAnalysis).getTime() > 7 * 24 * 60 * 60 * 1000) { // 7 days
        await this.analyzeProfile();
      }
    }
  }

  // Utility methods
  private determineFrequencyPattern(_events: DnaProfileEvent[]): 'daily' | 'weekly' | 'sporadic' {
    if (events.length < 7) return 'sporadic';
    
    const dailyActivity = events.filter(e => 
      Date.now() - new Date(e.created_at).getTime() < 24 * 60 * 60 * 1000
    ).length;
    
    if (dailyActivity > 0) return 'daily';
    
    const weeklyActivity = events.filter(e => 
      Date.now() - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    
    return weeklyActivity > 3 ? 'weekly' : 'sporadic';
  }

  private inferCategoryFromUrl(_url: string): string {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('github') || domain.includes('stackoverflow')) return 'development';
    if (domain.includes('youtube') || domain.includes('netflix')) return 'entertainment';
    if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc')) return 'news';
    if (domain.includes('learn') || domain.includes('course') || domain.includes('edu')) return 'education';
    if (domain.includes('shop') || domain.includes('amazon') || domain.includes('store')) return 'shopping';
    
    return 'general';
  }

  private identifyEmergingInterests(_events: DnaProfileEvent[]): string[] {
    const recentEvents = events.filter(e => 
      Date.now() - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    
    const categories = recentEvents
      .filter(e => e.event_type === 'bookmark_added')
      .map(e => {
        const eventData = e.event_data as any;
        return this.inferCategoryFromUrl(eventData?.url || '');
      })
      .filter(Boolean);
    
    const categoryCount: Record<string, number> = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .filter(([, count]) => count >= 2)
      .map(([category]) => category);
  }

  private generateProfileName(_analysis: BehavioralAnalysis): string {
    const { personalityTraits, interactionStyle } = analysis;
    
    if (personalityTraits.curiosity > 80 && personalityTraits.exploration > 70) {
      return 'The Explorer';
    }
    if (personalityTraits.organization > 80 && interactionStyle.organizationLevel === 'extensive') {
      return 'The Organizer';
    }
    if (personalityTraits.focus > 80 && personalityTraits.curiosity < 50) {
      return 'The Specialist';
    }
    if (personalityTraits.curiosity > 70 && personalityTraits.organization > 70) {
      return 'The Curator';
    }
    
    return 'The Collector';
  }

  private inferLearningStyle(_analysis: BehavioralAnalysis) {
    return {
      preference: analysis.personalityTraits.exploration > 70 ? 'exploratory' : 'structured',
      pace: analysis.personalityTraits.focus > 70 ? 'deep' : 'broad',
      organization: analysis.interactionStyle.organizationLevel
    };
  }

  private analyzeProductivityPatterns(_analysis: BehavioralAnalysis) {
    return {
      peakHours: analysis.browsingPattern.peakHours,
      sessionStyle: analysis.browsingPattern.sessionDuration > 1800000 ? 'long' : 'short', // 30 min
      organizationApproach: analysis.interactionStyle.organizationLevel
    };
  }

  private calculateConfidenceScore(_analysis: BehavioralAnalysis): number {
    const scores = Object.values(analysis.personalityTraits);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    // Ensure the score is between 0 and 1
    const normalizedScore = Math.min(Math.max(avgScore / 100, 0), 1);
    return Math.round(normalizedScore * 100) / 100; // Round to 2 decimal places
  }
} 