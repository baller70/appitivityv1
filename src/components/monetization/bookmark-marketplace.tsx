'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  DollarSign, 
  ShoppingCart, 
  Star,
  Heart,
  Download,
  Upload,
  Eye,
  Users,
  TrendingUp,
  Award,
  Zap,
  Plus,
  Search,
  Filter,
  Share2,
  Lock,
  Unlock,
  CreditCard,
  Wallet
} from 'lucide-react'

interface Playlist {
  id: string
  title: string
  description: string
  category: string
  price: number
  rating: number
  reviews: number
  downloads: number
  author: string
  authorAvatar: string
  bookmarkCount: number
  tags: string[]
  featured: boolean
  premium: boolean
  previewBookmarks: string[]
}

interface UserPlaylist {
  id: string
  title: string
  description: string
  bookmarkCount: number
  category: string
  isPublic: boolean
  price?: number
  earnings?: number
}

const featuredPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Ultimate Web Development Resources',
    description: 'Comprehensive collection of tools, tutorials, and frameworks for modern web development',
    category: 'Development',
    price: 29.99,
    rating: 4.9,
    reviews: 156,
    downloads: 2341,
    author: 'DevMaster Pro',
    authorAvatar: 'DM',
    bookmarkCount: 127,
    tags: ['React', 'JavaScript', 'CSS', 'Tools'],
    featured: true,
    premium: true,
    previewBookmarks: ['React Documentation', 'CSS Grid Guide', 'JavaScript ES6 Features']
  },
  {
    id: '2',
    title: 'AI & Machine Learning Essentials',
    description: 'Curated resources for learning and implementing AI/ML solutions',
    category: 'AI/ML',
    price: 39.99,
    rating: 4.8,
    reviews: 89,
    downloads: 1567,
    author: 'AI Researcher',
    authorAvatar: 'AR',
    bookmarkCount: 94,
    tags: ['TensorFlow', 'PyTorch', 'Datasets', 'Papers'],
    featured: true,
    premium: true,
    previewBookmarks: ['TensorFlow Tutorials', 'Kaggle Datasets', 'ArXiv Papers']
  },
  {
    id: '3',
    title: 'Design System Inspiration',
    description: 'Beautiful design systems and UI/UX resources from top companies',
    category: 'Design',
    price: 19.99,
    rating: 4.7,
    reviews: 203,
    downloads: 3421,
    author: 'DesignGuru',
    authorAvatar: 'DG',
    bookmarkCount: 78,
    tags: ['UI/UX', 'Figma', 'Components', 'Inspiration'],
    featured: false,
    premium: false,
    previewBookmarks: ['Material Design', 'Apple HIG', 'Atlassian Design']
  }
]

const userPlaylists: UserPlaylist[] = [
  {
    id: '1',
    title: 'My Development Tools',
    description: 'Personal collection of development utilities',
    bookmarkCount: 45,
    category: 'Development',
    isPublic: false,
    price: 0,
    earnings: 0
  },
  {
    id: '2',
    title: 'Startup Resources',
    description: 'Everything needed to launch a successful startup',
    bookmarkCount: 67,
    category: 'Business',
    isPublic: true,
    price: 15.99,
    earnings: 127.92
  }
]

export default function BookmarkMarketplace() {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    tags: ''
  })

  const categories = [
    'Development', 'Design', 'AI/ML', 'Business', 'Marketing', 
    'Education', 'Health', 'Finance', 'Entertainment', 'News'
  ]

  const handleCreatePlaylist = () => {
    if (!newPlaylist.title || !newPlaylist.description) {
      toast.error('Please fill in all required fields')
      return
    }
    
    toast.success('Playlist created successfully!')
    setShowCreateForm(false)
    setNewPlaylist({ title: '', description: '', category: '', price: 0, tags: '' })
  }

  const handlePurchase = (playlist: Playlist) => {
    toast.success(`Purchased "${playlist.title}" for $${playlist.price}`)
  }

  const filteredPlaylists = featuredPlaylists.filter(playlist => {
    const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || playlist.category === selectedCategory
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && playlist.price === 0) ||
                        (priceFilter === 'paid' && playlist.price > 0)
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const totalEarnings = userPlaylists.reduce((sum, playlist) => sum + (playlist.earnings || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span>Bookmark Marketplace</span>
          </h2>
          <p className="text-muted-foreground">
            Discover, create, and sell curated bookmark collections
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            <Wallet className="h-4 w-4 mr-1" />
            Earnings: ${totalEarnings.toFixed(2)}
          </Badge>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'browse', label: 'Browse', icon: Search },
          { id: 'my-playlists', label: 'My Playlists', icon: Users },
          { id: 'purchased', label: 'Purchased', icon: Download },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Search playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Featured Playlists</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlaylists.map((playlist) => (
                <Card key={playlist.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {playlist.authorAvatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{playlist.author}</p>
                          <p className="text-xs text-muted-foreground">{playlist.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {playlist.featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {playlist.premium && (
                          <Badge variant="default" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{playlist.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {playlist.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {playlist.bookmarkCount} bookmarks
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{playlist.rating}</span>
                        <span className="text-muted-foreground">({playlist.reviews})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {playlist.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {playlist.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{playlist.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Preview:</p>
                      <div className="space-y-1">
                        {playlist.previewBookmarks.map((bookmark, index) => (
                          <div key={index} className="text-xs bg-muted p-2 rounded">
                            {bookmark}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{playlist.downloads}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">
                          ${playlist.price}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handlePurchase(playlist)}
                          className="group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Playlists Tab */}
      {activeTab === 'my-playlists' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userPlaylists.map((playlist) => (
              <Card key={playlist.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{playlist.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {playlist.isPublic ? (
                        <Unlock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                      <Badge variant="outline">{playlist.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{playlist.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{playlist.bookmarkCount} bookmarks</span>
                    <span className="text-muted-foreground">
                      {playlist.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  
                  {playlist.isPublic && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Price:</span>
                        <span className="font-medium">${playlist.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Earnings:</span>
                        <span className="font-medium text-green-600">
                          ${playlist.earnings?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Playlists</p>
                    <p className="text-2xl font-bold">{userPlaylists.filter(p => p.isPublic).length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Download className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">4.7</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Your earnings by playlist</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPlaylists.filter(p => p.isPublic).map((playlist) => (
                  <div key={playlist.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{playlist.title}</p>
                      <p className="text-sm text-muted-foreground">{playlist.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${playlist.earnings?.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${playlist.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New Playlist</CardTitle>
              <CardDescription>
                Create a curated bookmark collection to sell
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newPlaylist.title}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter playlist title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your playlist"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={newPlaylist.category} 
                  onValueChange={(value) => setNewPlaylist(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  value={newPlaylist.price}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  value={newPlaylist.tags}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="react, javascript, tools"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreatePlaylist} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 