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
import { DnaPageHeader } from './dna-page-header';

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
      {/* Standardized Header */}
      <DnaPageHeader 
        title="DNA Profile"
        description="AI-enhanced behavioral analysis to personalize your experience"
      >
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
      </DnaPageHeader>

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
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">DNA Profile Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Your behavioral profile is being analyzed. Check back soon for insights and recommendations.
          </p>
          <Button onClick={triggerAnalysis} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 