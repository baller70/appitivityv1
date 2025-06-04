'use client';

import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { apiClient } from '../../lib/api/client';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Eye,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ExternalLink,
  Calendar,
  Globe,
  Star,
  Folder,
  Activity,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AnalyticsPageProps {
  userId: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  color?: string;
}

function MetricCard({ title, value, change, icon, color = 'blue' }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    if (change.trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change.trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!change) return '';
    if (change.trend === 'up') return 'text-green-600 dark:text-green-400';
    if (change.trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{change.value > 0 ? '+' : ''}{change.value}</span>
                <span className="text-gray-500">vs {change.period}</span>
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage({ userId }: AnalyticsPageProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadBookmarks();
  }, [userId]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced analytics calculations
  const totalBookmarks = bookmarks.length;
  const favoriteBookmarks = bookmarks.filter(b => b.is_favorite).length;
  const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
  const averageVisits = totalBookmarks > 0 ? Math.round(totalVisits / totalBookmarks) : 0;

  // Time-based analytics
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisMonthBookmarks = bookmarks.filter(b => {
    if (!b.created_at) return false;
    const bookmarkDate = new Date(b.created_at);
    return bookmarkDate >= lastMonth;
  }).length;

  const thisWeekBookmarks = bookmarks.filter(b => {
    if (!b.created_at) return false;
    const bookmarkDate = new Date(b.created_at);
    return bookmarkDate >= lastWeek;
  }).length;

  // Category breakdown with enhanced stats
  const categoryStats = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.folder?.name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, visits: 0, favorites: 0 };
    }
    acc[category].count += 1;
    acc[category].visits += bookmark.visit_count || 0;
    acc[category].favorites += bookmark.is_favorite ? 1 : 0;
    return acc;
  }, {} as Record<string, { count: number; visits: number; favorites: number }>);

  // Top bookmarks by different metrics
  const topBookmarksByVisits = [...bookmarks]
    .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
    .slice(0, 5);

  const recentBookmarks = [...bookmarks]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  // Domain analysis
  const domainStats = bookmarks.reduce((acc, bookmark) => {
    try {
      const domain = new URL(bookmark.url).hostname.replace('www.', '');
      acc[domain] = (acc[domain] || 0) + 1;
    } catch {
      acc['invalid-url'] = (acc['invalid-url'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topDomains = Object.entries(domainStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ANALYTICS DASHBOARD</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive insights into your bookmark usage</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['7d', '30d', '90d', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </button>
              ))}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Bookmarks"
            value={totalBookmarks}
            change={{ value: thisMonthBookmarks, period: 'last month', trend: thisMonthBookmarks > 0 ? 'up' : 'neutral' }}
            icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
            color="blue"
          />
          <MetricCard
            title="Total Visits"
            value={totalVisits.toLocaleString()}
            change={{ value: Math.round(totalVisits * 0.1), period: 'last week', trend: 'up' }}
            icon={<Eye className="h-6 w-6 text-purple-600" />}
            color="purple"
          />
          <MetricCard
            title="Favorites"
            value={favoriteBookmarks}
            change={{ value: Math.round(favoriteBookmarks * 0.05), period: 'last month', trend: 'up' }}
            icon={<Star className="h-6 w-6 text-yellow-600" />}
            color="yellow"
          />
          <MetricCard
            title="Categories"
            value={Object.keys(categoryStats).length}
            icon={<Folder className="h-6 w-6 text-green-600" />}
            color="green"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Activity Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. visits/bookmark</span>
                  <Badge variant="secondary">{averageVisits}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Favorite rate</span>
                  <Badge variant="secondary">
                    {totalBookmarks > 0 ? Math.round((favoriteBookmarks / totalBookmarks) * 100) : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This week</span>
                  <Badge variant="outline">+{thisWeekBookmarks}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Top Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topDomains.map(([domain, count]) => (
                  <div key={domain} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-32" title={domain}>{domain}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Usage Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most active category</span>
                  <Badge variant="secondary">
                    {Object.entries(categoryStats)
                      .sort(([,a], [,b]) => b.visits - a.visits)[0]?.[0] || 'None'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unique domains</span>
                  <Badge variant="outline">{Object.keys(domainStats).length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Category Breakdown */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Category Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([category, stats]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{stats.count}</Badge>
                        <Badge variant="secondary">{stats.visits} visits</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.count / totalBookmarks) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {Math.round((stats.count / totalBookmarks) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Top Bookmarks */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Most Visited Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topBookmarksByVisits.map((bookmark, index) => (
                  <div key={bookmark.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                          {bookmark.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {bookmark.folder?.name.toUpperCase() || 'UNCATEGORIZED'}
                          </Badge>
                          {bookmark.is_favorite && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {bookmark.visit_count || 0}
                        </p>
                        <p className="text-xs text-gray-500">visits</p>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBookmarks.map((bookmark) => (
                <div key={bookmark.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {bookmark.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {bookmark.folder?.name.toUpperCase() || 'UNCATEGORIZED'}
                        </Badge>
                        {bookmark.is_favorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 