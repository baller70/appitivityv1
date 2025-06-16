'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/api/client';
import { BookmarkHubDashboard } from './bookmark-hub-dashboard';
import { AnalyticsPage } from '../analytics/analytics-page';
import { FavoritesPage } from '../favorites/favorites-page';
import { SettingsPage } from '../settings/settings-page';
import { EnhancedSearchDashboard } from '../search/enhanced-search-dashboard';
import { TimeCapsulePage } from '../time-capsule/time-capsule-page';
import DnaTabs from '../dna-profile/dna-tabs';
import DnaProfilePage from '../dna-profile/dna-profile-page';
import { 
  BarChart3, 
  Heart, 
  Settings, 
  Search, 
  User, 
  AlertCircle,
  Loader2,
  Package,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder, Tag } from '../../types/supabase';
import { CopilotPage } from '../ai/copilot-page';
import { ThemeAccentControls } from '@/components/ui/ThemeAccentControls'

interface DashboardMainProps {
  userId: string;
  userData: {
    id: string;
    firstName: string | null;
    email: string | undefined;
  };
}

export function DashboardMain({ userId, userData }: DashboardMainProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'favorites' | 'settings' | 'search' | 'time-capsule' | 'dna-profile' | 'copilot'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    bookmarks: BookmarkWithRelations[];
    folders: Folder[];
    tags: Tag[];
    stats: {
      totalBookmarks: number;
      thisMonth: number;
      favorites: number;
      totalVisits: number;
    };
  }>({
    bookmarks: [],
    folders: [],
    tags: [],
    stats: {
      totalBookmarks: 0,
      thisMonth: 0,
      favorites: 0,
      totalVisits: 0
    }
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure user profile exists
      await apiClient.ensureUserProfile(
        userId,
        userData.email || 'user@example.com',
        userData.firstName || 'User'
      );
      
      // Load all dashboard data
      const [bookmarks, folders, tags] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders(),
        apiClient.getTags()
      ]);

      // Calculate stats
      const stats = {
        totalBookmarks: bookmarks.length,
        thisMonth: bookmarks.filter(b => {
          if (!b.created_at) return false;
          const bookmarkDate = new Date(b.created_at);
          const thisMonth = new Date();
          return bookmarkDate.getMonth() === thisMonth.getMonth() && 
                 bookmarkDate.getFullYear() === thisMonth.getFullYear();
        }).length,
        favorites: bookmarks.filter(b => b.is_favorite).length,
        totalVisits: bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0)
      };

      setDashboardData({
        bookmarks,
        folders,
        tags,
        stats
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load dashboard: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userData.email, userData.firstName]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'time-capsule', label: 'Time Capsule', icon: Package },
    { id: 'dna-profile', label: 'DNA Profile', icon: Brain },
    { id: 'copilot', label: 'AI Copilot', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Dashboard Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDashboardData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <BookmarkHubDashboard 
            userId={userId} 
            userData={userData}
            onNavigate={(path) => setActiveTab(path as typeof activeTab)}
          />
        );
      case 'analytics':
        return <AnalyticsPage userId={userId} />;
      case 'favorites':
        return <FavoritesPage userId={userId} />;
      case 'search':
        return <EnhancedSearchDashboard userId={userId} />;
      case 'time-capsule':
        return <TimeCapsulePage />;
      case 'dna-profile':
        return (
          <>
            <DnaTabs />
            <DnaProfilePage />
          </>
        );
      case 'copilot':
        return <CopilotPage />;
      case 'settings':
        return <SettingsPage userId={userId} />;
      default:
        return (
          <BookmarkHubDashboard 
            userId={userId} 
            userData={userData}
            onNavigate={(path) => setActiveTab(path as typeof activeTab)}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {renderActiveComponent()}
      </div>
    </div>
  );
}