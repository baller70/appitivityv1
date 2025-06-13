'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { 
  Settings, 
  Palette, 
  Shield, 
  Database,
  Bell,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react'

interface SettingsData {
  general: {
    defaultView: string
    itemsPerPage: number
    autoSave: boolean
    confirmDelete: boolean
    showFavicons: boolean
    openInNewTab: boolean
  }
  appearance: {
    theme: string
    accentColor: string
    fontSize: number
    compactMode: boolean
    showThumbnails: boolean
    gridColumns: number
  }
  privacy: {
    trackVisits: boolean
    shareAnalytics: boolean
    publicProfile: boolean
    showActivity: boolean
    dataRetention: number
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    weeklyDigest: boolean
    goalReminders: boolean
    newFeatures: boolean
  }
  sync: {
    autoSync: boolean
    syncInterval: number
    cloudBackup: boolean
    deviceSync: boolean
    conflictResolution: string
  }
}

const defaultSettings: SettingsData = {
  general: {
    defaultView: 'grid',
    itemsPerPage: 20,
    autoSave: true,
    confirmDelete: true,
    showFavicons: true,
    openInNewTab: true
  },
  appearance: {
    theme: 'system',
    accentColor: 'blue',
    fontSize: 14,
    compactMode: false,
    showThumbnails: true,
    gridColumns: 3
  },
  privacy: {
    trackVisits: true,
    shareAnalytics: false,
    publicProfile: false,
    showActivity: true,
    dataRetention: 365
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    goalReminders: true,
    newFeatures: true
  },
  sync: {
    autoSync: true,
    syncInterval: 15,
    cloudBackup: true,
    deviceSync: true,
    conflictResolution: 'latest'
  }
}

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

const accentColors = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-500' }
]

