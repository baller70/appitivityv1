'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { AIFilterService } from '@/lib/services/ai-filter'
import { 
  Brain, 
  Filter, 
  Sparkles, 
  FolderPlus, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Building2,
  Palette,
  GraduationCap,
  Heart,
  DollarSign,
  Play,
  Newspaper,
  ShoppingCart,
  Zap
} from 'lucide-react'

interface IndustryFilterDialogProps {
  trigger?: React.ReactNode
}

const industryIcons: Record<string, React.ComponentType<any>> = {
  'Technology': Zap,
  'Design': Palette,
  'Business': Building2,
  'Education': GraduationCap,
  'Productivity': TrendingUp,
  'Healthcare': Heart,
  'Finance': DollarSign,
  'Entertainment': Play,
  'News & Media': Newspaper,
  'E-commerce': ShoppingCart
}

const industryColors: Record<string, string> = {
  'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
  'Design': 'bg-purple-100 text-purple-800 border-purple-200',
  'Business': 'bg-green-100 text-green-800 border-green-200',
  'Education': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Productivity': 'bg-orange-100 text-orange-800 border-orange-200',
  'Healthcare': 'bg-red-100 text-red-800 border-red-200',
  'Finance': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Entertainment': 'bg-pink-100 text-pink-800 border-pink-200',
  'News & Media': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'E-commerce': 'bg-cyan-100 text-cyan-800 border-cyan-200'
}

export function IndustryFilterDialog({ trigger }: IndustryFilterDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Array<{
    industry: string
    confidence: number
    bookmarkCount: number
    keywords: string[]
  }>>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [createFolders, setCreateFolders] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      analyzeBookmarks()
    }
  }, [open])

  const analyzeBookmarks = async () => {
    setIsAnalyzing(true)
    try {
      // Mock analysis - in real implementation, this would analyze actual bookmarks
      const mockRecommendations = [
        {
          industry: 'Technology',
          confidence: 0.85,
          bookmarkCount: 45,
          keywords: ['javascript', 'react', 'api', 'development']
        },
        {
          industry: 'Design',
          confidence: 0.72,
          bookmarkCount: 23,
          keywords: ['ui', 'ux', 'figma', 'inspiration']
        },
        {
          industry: 'Business',
          confidence: 0.68,
          bookmarkCount: 18,
          keywords: ['strategy', 'marketing', 'analytics']
        }
      ]
      
      setRecommendations(mockRecommendations)
      
      // Pre-select high-confidence industries
      const highConfidenceIndustries = mockRecommendations
        .filter(rec => rec.confidence > 0.7)
        .map(rec => rec.industry)
      setSelectedIndustries(highConfidenceIndustries)
      
      toast({
        title: "Analysis Complete",
        description: `Found ${mockRecommendations.length} industry categories in your bookmarks.`,
      })
    } catch (error) {
      console.error('Error analyzing bookmarks:', error)
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze bookmarks. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleIndustryToggle = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    )
  }

  const handleApplyFilter = async () => {
    if (selectedIndustries.length === 0) {
      toast({
        title: "No Industries Selected",
        description: "Please select at least one industry to filter by.",
        variant: "destructive"
      })
      return
    }

    setIsFiltering(true)
    try {
      // Mock filtering logic - in real implementation, this would use actual bookmarks
      const mockBookmarks = [
        { id: '1', title: 'React Documentation', url: 'https://react.dev', tags: [{ name: 'react' }] },
        { id: '2', title: 'Figma Design System', url: 'https://figma.com', tags: [{ name: 'design' }] }
      ]

      const preferences = {
        userId: 'current-user',
        preferredIndustries: selectedIndustries,
        excludedIndustries: [],
        confidenceThreshold: 0.3,
        autoFilter: false
      }

      const results = await AIFilterService.filterByIndustryPreferences(mockBookmarks, preferences)
      
      if (createFolders && results.length > 0) {
        await AIFilterService.createIndustryFolders(results.map(r => r.bookmark))
      }

      toast({
        title: "Filter Applied Successfully",
        description: `Organized ${results.length} bookmarks into industry categories.`,
      })
      setOpen(false)
    } catch (error) {
      console.error('Error applying filter:', error)
      toast({
        title: "Filter Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsFiltering(false)
    }
  }

  const selectAll = () => {
    setSelectedIndustries(recommendations.map(rec => rec.industry))
  }

  const resetSelection = () => {
    setSelectedIndustries([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Filter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Industry Filter
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Loading State */}
            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <h3 className="font-semibold mb-2">Analyzing Your Bookmarks</h3>
                <p className="text-gray-600">Using AI to categorize your bookmarks by industry...</p>
              </div>
            )}

            {/* Analysis Results */}
            {recommendations.length > 0 && !isAnalyzing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Industry Analysis
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetSelection}>
                      Clear All
                    </Button>
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {recommendations.map((recommendation) => {
                    const IconComponent = industryIcons[recommendation.industry]
                    const isSelected = selectedIndustries.includes(recommendation.industry)
                    
                    return (
                      <div
                        key={recommendation.industry}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-purple-300 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleIndustryToggle(recommendation.industry)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => handleIndustryToggle(recommendation.industry)}
                            />
                            <IconComponent className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="font-medium">{recommendation.industry}</div>
                              <div className="text-sm text-gray-500">
                                {recommendation.bookmarkCount} bookmarks • {Math.round(recommendation.confidence * 100)}% confidence
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Progress 
                              value={recommendation.confidence * 100} 
                              className="w-20 h-2 mb-1"
                            />
                            <Badge 
                              variant="secondary" 
                              className={industryColors[recommendation.industry]}
                            >
                              {Math.round(recommendation.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {recommendation.keywords.slice(0, 4).map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {recommendation.keywords.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{recommendation.keywords.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                {selectedIndustries.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Filter Summary</span>
                    </div>
                    <p className="text-sm text-green-800">
                      {selectedIndustries.length} industries selected • 
                      {' '}
                      {recommendations
                        .filter(rec => selectedIndustries.includes(rec.industry))
                        .reduce((sum, rec) => sum + rec.bookmarkCount, 0)
                      } bookmarks will be organized
                    </p>
                  </div>
                )}

                <Separator />

                {/* Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FolderPlus className="h-4 w-4" />
                    Organization Options
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="create-folders"
                      checked={createFolders}
                      onCheckedChange={(checked) => setCreateFolders(checked === true)}
                    />
                    <label 
                      htmlFor="create-folders" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Create industry folders automatically
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    When enabled, bookmarks will be organized into folders based on their industry category.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleApplyFilter}
                    disabled={isFiltering || selectedIndustries.length === 0}
                    className="flex-1"
                  >
                    {isFiltering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Applying Filter...
                      </>
                    ) : (
                      <>
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Industry Filter
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {recommendations.length === 0 && !isAnalyzing && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-500 mb-4">Add some bookmarks first to use AI industry filtering.</p>
                <Button onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 