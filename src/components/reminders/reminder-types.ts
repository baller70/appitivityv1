export type ReminderType = 'one-time' | 'recurring' | 'smart' | 'location-based';
export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReminderStatus = 'active' | 'paused' | 'completed' | 'expired';

export interface Reminder {
  id: string;
  bookmarkId: string;
  title: string;
  description?: string;
  type: ReminderType;
  priority: ReminderPriority;
  status: ReminderStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Scheduling
  scheduledFor: Date;
  frequency?: ReminderFrequency;
  customPattern?: string; // cron-like pattern
  endDate?: Date;
  maxOccurrences?: number;
  
  // Recurrence tracking
  occurrenceCount: number;
  lastTriggered?: Date;
  nextTrigger?: Date;
  
  // Smart reminder features
  learningGoal?: string;
  estimatedStudyTime?: number; // in minutes
  completionPercentage?: number;
  
  // Notification settings
  enableBrowserNotification: boolean;
  enableEmailNotification: boolean;
  enableSoundAlert: boolean;
  customSoundUrl?: string;
  
  // Location-based (for future enhancement)
  locationTrigger?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
    name: string;
  };
  
  // Metadata
  tags: string[];
  metadata?: {
    source?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

export interface ReminderSettings {
  defaultNotificationTime: number; // minutes before
  enableSmartSuggestions: boolean;
  maxActiveReminders: number;
  autoArchiveCompleted: boolean;
  defaultPriority: ReminderPriority;
  enableLocationReminders: boolean;
  defaultStudyDuration: number; // minutes
  soundVolume: number; // 0-1
  snoozeOptions: number[]; // minutes
}

export interface ReminderContextType {
  reminders: Reminder[];
  settings: ReminderSettings;
  
  // CRUD operations
  createReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  duplicateReminder: (id: string) => void;
  
  // Status management
  markComplete: (id: string) => void;
  markIncomplete: (id: string) => void;
  pauseReminder: (id: string) => void;
  resumeReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  
  // Filtering and search
  getActiveReminders: () => Reminder[];
  getRemindersByBookmark: (bookmarkId: string) => Reminder[];
  getOverdueReminders: () => Reminder[];
  getUpcomingReminders: (hours?: number) => Reminder[];
  
  // Smart features
  generateSmartSuggestions: (bookmarkId: string) => Partial<Reminder>[];
  updateProgress: (id: string, percentage: number) => void;
  
  // Settings
  updateSettings: (settings: Partial<ReminderSettings>) => void;
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: ReminderStatus) => void;
  bulkDelete: (ids: string[]) => void;
  
  // Import/Export
  exportReminders: () => string;
  importReminders: (data: string) => void;
} 