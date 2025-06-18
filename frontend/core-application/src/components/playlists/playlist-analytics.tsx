'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  Play, 
  Eye, 
  Share2,
  Download,
  Heart,
  Calendar,
  Target,
  Zap,
  Award,
  Activity,
  Plus
} from 'lucide-react'

interface PlaylistAnalytics {
  totalPlaylists: number
  totalLaunches: number
  totalBookmarks: number
  averagePlaylistSize: number
  mostPopularPlaylist: {
    id: string
    name: string
    launches: number
    bookmarkCount: number
  }
  recentActivity: Array<{
    id: string
    type: 'created' | 'launched' | 'shared' | 'favorited'
    playlistName: string
    timestamp: string
    details?: string
  }>
  performanceMetrics: {
    launchesThisWeek: number
    launchesLastWeek: number
    createdThisMonth: number
    createdLastMonth: number
    averageLaunchTime: number
    successRate: number
  }
  topCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  usagePatterns: {
    peakHours: Array<{ hour: number; launches: number }>
    weeklyDistribution: Array<{ day: string; launches: number }>
    deviceTypes: Array<{ type: string; percentage: number }>
  }
}

export function PlaylistAnalytics() {
  const [analytics, setAnalytics] = useState<PlaylistAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Mock analytics data - in real implementation, this would come from API
      const mockAnalytics: PlaylistAnalytics = {
        totalPlaylists: 24,
        totalLaunches: 156,
        totalBookmarks: 342,
        averagePlaylistSize: 14.3,
        mostPopularPlaylist: {
          id: '1',
          name: 'Daily Development Tools',
          launches: 45,
          bookmarkCount: 18
        },
        recentActivity: [
          {
            id: '1',
            type: 'launched',
            playlistName: 'Morning Routine',
            timestamp: '2024-01-15T09:30:00Z',
            details: '12 bookmarks opened'
          },
          {
            id: '2',
            type: 'created',
            playlistName: 'Design Inspiration',
            timestamp: '2024-01-15T08:15:00Z',
            details: '8 bookmarks added'
          },
          {
            id: '3',
            type: 'shared',
            playlistName: 'React Resources',
            timestamp: '2024-01-14T16:45:00Z',
            details: 'Shared with team'
          }
        ],
        performanceMetrics: {
          launchesThisWeek: 32,
          launchesLastWeek: 28,
          createdThisMonth: 6,
          createdLastMonth: 4,
          averageLaunchTime: 2.3,
          successRate: 94.5
        },
        topCategories: [
          { category: 'Development', count: 8, percentage: 33.3 },
          { category: 'Design', count: 6, percentage: 25.0 },
          { category: 'Productivity', count: 5, percentage: 20.8 },
          { category: 'Learning', count: 3, percentage: 12.5 },
          { category: 'Entertainment', count: 2, percentage: 8.3 }
        ],
        usagePatterns: {
          peakHours: [
            { hour: 9, launches: 25 },
            { hour: 14, launches: 18 },
            { hour: 16, launches: 22 },
            { hour: 20, launches: 15 }
          ],
          weeklyDistribution: [
            { day: 'Mon', launches: 28 },
            { day: 'Tue', launches: 32 },
            { day: 'Wed', launches: 25 },
            { day: 'Thu', launches: 30 },
            { day: 'Fri', launches: 22 },
            { day: 'Sat', launches: 12 },
            { day: 'Sun', launches: 7 }
          ],
          deviceTypes: [
            { type: 'Desktop', percentage: 68 },
            { type: 'Mobile', percentage: 24 },
            { type: 'Tablet', percentage: 8 }
          ]
        }
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'launched': return <Play className="h-4 w-4 text-green-500" />
      case 'created': return <Plus className="h-4 w-4 text-blue-500" />
      case 'shared': return <Share2 className="h-4 w-4 text-purple-500" />
      case 'favorited': return <Heart className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const growthRate = ((analytics.performanceMetrics.launchesThisWeek - analytics.performanceMetrics.launchesLastWeek) / analytics.performanceMetrics.launchesLastWeek * 100)
  const creationGrowth = ((analytics.performanceMetrics.createdThisMonth - analytics.performanceMetrics.createdLastMonth) / analytics.performanceMetrics.createdLastMonth * 100)

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Playlist Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Playlists</p>
                <p className="text-2xl font-bold">{analytics.totalPlaylists}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{creationGrowth.toFixed(1)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Launches</p>
                <p className="text-2xl font-bold">{analytics.totalLaunches}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{growthRate.toFixed(1)}% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Playlist Size</p>
                <p className="text-2xl font-bold">{analytics.averagePlaylistSize}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">bookmarks per playlist</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.successRate}%</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={analytics.performanceMetrics.successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Popular Playlist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Most Popular Playlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{analytics.mostPopularPlaylist.name}</h3>
                    <p className="text-gray-600">{analytics.mostPopularPlaylist.bookmarkCount} bookmarks</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Launches</span>
                    <Badge variant="secondary">{analytics.mostPopularPlaylist.launches}</Badge>
                  </div>
                  <Progress value={(analytics.mostPopularPlaylist.launches / analytics.totalLaunches) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Usage Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Usage Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Peak Hours</h4>
                    <div className="space-y-2">
                      {analytics.usagePatterns.peakHours.map((hour) => (
                        <div key={hour.hour} className="flex items-center justify-between">
                          <span className="text-sm">{hour.hour}:00</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(hour.launches / Math.max(...analytics.usagePatterns.peakHours.map(h => h.launches))) * 100} className="w-20 h-2" />
                            <span className="text-sm text-gray-600">{hour.launches}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.usagePatterns.weeklyDistribution.map((day) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{day.day}</span>
                      <div className="flex items-center gap-2 flex-1">
                        <Progress 
                          value={(day.launches / Math.max(...analytics.usagePatterns.weeklyDistribution.map(d => d.launches))) * 100} 
                          className="flex-1 h-3" 
                        />
                        <span className="text-sm text-gray-600 w-8">{day.launches}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.usagePatterns.deviceTypes.map((device) => (
                    <div key={device.type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{device.type}</span>
                        <span className="text-sm text-gray-600">{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.count} playlists</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                    <Badge variant="outline">{category.percentage.toFixed(1)}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.playlistName}</span>
                        <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{activity.type}</p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 