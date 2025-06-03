'use client';

import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SettingsPageProps {
  userId: string;
}

export function SettingsPage({ userId }: SettingsPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
    },
    privacy: {
      publicProfile: false,
      shareAnalytics: true,
    },
    preferences: {
      defaultView: 'grid',
      itemsPerPage: 12,
      autoBackup: true,
    }
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export user data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Data export started. You will receive an email when ready.');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              General
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, theme: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="defaultView">Default View</Label>
                <Select value={settings.preferences.defaultView} onValueChange={(value) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, defaultView: value }
                  }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="itemsPerPage">Items per page</Label>
                <Select value={settings.preferences.itemsPerPage.toString()} onValueChange={(value) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, itemsPerPage: parseInt(value) }
                  }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email updates about your bookmarks
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, emailNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, pushNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Weekly summary of your bookmark activity
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.weeklyDigest}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, weeklyDigest: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Make your bookmark collections public
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, publicProfile: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Analytics</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Help improve BookmarkHub with usage analytics
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.shareAnalytics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, shareAnalytics: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Data Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically backup your bookmarks weekly
                  </p>
                </div>
                <Switch 
                  checked={settings.preferences.autoBackup}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, autoBackup: checked }
                    }))
                  }
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Export Data</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Download all your bookmarks and data
                    </p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600 dark:text-red-400">Delete Account</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 