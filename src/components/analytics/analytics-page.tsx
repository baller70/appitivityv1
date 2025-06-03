'use client';

import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { apiClient } from '../../lib/api/client';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import { Button } from '../ui/button';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  MousePointerClick,
  PieChart,
  Timer,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AnalyticsPageProps {
  userId: string;
}

export function AnalyticsPage({ userId }: AnalyticsPageProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate analytics data
  const totalBookmarks = bookmarks.length;
  const favoriteBookmarks = bookmarks.filter(b => b.is_favorite).length;
  const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
  const averageVisits = totalBookmarks > 0 ? Math.round(totalVisits / totalBookmarks) : 0;

  // Monthly data
  const thisMonth = new Date();
  const thisMonthBookmarks = bookmarks.filter(b => {
    if (!b.created_at) return false;
    const bookmarkDate = new Date(b.created_at);
    return bookmarkDate.getMonth() === thisMonth.getMonth() && 
           bookmarkDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  // Category breakdown
  const categoryStats = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.folder?.name || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top bookmarks by visits
  const topBookmarks = [...bookmarks]
    .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookmarks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalBookmarks}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">+{thisMonthBookmarks}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Visits</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVisits}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{favoriteBookmarks}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / totalBookmarks) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Bookmarks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Visited</h3>
            <div className="space-y-3">
              {topBookmarks.map((bookmark, index) => (
                <div key={bookmark.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                        {bookmark.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {bookmark.folder?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {bookmark.visit_count || 0} visits
                    </span>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageVisits}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. visits per bookmark</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBookmarks > 0 ? Math.round((favoriteBookmarks / totalBookmarks) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks favorited</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(categoryStats).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories used</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 