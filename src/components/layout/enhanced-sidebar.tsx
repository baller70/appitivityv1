/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Home, 
  BarChart3, 
  Heart, 
  Settings,
  Search,
  Menu,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Folder,
  Tag,
  Calendar,
  Activity,
  Zap,
  Target,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  Eye,
  Hash,
  Star,
  Users,
  User,
  LogOut,
  Bookmark,
  Brain,
  Play,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BookmarkWithRelations } from '@/lib/services/bookmarks';
import type { Folder as FolderType, Tag as TagType } from '@/types/supabase';

interface EnhancedSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  bookmarks: BookmarkWithRelations[];
  folders: FolderType[];
  tags: TagType[];
  onNavigate: (path: string) => void;
  currentPath: string;
  onAddBookmark: () => void;
}

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  color: string;
  tooltip?: string;
  progress?: number;
}

interface CategoryStat {
  name: string;
  count: number;
  percentage: number;
  trend: number;
  icon?: React.ElementType;
  color: string;
}

export function EnhancedSidebar({
  isCollapsed,
  onToggle,
  bookmarks,
  folders,
  tags,
  onNavigate,
  currentPath,
  onAddBookmark
}: EnhancedSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    navigation: true,
    categories: true,
    stats: true,
    insights: false
  });
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = new Date(currentYear, currentMonth - 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalBookmarks = bookmarks.length;
    const favoriteBookmarks = bookmarks.filter(b => b.is_favorite).length;
    const archivedBookmarks = bookmarks.filter(b => b.is_archived).length;
    const activeBookmarks = totalBookmarks - archivedBookmarks;

    // Time-based stats
    const thisMonthBookmarks = bookmarks.filter(b => {
      if (!b.created_at) return false;
      const date = new Date(b.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const lastMonthBookmarks = bookmarks.filter(b => {
      if (!b.created_at) return false;
      const date = new Date(b.created_at);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }).length;

    const thisWeekBookmarks = bookmarks.filter(b => {
      if (!b.created_at) return false;
      return new Date(b.created_at) > weekAgo;
    }).length;

    const recentBookmarks = bookmarks.filter(b => {
      if (!b.created_at) return false;
      return new Date(b.created_at) > monthAgo;
    }).length;

    // Visit stats
    const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
    const avgVisitsPerBookmark = totalBookmarks > 0 ? Math.round(totalVisits / totalBookmarks) : 0;
    const mostVisited = [...bookmarks].sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))[0];

    // Domain stats
    const uniqueDomains = new Set(bookmarks.map(b => {
      try {
        return new URL(b.url).hostname.replace('www.', '');
      } catch {
        return 'invalid';
      }
    })).size;

    // Folder stats
    const foldersWithBookmarks = new Set(bookmarks.map(b => b.folder_id).filter(Boolean)).size;
    const emptyFolders = folders.length - foldersWithBookmarks;

    // Tag stats
    const totalTags = tags.length;
    const usedTags = new Set(bookmarks.flatMap(b => b.tags?.map((t: any) => t.id) || [])).size;
    const unusedTags = totalTags - usedTags;

    // Growth calculations
    const monthlyGrowth = lastMonthBookmarks > 0 
      ? Math.round(((thisMonthBookmarks - lastMonthBookmarks) / lastMonthBookmarks) * 100)
      : thisMonthBookmarks > 0 ? 100 : 0;

    const weeklyGrowth = thisWeekBookmarks > 0 ? Math.round((thisWeekBookmarks / Math.max(1, activeBookmarks)) * 100) : 0;

    // Engagement score (0-100)
    const engagementScore = Math.min(100, Math.round(
      (avgVisitsPerBookmark * 10) + 
      (favoriteBookmarks / Math.max(1, totalBookmarks) * 30) +
      (recentBookmarks / Math.max(1, totalBookmarks) * 20) +
      (usedTags / Math.max(1, totalTags) * 20) +
      (foldersWithBookmarks / Math.max(1, folders.length) * 20)
    ));

    // Category breakdown
    const categoryStats = folders.reduce((acc, folder) => {
      const folderBookmarks = bookmarks.filter(b => b.folder_id === folder.id);
      const count = folderBookmarks.length;
      const visits = folderBookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
      const recentCount = folderBookmarks.filter(b => {
        if (!b.created_at) return false;
        return new Date(b.created_at) > weekAgo;
      }).length;

      acc[folder.name] = {
        count,
        visits,
        recent: recentCount,
        percentage: totalBookmarks > 0 ? Math.round((count / totalBookmarks) * 100) : 0
      } as any;
      return acc;
    }, {} as Record<string, { count: number; visits: number; recent: number; percentage: number }>);

    return {
      totalBookmarks,
      activeBookmarks,
      favoriteBookmarks,
      archivedBookmarks,
      thisMonthBookmarks,
      lastMonthBookmarks,
      thisWeekBookmarks,
      recentBookmarks,
      totalVisits,
      avgVisitsPerBookmark,
      mostVisited,
      uniqueDomains,
      foldersWithBookmarks,
      emptyFolders,
      usedTags,
      unusedTags,
      monthlyGrowth,
      weeklyGrowth,
      engagementScore,
      categoryStats
    };
  }, [bookmarks, folders, tags]);

  // Navigation items with dynamic counts
  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      active: currentPath === '/dashboard'
    },
    { 
      name: 'AI Co-pilot', 
      icon: Brain, 
      path: '/ai-copilot',
      active: currentPath === '/ai-copilot'
    },
    { 
      name: 'Feature', 
      icon: Zap, 
      path: '/feature',
      active: currentPath === '/feature'
    },
    { 
      name: 'Marketplace', 
      icon: CreditCard, 
      path: '/marketplace',
      active: currentPath === '/marketplace'
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/features/settings',
      active: currentPath === '/features/settings' || currentPath === '/settings'
    },
  ];

  // Key stats for display
  const keyStats: StatItem[] = [
    {
      label: 'Total Bookmarks',
      value: stats.totalBookmarks,
      change: stats.monthlyGrowth,
      changeType: stats.monthlyGrowth > 0 ? 'positive' : stats.monthlyGrowth < 0 ? 'negative' : 'neutral',
      icon: Globe,
      color: 'text-blue-600',
      tooltip: `${stats.thisMonthBookmarks} added this month`
    },
    {
      label: 'Favorites',
      value: stats.favoriteBookmarks,
      icon: Heart,
      color: 'text-red-600',
      tooltip: `${Math.round((stats.favoriteBookmarks / Math.max(1, stats.totalBookmarks)) * 100)}% of total bookmarks`,
      progress: (stats.favoriteBookmarks / Math.max(1, stats.totalBookmarks)) * 100
    },
    {
      label: 'Total Visits',
      value: stats.totalVisits,
      icon: Activity,
      color: 'text-green-600',
      tooltip: `Average ${stats.avgVisitsPerBookmark} visits per bookmark`
    },
    {
      label: 'Engagement',
      value: `${stats.engagementScore}%`,
      icon: Target,
      color: 'text-purple-600',
      tooltip: 'Based on visits, favorites, and organization',
      progress: stats.engagementScore
    }
  ];

  // Category list for display
  const categoryList: CategoryStat[] = Object.entries(stats.categoryStats)
    .map(([name, data]) => ({
      name: name.toUpperCase(),
      count: data.count,
      percentage: data.percentage,
      trend: data.recent,
      color: getFolderColor(name),
      icon: Folder
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  function getFolderColor(folderName: string): string {
    const colors = {
      'DEVELOPMENT': '#3b82f6',
      'DESIGN': '#8b5cf6',
      'PRODUCTIVITY': '#10b981',
      'LEARNING': '#f59e0b',
      'ENTERTAINMENT': '#ef4444'
    };
    return colors[folderName.toUpperCase() as keyof typeof colors] || '#6b7280';
  }

  // Insights
  const insights = [
    {
      label: 'Engagement Score',
      value: `${stats.engagementScore}%`,
      icon: Zap,
      color: stats.engagementScore >= 70 ? 'text-green-600' : stats.engagementScore >= 40 ? 'text-yellow-600' : 'text-red-600',
      progress: stats.engagementScore
    },
    {
      label: 'Most Visited',
      value: stats.mostVisited?.title || 'None',
      icon: Award,
      color: 'text-purple-600',
      tooltip: stats.mostVisited ? `${stats.mostVisited.visit_count} visits` : undefined
    },
    {
      label: 'Folder Usage',
      value: `${stats.foldersWithBookmarks}/${folders.length}`,
      icon: Folder,
      color: 'text-blue-600',
      progress: folders.length > 0 ? (stats.foldersWithBookmarks / folders.length) * 100 : 0
    },
    {
      label: 'Tag Usage',
      value: `${stats.usedTags}/${tags.length}`,
      icon: Tag,
      color: 'text-green-600',
      progress: tags.length > 0 ? (stats.usedTags / tags.length) * 100 : 0
    }
  ];

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, this would refetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Collapsed Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <Menu className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand Sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Collapsed Navigation */}
          <div className="flex-1 p-2 space-y-2">
            {navigationItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-10 p-0"
                    onClick={() => onNavigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Collapsed Add Button */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="w-full h-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={onAddBookmark}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Bookmark</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col h-full",
        isCollapsed ? "w-16" : "w-80"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bookmark className="h-4 w-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-gray-900 dark:text-white">BookmarkHub</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <div className="p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={currentPath === item.path ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "px-2"
                  )}
                  onClick={() => onNavigate(item.path)}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.name}
                </Button>
              ))}
            </div>
          </div>



          {/* Categories */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categories
              </h2>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-5 w-5 p-0"
                >
                  <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('categories')}
                  className="h-5 w-5 p-0"
                >
                  {expandedSections.categories ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedSections.categories && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {categoryList.map((category, index) => (
                    <motion.div
                      key={`${category.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                      onClick={() => onNavigate(`/category/${category.name.toLowerCase()}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {category.icon && <category.icon className={cn("h-4 w-4", category.color)} />}
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                          {category.trend !== 0 && (
                            <div className={cn(
                              "flex items-center",
                              category.trend > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {category.trend > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {category.percentage > 0 && (
                        <div className="mx-3 mt-1">
                          <Progress value={category.percentage} className="h-1" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Stats */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statistics
              </h2>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-5 w-5 p-0"
                >
                  <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('stats')}
                  className="h-5 w-5 p-0"
                >
                  {expandedSections.stats ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedSections.stats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {keyStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <stat.icon className={cn("h-4 w-4", stat.color)} />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</span>
                        </div>
                        {stat.tooltip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{stat.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </span>
                        {stat.change !== undefined && (
                          <div className={cn(
                            "flex items-center space-x-1 text-xs",
                            stat.changeType === 'positive' && "text-green-600",
                            stat.changeType === 'negative' && "text-red-600",
                            stat.changeType === 'neutral' && "text-gray-500"
                          )}>
                            {stat.changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                            {stat.changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                            <span>{Math.abs(stat.change)}%</span>
                          </div>
                        )}
                      </div>
                      {stat.progress !== undefined && (
                        <Progress value={stat.progress} className="h-1 mt-2" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Insights */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Insights
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('insights')}
                className="h-5 w-5 p-0"
              >
                {expandedSections.insights ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedSections.insights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {insights.map((insight, index) => (
                    <motion.div
                      key={insight.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <insight.icon className={cn("h-4 w-4", insight.color)} />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{insight.label}</span>
                        </div>
                        {insight.tooltip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{insight.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn("text-sm font-medium", insight.color)}>
                          {insight.value}
                        </span>
                      </div>
                      {insight.progress !== undefined && (
                        <Progress value={insight.progress} className="h-1" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Player DNA Profile at Bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => onNavigate('dna-profile')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none text-gray-900 dark:text-white truncate">
                  User DNA
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  View your profile insights
                </p>
              </div>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  signOut();
                }}
                className="h-8 w-8 p-0 flex-shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 