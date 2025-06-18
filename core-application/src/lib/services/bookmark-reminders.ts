'use client';

export type ReminderInterval = 
  | 'none'
  | 'daily'
  | 'weekly' 
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'biannually'
  | 'yearly'
  | 'custom';

export interface BookmarkReminder {
  id: string;
  bookmarkId: string;
  interval: ReminderInterval;
  customDays?: number; // For custom intervals
  nextReminderDate: Date;
  lastReminderDate?: Date;
  isActive: boolean;
  reminderType: 'in-app' | 'email' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderNotification {
  id: string;
  reminderId: string;
  bookmarkTitle: string;
  bookmarkUrl: string;
  dueDate: Date;
  isRead: boolean;
  createdAt: Date;
}

class BookmarkReminderService {
  /**
   * Calculate the next reminder date based on interval
   */
  calculateNextReminderDate(interval: ReminderInterval, customDays?: number, fromDate: Date = new Date()): Date {
    const nextDate = new Date(fromDate);
    
    switch (interval) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'biannually':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case 'custom':
        if (customDays) {
          nextDate.setDate(nextDate.getDate() + customDays);
        }
        break;
      default:
        return nextDate; // Return same date for 'none'
    }
    
    return nextDate;
  }

  /**
   * Create a new reminder for a bookmark
   */
  createReminder(
    bookmarkId: string, 
    interval: ReminderInterval, 
    reminderType: 'in-app' | 'email' | 'both' = 'in-app',
    customDays?: number
  ): BookmarkReminder {
    const now = new Date();
    const nextReminderDate = this.calculateNextReminderDate(interval, customDays, now);
    
    return {
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookmarkId,
      interval,
      customDays,
      nextReminderDate,
      isActive: interval !== 'none',
      reminderType,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Update an existing reminder
   */
  updateReminder(
    reminder: BookmarkReminder, 
    updates: Partial<Pick<BookmarkReminder, 'interval' | 'customDays' | 'reminderType' | 'isActive'>>
  ): BookmarkReminder {
    const updatedReminder = { ...reminder, ...updates, updatedAt: new Date() };
    
    // Recalculate next reminder date if interval changed
    if (updates.interval !== undefined || updates.customDays !== undefined) {
      updatedReminder.nextReminderDate = this.calculateNextReminderDate(
        updatedReminder.interval, 
        updatedReminder.customDays,
        new Date()
      );
    }
    
    return updatedReminder;
  }

  /**
   * Mark reminder as triggered and calculate next occurrence
   */
  triggerReminder(reminder: BookmarkReminder): BookmarkReminder {
    const now = new Date();
    const nextReminderDate = this.calculateNextReminderDate(
      reminder.interval, 
      reminder.customDays, 
      now
    );
    
    return {
      ...reminder,
      lastReminderDate: now,
      nextReminderDate,
      updatedAt: now
    };
  }

  /**
   * Get all due reminders (for background processing)
   */
  getDueReminders(reminders: BookmarkReminder[]): BookmarkReminder[] {
    const now = new Date();
    return reminders.filter(reminder => 
      reminder.isActive && 
      reminder.nextReminderDate <= now
    );
  }

  /**
   * Get upcoming reminders within a time frame
   */
  getUpcomingReminders(reminders: BookmarkReminder[], withinDays: number = 7): BookmarkReminder[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + withinDays);
    
    return reminders.filter(reminder => 
      reminder.isActive && 
      reminder.nextReminderDate >= now && 
      reminder.nextReminderDate <= futureDate
    ).sort((a, b) => a.nextReminderDate.getTime() - b.nextReminderDate.getTime());
  }

  /**
   * Create a reminder notification
   */
  createNotification(
    reminder: BookmarkReminder, 
    bookmarkTitle: string, 
    bookmarkUrl: string
  ): ReminderNotification {
    return {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reminderId: reminder.id,
      bookmarkTitle,
      bookmarkUrl,
      dueDate: reminder.nextReminderDate,
      isRead: false,
      createdAt: new Date()
    };
  }

  /**
   * Get human-readable description for reminder interval
   */
  getIntervalDescription(interval: ReminderInterval, customDays?: number): string {
    switch (interval) {
      case 'none':
        return 'No reminders';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Every 2 weeks';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Every 3 months';
      case 'biannually':
        return 'Every 6 months';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return customDays ? `Every ${customDays} day${customDays !== 1 ? 's' : ''}` : 'Custom';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get all available reminder intervals
   */
  getAvailableIntervals(): { value: ReminderInterval; label: string }[] {
    return [
      { value: 'none', label: 'No reminders' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'biweekly', label: 'Every 2 weeks' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Every 3 months' },
      { value: 'biannually', label: 'Every 6 months' },
      { value: 'yearly', label: 'Yearly' },
      { value: 'custom', label: 'Custom...' }
    ];
  }

  /**
   * Format reminder date for display
   */
  formatReminderDate(date: Date): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays > 0 && diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Check if reminder is overdue
   */
  isOverdue(reminder: BookmarkReminder): boolean {
    return reminder.isActive && reminder.nextReminderDate < new Date();
  }

  /**
   * Get reminder statistics
   */
  getReminderStatistics(reminders: BookmarkReminder[]): {
    total: number;
    active: number;
    overdue: number;
    upcoming: number;
  } {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return {
      total: reminders.length,
      active: reminders.filter(r => r.isActive).length,
      overdue: reminders.filter(r => this.isOverdue(r)).length,
      upcoming: reminders.filter(r => 
        r.isActive && 
        r.nextReminderDate >= now && 
        r.nextReminderDate <= nextWeek
      ).length
    };
  }

  /**
   * Generate reminder notification message
   */
  generateNotificationMessage(bookmarkTitle: string, interval: ReminderInterval): string {
    const timeText = this.getIntervalDescription(interval).toLowerCase();
    return `Time to revisit "${bookmarkTitle}" - you set a ${timeText} reminder for this bookmark.`;
  }

  /**
   * Mock function for sending actual notifications (to be implemented with real notification service)
   */
  async sendNotification(notification: ReminderNotification, reminderType: 'in-app' | 'email' | 'both'): Promise<boolean> {
    // This would integrate with actual notification services
    console.log('Sending notification:', {
      type: reminderType,
      title: `Reminder: ${notification.bookmarkTitle}`,
      message: this.generateNotificationMessage(notification.bookmarkTitle, 'custom'),
      url: notification.bookmarkUrl
    });
    
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 100);
    });
  }
}

// Export singleton instance
export const bookmarkReminderService = new BookmarkReminderService(); 