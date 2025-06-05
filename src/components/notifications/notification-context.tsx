'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  type Notification, 
  type NotificationSettings, 
  type NotificationContextType, 
  type NotificationType, 
  type NotificationPriority 
} from './notification-types';

const defaultSettings: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  volume: 0.5,
  position: 'top-right',
  maxVisible: 5,
  defaultDuration: 5000,
  showInBrowser: true,
  enablePersistent: true,
  groupSimilar: false,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('app-notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }

      const savedSettings = localStorage.getItem('app-notification-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    localStorage.setItem('app-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('app-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Audio notifications
  const playNotificationSound = useCallback((type: NotificationType) => {
    if (!settings.soundEnabled || !settings.enabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different types
      const frequencies = {
        success: [523, 659, 784], // C, E, G chord
        error: [220, 220, 220], // Repeated A note
        warning: [440, 554], // A, C# 
        info: [523] // Single C note
      };
      
      const freqs = frequencies[type];
      let time = audioContext.currentTime;
      
      freqs.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(settings.volume * 0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc.start(time);
        osc.stop(time + 0.2);
        
        time += 0.1;
      });
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  }, [settings.soundEnabled, settings.enabled, settings.volume]);

  // Browser notification
  const showBrowserNotification = useCallback(async (notification: Notification) => {
    if (!settings.showInBrowser || !settings.enabled) return;

    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: `/favicon.ico`,
            tag: notification.id,
            badge: `/favicon.ico`,
          });

          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
            markAsRead(notification.id);
          };

          setTimeout(() => {
            browserNotification.close();
          }, notification.duration || settings.defaultDuration);
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            showBrowserNotification(notification);
          }
        }
      }
    } catch (error) {
      console.error('Browser notification error:', error);
    }
  }, [settings.showInBrowser, settings.enabled, settings.defaultDuration]);

  // Core notification function
  const showNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>
  ): string => {
    if (!settings.enabled) return '';

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      timestamp: new Date(),
      isRead: false,
      isDismissed: false,
      duration: notificationData.duration ?? settings.defaultDuration,
      ...notificationData,
    };

    setNotifications(prev => {
      let newNotifications = [notification, ...prev];
      
      // Group similar notifications if enabled
      if (settings.groupSimilar) {
        const similarIndex = prev.findIndex(n => 
          n.title === notification.title && 
          n.type === notification.type && 
          !n.isDismissed
        );
        
        if (similarIndex !== -1) {
          newNotifications = prev.map((n, index) => 
            index === similarIndex 
              ? { ...n, message: notification.message, timestamp: notification.timestamp }
              : n
          );
          newNotifications.unshift(notification);
        }
      }
      
      // Limit visible notifications
      const visibleNotifications = newNotifications.filter(n => !n.isDismissed);
      if (visibleNotifications.length > settings.maxVisible) {
        // Auto-dismiss oldest notifications
        newNotifications = newNotifications.map(n => 
          visibleNotifications.indexOf(n) >= settings.maxVisible 
            ? { ...n, isDismissed: true }
            : n
        );
      }
      
      return newNotifications;
    });

    // Play sound and show browser notification
    playNotificationSound(notification.type);
    showBrowserNotification(notification);

    // Auto-dismiss after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, notification.duration);
    }

    return id;
  }, [settings, playNotificationSound, showBrowserNotification]);

  // Quick notification methods
  const success = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'success',
      title,
      message,
      priority: 'medium',
      ...options,
    });
  }, [showNotification]);

  const error = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'error',
      title,
      message,
      priority: 'high',
      duration: options?.duration ?? 8000, // Errors stay longer
      ...options,
    });
  }, [showNotification]);

  const warning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      priority: 'medium',
      duration: options?.duration ?? 6000,
      ...options,
    });
  }, [showNotification]);

  const info = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'info',
      title,
      message,
      priority: 'low',
      ...options,
    });
  }, [showNotification]);

  // Notification management
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isDismissed: true }
          : notification
      )
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isDismissed: true }))
    );
  }, []);

  const clearAllRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.isRead 
          ? { ...notification, isDismissed: true }
          : notification
      )
    );
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Stats and filtering
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.isRead && !n.isDismissed).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type && !n.isDismissed);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: NotificationPriority) => {
    return notifications.filter(n => n.priority === priority && !n.isDismissed);
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    settings,
    showNotification,
    dismissNotification,
    markAsRead,
    clearAll,
    clearAllRead,
    success,
    error,
    warning,
    info,
    updateSettings,
    getUnreadCount,
    getNotificationsByType,
    getNotificationsByPriority,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 