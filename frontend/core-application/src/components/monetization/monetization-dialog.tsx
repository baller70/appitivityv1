'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  MonetizationService, 
  SubscriptionPlan, 
  MarketplacePlaylist,
  UserSubscription,
  MarketplaceStats
} from '@/lib/services/monetization'
import { 
  Crown, 
  DollarSign, 
  Star, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Zap,
  Check,
  X,
  CreditCard,
  Gift,
  Award,
  Target,
  BarChart3,
  Sparkles,
  Lock,
  Unlock,
  Package,
  Store,
  PlusCircle,
  Eye,
  Download
} from 'lucide-react'

interface MonetizationDialogProps {
  trigger?: React.ReactNode
}

export function MonetizationDialog({ trigger }: MonetizationDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('plans')
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [marketplacePlaylists, setMarketplacePlaylists] = useState<MarketplacePlaylist[]>([])
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [plansData, subscriptionData, playlistsData, statsData] = await Promise.all([
        Promise.resolve(MonetizationService.getSubscriptionPlans()),
        MonetizationService.getUserSubscription('current-user'),
        MonetizationService.getMarketplacePlaylists(),
        MonetizationService.getMarketplaceStats()
      ])

      setPlans(plansData)
      setCurrentSubscription(subscriptionData)
      setMarketplacePlaylists(playlistsData)
      setMarketplaceStats(statsData)
    } catch (error) {
      console.error('Error loading monetization data:', error)
      toast({
        title: "Loading Failed",
        description: "Unable to load monetization data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true)
    try {
      const result = await MonetizationService.createSubscription('current-user', planId)
      
      if (result.success) {
        toast({
          title: "Subscription Created",
          description: "Your subscription has been activated successfully!",
        })
        await loadData() // Refresh data
      } else {
        throw new Error(result.error || 'Subscription failed')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchasePlaylist = async (playlistId: string) => {
    setIsLoading(true)
    try {
      const result = await MonetizationService.purchasePlaylist('current-user', playlistId)
      
      if (result.success) {
        toast({
          title: "Purchase Successful",
          description: "Playlist has been added to your collection!",
        })
      } else {
        throw new Error(result.error || 'Purchase failed')
      }
    } catch (error) {
      console.error('Error purchasing playlist:', error)
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'business': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-gold-100 text-gold-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price)
  }

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Crown className="h-4 w-4" />
            Premium
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Premium Features & Marketplace
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="features">Premium Features</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[70vh] mt-4">
            <TabsContent value="plans" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Unlock powerful features to supercharge your bookmark management</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''} ${
                      isCurrentPlan(plan.id) ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                      </div>
                    )}
                    {isCurrentPlan(plan.id) && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-500 text-white">Current Plan</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        {plan.id === 'enterprise' && <Crown className="h-5 w-5 text-yellow-500" />}
                        {plan.name}
                      </CardTitle>
                      <div className="text-3xl font-bold">
                        {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                        {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div>Bookmarks: {plan.limits.bookmarks}</div>
                        <div>Folders: {plan.limits.folders}</div>
                        <div>Playlists: {plan.limits.playlists}</div>
                        <div>Storage: {plan.limits.storage}</div>
                      </div>

                      <Button
                        className="w-full"
                        variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading || isCurrentPlan(plan.id)}
                      >
                        {isCurrentPlan(plan.id) ? 'Current Plan' : 
                         plan.price === 0 ? 'Get Started' : 'Subscribe'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {currentSubscription && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Plan</Label>
                        <div className="font-medium">{plans.find(p => p.id === currentSubscription.planId)?.name}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Status</Label>
                        <Badge className={currentSubscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {currentSubscription.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Next Billing</Label>
                        <div className="font-medium">{currentSubscription.currentPeriodEnd.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Auto Renew</Label>
                        <div className="font-medium">{currentSubscription.cancelAtPeriodEnd ? 'No' : 'Yes'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Playlist Marketplace</h2>
                  <p className="text-gray-600">Discover and purchase curated bookmark collections</p>
                </div>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Sell Your Playlists
                </Button>
              </div>

              {marketplaceStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{marketplaceStats.totalListings}</div>
                      <div className="text-xs text-gray-500">Total Listings</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{marketplaceStats.totalSales}</div>
                      <div className="text-xs text-gray-500">Total Sales</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{formatPrice(marketplaceStats.totalRevenue)}</div>
                      <div className="text-xs text-gray-500">Total Revenue</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {marketplaceStats.averageRating}
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-xs text-gray-500">Avg Rating</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketplacePlaylists.map((playlist) => (
                  <Card key={playlist.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {playlist.title}
                            {playlist.isVerified && <Award className="h-4 w-4 text-blue-500" />}
                          </CardTitle>
                          <CardDescription className="mt-1">{playlist.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{formatPrice(playlist.price)}</div>
                          <div className="text-xs text-gray-500">{playlist.bookmarkCount} bookmarks</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                          <span>{playlist.creatorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{playlist.rating}</span>
                          <span className="text-gray-500">({playlist.reviewCount})</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {playlist.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {playlist.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{playlist.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Preview:</Label>
                        {playlist.previewBookmarks.slice(0, 2).map((bookmark, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                            <div className="font-medium">{bookmark.title}</div>
                            <div className="text-gray-500 truncate">{bookmark.url}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePurchasePlaylist(playlist.id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Creator Earnings</h2>
                <p className="text-gray-600">Track your revenue from selling bookmark playlists</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{formatPrice(2456.78)}</div>
                    <div className="text-xs text-gray-500">Total Earnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{formatPrice(345.67)}</div>
                    <div className="text-xs text-gray-500">This Month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">89</div>
                    <div className="text-xs text-gray-500">Total Sales</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold flex items-center gap-1">
                      4.7
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <div className="text-xs text-gray-500">Avg Rating</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Playlists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Ultimate Web Development Resources</div>
                        <div className="text-sm text-gray-500">34 sales • 4.8★</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatPrice(679.66)}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Design Inspiration Collection</div>
                        <div className="text-sm text-gray-500">28 sales • 4.9★</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatPrice(419.72)}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Premium Features</h2>
                <p className="text-gray-600">Unlock advanced capabilities with your subscription</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      AI Categorization
                    </CardTitle>
                    <CardDescription>
                      Automatically categorize bookmarks using AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Usage this month</span>
                      <span className="text-sm font-medium">245 / 1000</span>
                    </div>
                    <Progress value={24.5} className="mb-4" />
                    <Badge className="bg-blue-100 text-blue-800">Pro Feature</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      Advanced Analytics
                    </CardTitle>
                    <CardDescription>
                      Detailed insights and usage analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Unlock className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Unlimited access</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Pro Feature</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-500" />
                      Custom Branding
                    </CardTitle>
                    <CardDescription>
                      Customize the interface with your brand
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Requires Business plan</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Business Feature</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      API Access
                    </CardTitle>
                    <CardDescription>
                      Full API access for custom integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">API calls this month</span>
                      <span className="text-sm font-medium">1,234 / 10,000</span>
                    </div>
                    <Progress value={12.34} className="mb-4" />
                    <Badge className="bg-purple-100 text-purple-800">Business Feature</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 