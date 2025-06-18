import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BookmarkSession {
  id: string
  bookmark_id: string
  user_id: string
  session_start: string
  session_end?: string
  duration_seconds?: number
  is_active: boolean
  session_type: 'view' | 'focus' | 'timer' | 'research' | 'reading'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TimeStats {
  total_time_spent: number
  session_count: number
  average_session_time: number
  last_session_time: number
  longest_session_time: number
}

export class TimeTrackingService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Start a new tracking session for a bookmark
   */
  async startSession(
    bookmarkId: string,
    sessionType: BookmarkSession['session_type'] = 'view',
    metadata: Record<string, any> = {}
  ): Promise<BookmarkSession> {
    // First, end any active sessions for this bookmark
    await this.endActiveSessionsForBookmark(bookmarkId)

    const { data, error } = await supabase
      .from('bookmark_sessions')
      .insert({
        bookmark_id: bookmarkId,
        user_id: this.userId,
        session_type: sessionType,
        metadata,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to start session: ${error.message}`)
    }

    return data
  }

  /**
   * End a specific session
   */
  async endSession(sessionId: string): Promise<BookmarkSession> {
    const { data: session, error: fetchError } = await supabase
      .from('bookmark_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .single()

    if (fetchError || !session) {
      throw new Error('Session not found')
    }

    const sessionEnd = new Date()
    const sessionStart = new Date(session.session_start)
    const durationSeconds = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 1000)

    const { data, error } = await supabase
      .from('bookmark_sessions')
      .update({
        session_end: sessionEnd.toISOString(),
        duration_seconds: durationSeconds,
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to end session: ${error.message}`)
    }

    return data
  }

  /**
   * End all active sessions for a bookmark
   */
  async endActiveSessionsForBookmark(bookmarkId: string): Promise<void> {
    const { data: activeSessions, error: fetchError } = await supabase
      .from('bookmark_sessions')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .eq('user_id', this.userId)
      .eq('is_active', true)

    if (fetchError) {
      throw new Error(`Failed to fetch active sessions: ${fetchError.message}`)
    }

    if (!activeSessions || activeSessions.length === 0) {
      return
    }

    // End each active session
    for (const session of activeSessions) {
      await this.endSession(session.id)
    }
  }

  /**
   * End all active sessions for the user
   */
  async endAllActiveSessions(): Promise<void> {
    const { data: activeSessions, error: fetchError } = await supabase
      .from('bookmark_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)

    if (fetchError) {
      throw new Error(`Failed to fetch active sessions: ${fetchError.message}`)
    }

    if (!activeSessions || activeSessions.length === 0) {
      return
    }

    // End each active session
    for (const session of activeSessions) {
      await this.endSession(session.id)
    }
  }

  /**
   * Get active session for a bookmark
   */
  async getActiveSession(bookmarkId: string): Promise<BookmarkSession | null> {
    const { data, error } = await supabase
      .from('bookmark_sessions')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('session_start', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to get active session: ${error.message}`)
    }

    return data
  }

  /**
   * Get all sessions for a bookmark
   */
  async getBookmarkSessions(
    bookmarkId: string,
    limit: number = 50
  ): Promise<BookmarkSession[]> {
    const { data, error } = await supabase
      .from('bookmark_sessions')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .eq('user_id', this.userId)
      .order('session_start', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get bookmark sessions: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get time statistics for a bookmark
   */
  async getBookmarkTimeStats(bookmarkId: string): Promise<TimeStats> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('total_time_spent, session_count, average_session_time, last_session_time, longest_session_time')
      .eq('id', bookmarkId)
      .eq('user_id', this.userId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to get time stats: ${error.message}`)
    }

    // If no bookmark found, return default stats
    if (!data) {
      return {
        total_time_spent: 0,
        session_count: 0,
        average_session_time: 0,
        last_session_time: 0,
        longest_session_time: 0
      }
    }

    return {
      total_time_spent: data.total_time_spent || 0,
      session_count: data.session_count || 0,
      average_session_time: data.average_session_time || 0,
      last_session_time: data.last_session_time || 0,
      longest_session_time: data.longest_session_time || 0
    }
  }

  /**
   * Get user's overall time statistics
   */
  async getUserTimeStats(): Promise<{
    totalTimeSpent: number
    totalSessions: number
    averageSessionTime: number
    mostUsedBookmark: { id: string; title: string; time: number } | null
    dailyAverage: number
  }> {
    // Get aggregated bookmark stats
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('id, title, total_time_spent, session_count')
      .eq('user_id', this.userId)

    if (bookmarksError) {
      throw new Error(`Failed to get user time stats: ${bookmarksError.message}`)
    }

    const totalTimeSpent = bookmarks?.reduce((sum, b) => sum + (b.total_time_spent || 0), 0) || 0
    const totalSessions = bookmarks?.reduce((sum, b) => sum + (b.session_count || 0), 0) || 0
    const averageSessionTime = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0

    // Find most used bookmark
    const mostUsedBookmark = bookmarks
      ?.filter(b => b.total_time_spent > 0)
      ?.sort((a, b) => (b.total_time_spent || 0) - (a.total_time_spent || 0))[0]

    // Calculate daily average (based on last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentSessions, error: sessionsError } = await supabase
      .from('bookmark_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId)
      .gte('session_start', thirtyDaysAgo.toISOString())
      .not('duration_seconds', 'is', null)

    if (sessionsError) {
      throw new Error(`Failed to get recent sessions: ${sessionsError.message}`)
    }

    const recentTotalTime = recentSessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0
    const dailyAverage = Math.round(recentTotalTime / 30)

    return {
      totalTimeSpent,
      totalSessions,
      averageSessionTime,
      mostUsedBookmark: mostUsedBookmark ? {
        id: mostUsedBookmark.id,
        title: mostUsedBookmark.title,
        time: mostUsedBookmark.total_time_spent || 0
      } : null,
      dailyAverage
    }
  }

  /**
   * Format seconds into human-readable time
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  /**
   * Get time tracking analytics for a date range
   */
  async getTimeAnalytics(startDate: Date, endDate: Date): Promise<{
    totalTime: number
    sessions: number
    dailyBreakdown: { date: string; time: number; sessions: number }[]
    sessionTypeBreakdown: { type: string; time: number; sessions: number }[]
  }> {
    const { data: sessions, error } = await supabase
      .from('bookmark_sessions')
      .select('duration_seconds, session_type, session_start')
      .eq('user_id', this.userId)
      .gte('session_start', startDate.toISOString())
      .lte('session_start', endDate.toISOString())
      .not('duration_seconds', 'is', null)

    if (error) {
      throw new Error(`Failed to get time analytics: ${error.message}`)
    }

    const totalTime = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0
    const sessionCount = sessions?.length || 0

    // Daily breakdown
    const dailyMap = new Map<string, { time: number; sessions: number }>()
    sessions?.forEach(session => {
      const date = new Date(session.session_start).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { time: 0, sessions: 0 }
      dailyMap.set(date, {
        time: existing.time + (session.duration_seconds || 0),
        sessions: existing.sessions + 1
      })
    })

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      time: data.time,
      sessions: data.sessions
    }))

    // Session type breakdown
    const typeMap = new Map<string, { time: number; sessions: number }>()
    sessions?.forEach(session => {
      const type = session.session_type || 'view'
      const existing = typeMap.get(type) || { time: 0, sessions: 0 }
      typeMap.set(type, {
        time: existing.time + (session.duration_seconds || 0),
        sessions: existing.sessions + 1
      })
    })

    const sessionTypeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      time: data.time,
      sessions: data.sessions
    }))

    return {
      totalTime,
      sessions: sessionCount,
      dailyBreakdown,
      sessionTypeBreakdown
    }
  }
} 