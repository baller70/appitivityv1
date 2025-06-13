import { createSupabaseClient } from '../supabase'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export interface PresenceEvent {
  userId: string
  action: 'join' | 'leave'
}

export class CollaborationService {
  private supabase
  constructor(userId: string) {
    this.supabase = createSupabaseClient(userId)
  }

  joinBookmarkChannel(bookmarkId: string, userKey: string) {
    const channel = this.supabase.channel(`bookmark:${bookmarkId}`, {
      config: { presence: { key: userKey } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      // no-op; consumers can read channel.presenceState()
    })

    channel.subscribe()
    return channel
  }
}

// React hook to expose presence state
export function useBookmarkPresence(bookmarkId: string) {
  const { user } = useUser()
  const userId = user?.id || 'anon'
  useEffect(() => {
    const client = createSupabaseClient(userId)
    const channel = client.channel(`bookmark:${bookmarkId}`, {
      config: { presence: { key: userId } },
    })
    channel.subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [bookmarkId, userId])
} 