'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

interface SimpleTag {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export function SimpleTagManager() {
  const { user, isLoaded } = useUser()
  const [tags, setTags] = useState<SimpleTag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')
  const [loading, setLoading] = useState(false)

  // Load tags
  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  // Create tag
  const createTag = async () => {
    if (!newTagName.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (response.ok) {
        const newTag = await response.json()
        setTags(prev => [...prev, newTag])
        setNewTagName('')
        setNewTagColor('#3B82F6')
      } else {
        console.error('Failed to create tag')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      loadTags()
    }
  }, [isLoaded, user])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in to manage tags</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Simple Tag Manager</h2>
      
      {/* Create new tag */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="flex-1"
        />
        <input
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
          className="w-12 h-10 rounded border"
        />
        <Button 
          onClick={createTag} 
          disabled={loading || !newTagName.trim()}
        >
          {loading ? 'Creating...' : 'Create Tag'}
        </Button>
      </div>

      {/* Display tags */}
      <div className="space-y-2">
        <h3 className="font-semibold">Your Tags ({tags.length})</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge 
              key={tag.id} 
              style={{ backgroundColor: tag.color }}
              className="text-white"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        {tags.length === 0 && (
          <p className="text-gray-500">No tags yet. Create your first tag above!</p>
        )}
      </div>
    </div>
  )
} 