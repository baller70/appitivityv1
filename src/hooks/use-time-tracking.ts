import { useState, useEffect, useRef, useCallback } from 'react'
import { BookmarkSession, TimeStats } from '@/lib/services/time-tracking'

interface UseTimeTrackingProps {
  bookmarkId: string
  sessionType?: 'view' | 'focus' | 'timer' | 'research' | 'reading'
  autoStart?: boolean
  metadata?: Record<string, any>
}

export function useTimeTracking({
  bookmarkId,
  sessionType = 'view',
  autoStart = true,
  metadata = {}
}: UseTimeTrackingProps) {
  const [activeSession, setActiveSession] = useState<BookmarkSession | null>(null)
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

    // Start tracking session
  const startTracking = useCallback(async () => {
    if (!bookmarkId) return
    
    try {
      setError(null)

      const response = await fetch('/api/time-tracking/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId,
          sessionType,
          metadata
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start tracking session')
      }

      const session = await response.json()
      setActiveSession(session)
      setIsTracking(true)
      startTimeRef.current = new Date()

      // Start elapsed time counter
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
          setElapsedTime(elapsed)
        }
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking')
      console.error('Error starting time tracking:', err)
    }
  }, [bookmarkId, sessionType, metadata])

  // Stop tracking session
  const stopTracking = useCallback(async () => {
    try {
      setError(null)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (activeSession) {
        const response = await fetch('/api/time-tracking/session', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: activeSession.id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to stop tracking session')
        }
      }

      setActiveSession(null)
      setIsTracking(false)
      setElapsedTime(0)
      startTimeRef.current = null

      // Refresh time stats after stopping
      await refreshTimeStats()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop tracking')
      console.error('Error stopping time tracking:', err)
    }
  }, [activeSession])

  // Get time statistics for the bookmark
  const refreshTimeStats = useCallback(async () => {
    if (!bookmarkId) return
    
    try {
      const response = await fetch(`/api/time-tracking/stats?bookmarkId=${bookmarkId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch time stats')
      }

      const stats = await response.json()
      setTimeStats(stats)
    } catch (err) {
      console.error('Error fetching time stats:', err)
    }
  }, [bookmarkId])

  // Check for active session on mount
  const checkActiveSession = useCallback(async () => {
    if (!bookmarkId) return
    
    try {
      const response = await fetch(`/api/time-tracking/session?bookmarkId=${bookmarkId}`)
      
      if (!response.ok) {
        return
      }

      const session = await response.json()
      if (session && session.is_active) {
        setActiveSession(session)
        setIsTracking(true)
        startTimeRef.current = new Date(session.session_start)

        // Calculate elapsed time since session start
        const elapsed = Math.floor((Date.now() - new Date(session.session_start).getTime()) / 1000)
        setElapsedTime(elapsed)

        // Start interval for real-time updates
        intervalRef.current = setInterval(() => {
          if (startTimeRef.current) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
            setElapsedTime(elapsed)
          }
        }, 1000)
      }
    } catch (err) {
      console.error('Error checking active session:', err)
    }
  }, [bookmarkId])

  // Format elapsed time for display
  const formatElapsedTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }, [])

  // Toggle tracking
  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking()
    } else {
      startTracking()
    }
  }, [isTracking, startTracking, stopTracking])

  // Initialize
  useEffect(() => {
    if (!bookmarkId) return
    
    checkActiveSession()
    refreshTimeStats()

    // Auto-start if specified
    if (autoStart && !isTracking) {
      const timer = setTimeout(() => {
        startTracking()
      }, 1000) // Delay to avoid conflicts with existing session check

      return () => clearTimeout(timer)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [bookmarkId, autoStart])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Optionally stop tracking when component unmounts
      if (isTracking && activeSession) {
        stopTracking()
      }
    }
  }, [])

  return {
    // State
    activeSession,
    timeStats,
    isTracking,
    elapsedTime,
    error,

    // Actions
    startTracking,
    stopTracking,
    toggleTracking,
    refreshTimeStats,

    // Utilities
    formatElapsedTime,
    formattedElapsedTime: formatElapsedTime(elapsedTime)
  }
} 