'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Brain, 
  Filter, 
  Building2, 
  TrendingUp, 
  Search,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'

interface Industry {
  id: string
  name: string
  description: string
  keywords: string[]
  color: string
  confidence?: number
}

const industries: Industry[] = [
  {
    id: 'tech',
    name: 'Technology',
    description: 'Software, hardware, AI, and digital innovation',
    keywords: ['software', 'AI', 'tech', 'programming', 'digital', 'startup'],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    description: 'Financial services, banking, investment, fintech',
    keywords: ['finance', 'banking', 'investment', 'fintech', 'crypto', 'trading'],
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical, pharmaceutical, biotech, wellness',
    keywords: ['health', 'medical', 'pharma', 'biotech', 'wellness', 'medicine'],
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learning, training, academic, e-learning',
    keywords: ['education', 'learning', 'training', 'academic', 'course', 'university'],
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Digital marketing, advertising, sales, growth',
    keywords: ['marketing', 'advertising', 'sales', 'growth', 'branding', 'social media'],
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'design',
    name: 'Design & Creative',
    description: 'UI/UX, graphic design, creative arts',
    keywords: ['design', 'UI', 'UX', 'creative', 'art', 'graphics', 'branding'],
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'business',
    name: 'Business & Management',
    description: 'Strategy, operations, consulting, leadership',
    keywords: ['business', 'management', 'strategy', 'consulting', 'leadership', 'operations'],
    color: 'bg-gray-100 text-gray-800'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & Retail',
    description: 'Online retail, marketplace, shopping',
    keywords: ['ecommerce', 'retail', 'shopping', 'marketplace', 'store', 'commerce'],
    color: 'bg-yellow-100 text-yellow-800'
  }
]

export default function IndustryFilter() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<Industry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeBookmarksWithAI = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate AI analysis of user's bookmarks
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI suggestions based on bookmark analysis
      const suggestions = [
        { ...industries[0], confidence: 0.92 },
        { ...industries[1], confidence: 0.78 },
        { ...industries[4], confidence: 0.65 }
      ]
      
      setAiSuggestions(suggestions)
      toast.success('AI analysis complete! Found industry preferences.')
    } catch (error) {
      toast.error('Failed to analyze bookmarks')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleIndustryToggle = (industryId: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    )
  }

  const applyAISuggestion = (industryId: string) => {
    if (!selectedIndustries.includes(industryId)) {
      setSelectedIndustries(prev => [...prev, industryId])
      toast.success('Industry preference added!')
    }
  }

  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    industry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    industry.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <span>AI Industry Filter</span>
          </h2>
          <p className="text-muted-foreground">
            Filter bookmarks by industry using AI-powered categorization
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {selectedIndustries.length} selected
        </Badge>
      </div>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI-Powered Analysis</span>
          </CardTitle>
          <CardDescription>
            Let AI analyze your bookmarks to suggest relevant industries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={analyzeBookmarksWithAI}
            disabled={isAnalyzing}
            className="w-full md:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Bookmarks...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze My Bookmarks
              </>
            )}
          </Button>

          {aiSuggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">AI Suggestions:</h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {aiSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={suggestion.color}>
                        {suggestion.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((suggestion.confidence || 0) * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyAISuggestion(suggestion.id)}
                      disabled={selectedIndustries.includes(suggestion.id)}
                    >
                      {selectedIndustries.includes(suggestion.id) ? 'Added' : 'Add Filter'}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search industries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </div>

      {/* Industry Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredIndustries.map((industry) => (
          <Card 
            key={industry.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedIndustries.includes(industry.id) 
                ? 'ring-2 ring-primary bg-primary/5' 
                : ''
            }`}
            onClick={() => handleIndustryToggle(industry.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Checkbox 
                  checked={selectedIndustries.includes(industry.id)}
                  onChange={() => {}} // Handled by card click
                />
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <Badge className={industry.color}>
                  {industry.name}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {industry.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {industry.keywords.slice(0, 3).map((keyword) => (
                    <span 
                      key={keyword}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Filters Summary */}
      {selectedIndustries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Active Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedIndustries.map((industryId) => {
                const industry = industries.find(i => i.id === industryId)
                return industry ? (
                  <Badge 
                    key={industryId}
                    className={industry.color}
                    variant="secondary"
                  >
                    {industry.name}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleIndustryToggle(industryId)
                      }}
                      className="ml-2 hover:bg-black/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 