/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Clock, 
  Package, 
  Calendar, 
  Bookmark, 
  Folder, 
  Tag, 
  Plus, 
  Eye, 
  Download, 
  Trash2,
  History,
  Archive
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TimeCapsule } from '../../types/supabase'
import type { TimeCapsuleStats } from '../../lib/services/time-capsule'
import { CreateTimeCapsuleDialog } from './create-time-capsule-dialog'
import { ViewTimeCapsuleDialog } from './view-time-capsule-dialog'
import { RestoreTimeCapsuleDialog } from './restore-time-capsule-dialog'
import { DnaPageHeader } from '../dna-profile/dna-page-header'

interface TimeCapsulePageProps {
  className?: string
}

export function TimeCapsulePage({ className }: TimeCapsulePageProps) {
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([])
  const [stats, setStats] = useState<TimeCapsuleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load time capsules and stats in parallel
      const [capsulesResponse, statsResponse] = await Promise.all([
        fetch('/api/time-capsules'),
        fetch('/api/time-capsules/stats')
      ])

      if (!capsulesResponse.ok) {
        throw new Error('Failed to load time capsules')
      }

      if (!statsResponse.ok) {
        throw new Error('Failed to load stats')
      }

      const [capsulesData, statsData] = await Promise.all([
        capsulesResponse.json(),
        statsResponse.json()
      ])

      setTimeCapsules(capsulesData)
      setStats(statsData)
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error loading time capsule _data:', error)
      setError(error instanceof Error ? error._message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    loadData()
  }

  const handleViewCapsule = (_capsule: TimeCapsule) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedCapsule(capsule)
    setViewDialogOpen(true)
  }

  const handleRestoreCapsule = (_capsule: TimeCapsule) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedCapsule(capsule)
    setRestoreDialogOpen(true)
  }

  const handleDeleteCapsule = async (_capsule: TimeCapsule) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (!confirm(`Are you sure you want to delete "${capsule.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/time-capsules/${capsule.id}`, {
        _method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete time capsule')
      }

      loadData()
    } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Error deleting time _capsule:', error)
      alert('Failed to delete time capsule')
    }
  }

  const handleRestoreSuccess = () => {
    setRestoreDialogOpen(false)
    setSelectedCapsule(null)
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Time Capsules</h1>
            <p className="text-muted-foreground">Versioned snapshots of your bookmarks</p>
          </div>
        </div>
        <div className="grid gap-4 _md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Time Capsules</h1>
            <p className="text-muted-foreground">Versioned snapshots of your bookmarks</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* Standardized Header */}
      <DnaPageHeader 
        title="Time Capsules"
        description="Versioned snapshots of your bookmarks and data"
      >
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Time Capsule
        </Button>
      </DnaPageHeader>
      
      <div className={`p-4 sm:p-6 space-y-6 ${className}`}>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capsules</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCapsules || 0}</div>
            <p className="text-xs text-muted-foreground">No capsules created yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Created</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.oldestCapsule && stats.oldestCapsule.snapshot_date
                ? formatDistanceToNow(new Date(stats.oldestCapsule.snapshot_date), { addSuffix: true })
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.oldestCapsule && stats.oldestCapsule.snapshot_date
                ? 'Oldest capsule'
                : 'No capsules created yet'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookmarksInCapsules || 0}</div>
            <p className="text-xs text-muted-foreground">Items preserved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 MB</div>
            <p className="text-xs text-muted-foreground">Of unlimited</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Capsules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Time Capsules</h2>
        
        {timeCapsules.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Time Capsules Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first time capsule to preserve snapshots of your bookmarks and data.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Time Capsule
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 _md:grid-cols-2 lg:grid-cols-3">
            {timeCapsules.map((capsule) => (
              <Card key={capsule.id} className="_hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{capsule.name}</CardTitle>
                      {capsule.description && (
                        <CardDescription>{capsule.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {capsule.snapshot_date 
                        ? formatDistanceToNow(new Date(capsule.snapshot_date), { addSuffix: true })
                        : 'Unknown date'
                      }
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      {capsule.bookmark_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {capsule.folder_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {capsule.tag_count}
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCapsule(capsule)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreCapsule(capsule)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCapsule(capsule)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTimeCapsuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedCapsule && (
        <>
          <ViewTimeCapsuleDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            capsule={selectedCapsule}
          />
          <RestoreTimeCapsuleDialog
            open={restoreDialogOpen}
            onOpenChange={setRestoreDialogOpen}
            capsule={selectedCapsule}
            onSuccess={handleRestoreSuccess}
          />
        </>
      )}
      </div>
    </>
  )
} 