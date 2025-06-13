'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import TabSaver from '@/components/utilities/tab-saver'

export default function TabSaverPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Save Current Tabs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bulk save all open browser tabs as organized bookmarks
          </p>
        </div>

        {/* Feature Component */}
        <TabSaver />
      </div>
    </div>
  )
} 