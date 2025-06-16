'use client'

import React from 'react'
import { 
  Home, 
  BarChart3, 
  Heart, 
  Settings,
  Menu,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AccentToggle } from '@/components/ui/AccentToggle'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigationItems = [
    { name: 'Dashboard', icon: Home, active: true },
    { name: 'Analytics', icon: BarChart3, active: false },
    { name: 'Favorites', icon: Heart, count: 3, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ]

  const categories = [
    { name: 'Development', count: 2 },
    { name: 'Design', count: 2 },
    { name: 'Productivity', count: 2 },
    { name: 'Learning', count: 0 },
    { name: 'Entertainment', count: 0 },
  ]

  return (
    <div
      data-testid="sidebar"
      className={cn(
        'bg-gray-900 border-r border-gray-800 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">BOOKMARKHUB</h1>
                <p className="text-sm text-gray-400">Your digital workspace</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <Menu className="w-5 h-5" />
              </Button>
              <ThemeToggle />
              <AccentToggle />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              NAVIGATION
            </h2>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={item.active ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    {item.count && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* Footer with Add Bookmark removed along with stats */}
      </div>
    </div>
  )
} 