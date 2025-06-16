'use client'

import React from 'react'
import { ThemeToggle } from './ThemeToggle'
import { AccentToggle } from './AccentToggle'

export function ThemeAccentControls() {
  return (
    <div className="flex space-x-2">
      <ThemeToggle />
      <AccentToggle />
    </div>
  )
}

// additional export for default
export default ThemeAccentControls 