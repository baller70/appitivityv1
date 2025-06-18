/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Eye, 
  Bookmark, 
  Folder, 
  Tag, 
  ExternalLink,
  Calendar,
  Clock,
  Loader2,
  Star
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ViewTimeCapsuleDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  capsule: any
}

interface TimeCapsuleDetails {
  id: string
  name: string
  description?: string
  snapshot_date: string
  bookmark_count: number
  folder_count: number
  tag_count: number
  bookmarks: Array<{
    id: string
    title: string
    url: string
    description?: string
    folder_name?: string
    is_favorite: boolean
    visit_count: number
    last_visited_at?: string
  }>
  tags: Array<{
    id: string
    name: string
    time_capsule_id: string
  }>
}

export function ViewTimeCapsuleDialog({
  open,
  onOpenChange,
  capsule
}: ViewTimeCapsuleDialogProps) {
  const [details, setDetails] = useState<TimeCapsuleDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'tags'>('bookmarks')

  const loadDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/time-capsules/${capsule.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load time capsule details')
      }

      const data = await response.json()
      setDetails(data)
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error loading time capsule details:', error)
      setError(error instanceof Error ? error.message : 'Failed to load details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && capsule) {
      loadDetails()
    }
  }, [open, capsule])

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setDetails(null)
      setError(null)
      setActiveTab('bookmarks')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="_sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {capsule.name}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>
              Created {capsule.snapshot_date ? formatDistanceToNow(new Date(capsule.snapshot_date), { addSuffix: true }) : 'Unknown date'}
            </div>
            {capsule.description && (
              <div className="text-sm">{capsule.description}</div>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading time capsule details...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadDetails}>Try Again</Button>
          </div>
        ) : details ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{details.bookmarks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Folders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{details.folder_count}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{details.tags.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b">
              <Button
                variant={activeTab === 'bookmarks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('bookmarks')}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks ({details.bookmarks.length})
              </Button>
              <Button
                variant={activeTab === 'tags' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('tags')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Tags ({details.tags.length})
              </Button>
            </div>

            {/* Tab Content */}
            <ScrollArea className="h-[400px]">
              {activeTab === 'bookmarks' && (
                <div className="space-y-3">
                  {details.bookmarks.map((bookmark) => (
                    <Card key={bookmark.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-sm">{bookmark.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <ExternalLink className="h-3 w-3" />
                              {bookmark.url}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {bookmark.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {bookmark.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {bookmark.folder_name && (
                            <Badge variant="outline">
                              <Folder className="h-3 w-3 mr-1" />
                              {bookmark.folder_name}
                            </Badge>
                          )}
                          {bookmark.is_favorite && (
                            <Badge variant="secondary">
                              <Star className="h-3 w-3 mr-1" />
                              Favorite
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {details.bookmarks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No bookmarks in this time capsule
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tags' && (
                <div className="space-y-3">
                  {details.tags.map((tag) => (
                    <Card key={tag.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{tag.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                  {details.tags.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tags in this time capsule
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
} 