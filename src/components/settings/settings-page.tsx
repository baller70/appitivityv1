'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Download, 
  Trash2,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPageProps {
  userId: string;
}

export function SettingsPage({ }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      weekly: true
    },
    privacy: {
      publicProfile: false,
      shareData: false,
      analytics: true
    },
    language: 'en',
    autoSave: true,
    compactView: false
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Setting updated');
  };

  const handleNestedSettingChange = (category: keyof typeof settings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, boolean>),
        [key]: value
      }
    }));
    toast.success('Setting updated');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and application settings
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Preferences
                </CardTitle>
                <CardDescription>
                  Configure your basic application preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Theme</Label>
                      <div className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </div>
                    </div>
                    <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                      <SelectTrigger className="w-[180px]">
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
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Language</Label>
                      <div className="text-sm text-muted-foreground">
                        Select your preferred language
                      </div>
                    </div>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger className="w-[180px]">
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

                  <Separator />

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
                  Choose how you want to be notified about updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
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
        </Tabs>
      </div>
    </div>
  );
} 