import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CommentService } from '../../lib/services/comments'
import type { BookmarkComment } from '../../types/supabase'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { toast } from 'sonner'

interface BookmarkCommentsProps {
  bookmarkId: string
}

export function BookmarkComments({ bookmarkId }: BookmarkCommentsProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<BookmarkComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const commentService = user ? new CommentService(user.id) : null

  const fetchComments = async () => {
    if (!commentService) return
    try {
      const list = await commentService.listComments(bookmarkId)
      setComments(list)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load comments')
    }
  }

  useEffect(() => {
    if (bookmarkId && user) {
      fetchComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkId, user?.id])

  const handleAdd = async () => {
    if (!newComment.trim() || !commentService) return
    setLoading(true)
    try {
      const created = await commentService.addComment(bookmarkId, newComment.trim())
      setComments(prev => [...prev, created])
      setNewComment('')
    } catch (e) {
      console.error(e)
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {comments.map(c => (
          <Card key={c.id}>
            <CardContent className="p-3 text-sm">
              <p className="font-semibold">{c.user_id}</p>
              <p>{c.text}</p>
              <p className="text-xs text-muted-foreground">{new Date(c.created_at ?? '').toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </div>
      {user && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={3}
          />
          <Button disabled={loading || !newComment.trim()} onClick={handleAdd}>
            {loading ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>
      )}
      {!user && <p className="text-sm text-muted-foreground">Sign in to comment.</p>}
    </div>
  )
} 