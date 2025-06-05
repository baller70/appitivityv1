'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  type Reminder, 
  type ReminderSettings, 
  type ReminderContextType, 
  type ReminderStatus,
  type ReminderPriority 
} from './reminder-types';

const defaultSettings: ReminderSettings = {
  defaultNotificationTime: 15, // 15 minutes before
  enableSmartSuggestions: true,
  maxActiveReminders: 50,
  autoArchiveCompleted: true,
  defaultPriority: 'medium',
  enableLocationReminders: false,
  defaultStudyDuration: 30,
  soundVolume: 0.5,
  snoozeOptions: [5, 10, 15, 30, 60] // minutes
};

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('bookmark-reminders');
    if (savedReminders) {
      try {
        const parsed = JSON.parse(savedReminders);
        setReminders(parsed.map((reminder: any) => ({
          ...reminder,
          createdAt: new Date(reminder.createdAt),
          updatedAt: new Date(reminder.updatedAt),
          scheduledFor: new Date(reminder.scheduledFor),
          endDate: reminder.endDate ? new Date(reminder.endDate) : undefined,
          lastTriggered: reminder.lastTriggered ? new Date(reminder.lastTriggered) : undefined,
          nextTrigger: reminder.nextTrigger ? new Date(reminder.nextTrigger) : undefined
        })));
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    }

    const savedSettings = localStorage.getItem('reminder-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading reminder settings:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bookmark-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('reminder-settings', JSON.stringify(settings));
  }, [settings]);

  // Check for due reminders and send notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const activeReminders = reminders.filter(r => r.status === 'active');
      
      activeReminders.forEach(reminder => {
        if (reminder.scheduledFor <= now && !reminder.lastTriggered) {
          triggerReminder(reminder);
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders]);

  const triggerReminder = useCallback((reminder: Reminder) => {
    // Browser notification
    if (reminder.enableBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.description || 'Time to revisit this bookmark!',
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }

    // Sound notification
    if (reminder.enableSoundAlert) {
      playReminderSound(reminder.customSoundUrl);
    }

    // Update reminder with trigger time
    updateReminder(reminder.id, {
      lastTriggered: new Date(),
      occurrenceCount: reminder.occurrenceCount + 1,
      nextTrigger: calculateNextTrigger(reminder)
    });
  }, []);

  const playReminderSound = useCallback((customUrl?: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(settings.soundVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [settings.soundVolume]);

  const calculateNextTrigger = (reminder: Reminder): Date | undefined => {
    if (reminder.type !== 'recurring' || !reminder.frequency) return undefined;
    
    const now = new Date();
    const next = new Date(reminder.scheduledFor);
    
    switch (reminder.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        return undefined;
    }
    
    return next > now ? next : undefined;
  };

  const createReminder = useCallback((reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      occurrenceCount: 0
    };
    
    setReminders(prev => [...prev, newReminder]);
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id 
        ? { ...reminder, ...updates, updatedAt: new Date() }
        : reminder
    ));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  }, []);

  const duplicateReminder = useCallback((id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const duplicated = {
        ...reminder,
        title: `${reminder.title} (Copy)`,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'active' as ReminderStatus,
        lastTriggered: undefined,
        nextTrigger: undefined,
        occurrenceCount: 0
      };
      delete (duplicated as any).id;
      delete (duplicated as any).createdAt;
      delete (duplicated as any).updatedAt;
      createReminder(duplicated);
    }
  }, [reminders, createReminder]);

  const markComplete = useCallback((id: string) => {
    updateReminder(id, { status: 'completed' });
  }, [updateReminder]);

  const markIncomplete = useCallback((id: string) => {
    updateReminder(id, { status: 'active' });
  }, [updateReminder]);

  const pauseReminder = useCallback((id: string) => {
    updateReminder(id, { status: 'paused' });
  }, [updateReminder]);

  const resumeReminder = useCallback((id: string) => {
    updateReminder(id, { status: 'active' });
  }, [updateReminder]);

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    const newTime = new Date(Date.now() + minutes * 60 * 1000);
    updateReminder(id, { 
      scheduledFor: newTime,
      lastTriggered: undefined
    });
  }, [updateReminder]);

  // Filtering and search functions
  const getActiveReminders = useCallback(() => {
    return reminders.filter(r => r.status === 'active');
  }, [reminders]);

  const getRemindersByBookmark = useCallback((bookmarkId: string) => {
    return reminders.filter(r => r.bookmarkId === bookmarkId);
  }, [reminders]);

  const getOverdueReminders = useCallback(() => {
    const now = new Date();
    return reminders.filter(r => 
      r.status === 'active' && 
      r.scheduledFor < now && 
      !r.lastTriggered
    );
  }, [reminders]);

  const getUpcomingReminders = useCallback((hours: number = 24) => {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return reminders.filter(r => 
      r.status === 'active' && 
      r.scheduledFor >= now && 
      r.scheduledFor <= future
    );
  }, [reminders]);

  const generateSmartSuggestions = useCallback((bookmarkId: string): Partial<Reminder>[] => {
    // Smart suggestion algorithm based on bookmark content and user patterns
    const suggestions: Partial<Reminder>[] = [
      {
        title: 'Daily Review',
        description: 'Quick daily check of this resource',
        type: 'recurring',
        frequency: 'daily',
        priority: 'medium',
        estimatedStudyTime: 15,
        learningGoal: 'Regular review for retention'
      },
      {
        title: 'Weekly Deep Dive',
        description: 'In-depth study session',
        type: 'recurring',
        frequency: 'weekly',
        priority: 'high',
        estimatedStudyTime: 60,
        learningGoal: 'Comprehensive understanding'
      },
      {
        title: 'Practice Session',
        description: 'Apply knowledge from this resource',
        type: 'one-time',
        priority: 'medium',
        estimatedStudyTime: 30,
        learningGoal: 'Practical application'
      }
    ];

    return suggestions;
  }, []);

  const updateProgress = useCallback((id: string, percentage: number) => {
    updateReminder(id, { completionPercentage: Math.max(0, Math.min(100, percentage)) });
  }, [updateReminder]);

  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const bulkUpdateStatus = useCallback((ids: string[], status: ReminderStatus) => {
    setReminders(prev => prev.map(reminder => 
      ids.includes(reminder.id) 
        ? { ...reminder, status, updatedAt: new Date() }
        : reminder
    ));
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    setReminders(prev => prev.filter(reminder => !ids.includes(reminder.id)));
  }, []);

  const exportReminders = useCallback(() => {
    return JSON.stringify({
      reminders,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }, [reminders, settings]);

  const importReminders = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.reminders && Array.isArray(parsed.reminders)) {
        setReminders(parsed.reminders.map((reminder: any) => ({
          ...reminder,
          id: crypto.randomUUID(), // Generate new IDs to avoid conflicts
          createdAt: new Date(reminder.createdAt),
          updatedAt: new Date(reminder.updatedAt),
          scheduledFor: new Date(reminder.scheduledFor),
          endDate: reminder.endDate ? new Date(reminder.endDate) : undefined,
          lastTriggered: reminder.lastTriggered ? new Date(reminder.lastTriggered) : undefined,
          nextTrigger: reminder.nextTrigger ? new Date(reminder.nextTrigger) : undefined
        })));
      }
      if (parsed.settings) {
        setSettings(prev => ({ ...prev, ...parsed.settings }));
      }
    } catch (error) {
      console.error('Error importing reminders:', error);
      throw new Error('Invalid reminder data format');
    }
  }, []);

  const value: ReminderContextType = {
    reminders,
    settings,
    createReminder,
    updateReminder,
    deleteReminder,
    duplicateReminder,
    markComplete,
    markIncomplete,
    pauseReminder,
    resumeReminder,
    snoozeReminder,
    getActiveReminders,
    getRemindersByBookmark,
    getOverdueReminders,
    getUpcomingReminders,
    generateSmartSuggestions,
    updateProgress,
    updateSettings,
    bulkUpdateStatus,
    bulkDelete,
    exportReminders,
    importReminders
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
} 