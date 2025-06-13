'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Eye,
  ExternalLink,
  Plus,
  Users,
  Star
} from 'lucide-react'

interface SocialBookmark {
  id: string
  title: string
  url: string
  description: string
  image?: string
  domain: string
  author: {
    name: string
    avatar: string
    username: string
  }
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  tags: string[]
  timestamp: string
  isLiked: boolean
  isBookmarked: boolean
  category: string
}

const mockBookmarks: SocialBookmark[] = [
  {
    id: '1',
    title: 'The Future of Web Development: React 19 Features',
    url: 'https://react.dev/blog/react-19',
    description: 'Exploring the latest features and improvements coming in React 19, including concurrent features and new hooks.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    domain: 'react.dev',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      username: '@sarahdev'
    },
    stats: { likes: 234, comments: 45, shares: 67, views: 1200 },
    tags: ['React', 'JavaScript', 'Frontend'],
    timestamp: '2 hours ago',
    isLiked: true,
    isBookmarked: false,
    category: 'Development'
  },
  {
    id: '2',
    title: 'AI-Powered Design Tools Revolution',
    url: 'https://figma.com/ai-design',
    description: 'How artificial intelligence is transforming the design workflow and what it means for designers.',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
    domain: 'figma.com',
    author: {
      name: 'Alex Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      username: '@alexdesign'
    },
    stats: { likes: 189, comments: 32, shares: 41, views: 890 },
    tags: ['AI', 'Design', 'Figma'],
    timestamp: '4 hours ago',
    isLiked: false,
    isBookmarked: true,
    category: 'Design'
  },
  {
    id: '3',
    title: 'Building Scalable APIs with Node.js',
    url: 'https://nodejs.org/guides/scalable-apis',
    description: 'Best practices for creating robust and scalable API architectures using Node.js and modern patterns.',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    domain: 'nodejs.org',
    author: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      username: '@mikejs'
    },
    stats: { likes: 156, comments: 28, shares: 35, views: 720 },
    tags: ['Node.js', 'API', 'Backend'],
    timestamp: '6 hours ago',
    isLiked: false,
    isBookmarked: false,
    category: 'Development'
  }
]

const trendingTags = [
  { name: 'React', count: 1234 },
  { name: 'AI', count: 987 },
  { name: 'Design', count: 756 },
  { name: 'JavaScript', count: 654 },
  { name: 'Node.js', count: 543 }
]

export default function SocialBookmarkPage() {
  const [bookmarks, setBookmarks] = useState<SocialBookmark[]>(mockBookmarks)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const handleLike = (bookmarkId: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === bookmarkId 
        ? { 
            ...bookmark, 
            isLiked: !bookmark.isLiked,
            stats: { 
              ...bookmark.stats, 
              likes: bookmark.isLiked ? bookmark.stats.likes - 1 : bookmark.stats.likes + 1 
            }
          }
        : bookmark
    ))
  }

  const handleBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === bookmarkId 
        ? { ...bookmark, isBookmarked: !bookmark.isBookmarked }
        : bookmark
    ))
    toast.success('Bookmark updated!')
  }

  const handleShare = (bookmark: SocialBookmark) => {
    navigator.clipboard.writeText(bookmark.url)
    toast.success('Link copied to clipboard!')
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Social Bookmarks</h1>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Community</span>
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['All', 'Development', 'Design', 'AI', 'Business'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTags.map((tag, index) => (
                  <div key={tag.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <Badge variant="outline">#{tag.name}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{tag.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bookmarks</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Likes Given</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shares</span>
                  <span className="font-medium">89</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Post Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                                         <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                         <span className="text-sm font-medium">{bookmark.author.name[0]}</span>
                       </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{bookmark.author.name}</span>
                          <span className="text-sm text-muted-foreground">{bookmark.author.username}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{bookmark.timestamp}</span>
                          <span>•</span>
                          <span>{bookmark.domain}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Post Content */}
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{bookmark.title}</h3>
                    <p className="text-muted-foreground">{bookmark.description}</p>
                  </div>

                  {/* Image */}
                  {bookmark.image && (
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={bookmark.image} 
                        alt={bookmark.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(bookmark.id)}
                        className={bookmark.isLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${bookmark.isLiked ? 'fill-current' : ''}`} />
                        {bookmark.stats.likes}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {bookmark.stats.comments}
                      </Button>
                      
                      <Button variant="ghost" size="sm" onClick={() => handleShare(bookmark)}>
                        <Share2 className="h-4 w-4 mr-1" />
                        {bookmark.stats.shares}
                      </Button>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="h-4 w-4 mr-1" />
                        {bookmark.stats.views}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(bookmark.id)}
                      className={bookmark.isBookmarked ? 'text-blue-500' : ''}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmark.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More */}
            <div className="text-center py-6">
              <Button variant="outline" size="lg">
                Load More Bookmarks
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 