import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

export type Theme = 'light' | 'dark' | 'system'
export type ViewMode = 'grid' | 'list' | 'kanban'

interface UserPreferences {
  theme: Theme
  viewMode: ViewMode
}

export function useTheme() {
  // Safely use Clerk hooks with error handling
  let user = null
  let isLoaded = false
  
  try {
    const clerkData = useUser()
    user = clerkData.user
    isLoaded = clerkData.isLoaded
  } catch (error) {
    // If Clerk is not available, continue with guest mode
    console.warn('Clerk not available, using guest mode for theme:', error)
    isLoaded = true // Treat as loaded in guest mode
  }

  const [theme, setTheme] = useState<Theme>('system')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(false)

  // Function to get system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }, [])

  // Function to apply theme to DOM
  const applyTheme = useCallback((actualTheme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(actualTheme)
      setResolvedTheme(actualTheme)
    }
  }, [])

  // Function to resolve theme (handle 'system' option)
  const resolveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return getSystemTheme()
    }
    return themeValue
  }, [getSystemTheme])

  // Load preferences from API for authenticated users
  const loadPreferences = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/preferences')
      if (response.ok) {
        const data = await response.json()
        setTheme(data.theme || 'system')
        setViewMode(data.view_mode || 'grid')
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Fall back to localStorage for guests
      const savedTheme = localStorage.getItem('theme') as Theme
      const savedViewMode = localStorage.getItem('viewMode') as ViewMode
      
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme)
      }
      
      if (savedViewMode && ['grid', 'list', 'kanban'].includes(savedViewMode)) {
        setViewMode(savedViewMode)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Save preferences to API for authenticated users
  const savePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) {
      // Save to localStorage for guests
      if (updates.theme) localStorage.setItem('theme', updates.theme)
      if (updates.viewMode) localStorage.setItem('viewMode', updates.viewMode)
      return
    }

    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
      // Fall back to localStorage
      if (updates.theme) localStorage.setItem('theme', updates.theme)
      if (updates.viewMode) localStorage.setItem('viewMode', updates.viewMode)
    }
  }, [user])

  // Update theme and save preference
  const updateTheme = useCallback(async (newTheme: Theme) => {
    setTheme(newTheme)
    const resolved = resolveTheme(newTheme)
    applyTheme(resolved)
    await savePreferences({ theme: newTheme })
  }, [resolveTheme, applyTheme, savePreferences])

  // Update view mode and save preference
  const updateViewMode = useCallback(async (newViewMode: ViewMode) => {
    setViewMode(newViewMode)
    await savePreferences({ viewMode: newViewMode })
  }, [savePreferences])

  // Load preferences on mount
  useEffect(() => {
    if (isLoaded) {
      loadPreferences()
    }
  }, [isLoaded, loadPreferences])

  // Apply theme when it changes or on system theme change
  useEffect(() => {
    const resolved = resolveTheme(theme)
    applyTheme(resolved)

    // Listen for system theme changes when using 'system' theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newResolved = resolveTheme('system')
        applyTheme(newResolved)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, resolveTheme, applyTheme])

  return {
    theme,
    viewMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLoading,
    updateTheme,
    updateViewMode,
  }
} 