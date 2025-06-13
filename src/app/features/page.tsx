'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Globe, 
  Brain, 
  TabletSmartphone, 
  Languages, 
  Share2, 
  BarChart3, 
  Settings, 
  DollarSign,
  Zap,
  Filter,
  Save,
  Palette,
  TrendingUp,
  Users
} from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'ai' | 'productivity' | 'social' | 'analytics' | 'monetization'
  status: 'available' | 'coming-soon'
  path: string
}

const features: Feature[] = [
  {
    id: 'third-party-integrations',
    title: 'Third-Party Integrations',
    description: 'Connect with popular services like Pocket, GitHub, Twitter, and more',
    icon: <Globe className="h-6 w-6" />,
    category: 'productivity',
    status: 'available',
    path: '/features/integrations'
  },
  {
    id: 'ai-industry-filter',
    title: 'AI Industry Filter',
    description: 'Automatically categorize bookmarks by industry using AI',
    icon: <Brain className="h-6 w-6" />,
    category: 'ai',
    status: 'available',
    path: '/features/ai-filter'
  },
  {
    id: 'tab-saver',
    title: 'Save Current Tabs',
    description: 'Bulk save all open browser tabs as organized bookmarks',
    icon: <TabletSmartphone className="h-6 w-6" />,
    category: 'productivity',
    status: 'available',
    path: '/features/tab-saver'
  },
  {
    id: 'multilingual',
    title: 'Multilingual Support',
    description: 'Translate bookmarks and interface to 12+ languages',
    icon: <Languages className="h-6 w-6" />,
    category: 'productivity',
    status: 'available',
    path: '/features/multilingual'
  },
  {
    id: 'social-layout',
    title: 'Social Media Layout',
    description: 'Social media-style interface with likes, shares, and comments',
    icon: <Share2 className="h-6 w-6" />,
    category: 'social',
    status: 'available',
    path: '/features/social'
  },
  {
    id: 'bookmark-tracker',
    title: 'Bookmark Analytics',
    description: 'Track usage patterns, goals, and detailed analytics',
    icon: <BarChart3 className="h-6 w-6" />,
    category: 'analytics',
    status: 'available',
    path: '/features/analytics'
  },
  {
    id: 'enhanced-settings',
    title: 'Enhanced Settings',
    description: 'Comprehensive configuration options for appearance and behavior',
    icon: <Settings className="h-6 w-6" />,
    category: 'productivity',
    status: 'available',
    path: '/features/settings'
  },
  {
    id: 'marketplace',
    title: 'Bookmark Marketplace',
    description: 'Create, sell, and purchase curated bookmark collections',
    icon: <DollarSign className="h-6 w-6" />,
    category: 'monetization',
    status: 'available',
    path: '/features/marketplace'
  }
]

const categoryColors = {
  ai: 'bg-purple-100 text-purple-800 border-purple-200',
  productivity: 'bg-blue-100 text-blue-800 border-blue-200',
  social: 'bg-green-100 text-green-800 border-green-200',
  analytics: 'bg-orange-100 text-orange-800 border-orange-200',
  monetization: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const categoryIcons = {
  ai: <Zap className="h-4 w-4" />,
  productivity: <Save className="h-4 w-4" />,
  social: <Users className="h-4 w-4" />,
  analytics: <TrendingUp className="h-4 w-4" />,
  monetization: <DollarSign className="h-4 w-4" />
}

export default function FeaturesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Features', count: features.length },
    { id: 'ai', name: 'AI & Smart', count: features.filter(f => f.category === 'ai').length },
    { id: 'productivity', name: 'Productivity', count: features.filter(f => f.category === 'productivity').length },
    { id: 'social', name: 'Social', count: features.filter(f => f.category === 'social').length },
    { id: 'analytics', name: 'Analytics', count: features.filter(f => f.category === 'analytics').length },
    { id: 'monetization', name: 'Monetization', count: features.filter(f => f.category === 'monetization').length }
  ]

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory)

  const handleFeatureClick = (feature: Feature) => {
    window.location.href = feature.path
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bookmark Features
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore powerful features to enhance your bookmark management experience
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {category.id !== 'all' && categoryIcons[category.id as keyof typeof categoryIcons]}
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleFeatureClick(feature)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    {feature.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={categoryColors[feature.category]}
                    >
                      {feature.category}
                    </Badge>
                    {feature.status === 'available' ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900 transition-colors"
                  disabled={feature.status === 'coming-soon'}
                >
                  {feature.status === 'available' ? 'Open Feature' : 'Coming Soon'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{features.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Features</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {features.filter(f => f.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available Now</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {features.filter(f => f.category === 'ai').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI-Powered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(categoryColors).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 