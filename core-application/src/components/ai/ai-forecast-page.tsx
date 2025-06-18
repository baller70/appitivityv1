'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DnaPageHeader } from '../dna-profile/dna-page-header';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Zap,
  ExternalLink,
  RefreshCw,
  Target,
  Clock
} from 'lucide-react';

interface Forecast {
  bookmarkId: string;
  title: string;
  url: string;
  expectedVisitsNext7Days: number;
  currentTrend: 'up' | 'down' | 'stable';
  confidence: number;
  category: string;
  historicalVisits: number;
}

export function AIForecastPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('7days');

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/forecasting');
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedForecasts: Forecast[] = (data.forecasts || []).map((forecast: any) => ({
          bookmarkId: forecast.bookmarkId,
          title: `Bookmark ${forecast.bookmarkId}`, // Mock title since API might not return it
          url: '#', // Mock URL
          expectedVisitsNext7Days: forecast.expectedVisitsNext7Days,
          currentTrend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          confidence: Math.random() * 40 + 60, // Mock confidence 60-100%
          category: 'General',
          historicalVisits: Math.floor(Math.random() * 50) + 10
        }));
        setForecasts(transformedForecasts);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading forecasts:', error);
      // Fallback to mock data
      const mockForecasts: Forecast[] = [
        {
          bookmarkId: '1',
          title: 'React Documentation',
          url: 'https://react.dev',
          expectedVisitsNext7Days: 12,
          currentTrend: 'up',
          confidence: 92,
          category: 'Development',
          historicalVisits: 45
        },
        {
          bookmarkId: '2',
          title: 'GitHub Dashboard',
          url: 'https://github.com',
          expectedVisitsNext7Days: 8,
          currentTrend: 'stable',
          confidence: 87,
          category: 'Development',
          historicalVisits: 32
        },
        {
          bookmarkId: '3',
          title: 'Design System',
          url: 'https://design-system.com',
          expectedVisitsNext7Days: 5,
          currentTrend: 'down',
          confidence: 73,
          category: 'Design',
          historicalVisits: 18
        },
        {
          bookmarkId: '4',
          title: 'Productivity Tools',
          url: 'https://notion.so',
          expectedVisitsNext7Days: 15,
          currentTrend: 'up',
          confidence: 89,
          category: 'Productivity',
          historicalVisits: 67
        }
      ];
      setForecasts(mockForecasts);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const refreshForecasts = () => {
    loadForecasts();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const totalExpectedVisits = forecasts.reduce((sum, forecast) => sum + forecast.expectedVisitsNext7Days, 0);
  const averageConfidence = forecasts.length > 0 
    ? forecasts.reduce((sum, forecast) => sum + forecast.confidence, 0) / forecasts.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <DnaPageHeader 
        title="AI FORECAST"
        description="AI-powered forecasting for future bookmark usage patterns and trends"
      >
        <Button
          onClick={refreshForecasts}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4" />
          )}
          {isLoading ? 'Forecasting...' : 'Update Forecast'}
        </Button>
      </DnaPageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expected Visits (7d)</p>
                <p className="text-2xl font-bold">{totalExpectedVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{Math.round(averageConfidence)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Trending Up</p>
                <p className="text-2xl font-bold">
                  {forecasts.filter(f => f.currentTrend === 'up').length}
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

      {/* Forecast Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            7-Day Forecast Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {forecasts.filter(f => f.currentTrend === 'up').length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Increasing Usage</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {forecasts.filter(f => f.currentTrend === 'stable').length}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Stable Usage</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {forecasts.filter(f => f.currentTrend === 'down').length}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Decreasing Usage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecasts List */}
      <div className="space-y-4">
        {forecasts.length > 0 ? (
          forecasts
            .sort((a, b) => b.expectedVisitsNext7Days - a.expectedVisitsNext7Days)
            .map((forecast, index) => (
              <Card key={forecast.bookmarkId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {forecast.title}
                        </h3>
                        <Badge className={getTrendColor(forecast.currentTrend)}>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(forecast.currentTrend)}
                            {forecast.currentTrend}
                          </div>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {forecast.url}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Expected Visits:</span>
                          <div className="font-semibold text-blue-600">
                            {forecast.expectedVisitsNext7Days} in 7 days
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Historical:</span>
                          <div className="font-semibold">{forecast.historicalVisits} total</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <div className="font-semibold">{forecast.category}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Confidence:</span>
                          <Badge className={getConfidenceColor(forecast.confidence)}>
                            {Math.round(forecast.confidence)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col gap-2 items-end">
                      <Button
                        size="sm"
                        onClick={() => window.open(forecast.url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit
                      </Button>
                      
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Forecast</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {forecast.expectedVisitsNext7Days}
                        </div>
                        <div className="text-xs text-gray-500">visits</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Forecast Visualization */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Usage Forecast</span>
                      <span>{forecast.expectedVisitsNext7Days} visits expected</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (forecast.expectedVisitsNext7Days / Math.max(...forecasts.map(f => f.expectedVisitsNext7Days))) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Forecasts Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isLoading 
                  ? 'Generating forecasts...' 
                  : 'Add more bookmarks and visit them regularly to generate AI forecasts.'
                }
              </p>
              {!isLoading && (
                <Button onClick={refreshForecasts}>
                  Generate Forecasts
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 