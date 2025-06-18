import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DnaPageHeader } from '@/components/dna-profile/dna-page-header'
import { Zap, Star, Rocket, Target } from 'lucide-react'

export default function FeaturePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Standardized Header */}
          <DnaPageHeader 
            title="FEATURE"
            description="Discover powerful features to enhance your bookmark management experience"
          />

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Smart Organization
                </CardTitle>
                <CardDescription>
                  AI-powered categorization and tagging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically organize your bookmarks with intelligent categorization and smart tagging suggestions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  Advanced Search
                </CardTitle>
                <CardDescription>
                  Find anything instantly with powerful search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Search through titles, descriptions, content, and tags with advanced filtering options.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-500" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Track usage patterns and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get detailed analytics on your bookmark usage, trends, and productivity insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Goal Tracking
                </CardTitle>
                <CardDescription>
                  Set and achieve your learning goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your progress towards learning and productivity goals with smart recommendations.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Section */}
          <Card>
            <CardContent className="p-8 text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">More Features Coming Soon</h3>
              <p className="text-muted-foreground">
                We're constantly working on new features to enhance your experience. Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 