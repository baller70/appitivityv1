'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Users,
  Bookmark,
  Eye,
  MousePointer,
  Timer,
  Award,
  Zap
} from 'lucide-react'

interface TrackerData {
  totalBookmarks: number
  weeklyGoal: number
  dailyAverage: number
  streakDays: number
  categoriesUsed: number
  timeSpent: number
  clickThroughRate: number
  favoriteCategory: string
}

interface ActivityLog {
  id: string
  action: string
  bookmark: string
  timestamp: string
  category: string
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  deadline: string
  category: string
  completed: boolean
}

const mockTrackerData: TrackerData = {
  totalBookmarks: 156,
  weeklyGoal: 25,
  dailyAverage: 3.2,
  streakDays: 12,
  categoriesUsed: 8,
  timeSpent: 45,
  clickThroughRate: 68,
  favoriteCategory: 'Development'
}

const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    action: 'Added bookmark',
    bookmark: 'React 19 Documentation',
    timestamp: '2 minutes ago',
    category: 'Development'
  },
  {
    id: '2',
    action: 'Visited bookmark',
    bookmark: 'Figma Design System',
    timestamp: '15 minutes ago',
    category: 'Design'
  },
  {
    id: '3',
    action: 'Shared bookmark',
    bookmark: 'AI Tools Collection',
    timestamp: '1 hour ago',
    category: 'AI'
  },
  {
    id: '4',
    action: 'Created folder',
    bookmark: 'Machine Learning Resources',
    timestamp: '2 hours ago',
    category: 'AI'
  }
]

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Add 25 bookmarks this week',
    target: 25,
    current: 18,
    deadline: '2024-01-07',
    category: 'General',
    completed: false
  },
  {
    id: '2',
    title: 'Organize 50 bookmarks',
    target: 50,
    current: 32,
    deadline: '2024-01-10',
    category: 'Organization',
    completed: false
  },
  {
    id: '3',
    title: 'Visit 100 saved bookmarks',
    target: 100,
    current: 100,
    deadline: '2024-01-05',
    category: 'Engagement',
    completed: true
  }
]

export default function BookmarkTracker() {
  const [trackerData, setTrackerData] = useState<TrackerData>(mockTrackerData)
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(mockActivityLog)
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Tracker data refreshed!')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }

  const weeklyProgress = (trackerData.totalBookmarks % trackerData.weeklyGoal) / trackerData.weeklyGoal * 100
  const completedGoals = goals.filter(goal => goal.completed).length
  const activeGoals = goals.filter(goal => !goal.completed).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span>Bookmark Tracker</span>
          </h2>
          <p className="text-muted-foreground">
            Track your bookmark usage, goals, and productivity metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} disabled={isLoading}>
            {isLoading ? (
              <Timer className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookmarks</p>
                <p className="text-2xl font-bold">{trackerData.totalBookmarks}</p>
              </div>
              <Bookmark className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Progress value={weeklyProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(weeklyProgress)}% of weekly goal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{trackerData.dailyAverage}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{trackerData.streakDays} days</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Keep going! Personal best: 18 days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{trackerData.clickThroughRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                Above average
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Goals Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Goals & Targets</span>
            </CardTitle>
            <CardDescription>
              Track your bookmark goals and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{goal.title}</span>
                    {goal.completed && (
                      <Badge variant="default" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <Progress 
                  value={(goal.current / goal.target) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Category: {goal.category}</span>
                  <span>Due: {goal.deadline}</span>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{activeGoals}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest bookmark actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLog.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.bookmark}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4">
              View Full Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Category Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Development', count: 45, color: 'bg-blue-500' },
                { name: 'Design', count: 32, color: 'bg-green-500' },
                { name: 'AI/ML', count: 28, color: 'bg-purple-500' },
                { name: 'Business', count: 24, color: 'bg-orange-500' },
                { name: 'Other', count: 27, color: 'bg-gray-500' }
              ].map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${(category.count / 156) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Usage Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time spent browsing</span>
                <span className="font-medium">{trackerData.timeSpent} min/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categories used</span>
                <span className="font-medium">{trackerData.categoriesUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Favorite category</span>
                <Badge variant="secondary">{trackerData.favoriteCategory}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Most active day</span>
                <span className="font-medium">Tuesday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Peak usage time</span>
                <span className="font-medium">2-4 PM</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 