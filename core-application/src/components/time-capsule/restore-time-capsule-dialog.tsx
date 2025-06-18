/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { 
  Download, 
  Bookmark, 
  Folder, 
  Tag, 
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RestoreTimeCapsuleDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  capsule: any
  onSuccess: () => void
}

export function RestoreTimeCapsuleDialog({
  open,
  onOpenChange,
  capsule,
  onSuccess
}: RestoreTimeCapsuleDialogProps) {
  const [restoreBookmarks, setRestoreBookmarks] = useState(true)
  const [restoreFolders, setRestoreFolders] = useState(true)
  const [restoreTags, setRestoreTags] = useState(true)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRestore = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/time-capsules/${capsule.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restoreBookmarks,
          restoreFolders,
          restoreTags,
          replaceExisting,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to restore time capsule')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error('Error restoring time capsule:', error)
      setError(error instanceof Error ? error.message : 'Failed to restore time capsule')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        // Reset state when closing
        setRestoreBookmarks(true)
        setRestoreFolders(true)
        setRestoreTags(true)
        setReplaceExisting(false)
        setError(null)
        setSuccess(false)
      }
    }
  }

  const hasSelections = restoreBookmarks || restoreFolders || restoreTags

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="_sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Restore Complete
            </DialogTitle>
            <DialogDescription>
              Your bookmarks have been successfully restored from the time capsule.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              The restoration process is complete. Your dashboard will refresh automatically.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="_sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Restore Time Capsule
          </DialogTitle>
          <DialogDescription>
            Restore bookmarks, folders, and tags from "{capsule.name}" created{' '}
            {capsule.snapshot_date 
              ? formatDistanceToNow(new Date(capsule.snapshot_date), { addSuffix: true })
              : 'at an unknown time'
            }.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Capsule Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Time Capsule Contents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  <span className="text-sm">Bookmarks</span>
                </div>
                <Badge variant="secondary">{capsule.bookmark_count}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="text-sm">Folders</span>
                </div>
                <Badge variant="secondary">{capsule.folder_count}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm">Tags</span>
                </div>
                <Badge variant="secondary">{capsule.tag_count}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Restore Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">What to restore:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="restore-bookmarks"
                  checked={restoreBookmarks}
                  onCheckedChange={(checked) => setRestoreBookmarks(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="restore-bookmarks" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Restore bookmarks ({capsule.bookmark_count})
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="restore-folders"
                  checked={restoreFolders}
                  onCheckedChange={(checked) => setRestoreFolders(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="restore-folders" className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Restore folders ({capsule.folder_count})
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="restore-tags"
                  checked={restoreTags}
                  onCheckedChange={(checked) => setRestoreTags(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="restore-tags" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Restore tags ({capsule.tag_count})
                </Label>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="replace-existing"
                  checked={replaceExisting}
                  onCheckedChange={(checked) => setReplaceExisting(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="replace-existing" className="text-sm">
                  Replace existing items with same names
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                If unchecked, items with duplicate names will be skipped
              </p>
            </div>
          </div>

          {/* Warning */}
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Important
                  </p>
                  <p className="text-orange-700 dark:text-orange-300">
                    Restoring a time capsule may overwrite or duplicate existing bookmarks, folders, or tags depending on your selections. This action cannot be undone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRestore}
              disabled={loading || !hasSelections}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Restore Selected
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 