'use client'

import React from 'react'
import { useThemeContext } from '../providers/ThemeProvider'
import { Button } from './button'
import { Grid3X3, List, Kanban } from 'lucide-react'

export function ViewModeToggle() {
  const { viewMode, updateViewMode } = useThemeContext()

  const viewModes = [
    {
      value: 'grid' as const,
      label: 'Grid View',
      icon: Grid3X3,
    },
    {
      value: 'list' as const,
      label: 'List View', 
      icon: List,
    },
    {
      value: 'kanban' as const,
      label: 'Kanban View',
      icon: Kanban,
    },
  ]

  return (
    <div className="flex items-center space-x-1 rounded-lg bg-muted p-1">
      {viewModes.map((mode) => {
        const Icon = mode.icon
        const isActive = viewMode === mode.value
        
        return (
          <Button
            key={mode.value}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateViewMode(mode.value)}
            className={`px-3 ${isActive ? 'bg-background shadow-sm' : 'hover:bg-background/60'}`}
            title={mode.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
} 