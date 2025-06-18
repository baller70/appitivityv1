'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { 
  Share2, 
  Users, 
  Link, 
  Mail, 
  Copy,
  Eye,
  Edit,
  UserPlus,
  Globe,
  Lock,
  MessageSquare,
  Clock
} from 'lucide-react'

export function CollaborationSystem() {
  const [activeTab, setActiveTab] = useState('collections')
  const [shareEmail, setShareEmail] = useState('')
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer')
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (!shareEmail) return
    
    setIsSharing(true)
    try {
      // Mock sharing functionality
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Sharing with ${shareEmail} as ${shareRole}`)
      setShareEmail('')
    } catch (error) {
      console.error('Sharing failed:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url)
    // In real app, show toast notification
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Share2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Collaboration & Sharing</h2>
          <p className="text-sm text-gray-600">Share bookmarks and collaborate with your team</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collections">Shared Collections</TabsTrigger>
          <TabsTrigger value="links">Share Links</TabsTrigger>
          <TabsTrigger value="invite">Invite Team</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Shared Collections</h3>
              <p className="text-gray-600 mb-4">
                Start collaborating by sharing your bookmark collections with team members.
              </p>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share Collection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Share Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Share Links</h3>
                <p className="text-gray-600 mb-4">
                  Create shareable links to give others access to your bookmarks.
                </p>
                <Button>
                  <Link className="h-4 w-4 mr-2" />
                  Create Share Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="share-email">Email Address</Label>
                  <Input
                    id="share-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Permission Level</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={shareRole === 'viewer' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShareRole('viewer')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Viewer
                    </Button>
                    <Button
                      variant={shareRole === 'editor' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShareRole('editor')}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editor
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {shareRole === 'viewer' 
                      ? 'Can view bookmarks and collections' 
                      : 'Can view, add, and edit bookmarks'}
                  </p>
                </div>

                <Button 
                  onClick={handleShare} 
                  disabled={!shareEmail || isSharing}
                  className="w-full"
                >
                  {isSharing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 