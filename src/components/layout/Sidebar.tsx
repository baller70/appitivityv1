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

        {/* Categories */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-between text-sm"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {!isCollapsed && (
          <div className="p-4 mt-auto border-t border-gray-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Bookmarks</span>
                <span className="text-sm font-semibold text-white">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">This Month</span>
                <span className="text-sm font-semibold text-green-400">+12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Favorites</span>
                <span className="text-sm font-semibold text-white">3</span>
              </div>
            </div>
            
            <Button className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 