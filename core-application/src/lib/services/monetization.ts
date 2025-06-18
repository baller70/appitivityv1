/**
 * Monetization Service
 * Handles premium features, subscriptions, and marketplace functionality
 */

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  limits: {
    bookmarks: number | 'unlimited'
    folders: number | 'unlimited'
    playlists: number | 'unlimited'
    integrations: number | 'unlimited'
    storage: string
    aiFeatures: boolean
    prioritySupport: boolean
    customBranding: boolean
  }
  isPopular?: boolean
  stripePriceId?: string
}

export interface MarketplacePlaylist {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  bookmarkCount: number
  price: number
  currency: string
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  rating: number
  reviewCount: number
  purchaseCount: number
  previewBookmarks: Array<{
    title: string
    url: string
    description?: string
  }>
  thumbnailUrl?: string
  createdAt: Date
  updatedAt: Date
  isVerified: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface PremiumFeature {
  id: string
  name: string
  description: string
  requiredPlan: 'pro' | 'business' | 'enterprise'
  isEnabled: boolean
  usageLimit?: number
  currentUsage?: number
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  trialEnd?: Date
}

export interface MarketplaceStats {
  totalListings: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  topCategories: Array<{
    category: string
    count: number
    revenue: number
  }>
  recentSales: Array<{
    playlistTitle: string
    price: number
    buyerName: string
    date: Date
  }>
}

export class MonetizationService {
  private static readonly SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with bookmark management',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Up to 100 bookmarks',
        'Basic folders',
        '3 playlists',
        'Standard search',
        'Community support'
      ],
      limits: {
        bookmarks: 100,
        folders: 10,
        playlists: 3,
        integrations: 1,
        storage: '100MB',
        aiFeatures: false,
        prioritySupport: false,
        customBranding: false
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For power users who need advanced features',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Unlimited bookmarks',
        'Advanced folders & tags',
        'Unlimited playlists',
        'AI-powered categorization',
        'Third-party integrations',
        'Advanced analytics',
        'Priority support'
      ],
      limits: {
        bookmarks: 'unlimited',
        folders: 'unlimited',
        playlists: 'unlimited',
        integrations: 10,
        storage: '10GB',
        aiFeatures: true,
        prioritySupport: true,
        customBranding: false
      },
      isPopular: true,
      stripePriceId: 'price_pro_monthly'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For teams and organizations',
      price: 29.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Shared workspaces',
        'Custom branding',
        'Advanced security',
        'API access',
        'Dedicated support'
      ],
      limits: {
        bookmarks: 'unlimited',
        folders: 'unlimited',
        playlists: 'unlimited',
        integrations: 'unlimited',
        storage: '100GB',
        aiFeatures: true,
        prioritySupport: true,
        customBranding: true
      },
      stripePriceId: 'price_business_monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      price: 99.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Everything in Business',
        'SSO integration',
        'Advanced compliance',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'On-premise deployment'
      ],
      limits: {
        bookmarks: 'unlimited',
        folders: 'unlimited',
        playlists: 'unlimited',
        integrations: 'unlimited',
        storage: 'unlimited',
        aiFeatures: true,
        prioritySupport: true,
        customBranding: true
      },
      stripePriceId: 'price_enterprise_monthly'
    }
  ]

  private static readonly PREMIUM_FEATURES: PremiumFeature[] = [
    {
      id: 'ai_categorization',
      name: 'AI Categorization',
      description: 'Automatically categorize bookmarks using AI',
      requiredPlan: 'pro',
      isEnabled: true,
      usageLimit: 1000,
      currentUsage: 0
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights and usage analytics',
      requiredPlan: 'pro',
      isEnabled: true
    },
    {
      id: 'custom_branding',
      name: 'Custom Branding',
      description: 'Customize the interface with your brand',
      requiredPlan: 'business',
      isEnabled: true
    },
    {
      id: 'api_access',
      name: 'API Access',
      description: 'Full API access for custom integrations',
      requiredPlan: 'business',
      isEnabled: true,
      usageLimit: 10000,
      currentUsage: 0
    },
    {
      id: 'sso_integration',
      name: 'SSO Integration',
      description: 'Single Sign-On with your organization',
      requiredPlan: 'enterprise',
      isEnabled: true
    }
  ]

  /**
   * Get all available subscription plans
   */
  static getSubscriptionPlans(): SubscriptionPlan[] {
    return this.SUBSCRIPTION_PLANS
  }

  /**
   * Get a specific subscription plan
   */
  static getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return this.SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    // Mock subscription data
    return {
      id: 'sub_123',
      userId,
      planId: 'pro',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: 'sub_stripe_123'
    }
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId?: string
  ): Promise<{ success: boolean; subscriptionId?: string; clientSecret?: string; error?: string }> {
    try {
      const plan = this.getSubscriptionPlan(planId)
      if (!plan) {
        throw new Error('Invalid plan selected')
      }

      if (plan.price === 0) {
        // Free plan - no payment required
        return {
          success: true,
          subscriptionId: `sub_free_${userId}_${Date.now()}`
        }
      }

      // Mock Stripe integration
      const mockSubscriptionId = `sub_${planId}_${userId}_${Date.now()}`
      const mockClientSecret = `pi_mock_${Date.now()}_secret`

      return {
        success: true,
        subscriptionId: mockSubscriptionId,
        clientSecret: mockClientSecret
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock cancellation
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if user has access to a premium feature
   */
  static async hasFeatureAccess(
    userId: string,
    featureId: string
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId)
      const feature = this.PREMIUM_FEATURES.find(f => f.id === featureId)

      if (!feature) {
        return { hasAccess: false, reason: 'Feature not found' }
      }

      if (!subscription || subscription.status !== 'active') {
        return { hasAccess: false, reason: 'No active subscription' }
      }

      const plan = this.getSubscriptionPlan(subscription.planId)
      if (!plan) {
        return { hasAccess: false, reason: 'Invalid subscription plan' }
      }

      // Check plan level
      const planLevels = ['free', 'pro', 'business', 'enterprise']
      const userPlanLevel = planLevels.indexOf(plan.id)
      const requiredPlanLevel = planLevels.indexOf(feature.requiredPlan)

      if (userPlanLevel < requiredPlanLevel) {
        return { hasAccess: false, reason: `Requires ${feature.requiredPlan} plan or higher` }
      }

      // Check usage limits
      if (feature.usageLimit && feature.currentUsage && feature.currentUsage >= feature.usageLimit) {
        return { hasAccess: false, reason: 'Usage limit exceeded' }
      }

      return { hasAccess: true }
    } catch (error) {
      return { hasAccess: false, reason: 'Error checking feature access' }
    }
  }

  /**
   * Get marketplace playlists
   */
  static async getMarketplacePlaylists(
    category?: string,
    sortBy: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating' = 'popular',
    limit: number = 20
  ): Promise<MarketplacePlaylist[]> {
    // Mock marketplace data
    const mockPlaylists: MarketplacePlaylist[] = [
      {
        id: 'playlist_1',
        title: 'Ultimate Web Development Resources',
        description: 'Comprehensive collection of web development tools, tutorials, and resources',
        category: 'Development',
        tags: ['javascript', 'react', 'nodejs', 'css'],
        bookmarkCount: 150,
        price: 19.99,
        currency: 'USD',
        creatorId: 'creator_1',
        creatorName: 'John Developer',
        rating: 4.8,
        reviewCount: 45,
        purchaseCount: 234,
        previewBookmarks: [
          { title: 'React Documentation', url: 'https://react.dev', description: 'Official React docs' },
          { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web development reference' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: true,
        difficulty: 'intermediate'
      },
      {
        id: 'playlist_2',
        title: 'Design Inspiration Collection',
        description: 'Curated collection of design inspiration and tools',
        category: 'Design',
        tags: ['ui', 'ux', 'inspiration', 'tools'],
        bookmarkCount: 89,
        price: 14.99,
        currency: 'USD',
        creatorId: 'creator_2',
        creatorName: 'Sarah Designer',
        rating: 4.9,
        reviewCount: 67,
        purchaseCount: 189,
        previewBookmarks: [
          { title: 'Dribbble', url: 'https://dribbble.com', description: 'Design inspiration' },
          { title: 'Figma', url: 'https://figma.com', description: 'Design tool' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: true,
        difficulty: 'beginner'
      }
    ]

    // Apply filters and sorting
    let filtered = mockPlaylists
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default: // popular
        filtered.sort((a, b) => b.purchaseCount - a.purchaseCount)
    }

    return filtered.slice(0, limit)
  }

  /**
   * Purchase a marketplace playlist
   */
  static async purchasePlaylist(
    userId: string,
    playlistId: string,
    paymentMethodId?: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Mock purchase logic
      const transactionId = `txn_${playlistId}_${userId}_${Date.now()}`
      
      return {
        success: true,
        transactionId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      }
    }
  }

  /**
   * List a playlist on the marketplace
   */
  static async listPlaylistOnMarketplace(
    userId: string,
    playlistId: string,
    marketplaceData: {
      title: string
      description: string
      category: string
      tags: string[]
      price: number
      difficulty?: 'beginner' | 'intermediate' | 'advanced'
    }
  ): Promise<{ success: boolean; listingId?: string; error?: string }> {
    try {
      // Check if user has permission to sell
      const subscription = await this.getUserSubscription(userId)
      if (!subscription || subscription.planId === 'free') {
        throw new Error('Pro plan or higher required to sell playlists')
      }

      const listingId = `listing_${playlistId}_${Date.now()}`
      
      return {
        success: true,
        listingId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list playlist'
      }
    }
  }

  /**
   * Get marketplace statistics
   */
  static async getMarketplaceStats(userId?: string): Promise<MarketplaceStats> {
    // Mock statistics
    return {
      totalListings: 1247,
      totalSales: 5632,
      totalRevenue: 89456.78,
      averageRating: 4.6,
      topCategories: [
        { category: 'Development', count: 456, revenue: 34567.89 },
        { category: 'Design', count: 234, revenue: 23456.78 },
        { category: 'Business', count: 189, revenue: 18765.43 },
        { category: 'Education', count: 156, revenue: 12345.67 }
      ],
      recentSales: [
        { playlistTitle: 'Ultimate Web Development Resources', price: 19.99, buyerName: 'Anonymous', date: new Date() },
        { playlistTitle: 'Design Inspiration Collection', price: 14.99, buyerName: 'Anonymous', date: new Date() }
      ]
    }
  }

  /**
   * Get user's earnings from marketplace
   */
  static async getUserEarnings(userId: string): Promise<{
    totalEarnings: number
    monthlyEarnings: number
    totalSales: number
    averageRating: number
    topSellingPlaylists: Array<{
      title: string
      sales: number
      revenue: number
      rating: number
    }>
  }> {
    // Mock earnings data
    return {
      totalEarnings: 2456.78,
      monthlyEarnings: 345.67,
      totalSales: 89,
      averageRating: 4.7,
      topSellingPlaylists: [
        { title: 'Ultimate Web Development Resources', sales: 34, revenue: 679.66, rating: 4.8 },
        { title: 'Design Inspiration Collection', sales: 28, revenue: 419.72, rating: 4.9 }
      ]
    }
  }

  /**
   * Process a refund
   */
  static async processRefund(
    transactionId: string,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      // Mock refund processing
      const refundId = `refund_${transactionId}_${Date.now()}`
      
      return {
        success: true,
        refundId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  /**
   * Get premium features list
   */
  static getPremiumFeatures(): PremiumFeature[] {
    return this.PREMIUM_FEATURES
  }

  /**
   * Track feature usage
   */
  static async trackFeatureUsage(
    userId: string,
    featureId: string,
    amount: number = 1
  ): Promise<{ success: boolean; remainingUsage?: number; error?: string }> {
    try {
      const feature = this.PREMIUM_FEATURES.find(f => f.id === featureId)
      if (!feature) {
        throw new Error('Feature not found')
      }

      // Mock usage tracking
      const currentUsage = (feature.currentUsage || 0) + amount
      const remainingUsage = feature.usageLimit ? feature.usageLimit - currentUsage : undefined

      return {
        success: true,
        remainingUsage
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track usage'
      }
    }
  }
} 