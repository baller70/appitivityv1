'use client';

import React from 'react';
import { Bell, BellOff, Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { bookmarkReminderService, type BookmarkReminder, type ReminderNotification } from '../../lib/services/bookmark-reminders';

interface RemindersDashboardProps {
  reminders: BookmarkReminder[];
  notifications: ReminderNotification[];
  onMarkAsRead?: (notificationId: string) => void;
  onSnoozeReminder?: (reminderId: string, snoozeUntil: Date) => void;
  onDisableReminder?: (reminderId: string) => void;
}

export const RemindersDashboard: React.FC<RemindersDashboardProps> = ({
  reminders,
  notifications,
  onMarkAsRead,
  onSnoozeReminder,
  onDisableReminder
}) => {
  const stats = bookmarkReminderService.getReminderStatistics(reminders);
  const overdueReminders = reminders.filter(r => bookmarkReminderService.isOverdue(r));
  const upcomingReminders = bookmarkReminderService.getUpcomingReminders(reminders, 7);
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              New Notifications ({unreadNotifications.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {unreadNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {notification.bookmarkTitle}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Time to revisit this bookmark
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => window.open(notification.bookmarkUrl, '_blank')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                    >
                      Open
                    </button>
                    {onMarkAsRead && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="p-4 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Overdue Reminders ({overdueReminders.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {overdueReminders.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                isOverdue={true}
                onSnooze={onSnoozeReminder}
                onDisable={onDisableReminder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
              Upcoming This Week ({upcomingReminders.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingReminders.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                isOverdue={false}
                onSnooze={onSnoozeReminder}
                onDisable={onDisableReminder}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Active Reminders */}
      {stats.active === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <BellOff className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Active Reminders
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Set up reminders for your bookmarks to be notified when it's time to revisit them.
          </p>
        </div>
      )}
    </div>
  );
};

interface ReminderItemProps {
  reminder: BookmarkReminder;
  isOverdue: boolean;
  onSnooze?: (reminderId: string, snoozeUntil: Date) => void;
  onDisable?: (reminderId: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  isOverdue,
  onSnooze,
  onDisable
}) => {
  const handleSnooze = (hours: number) => {
    if (onSnooze) {
      const snoozeUntil = new Date();
      snoozeUntil.setHours(snoozeUntil.getHours() + hours);
      onSnooze(reminder.id, snoozeUntil);
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`} />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Bookmark ID: {reminder.bookmarkId}
            </h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {bookmarkReminderService.getIntervalDescription(reminder.interval, reminder.customDays)} reminder
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {isOverdue ? 'Due: ' : 'Next: '} 
            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
              {bookmarkReminderService.formatReminderDate(reminder.nextReminderDate)}
            </span>
          </p>
        </div>
        
        <div className="flex space-x-2 ml-4">
          {isOverdue && onSnooze && (
            <div className="flex space-x-1">
              <button
                onClick={() => handleSnooze(24)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                +1d
              </button>
              <button
                onClick={() => handleSnooze(168)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                +1w
              </button>
            </div>
          )}
          
          {onDisable && (
            <button
              onClick={() => onDisable(reminder.id)}
              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm"
            >
              Disable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 