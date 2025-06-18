import { createSupabaseClient } from '../supabase'
import type { UserNotification, UserNotificationInsert } from '../../types/supabase'

export class NotificationService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async listNotifications(): Promise<UserNotification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      // If the notifications table doesn't exist yet in the DB, suppress the error and return empty list
      const missingRelation =
        error.code === 'PGRST200' ||
        error.message?.toLowerCase().includes('relation')
      if (missingRelation) {
        console.warn('Notifications table missing; returning empty list.')
        return []
      }
      throw new Error(`Failed to fetch notifications: ${error.message}`)
    }
    return data ?? []
  }

  async addNotification(input: Omit<UserNotificationInsert, 'user_id'>): Promise<UserNotification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({ ...input, user_id: this.userId })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add notification: ${error.message}`)
    }
    return data as UserNotification
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`)
    }
  }

  // Subscribe to realtime changes for this user
  subscribeToNewNotifications(callback: (notification: UserNotification) => void) {
    const channel = this.supabase.channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`,
        },
        payload => {
          callback(payload.new as UserNotification)
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }
} 