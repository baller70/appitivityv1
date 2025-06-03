'use client'

import React from 'react'
import { useThemeContext } from '../providers/ThemeProvider'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, updateTheme } = useThemeContext()

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
    },
  ]

  const currentTheme = themeOptions.find(option => option.value === theme)
  const CurrentIcon = currentTheme?.icon || Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateTheme(option.value)}
              className={theme === option.value ? 'bg-accent' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 