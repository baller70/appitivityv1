'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  DollarSign, 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Infinity,
  Check,
  TrendingUp,
  Gift,
  Users,
  Award
} from 'lucide-react'
import { DnaPageHeader } from '@/components/dna-profile/dna-page-header'

export function MarketplaceTabs() {
  const [activeTab, setActiveTab] = useState('subscription')

  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <DnaPageHeader 
        title="MARKETPLACE"
        description="Explore subscription plans, earning opportunities, and premium features"
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            SUBSCRIPTION PLAN
          </TabsTrigger>
          <TabsTrigger value="earning" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            EARNING
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            PREMIUM FEATURES
          </TabsTrigger>
        </TabsList>

        {/* Subscription Plan Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Free</CardTitle>
                  <Badge variant="secondary">Current</Badge>
                </div>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 100 bookmarks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic organization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Standard support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <CardDescription>For power users and professionals</CardDescription>
                <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited bookmarks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced AI features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom themes</span>
                  </li>
                </ul>
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>For teams and organizations</CardDescription>
                <div className="text-3xl font-bold">$29.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">24/7 support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Earning Tab */}
        <TabsContent value="earning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral Program
                </CardTitle>
                <CardDescription>
                  Earn money by referring friends and colleagues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <div className="text-3xl font-bold text-green-600">$25</div>
                  <p className="text-sm text-muted-foreground">Per successful referral</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Referrals</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Earnings</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
                <Button className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Get Referral Link
                </Button>
              </CardContent>
            </Card>

            {/* Affiliate Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Affiliate Program
                </CardTitle>
                <CardDescription>
                  Earn commission on every sale you generate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <Award className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <div className="text-3xl font-bold text-purple-600">30%</div>
                  <p className="text-sm text-muted-foreground">Commission rate</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline">Not Enrolled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Earnings</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Apply for Program
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Earning History */}
          <Card>
            <CardHeader>
              <CardTitle>Earning History</CardTitle>
              <CardDescription>Track your earnings and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
                <p className="text-muted-foreground">
                  Start referring friends or join our affiliate program to begin earning
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Features Tab */}
        <TabsContent value="premium" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI-Powered Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  AI-Powered Features
                </CardTitle>
                <CardDescription>
                  Advanced AI capabilities for smart organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart Categorization</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Summarization</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Duplicate Detection</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Predictive Tagging</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Deep insights into your bookmark usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Usage Patterns</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Time Analytics</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Productivity Insights</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom Reports</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Unlimited Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Infinity className="h-5 w-5 text-green-500" />
                  Unlimited Storage
                </CardTitle>
                <CardDescription>
                  No limits on bookmarks, folders, or tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unlimited Bookmarks</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unlimited Folders</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unlimited Tags</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cloud Backup</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Priority Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Priority Support
                </CardTitle>
                <CardDescription>
                  Get help when you need it most
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">24/7 Chat Support</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Support</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Priority Queue</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dedicated Manager</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Custom Themes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-pink-500" />
                  Custom Themes
                </CardTitle>
                <CardDescription>
                  Personalize your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark/Light Themes</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Color Customization</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Layout Options</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom CSS</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Team Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Team Collaboration
                </CardTitle>
                <CardDescription>
                  Work together with your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shared Workspaces</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Permission Management</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Team Analytics</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activity Tracking</span>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upgrade CTA */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-8 text-center">
              <Crown className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Unlock All Premium Features</h3>
              <p className="mb-6 opacity-90">
                Get access to all premium features and take your bookmark management to the next level
              </p>
              <Button size="lg" variant="secondary" className="text-purple-600">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MarketplaceTabs 