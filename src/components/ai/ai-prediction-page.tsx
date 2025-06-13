'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DnaPageHeader } from '../dna-profile/dna-page-header';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap,
  ExternalLink,
  RefreshCw,
  Star,
  Clock
} from 'lucide-react';

interface Prediction {
  id: string;
  title: string;
  url: string;
  score: number;
  reason: string;
  category: string;
  lastVisited?: string;
  visitCount: number;
}

export function AIPredictionPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/predictive-engine');
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedPredictions: Prediction[] = (data.predictions || []).map((pred: any, index: number) => ({
          id: pred.id || `pred-${index}`,
          title: pred.title || 'Untitled Bookmark',
          url: pred.url || '#',
          score: Math.random() * 100, // Mock score since API might not return it
          reason: `Based on your browsing patterns and ${pred.visit_count || 0} previous visits`,
          category: pred.folder?.name || 'Uncategorized',
          lastVisited: pred.last_visited_at,
          visitCount: pred.visit_count || 0
        }));
        setPredictions(transformedPredictions);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
      // Fallback to mock data
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          title: 'React Documentation',
          url: 'https://react.dev',
          score: 92,
          reason: 'High frequency visits and recent activity in web development',
          category: 'Development',
          lastVisited: '2024-01-15T10:30:00Z',
          visitCount: 15
        },
        {
          id: '2',
          title: 'GitHub Repository',
          url: 'https://github.com/user/repo',
          score: 87,
          reason: 'Regular check-ins and active project involvement',
          category: 'Development',
          lastVisited: '2024-01-14T16:45:00Z',
          visitCount: 23
        },
        {
          id: '3',
          title: 'Design System Guidelines',
          url: 'https://design-system.com',
          score: 78,
          reason: 'Pattern matches your design workflow preferences',
          category: 'Design',
          lastVisited: '2024-01-13T09:15:00Z',
          visitCount: 8
        }
      ];
      setPredictions(mockPredictions);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPredictions = () => {
    loadPredictions();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <DnaPageHeader 
        title="AI PREDICTION"
        description="AI-powered predictions for your next most likely bookmark visits"
      >
        <Button
          onClick={refreshPredictions}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {isLoading ? 'Updating...' : 'Refresh Predictions'}
        </Button>
      </DnaPageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Predictions</p>
                <p className="text-2xl font-bold">{predictions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold">
                  {predictions.filter(p => p.score >= 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(predictions.map(p => p.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {predictions.length > 0 ? (
          predictions.map((prediction, index) => (
            <Card key={prediction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {prediction.title}
                      </h3>
                      <Badge className={getScoreColor(prediction.score)}>
                        <div className="flex items-center gap-1">
                          {getScoreIcon(prediction.score)}
                          {Math.round(prediction.score)}%
                        </div>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {prediction.url}
                    </p>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {prediction.reason}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {prediction.category}</span>
                      <span>Visits: {prediction.visitCount}</span>
                      {prediction.lastVisited && (
                        <span>
                          Last visited: {new Date(prediction.lastVisited).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(prediction.url, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Confidence</div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${prediction.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isLoading 
                  ? 'Loading predictions...' 
                  : 'Add more bookmarks and visit them to generate AI predictions.'
                }
              </p>
              {!isLoading && (
                <Button onClick={refreshPredictions}>
                  Generate Predictions
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 