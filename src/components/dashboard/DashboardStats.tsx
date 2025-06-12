import React from 'react'
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
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${
                stat.changeType === 'positive' ? 'text-green-400' : 'text-white'
              }`}>
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 