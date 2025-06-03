'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useTheme, Theme, ViewMode } from '../../hooks/useTheme'

interface ThemeContextType {
  theme: Theme
  viewMode: ViewMode
  resolvedTheme: 'light' | 'dark'
  updateTheme: (theme: Theme) => void
  updateViewMode: (viewMode: ViewMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useTheme()

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
} 