export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  isRead: boolean;
  isDismissed: boolean;
  duration?: number; // Auto-dismiss time in ms, null for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: {
    source?: string;
    category?: string;
    userId?: string;
    tags?: string[];
  };
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  volume: number;
  position: NotificationPosition;
  maxVisible: number;
  defaultDuration: number;
  showInBrowser: boolean;
  enablePersistent: boolean;
  groupSimilar: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  settings: NotificationSettings;
  
  // Core functions
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => string;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  clearAllRead: () => void;
  
  // Quick notification methods
  success: (title: string, message: string, options?: Partial<Notification>) => string;
  error: (title: string, message: string, options?: Partial<Notification>) => string;
  warning: (title: string, message: string, options?: Partial<Notification>) => string;
  info: (title: string, message: string, options?: Partial<Notification>) => string;
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Stats
  getUnreadCount: () => number;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
} 