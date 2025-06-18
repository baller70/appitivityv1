import { useCallback, useEffect, useRef, useState } from 'react'
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
  const isTrackingRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    isTrackingRef.current = isTracking
  }, [isTracking])

  // Start tracking session
  const startTracking = useCallback(async () => {
    if (!bookmarkId) {
      console.log('🕒 Cannot start tracking - no bookmarkId')
      return
    }
    
    console.log('🕒 Starting tracking session for bookmark:', bookmarkId)
    
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

      console.log('🕒 Session start response status:', response.status)

      if (!response.ok) {
        // Check if it's an authentication error
        const authStatus = response.headers.get('x-clerk-auth-status')
        console.log('🕒 Auth status:', authStatus)
        if (authStatus === 'signed-out') {
          console.warn('User not authenticated, skipping time tracking')
          return // Silently skip time tracking if user is not authenticated
        }
        throw new Error('Failed to start tracking session')
      }

      const session = await response.json()
      console.log('🕒 Session started successfully:', session.id)
      setActiveSession(session)
      setIsTracking(true)
      isTrackingRef.current = true
      startTimeRef.current = new Date()

      // Start elapsed time counter
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
          setElapsedTime(elapsed)
        }
      }, 1000)

    } catch (err) {
      // For automatic tracking, don't show errors to user, just log them
      if (autoStart) {
        console.warn('Automatic time tracking failed (this is normal if not signed in):', err)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start tracking')
        console.error('Error starting time tracking:', err)
      }
    }
  }, [bookmarkId, sessionType, metadata, autoStart])

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
      isTrackingRef.current = false
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
        // Check if it's an authentication error
        const authStatus = response.headers.get('x-clerk-auth-status')
        if (authStatus === 'signed-out') {
          console.warn('User not authenticated, skipping time stats refresh')
          return // Silently skip if user is not authenticated
        }
        throw new Error('Failed to fetch time stats')
      }

      const stats = await response.json()
      setTimeStats(stats)
    } catch (err) {
      console.warn('Error fetching time stats (this is normal if not signed in):', err)
    }
  }, [bookmarkId])

  // Check for active session on mount
  const checkActiveSession = useCallback(async () => {
    if (!bookmarkId) {
      console.log('🕒 Cannot check active session - no bookmarkId')
      return
    }
    
    console.log('🕒 Checking for active session for bookmark:', bookmarkId)
    
    try {
      const response = await fetch(`/api/time-tracking/session?bookmarkId=${bookmarkId}`)
      
      console.log('🕒 Active session check response status:', response.status)
      
      if (!response.ok) {
        // Check if it's an authentication error
        const authStatus = response.headers.get('x-clerk-auth-status')
        console.log('🕒 Auth status for active session check:', authStatus)
        if (authStatus === 'signed-out') {
          console.warn('User not authenticated, skipping active session check')
        }
        return
      }

      const session = await response.json()
      console.log('🕒 Active session response:', session)
      
      if (session && session.is_active) {
        console.log('🕒 Found existing active session:', session.id)
        setActiveSession(session)
        setIsTracking(true)
        isTrackingRef.current = true
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
      } else {
        console.log('🕒 No active session found')
      }
    } catch (err) {
      console.warn('Error checking active session (this is normal if not signed in):', err)
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
    
    const initializeTracking = async () => {
      console.log('🕒 Initializing time tracking for bookmark:', bookmarkId)
      
      // First, check for existing active sessions
      await checkActiveSession()
      
      // Wait a bit, then check if we need to auto-start
      setTimeout(async () => {
        console.log('🕒 Auto-start check - autoStart:', autoStart, 'isTracking:', isTrackingRef.current)
        // Only auto-start if there's no active session and autoStart is enabled
        if (autoStart && !isTrackingRef.current) {
          console.log('🕒 Starting automatic time tracking...')
          await startTracking()
        } else {
          console.log('🕒 Skipping auto-start - already tracking or auto-start disabled')
        }
      }, 1000) // Increase delay to ensure state is properly updated
    }

    initializeTracking()
    refreshTimeStats()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [bookmarkId]) // Remove autoStart and isTracking from dependencies to avoid loops

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