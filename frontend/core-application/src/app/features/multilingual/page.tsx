'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import LanguageSelector from '@/components/i18n/language-selector'
import BookmarkTranslator from '@/components/i18n/bookmark-translator'

export default function MultilingualPage() {
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
            Multilingual Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Translate bookmarks and interface to 12+ languages with RTL support
          </p>
        </div>

        {/* Feature Components */}
        <div className="space-y-8">
          <LanguageSelector />
          <BookmarkTranslator />
        </div>
      </div>
    </div>
  )
} 