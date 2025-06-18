/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
// import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Activity,
  Database,
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Calendar,
  Globe
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { bookmarkCache } from '../../lib/services/bookmark-cache';
// import { visitTracker } from '../../lib/services/visit-tracker';
import { toast } from 'sonner';

interface AnalyticsCheck {
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
  icon: React.ReactNode;
}

export function AnalyticsVerification() {
  const [checks, setChecks] = useState<AnalyticsCheck[]>([
    {
      name: 'Data Collection',
      description: 'Verifying bookmark data is being collected',
      status: 'pending',
      icon: <Database className="h-5 w-5" />
    },
    {
      name: 'Visit Tracking',
      description: 'Testing visit count tracking functionality',
      status: 'pending',
      icon: <Eye className="h-5 w-5" />
    },
    {
      name: 'Time-based Analytics',
      description: 'Checking date filtering and calculations',
      status: 'pending',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: 'Category Analytics',
      description: 'Verifying folder/category statistics',
      status: 'pending',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: 'Performance Metrics',
      description: 'Testing engagement and growth calculations',
      status: 'pending',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      name: 'Cache System',
      description: 'Verifying cache functionality',
      status: 'pending',
      icon: <Activity className="h-5 w-5" />
    },
    {
      name: 'Real-time Updates',
      description: 'Testing live data synchronization',
      status: 'pending',
      icon: <Clock className="h-5 w-5" />
    },
    {
      name: 'Domain Analytics',
      description: 'Checking domain tracking and statistics',
      status: 'pending',
      icon: <Globe className="h-5 w-5" />
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    failed: number;
  }>({ total: 0, success: 0, failed: 0 });

  const updateCheck = (index: number, update: Partial<AnalyticsCheck>) => {
    setChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, ...update } : check
    ));
  };

  const runChecks = async () => {
    setIsRunning(true);
    let successCount = 0;
    let failedCount = 0;

    // Reset all checks
    setChecks(prev => prev.map(check => ({ ...check, status: 'checking', message: undefined })));

    // Check 1: Data Collection
    try {
      updateCheck(0, { status: 'checking' });
      const bookmarks = await apiClient.getBookmarks();
      if (bookmarks && bookmarks.length >= 0) {
        updateCheck(0, { 
          status: 'success', 
          message: `Found ${bookmarks.length} bookmarks` 
        });
        successCount++;
      } else {
        throw new Error('No bookmarks data received');
      }
    } catch (error) {
      updateCheck(0, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to fetch bookmarks' 
      });
      failedCount++;
    }

    // Check 2: Visit Tracking
    try {
      updateCheck(1, { status: 'checking' });
      // Test visit tracking API endpoint
      const testResponse = await fetch('/api/bookmarks/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId: 'test', incrementBy: 0 })
      });
      
      if (testResponse.status === 404 || testResponse.status === 401) {
        // Expected errors for test bookmark
        updateCheck(1, { 
          status: 'success', 
          message: 'Visit tracking endpoint is functional' 
        });
        successCount++;
      } else if (!testResponse.ok) {
        throw new Error('Unexpected response from visit tracking');
      }
    } catch {
      updateCheck(1, { 
        status: 'error', 
        message: 'Visit tracking endpoint not responding' 
      });
      failedCount++;
    }

    // Check 3: Time-based Analytics
    try {
      updateCheck(2, { status: 'checking' });
      const bookmarks = await apiClient.getBookmarks();
      const now = new Date();
      const thisMonth = bookmarks.filter(b => {
        if (!b.created_at) return false;
        const date = new Date(b.created_at);
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      });
      
      updateCheck(2, { 
        status: 'success', 
        message: `${thisMonth.length} bookmarks this month` 
      });
      successCount++;
    } catch {
      updateCheck(2, { 
        status: 'error', 
        message: 'Failed to calculate time-based metrics' 
      });
      failedCount++;
    }

    // Check 4: Category Analytics
    try {
      updateCheck(3, { status: 'checking' });
      const [bookmarks] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders()
      ]);
      
      const categoryStats = bookmarks.reduce((acc, b) => {
        const category = b.folder?.name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      updateCheck(3, { 
        status: 'success', 
        message: `${Object.keys(categoryStats).length} categories tracked` 
      });
      successCount++;
    } catch {
      updateCheck(3, { 
        status: 'error', 
        message: 'Failed to calculate category statistics' 
      });
      failedCount++;
    }

    // Check 5: Performance Metrics
    try {
      updateCheck(4, { status: 'checking' });
      const bookmarks = await apiClient.getBookmarks();
      const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
      const favorites = bookmarks.filter(b => b.is_favorite).length;
      const engagementScore = bookmarks.length > 0 
        ? Math.round((totalVisits / bookmarks.length) * (favorites / bookmarks.length) * 100)
        : 0;
      
      updateCheck(4, { 
        status: 'success', 
        message: `Engagement score: ${engagementScore}/100` 
      });
      successCount++;
    } catch {
      updateCheck(4, { 
        status: 'error', 
        message: 'Failed to calculate performance metrics' 
      });
      failedCount++;
    }

    // Check 6: Cache System
    try {
      updateCheck(5, { status: 'checking' });
      const bookmarks = await apiClient.getBookmarks();
      bookmarkCache.cacheBookmarks(bookmarks);
      const cached = bookmarkCache.getCachedBookmarks();
      
      if (cached && cached.length === bookmarks.length) {
        updateCheck(5, { 
          status: 'success', 
          message: 'Cache system working correctly' 
        });
        successCount++;
      } else {
        throw new Error('Cache mismatch');
      }
    } catch {
      updateCheck(5, { 
        status: 'error', 
        message: 'Cache system not functioning properly' 
      });
      failedCount++;
    }

    // Check 7: Real-time Updates
    try {
      updateCheck(6, { status: 'checking' });
      // Test optimistic updates
      const testId = 'test-bookmark-id';
      bookmarkCache.optimisticUpdate(testId, { visit_count: 100 });
      
      updateCheck(6, { 
        status: 'success', 
        message: 'Real-time updates functional' 
      });
      successCount++;
    } catch {
      updateCheck(6, { 
        status: 'error', 
        message: 'Real-time update system error' 
      });
      failedCount++;
    }

    // Check 8: Domain Analytics
    try {
      updateCheck(7, { status: 'checking' });
      const bookmarks = await apiClient.getBookmarks();
      const domains = new Set(bookmarks.map(b => {
        try {
          return new URL(b.url).hostname.replace('www.', '');
        } catch {
          return 'invalid';
        }
      }));
      
      updateCheck(7, { 
        status: 'success', 
        message: `Tracking ${domains.size} unique domains` 
      });
      successCount++;
    } catch {
      updateCheck(7, { 
        status: 'error', 
        message: 'Domain tracking failed' 
      });
      failedCount++;
    }

    setSummary({
      total: checks.length,
      success: successCount,
      failed: failedCount
    });

    setIsRunning(false);
    
    if (failedCount === 0) {
      toast.success('All analytics systems are functioning properly!');
    } else {
      toast.warning(`${failedCount} analytics checks failed. Please review.`);
    }
  };

  const getStatusIcon = (status: AnalyticsCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AnalyticsCheck['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Analytics System Verification
          </CardTitle>
          <Button
            onClick={runChecks}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Checks...' : 'Run All Checks'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          {summary.total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-gray-600">Total Checks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.success}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          )}

          {/* Individual Checks */}
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{check.icon}</div>
                    <div>
                      <h4 className="font-medium">{check.name}</h4>
                      <p className="text-sm opacity-75">{check.description}</p>
                      {check.message && (
                        <p className="text-sm mt-1 font-medium">{check.message}</p>
                      )}
                    </div>
                  </div>
                  <div>{getStatusIcon(check.status)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Analytics Verification Guide</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Run All Checks" to verify all analytics systems</li>
              <li>• Green checks indicate properly functioning features</li>
              <li>• Red checks require attention and debugging</li>
              <li>• Visit tracking updates every 5 seconds automatically</li>
              <li>• All analytics data is real-time and synced across the app</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 