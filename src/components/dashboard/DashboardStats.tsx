import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';

interface DashboardStatsProps {
  bookmarks: BookmarkWithRelations[];
}

export default function DashboardStats({ bookmarks }: DashboardStatsProps) {
  // Calculate real stats from bookmarks data
  const totalBookmarks = bookmarks.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthBookmarks = bookmarks.filter(bookmark => {
    if (!bookmark.created_at) return false;
    const bookmarkDate = new Date(bookmark.created_at);
    return bookmarkDate.getMonth() === currentMonth && bookmarkDate.getFullYear() === currentYear;
  }).length;
  
  const favoriteBookmarks = bookmarks.filter(bookmark => bookmark.is_favorite).length;
  const totalVisits = bookmarks.reduce((sum, bookmark) => sum + (bookmark.visit_count || 0), 0);

  const stats = [
    {
      title: 'Total Bookmarks',
      value: totalBookmarks.toString(),
      change: null,
      changeType: null
    },
    {
      title: 'This Month',
      value: `+${thisMonthBookmarks}`,
      change: null,
      changeType: 'positive'
    },
    {
      title: 'Total Visits',
      value: totalVisits.toString(),
      change: null,
      changeType: null
    },
    {
      title: 'Favorites',
      value: favoriteBookmarks.toString(),
      change: null,
      changeType: null
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card/50 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {stat.title}
            </p>
            <p
              className={cn(
                'text-2xl font-bold',
                stat.changeType === 'positive' ? 'text-green-500' : 'text-foreground'
              )}
            >
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 