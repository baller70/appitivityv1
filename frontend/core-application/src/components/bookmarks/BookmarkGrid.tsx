'use client'

import React from 'react'

interface Bookmark {
  id: string
  title: string
  url: string
  description: string
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  category: string
  visits: number
  logo: string
  screenshot?: string
  fullDescription: string
}

export default function BookmarkGrid() {
  const generateId = () => crypto.randomUUID();
  
  const bookmarks: Bookmark[] = [
    {
      id: generateId(),
      title: 'GitHub',
      url: 'https://github.com',
      description: 'Development platform for version control and collaboration',
      tags: ['code', 'git', 'collaboration', 'open-source'],
      priority: 'high',
      category: 'Development',
      visits: 45,
      logo: 'G',
      fullDescription: 'Main repository hosting platform for all projects. Contains personal and work repositories.'
    },
    {
      id: generateId(),
      title: 'Figma',
      url: 'https://figma.com',
      description: 'Collaborative design tool for UI/UX',
      tags: ['design', 'ui', 'collaboration', 'prototyping'],
      priority: 'high',
      category: 'Design',
      visits: 32,
      logo: 'F',
      fullDescription: 'Primary design tool for all UI/UX projects. Team collaboration workspace.'
    },
    {
      id: generateId(),
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      description: 'Q&A platform for developers',
      tags: ['help', 'programming', 'community', 'q&a'],
      priority: 'medium',
      category: 'Development',
      visits: 28,
      logo: 'S',
      fullDescription: 'Go-to resource for coding questions and solutions. Great community support.'
    },
    {
      id: generateId(),
      title: 'Notion',
      url: 'https://notion.so',
      description: 'All-in-one workspace for notes and collaboration',
      tags: ['notes', 'workspace', 'organization', 'collaboration'],
      priority: 'high',
      category: 'Productivity',
      visits: 67,
      logo: 'N',
      fullDescription: 'Main workspace for project management, documentation, and team collaboration.'
    },
    {
      id: generateId(),
      title: 'Dribbble',
      url: 'https://dribbble.com',
      description: 'Design inspiration and portfolio platform',
      tags: ['inspiration', 'portfolio', 'design', 'creative'],
      priority: 'low',
      category: 'Design',
      visits: 15,
      logo: 'D',
      fullDescription: 'Source of design inspiration and trends. Follow top designers for ideas.'
    },
    {
      id: generateId(),
      title: 'Linear',
      url: 'https://linear.app',
      description: 'Issue tracking and project management',
      tags: ['project', 'tracking', 'management', 'agile'],
      priority: 'medium',
      category: 'Productivity',
      visits: 23,
      logo: 'L',
      fullDescription: 'Issue tracking for development projects. Clean interface and fast performance.'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks.map((bookmark) => (
        <div 
          key={bookmark.id}
          data-testid="bookmark-card"
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors"
        >
          {/* Header with Logo and URL */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              {bookmark.logo}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{bookmark.title}</h3>
              <p className="text-sm text-gray-400">{bookmark.url}</p>
            </div>
          </div>

          {/* Screenshot placeholder */}
          <div className="bg-gray-700 rounded-lg h-32 mb-4 flex items-center justify-center">
            <span className="text-gray-500 text-sm">{bookmark.title} screenshot</span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-3">{bookmark.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {bookmark.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Priority and Category */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${getPriorityColor(bookmark.priority)}`}>
              {bookmark.priority}
            </span>
            <span className="text-sm text-gray-400">{bookmark.category}</span>
          </div>

          {/* Visits */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{bookmark.visits} visits</span>
          </div>

          {/* Full Description */}
          <p className="text-gray-400 text-xs mt-3 border-t border-gray-700 pt-3">
            {bookmark.fullDescription}
          </p>
        </div>
      ))}
    </div>
  )
} 