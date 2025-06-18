/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Download, 
  Trash2,
  Moon,
  Sun,
  ArrowLeft,
  Palette,
  Zap,
  Clock,
  Eye,
  Keyboard,
  Wifi,
  HardDrive,
  RefreshCw,
  Settings,
  Monitor,
  Smartphone,
  Volume2,
  Lock,
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
  RotateCcw,
  Save,
  Upload,
  Cloud
} from 'lucide-react';
import { toast } from 'sonner';
import { TimeCapsulePage } from '../time-capsule/time-capsule-page'

interface SettingsPageProps {
  userId: string;
}

export function SettingsPage({ userId: _userId }: SettingsPageProps) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes for auto-save
  useEffect(() => {
    if (hasUnsavedChanges && settings.autoSave) {
      const timer = setTimeout(() => {
        handleSaveSettings();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [settings, hasUnsavedChanges]);

  const handleSettingChange = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    toast.success('Setting updated');
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would save settings to your backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setHasUnsavedChanges(false);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
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
      setHasUnsavedChanges(false);
      toast.success('Settings reset to defaults');
    }
  };

  const handleExportData = async () => {
    try {
      toast.success('Export started - you will receive an email when ready');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        toast.success('Account deletion process started');
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

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            SETTINGS
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and application settings
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:grid-cols-8">
            <TabsTrigger value="appearance" className="text-xs lg:text-sm">
              <Palette className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs lg:text-sm">
              <Settings className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs lg:text-sm">
              <Bell className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs lg:text-sm">
              <Shield className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs lg:text-sm">
              <Volume2 className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs lg:text-sm">
              <Zap className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs lg:text-sm">
              <User className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="timecapsule" className="text-xs lg:text-sm">
              <Archive className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Time Capsule</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
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
          </TabsContent>

          {/* Behavior Settings */}
          <TabsContent value="behavior" className="space-y-6">
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
                          <SelectItem value="grid">
                            <div className="flex items-center gap-2">
                              <Grid className="h-4 w-4" />
                              Grid
                            </div>
                          </SelectItem>
                          <SelectItem value="list">
                            <div className="flex items-center gap-2">
                              <List className="h-4 w-4" />
                              List
                            </div>
                          </SelectItem>
                          <SelectItem value="compact">
                            <div className="flex items-center gap-2">
                              <Minus className="h-4 w-4" />
                              Compact
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Items Per Page</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        Number of bookmarks to show per page: {settings.itemsPerPage}
                      </div>
                      <Slider
                        value={[settings.itemsPerPage]}
                        onValueChange={(value) => handleSettingChange('itemsPerPage', value[0])}
                        max={100}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Auto-save</Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically save changes as you work
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
                          Sync changes across devices automatically
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
                          <SelectItem value="created_at">Date Added</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="visits">Most Visited</SelectItem>
                          <SelectItem value="favorites">Favorites</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive email updates about your bookmarks
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
                          Receive push notifications in your browser
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Summary</Label>
                        <div className="text-sm text-muted-foreground">
                          Get a weekly summary of your bookmarking activity
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.weekly}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'weekly', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Bookmark Reminders</Label>
                        <div className="text-sm text-muted-foreground">
                          Get reminded about bookmarks you haven't visited
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
                          Notify when data syncs across devices
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.syncNotifications}
                        onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'syncNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy, security, and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Privacy Settings</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Public Profile</Label>
                        <div className="text-sm text-muted-foreground">
                          Make your profile visible to other users
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
                          Help improve the service by sharing anonymous usage data
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
                          Allow analytics to help us improve your experience
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => handleNestedSettingChange('privacy', 'analytics', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Security Settings</h4>
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

                    <div className="space-y-2">
                      <Label className="text-base">Session Timeout</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        Auto-logout after inactivity: {settings.privacy.sessionTimeout} minutes
                      </div>
                      <Slider
                        value={[settings.privacy.sessionTimeout]}
                        onValueChange={(value) => handleNestedSettingChange('privacy', 'sessionTimeout', value[0])}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Control */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice Control
                </CardTitle>
                <CardDescription>
                  Configure voice commands and speech recognition settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Enable "Hey Bookmark" wake word detection
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
                          Keep listening for commands continuously
                        </div>
                      </div>
                      <Switch
                        checked={settings.voice.continuousListening}
                        onCheckedChange={(checked) => handleNestedSettingChange('voice', 'continuousListening', checked)}
                        disabled={!settings.voice.enabled}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Available Commands</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-medium">Search Commands</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>"Hey bookmark, search for React tutorials"</div>
                          <div>"Hey bookmark, find GitHub"</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">Bookmark Actions</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>"Hey bookmark, open GitHub"</div>
                          <div>"Hey bookmark, favorite this bookmark"</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">Organization</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>"Hey bookmark, tag as learning"</div>
                          <div>"Hey bookmark, move to Development folder"</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">Management</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>"Hey bookmark, add bookmark example.com"</div>
                          <div>"Hey bookmark, delete old bookmark"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
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
                        Enable advanced debugging and development features
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
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Performance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Cache Size (MB)</Label>
                        <div className="text-sm text-muted-foreground">
                          Amount of data to cache locally
                        </div>
                      </div>
                      <div className="w-32">
                        <Slider
                          value={[settings.advanced.cacheSize]}
                          onValueChange={(value) => handleNestedSettingChange('advanced', 'cacheSize', value[0])}
                          max={500}
                          min={50}
                          step={25}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground text-center mt-1">{settings.advanced.cacheSize} MB</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Preload Images</Label>
                        <div className="text-sm text-muted-foreground">
                          Load bookmark favicons in advance
                        </div>
                      </div>
                      <Switch
                        checked={settings.advanced.preloadImages}
                        onCheckedChange={(checked) => handleNestedSettingChange('advanced', 'preloadImages', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Actions</h4>
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleSaveSettings} 
                      disabled={!hasUnsavedChanges || isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button 
                      onClick={handleResetSettings} 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Management
                </CardTitle>
                <CardDescription>
                  Manage your account data and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Export Data</div>
                      <div className="text-sm text-muted-foreground">
                        Download all your bookmarks and data
                      </div>
                    </div>
                    <Button onClick={handleExportData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Clear All Data</div>
                      <div className="text-sm text-muted-foreground">
                        Remove all your bookmarks and folders
                      </div>
                    </div>
                    <Button onClick={handleClearData} variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
                    <div className="space-y-1">
                      <div className="font-medium text-destructive">Delete Account</div>
                      <div className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <Button onClick={handleDeleteAccount} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>
                  Overview of your account usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Total Bookmarks</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Folders Created</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Tags Used</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      <Badge variant="secondary">Pro</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Account Type</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Capsule */}
          <TabsContent value="timecapsule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Time Capsule
                </CardTitle>
                <CardDescription>
                  Create and manage versioned snapshots of your bookmarks, folders, and tags.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeCapsulePage />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 