import { useEffect, useState } from 'react'

export type Accent = 'brand' | 'blue' | 'green' | 'purple' | 'orange'

export function useAccent() {
  const [accent, setAccent] = useState<Accent>('brand')

  // Load saved accent on mount
  useEffect(() => {
    const stored = localStorage.getItem('accent') as Accent | null
    if (stored) {
      setAccent(stored)
      document.documentElement.setAttribute('data-accent', stored)
    }
  }, [])

  // Apply accent and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    localStorage.setItem('accent', accent)
  }, [accent])

  return { accent, setAccent }
} 