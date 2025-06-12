/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  Lightbulb, 
  RefreshCw,
  User,
  BarChart3,
  Zap
} from 'lucide-react';

interface DnaProfileStats {
  totalEvents: number;
  profileAge: number;
  lastAnalysis: string | null;
  confidenceScore: number;
  activeInsights: number;
  pendingRecommendations: number;
}

export default function DnaProfilePage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [stats, setStats] = useState<DnaProfileStats>({
    totalEvents: 0,
    profileAge: 0,
    lastAnalysis: null,
    confidenceScore: 0,
    activeInsights: 0,
    pendingRecommendations: 0
  });

  useEffect(() => {
    loadDnaProfile();
  }, []);

  const loadDnaProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const profileResponse = await fetch('/api/dna-profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Load insights
      const insightsResponse = await fetch('/api/dna-profile/insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);
      }

      // Load recommendations
      const recommendationsResponse = await fetch('/api/dna-profile/recommendations');
      if (recommendationsResponse.ok) {
        const recommendationsData = await recommendationsResponse.json();
        setRecommendations(recommendationsData);
      }

      // Load stats
      const statsResponse = await fetch('/api/dna-profile/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading DNA profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch('/api/dna-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' })
      });

      if (response.ok) {
        await loadDnaProfile();
      }
    } catch (error) {
      console.error('Error triggering analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRecommendationAction = async (id: string, action: 'apply' | 'dismiss') => {
    try {
      const response = await fetch(`/api/dna-profile/recommendations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await loadDnaProfile();
      }
    } catch (error) {
      console.error('Error handling recommendation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your DNA profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DNA Profile</h1>
          <p className="text-muted-foreground">
            AI-enhanced behavioral analysis to personalize your experience
          </p>
        </div>
        <Button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2"
        >
          {analyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Events</p>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Profile Age</p>
                  <p className="text-2xl font-bold">{stats.profileAge}d</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold">{stats.confidenceScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Insights</p>
                  <p className="text-2xl font-bold">{stats.activeInsights}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Recommendations</p>
                  <p className="text-2xl font-bold">{stats.pendingRecommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Analysis</p>
                  <p className="text-sm font-medium">
                    {stats.lastAnalysis 
                      ? new Date(stats.lastAnalysis).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {profile ? (
            <ProfileOverview profile={profile} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No DNA Profile Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start using the app to build your behavioral profile
                </p>
                <Button onClick={triggerAnalysis} disabled={analyzing}>
                  {analyzing ? 'Analyzing...' : 'Create Profile'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsSection insights={insights} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsSection
            recommendations={recommendations}
            onAction={handleRecommendationAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileOverview({ profile }: { profile: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold">{profile.profile_name || 'Analyzing...'}</p>
            <p className="text-sm text-muted-foreground">
              AI-enhanced behavioral profile
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Learning Style</span>
              <Badge variant="secondary">
                {profile.learning_style 
                  ? `${profile.learning_style.preference || 'Unknown'} (${profile.learning_style.pace || 'Unknown'})`
                  : 'Analyzing...'
                }
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Productivity Pattern</span>
              <Badge variant="secondary">
                {profile.productivity_patterns 
                  ? `${profile.productivity_patterns.sessionStyle || 'Unknown'} sessions`
                  : 'Analyzing...'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card>
        <CardHeader>
          <CardTitle>Personality Traits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.personality_traits && Object.entries(profile.personality_traits).map(([trait, value]) => (
            <div key={trait} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm capitalize">{trait}</span>
                <span className="text-sm font-medium">{typeof value === 'number' ? value : 0}%</span>
              </div>
              <Progress value={typeof value === 'number' ? value : 0} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Behavioral Analysis */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Behavioral Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Browsing Pattern</h4>
              <div className="space-y-2 text-sm">
                <p>Peak Hours: {profile.browsing_pattern?.peakHours?.join(', ') || 'Analyzing...'}</p>
                <p>Frequency: {profile.browsing_pattern?.frequencyPattern || 'Analyzing...'}</p>
                <p>Device: {profile.browsing_pattern?.devicePreference || 'Analyzing...'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Category Preferences</h4>
              <div className="space-y-1">
                {profile.category_preferences?.topCategories?.length > 0 ? (
                  profile.category_preferences.topCategories.map((category: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {category}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Analyzing preferences...</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Interaction Style</h4>
              <div className="space-y-2 text-sm">
                <p>Organization: {profile.interaction_style?.organizationLevel || 'Analyzing...'}</p>
                <p>Tagging: {profile.interaction_style?.taggingBehavior || 'Analyzing...'}</p>
                <p>Folders: {profile.interaction_style?.folderUsage || 'Analyzing...'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InsightsSection({ insights }: { insights: any[] }) {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
          <p className="text-muted-foreground">
            Keep using the app to generate behavioral insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{insight.insight_type}</CardTitle>
              <Badge variant="secondary">
                {insight.confidence_score}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{insight.description}</p>
            {insight.insight_data && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <pre className="text-sm">{JSON.stringify(insight.insight_data, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecommendationsSection({ 
  recommendations, 
  onAction 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any[];
  onAction: (id: string, action: 'apply' | 'dismiss') => void;
}) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
          <p className="text-muted-foreground">
            Your DNA profile will generate personalized recommendations as you use the app
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{recommendation.recommendation_type}</CardTitle>
              <Badge variant="outline">
                {recommendation.priority} priority
              </Badge>
            </div>
            <CardDescription>{recommendation.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onAction(recommendation.id, 'apply')}
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(recommendation.id, 'dismiss')}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 