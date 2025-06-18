'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  TabletSmartphone, 
  Save, 
  FolderPlus, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Filter,
  Tag,
  Bookmark
} from 'lucide-react'

interface TabInfo {
  id: string
  title: string
  url: string
  favicon?: string
  domain: string
  selected: boolean
  category?: string
}

const mockTabs: TabInfo[] = [
  {
    id: '1',
    title: 'GitHub - React Documentation',
    url: 'https://github.com/facebook/react',
    domain: 'github.com',
    selected: true,
    category: 'Development'
  },
  {
    id: '2',
    title: 'Stack Overflow - JavaScript Questions',
    url: 'https://stackoverflow.com/questions/tagged/javascript',
    domain: 'stackoverflow.com',
    selected: true,
    category: 'Development'
  },
  {
    id: '3',
    title: 'Medium - Tech Articles',
    url: 'https://medium.com/topic/technology',
    domain: 'medium.com',
    selected: true,
    category: 'Reading'
  },
  {
    id: '4',
    title: 'YouTube - Programming Tutorials',
    url: 'https://youtube.com/watch?v=example',
    domain: 'youtube.com',
    selected: false,
    category: 'Learning'
  },
  {
    id: '5',
    title: 'LinkedIn - Professional Network',
    url: 'https://linkedin.com/feed',
    domain: 'linkedin.com',
    selected: false,
    category: 'Social'
  }
]

const categories = [
  'Development',
  'Reading',
  'Learning',
  'Social',
  'Work',
  'Research',
  'Entertainment',
  'Shopping'
]

export default function TabSaver() {
  const [tabs, setTabs] = useState<TabInfo[]>(mockTabs)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [filterDomain, setFilterDomain] = useState<string>('')

  const loadCurrentTabs = async () => {
    setIsLoading(true)
    try {
      // Simulate loading current browser tabs
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real implementation, this would use browser APIs
      // or a browser extension to get actual tab data
      setTabs(mockTabs)
      toast.success('Current tabs loaded successfully!')
    } catch (error) {
      toast.error('Failed to load current tabs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabToggle = (tabId: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, selected: !tab.selected } : tab
    ))
  }

  const handleSelectAll = () => {
    const allSelected = tabs.every(tab => tab.selected)
    setTabs(prev => prev.map(tab => ({ ...tab, selected: !allSelected })))
  }

  const handleCategoryChange = (tabId: string, category: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, category } : tab
    ))
  }

  const saveSelectedTabs = async () => {
    const selectedTabs = tabs.filter(tab => tab.selected)
    
    if (selectedTabs.length === 0) {
      toast.error('Please select at least one tab to save')
      return
    }

    setIsSaving(true)
    try {
      // Simulate saving bookmarks
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Saved ${selectedTabs.length} tabs as bookmarks!`)
      
      // Reset selections
      setTabs(prev => prev.map(tab => ({ ...tab, selected: false })))
      setFolderName('')
    } catch (error) {
      toast.error('Failed to save bookmarks')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCount = tabs.filter(tab => tab.selected).length
  const uniqueDomains = [...new Set(tabs.map(tab => tab.domain))]
  const filteredTabs = filterDomain
    ? tabs.filter(tab => tab.domain === filterDomain)
    : tabs

  useEffect(() => {
    loadCurrentTabs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <TabletSmartphone className="h-6 w-6" />
            <span>Save Current Tabs</span>
          </h2>
          <p className="text-muted-foreground">
            Save all your current browser tabs as bookmarks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedCount} selected
          </Badge>
          <Button onClick={loadCurrentTabs} disabled={isLoading} variant="outline">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Refresh Tabs
          </Button>
        </div>
      </div>

      {/* Save Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Save Options</span>
          </CardTitle>
          <CardDescription>
            Configure how to save your selected tabs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder Name (Optional)</label>
              <Input
                placeholder="e.g., Research Session, Work Tabs"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {tabs.every(tab => tab.selected) ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Select value={filterDomain === '' ? 'all' : filterDomain} onValueChange={(v) => setFilterDomain(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {uniqueDomains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={saveSelectedTabs}
              disabled={selectedCount === 0 || isSaving}
              className="min-w-32"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save {selectedCount} Tabs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Loading current tabs...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTabs.map((tab) => (
            <Card 
              key={tab.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                tab.selected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleTabToggle(tab.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox 
                    checked={tab.selected}
                    onChange={() => {}} // Handled by card click
                  />
                  
                  <div className="flex items-center space-x-3 flex-1">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{tab.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {tab.url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {tab.domain}
                    </Badge>
                    
                    <Select 
                      value={tab.category || ''} 
                      onValueChange={(value) => handleCategoryChange(tab.id, value)}
                    >
                      <SelectTrigger 
                        className="w-32 h-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {selectedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderPlus className="h-5 w-5" />
              <span>Save Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{selectedCount}</strong> tabs will be saved as bookmarks
              </p>
              {folderName && (
                <p className="text-sm text-muted-foreground">
                  Folder: <strong>{folderName}</strong>
                </p>
              )}
              {selectedCategory && (
                <p className="text-sm text-muted-foreground">
                  Default category: <strong>{selectedCategory}</strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 