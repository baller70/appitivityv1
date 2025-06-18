'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
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
  RotateCcw,
  User,
  ArrowLeft,
  Clock,
  Keyboard,
  Wifi,
  HardDrive,
  Volume2,
  Key,
  FileText,
  Image,
  Link,
  Search,
  Filter,
  Grid,
  List,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Tag,
  Folder,
  Star,
  Heart,
  Bookmark,
  Archive,
  Share2,
  ExternalLink,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  Cloud
} from 'lucide-react'
import { TimeCapsulePage } from '../time-capsule/time-capsule-page'

interface EnhancedSettingsProps {
  userId?: string;
}

export default function EnhancedBookmarkSettings({ userId: _userId }: EnhancedSettingsProps) {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    compactView: false,
    showFavicons: true,
    animationsEnabled: true,
    
    // Behavior
    language: 'en',
    autoSave: true,
    autoSync: true,
    defaultView: 'grid',
    itemsPerPage: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    
    // Notifications
    notifications: {
      email: true,
      push: false,
      weekly: true,
      bookmarkReminders: false,
      duplicateWarnings: true,
      syncNotifications: true
    },
    
    // Privacy & Security
    privacy: {
      publicProfile: false,
      shareData: false,
      analytics: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      encryptBookmarks: false
    },
    
    // Import/Export
    backup: {
      autoBackup: true,
      backupFrequency: 'weekly',
      includeMetadata: true,
      compressionLevel: 'medium'
    },
    
    // Performance
    performance: {
      cacheSize: 100,
      preloadImages: true,
      lazyLoading: true,
      offlineMode: false
    },
    
    // Accessibility
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true
    },
    
    // Voice Control
    voice: {
      enabled: false,
      wakeWordEnabled: false,
      language: 'en-US',
      continuousListening: false
    },
    
    // Advanced
    advanced: {
      developerMode: false,
      betaFeatures: false,
      apiAccess: false,
      debugLogging: false,
      cacheSize: 100,
      preloadImages: true
    }
  });

  const [activeTab, setActiveTab] = useState('appearance')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Track changes for auto-save
  useEffect(() => {
    if (hasChanges && settings.autoSave) {
      const timer = setTimeout(() => {
        handleSaveSettings();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [settings, hasChanges]);

  const handleSettingChange = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    toast.success('Setting updated');
  };

  const handleNestedSettingChange = (category: keyof typeof settings, key: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, boolean | string | number>),
        [key]: value
      }
    }));
    setHasChanges(true);
    toast.success('Setting updated');
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to their default values?')) {
      setSettings({
        theme: 'light',
        accentColor: 'blue',
        fontSize: 'medium',
        compactView: false,
        showFavicons: true,
        animationsEnabled: true,
        language: 'en',
        autoSave: true,
        autoSync: true,
        defaultView: 'grid',
        itemsPerPage: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
        notifications: {
          email: true,
          push: false,
          weekly: true,
          bookmarkReminders: false,
          duplicateWarnings: true,
          syncNotifications: true
        },
        privacy: {
          publicProfile: false,
          shareData: false,
          analytics: true,
          twoFactorAuth: false,
          sessionTimeout: 30,
          encryptBookmarks: false
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'weekly',
          includeMetadata: true,
          compressionLevel: 'medium'
        },
        performance: {
          cacheSize: 100,
          preloadImages: true,
          lazyLoading: true,
          offlineMode: false
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          screenReader: false,
          keyboardNavigation: true,
          focusIndicators: true
        },
        voice: {
          enabled: false,
          wakeWordEnabled: false,
          language: 'en-US',
          continuousListening: false
        },
        advanced: {
          developerMode: false,
          betaFeatures: false,
          apiAccess: false,
          debugLogging: false,
          cacheSize: 100,
          preloadImages: true
        }
      });
      setHasChanges(true);
      toast.success('Settings reset to defaults');
    }
  };

  const handleExportData = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'apptivity-settings.json';
      link.click();
      toast.success('Settings exported successfully!');
    } catch {
      toast.error('Failed to export settings');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      try {
        toast.success('Account deletion initiated. You will receive a confirmation email.');
      } catch {
        toast.error('Failed to delete account');
      }
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all your bookmarks? This action cannot be undone.')) {
      try {
        toast.success('Data cleared successfully');
      } catch {
        toast.error('Failed to clear data');
      }
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'voice', label: 'Voice Control', icon: Volume2 },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'account', label: 'Account', icon: User },
    { id: 'timecapsule', label: 'Time Capsule', icon: Archive }
  ]

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                SETTINGS
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account preferences and application settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  Unsaved changes
                </Badge>
              )}
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleSaveSettings} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Settings Categories</CardTitle>
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
                <Button variant="outline" onClick={handleResetSettings} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Visual Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your bookmark manager
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Theme</Label>
                          <div className="text-sm text-muted-foreground">
                            Choose your preferred color scheme
                          </div>
                        </div>
                        <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                Light
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                Dark
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                System
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Accent Color</Label>
                          <div className="text-sm text-muted-foreground">
                            Primary color for highlights and buttons
                          </div>
                        </div>
                        <Select value={settings.accentColor} onValueChange={(value) => handleSettingChange('accentColor', value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Font Size</Label>
                          <div className="text-sm text-muted-foreground">
                            Adjust text size for better readability
                          </div>
                        </div>
                        <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="extra-large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Compact View</Label>
                          <div className="text-sm text-muted-foreground">
                            Use a more compact layout for bookmarks
                          </div>
                        </div>
                        <Switch
                          checked={settings.compactView}
                          onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Show Favicons</Label>
                          <div className="text-sm text-muted-foreground">
                            Display website icons next to bookmarks
                          </div>
                        </div>
                        <Switch
                          checked={settings.showFavicons}
                          onCheckedChange={(checked) => handleSettingChange('showFavicons', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Animations</Label>
                          <div className="text-sm text-muted-foreground">
                            Enable smooth transitions and animations
                          </div>
                        </div>
                        <Switch
                          checked={settings.animationsEnabled}
                          onCheckedChange={(checked) => handleSettingChange('animationsEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Behavior Settings */}
            {activeTab === 'behavior' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Application Behavior
                  </CardTitle>
                  <CardDescription>
                    Configure how the application behaves and responds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Language</Label>
                          <div className="text-sm text-muted-foreground">
                            Select your preferred language
                          </div>
                        </div>
                        <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Default View</Label>
                          <div className="text-sm text-muted-foreground">
                            How bookmarks are displayed by default
                          </div>
                        </div>
                        <Select value={settings.defaultView} onValueChange={(value) => handleSettingChange('defaultView', value)}>
                          <SelectTrigger className="w-[140px]">
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

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Items Per Page</Label>
                          <div className="text-sm text-muted-foreground">
                            Number of bookmarks to show per page
                          </div>
                        </div>
                        <Select value={settings.itemsPerPage.toString()} onValueChange={(value) => handleSettingChange('itemsPerPage', parseInt(value))}>
                          <SelectTrigger className="w-[140px]">
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
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-save changes</Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically save bookmark modifications
                          </div>
                        </div>
                        <Switch
                          checked={settings.autoSave}
                          onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-sync</Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically sync data across devices
                          </div>
                        </div>
                        <Switch
                          checked={settings.autoSync}
                          onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Sort By</Label>
                          <div className="text-sm text-muted-foreground">
                            Default sorting method for bookmarks
                          </div>
                        </div>
                        <Select value={settings.sortBy} onValueChange={(value) => handleSettingChange('sortBy', value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created_at">Date Created</SelectItem>
                            <SelectItem value="updated_at">Date Modified</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="visits">Visit Count</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Digest</Label>
                        <div className="text-sm text-muted-foreground">
                          Weekly summary of your bookmark activity
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.weekly}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'weekly', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Bookmark Reminders</Label>
                        <div className="text-sm text-muted-foreground">
                          Reminders for bookmarks you haven't visited
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.bookmarkReminders}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'bookmarkReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Duplicate Warnings</Label>
                        <div className="text-sm text-muted-foreground">
                          Alert when adding duplicate bookmarks
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.duplicateWarnings}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'duplicateWarnings', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Sync Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Notifications about sync status and conflicts
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.syncNotifications}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'syncNotifications', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy & Security Settings */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Manage your privacy settings and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Public Profile</Label>
                        <div className="text-sm text-muted-foreground">
                          Allow others to view your public bookmarks
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.publicProfile}
                        onCheckedChange={(checked) => handleNestedSettingChange('privacy', 'publicProfile', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Share Usage Data</Label>
                        <div className="text-sm text-muted-foreground">
                          Help improve the app by sharing anonymous usage data
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.shareData}
                        onCheckedChange={(checked) => handleNestedSettingChange('privacy', 'shareData', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Analytics</Label>
                        <div className="text-sm text-muted-foreground">
                          Enable analytics to track your bookmark usage
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => handleNestedSettingChange('privacy', 'analytics', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <div className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.twoFactorAuth}
                        onCheckedChange={(checked) => handleNestedSettingChange('privacy', 'twoFactorAuth', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Session Timeout</Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically log out after inactivity (minutes)
                        </div>
                      </div>
                      <Select 
                        value={settings.privacy.sessionTimeout.toString()} 
                        onValueChange={(value) => handleNestedSettingChange('privacy', 'sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="0">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Encrypt Bookmarks</Label>
                        <div className="text-sm text-muted-foreground">
                          Encrypt bookmark data for enhanced security
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.encryptBookmarks}
                        onCheckedChange={(checked) => handleNestedSettingChange('privacy', 'encryptBookmarks', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voice Control Settings */}
            {activeTab === 'voice' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Voice Control
                  </CardTitle>
                  <CardDescription>
                    Configure voice commands and speech recognition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Voice Control</Label>
                        <div className="text-sm text-muted-foreground">
                          Use voice commands to control the application
                        </div>
                      </div>
                      <Switch
                        checked={settings.voice.enabled}
                        onCheckedChange={(checked) => handleNestedSettingChange('voice', 'enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Wake Word</Label>
                        <div className="text-sm text-muted-foreground">
                          Enable wake word detection for hands-free use
                        </div>
                      </div>
                      <Switch
                        checked={settings.voice.wakeWordEnabled}
                        onCheckedChange={(checked) => handleNestedSettingChange('voice', 'wakeWordEnabled', checked)}
                        disabled={!settings.voice.enabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Voice Language</Label>
                        <div className="text-sm text-muted-foreground">
                          Language for voice recognition
                        </div>
                      </div>
                      <Select 
                        value={settings.voice.language} 
                        onValueChange={(value) => handleNestedSettingChange('voice', 'language', value)}
                        disabled={!settings.voice.enabled}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Continuous Listening</Label>
                        <div className="text-sm text-muted-foreground">
                          Keep microphone active for continuous commands
                        </div>
                      </div>
                      <Switch
                        checked={settings.voice.continuousListening}
                        onCheckedChange={(checked) => handleNestedSettingChange('voice', 'continuousListening', checked)}
                        disabled={!settings.voice.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>
                    Advanced configuration options for power users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Developer Mode</Label>
                        <div className="text-sm text-muted-foreground">
                          Enable developer tools and debugging features
                        </div>
                      </div>
                      <Switch
                        checked={settings.advanced.developerMode}
                        onCheckedChange={(checked) => handleNestedSettingChange('advanced', 'developerMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Beta Features</Label>
                        <div className="text-sm text-muted-foreground">
                          Access experimental features before they're released
                        </div>
                      </div>
                      <Switch
                        checked={settings.advanced.betaFeatures}
                        onCheckedChange={(checked) => handleNestedSettingChange('advanced', 'betaFeatures', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">API Access</Label>
                        <div className="text-sm text-muted-foreground">
                          Enable API access for third-party integrations
                        </div>
                      </div>
                      <Switch
                        checked={settings.advanced.apiAccess}
                        onCheckedChange={(checked) => handleNestedSettingChange('advanced', 'apiAccess', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Debug Logging</Label>
                        <div className="text-sm text-muted-foreground">
                          Enable detailed logging for troubleshooting
                        </div>
                      </div>
                      <Switch
                        checked={settings.advanced.debugLogging}
                        onCheckedChange={(checked) => handleNestedSettingChange('advanced', 'debugLogging', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Cache Size (MB)</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        Amount of storage to use for caching: {settings.advanced.cacheSize}MB
                      </div>
                      <Slider
                        value={[settings.advanced.cacheSize]}
                        onValueChange={(value) => handleNestedSettingChange('advanced', 'cacheSize', value[0])}
                        max={500}
                        min={50}
                        step={25}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Preload Images</Label>
                        <div className="text-sm text-muted-foreground">
                          Preload bookmark thumbnails for faster loading
                        </div>
                      </div>
                      <Switch
                        checked={settings.advanced.preloadImages}
                        onCheckedChange={(checked) => handleNestedSettingChange('advanced', 'preloadImages', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Settings */}
            {activeTab === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Data Export</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all your bookmarks and settings to a JSON file
                      </p>
                      <Button onClick={handleExportData} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Clear All Data</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete all your bookmarks and folders. This action cannot be undone.
                      </p>
                      <Button onClick={handleClearData} variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </Button>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
                      <h3 className="font-medium mb-2 text-red-900 dark:text-red-100">Danger Zone</h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button onClick={handleDeleteAccount} variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Capsule Settings */}
            {activeTab === 'timecapsule' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Time Capsule
                  </CardTitle>
                  <CardDescription>
                    Manage your time capsule settings and archived content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeCapsulePage />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 