export default function EnhancedBookmarkSettings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setHasChanges(false)
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast.success('Settings reset to defaults')
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bookmark-settings.json'
    link.click()
    toast.success('Settings exported!')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sync', label: 'Sync & Backup', icon: Database }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Bookmark Settings</span>
          </h2>
          <p className="text-muted-foreground">
            Customize your bookmark experience and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              )
            })}
            
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={resetSettings} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure basic bookmark behavior and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default View</label>
                    <Select 
                      value={settings.general.defaultView} 
                      onValueChange={(value) => updateSetting('general', 'defaultView', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="kanban">Kanban View</SelectItem>
                        <SelectItem value="timeline">Timeline View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Items Per Page</label>
                    <Select 
                      value={settings.general.itemsPerPage.toString()} 
                      onValueChange={(value) => updateSetting('general', 'itemsPerPage', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                        <SelectItem value="100">100 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Auto-save changes</label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save bookmark modifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.autoSave}
                      onCheckedChange={(checked) => updateSetting('general', 'autoSave', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Confirm before deleting</label>
                      <p className="text-sm text-muted-foreground">
                        Show confirmation dialog when deleting bookmarks
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.confirmDelete}
                      onCheckedChange={(checked) => updateSetting('general', 'confirmDelete', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Show favicons</label>
                      <p className="text-sm text-muted-foreground">
                        Display website icons next to bookmark titles
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.showFavicons}
                      onCheckedChange={(checked) => updateSetting('general', 'showFavicons', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Open in new tab</label>
                      <p className="text-sm text-muted-foreground">
                        Open bookmarks in new browser tabs by default
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.openInNewTab}
                      onCheckedChange={(checked) => updateSetting('general', 'openInNewTab', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance Settings</span>
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your bookmark interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {themes.map((theme) => {
                        const Icon = theme.icon
                        return (
                          <Button
                            key={theme.value}
                            variant={settings.appearance.theme === theme.value ? 'default' : 'outline'}
                            className="flex flex-col h-16"
                            onClick={() => updateSetting('appearance', 'theme', theme.value)}
                          >
                            <Icon className="h-5 w-5 mb-1" />
                            <span className="text-xs">{theme.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Accent Color</label>
                    <div className="grid grid-cols-6 gap-2">
                      {accentColors.map((color) => (
                        <Button
                          key={color.value}
                          variant="outline"
                          className={`h-12 p-2 ${settings.appearance.accentColor === color.value ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => updateSetting('appearance', 'accentColor', color.value)}
                        >
                          <div className={`w-full h-full rounded ${color.color}`} />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font Size: {settings.appearance.fontSize}px</label>
                    <Slider
                      value={[settings.appearance.fontSize]}
                      onValueChange={([value]) => updateSetting('appearance', 'fontSize', value)}
                      min={12}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grid Columns: {settings.appearance.gridColumns}</label>
                    <Slider
                      value={[settings.appearance.gridColumns]}
                      onValueChange={([value]) => updateSetting('appearance', 'gridColumns', value)}
                      min={2}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Compact mode</label>
                      <p className="text-sm text-muted-foreground">
                        Use smaller spacing and condensed layout
                      </p>
                    </div>
                    <Switch
                      checked={settings.appearance.compactMode}
                      onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Show thumbnails</label>
                      <p className="text-sm text-muted-foreground">
                        Display preview images for bookmarks
                      </p>
                    </div>
                    <Switch
                      checked={settings.appearance.showThumbnails}
                      onCheckedChange={(checked) => updateSetting('appearance', 'showThumbnails', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>
                  Control your data privacy and sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Track bookmark visits</label>
                      <p className="text-sm text-muted-foreground">
                        Record when you visit bookmarks for analytics
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.trackVisits}
                      onCheckedChange={(checked) => updateSetting('privacy', 'trackVisits', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Share anonymous analytics</label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the app by sharing usage data
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.shareAnalytics}
                      onCheckedChange={(checked) => updateSetting('privacy', 'shareAnalytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Public profile</label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your public bookmarks
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.publicProfile}
                      onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Show activity status</label>
                      <p className="text-sm text-muted-foreground">
                        Display when you were last active
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.showActivity}
                      onCheckedChange={(checked) => updateSetting('privacy', 'showActivity', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data retention: {settings.privacy.dataRetention} days</label>
                    <p className="text-sm text-muted-foreground">
                      How long to keep your activity data
                    </p>
                    <Slider
                      value={[settings.privacy.dataRetention]}
                      onValueChange={([value]) => updateSetting('privacy', 'dataRetention', value)}
                      min={30}
                      max={730}
                      step={30}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Email notifications</label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates and reminders via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Push notifications</label>
                      <p className="text-sm text-muted-foreground">
                        Get instant notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Weekly digest</label>
                      <p className="text-sm text-muted-foreground">
                        Summary of your bookmark activity each week
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyDigest}
                      onCheckedChange={(checked) => updateSetting('notifications', 'weeklyDigest', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Goal reminders</label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about your bookmark goals
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.goalReminders}
                      onCheckedChange={(checked) => updateSetting('notifications', 'goalReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">New features</label>
                      <p className="text-sm text-muted-foreground">
                        Updates about new app features and improvements
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.newFeatures}
                      onCheckedChange={(checked) => updateSetting('notifications', 'newFeatures', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sync & Backup Settings */}
          {activeTab === 'sync' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Sync & Backup Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure data synchronization and backup options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Auto-sync</label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync changes across devices
                      </p>
                    </div>
                    <Switch
                      checked={settings.sync.autoSync}
                      onCheckedChange={(checked) => updateSetting('sync', 'autoSync', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sync interval: {settings.sync.syncInterval} minutes</label>
                    <Slider
                      value={[settings.sync.syncInterval]}
                      onValueChange={([value]) => updateSetting('sync', 'syncInterval', value)}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Cloud backup</label>
                      <p className="text-sm text-muted-foreground">
                        Backup your bookmarks to cloud storage
                      </p>
                    </div>
                    <Switch
                      checked={settings.sync.cloudBackup}
                      onCheckedChange={(checked) => updateSetting('sync', 'cloudBackup', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Device sync</label>
                      <p className="text-sm text-muted-foreground">
                        Sync bookmarks across all your devices
                      </p>
                    </div>
                    <Switch
                      checked={settings.sync.deviceSync}
                      onCheckedChange={(checked) => updateSetting('sync', 'deviceSync', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conflict resolution</label>
                    <Select 
                      value={settings.sync.conflictResolution} 
                      onValueChange={(value) => updateSetting('sync', 'conflictResolution', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Use latest version</SelectItem>
                        <SelectItem value="manual">Manual resolution</SelectItem>
                        <SelectItem value="merge">Auto-merge changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Settings
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Backup Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 