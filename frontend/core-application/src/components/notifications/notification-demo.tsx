'use client';

import React from 'react';
import { useNotifications } from './notification-context';

export function NotificationDemo() {
  const notifications = useNotifications();

  const showSampleNotifications = () => {
    // Success notification
    notifications.success(
      'Task Completed!',
      'Your pomodoro session has been successfully completed.',
      {
        duration: 4000,
        metadata: {
          category: 'Productivity',
          tags: ['pomodoro', 'success']
        }
      }
    );

    // Info notification with action
    setTimeout(() => {
      notifications.info(
        'New Feature Available',
        'Check out the improved timer settings in the latest update.',
        {
          action: {
            label: 'View Settings',
            onClick: () => console.log('Opening settings...')
          },
          metadata: {
            category: 'Updates',
            tags: ['feature', 'timer']
          }
        }
      );
    }, 1000);

    // Warning notification
    setTimeout(() => {
      notifications.warning(
        'Network Connection Unstable',
        'Your data might not sync properly. Please check your internet connection.',
        {
          priority: 'high',
          duration: 6000,
          metadata: {
            category: 'System',
            tags: ['network', 'sync']
          }
        }
      );
    }, 2000);

    // Error notification
    setTimeout(() => {
      notifications.error(
        'Save Failed',
        'Unable to save your progress. Please try again or contact support.',
        {
          priority: 'high',
          duration: 8000,
          action: {
            label: 'Retry',
            onClick: () => console.log('Retrying save...')
          },
          metadata: {
            category: 'System',
            tags: ['error', 'save']
          }
        }
      );
    }, 3000);

    // Urgent notification
    setTimeout(() => {
      notifications.showNotification({
        type: 'warning',
        title: 'Session Timeout Warning',
        message: 'Your session will expire in 5 minutes. Please save your work.',
        priority: 'urgent',
        duration: 0, // Persistent
        action: {
          label: 'Extend Session',
          onClick: () => console.log('Extending session...')
        },
        metadata: {
          category: 'Security',
          tags: ['session', 'timeout', 'urgent']
        }
      });
    }, 4000);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Notification System Demo
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Test the notification system with various types and priorities:
      </p>

      <div className="space-y-4">
        <button
          onClick={showSampleNotifications}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Show Sample Notifications
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => notifications.success('Success!', 'Operation completed successfully.')}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            Success
          </button>
          
          <button
            onClick={() => notifications.error('Error!', 'Something went wrong.')}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Error
          </button>
          
          <button
            onClick={() => notifications.warning('Warning!', 'Please review this action.')}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
          >
            Warning
          </button>
          
          <button
            onClick={() => notifications.info('Info', 'Here\'s some helpful information.')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Info
          </button>
        </div>

        <button
          onClick={() => notifications.clearAll()}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
        >
          Clear All Notifications
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Usage Examples:</h4>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <div><code>notifications.success('Title', 'Message')</code></div>
          <div><code>notifications.error('Title', 'Message', options)</code></div>
          <div><code>notifications.showNotification(fullConfig)</code></div>
        </div>
      </div>
    </div>
  );
} 