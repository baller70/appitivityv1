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
      className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">BookmarkHub</h1>
                <p className="text-sm text-gray-400">Your digital workspace</p>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h2>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href="#"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.count && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </a>
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
                <a
                  key={category.name}
                  href="#"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </a>
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
            
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Bookmark
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 