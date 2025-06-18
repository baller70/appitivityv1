'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import EnhancedBookmarkSettings from '@/components/settings/enhanced-bookmark-settings'

export default function SettingsPage() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedBookmarkSettings userId={user?.id} />
    </div>
  )
} 