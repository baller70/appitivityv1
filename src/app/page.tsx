import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardStats from '@/components/dashboard/DashboardStats'
import BookmarkGrid from '@/components/bookmarks/BookmarkGrid'

export const metadata = {
  title: 'BookmarkHub - Your Digital Workspace',
  description: 'Organize and manage your bookmarks efficiently',
}

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Main Stats */}
        <DashboardStats />
        
        {/* Bookmarks Grid */}
        <BookmarkGrid />
      </div>
    </DashboardLayout>
  )
} 