'use client';

import React from 'react';
import { NotificationDemo } from '@/components/notifications/notification-demo';
import { NotificationBell } from '@/components/notifications';

export default function NotificationsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notification System Test
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test all features of the comprehensive notification system
            </p>
          </div>
          
          {/* Notification Bell */}
          <div className="flex items-center space-x-4">
            <NotificationBell size="lg" />
            <a 
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Demo Component */}
        <div className="mb-8">
          <NotificationDemo />
        </div>

        {/* Feature List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notification System Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Core Features
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>✅ Toast notifications (success, error, warning, info)</li>
                <li>✅ Priority levels (low, medium, high, urgent)</li>
                <li>✅ Auto-dismiss with configurable duration</li>
                <li>✅ Manual dismiss and mark as read</li>
                <li>✅ Browser notifications support</li>
                <li>✅ Audio alerts with type-specific sounds</li>
                <li>✅ Persistent storage with localStorage</li>
                <li>✅ Dark mode support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Advanced Features
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>✅ Notification center with search and filtering</li>
                <li>✅ Rich metadata (tags, categories, actions)</li>
                <li>✅ Action buttons in notifications</li>
                <li>✅ Unread count badge</li>
                <li>✅ Position configuration</li>
                <li>✅ Animation and visual feedback</li>
                <li>✅ Urgent notification indicators</li>
                <li>✅ Notification grouping options</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Usage in Your App
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <p>
                <strong>1. Add NotificationBell:</strong> Import and place the NotificationBell component in your navigation/header
              </p>
              <p>
                <strong>2. Use notifications hook:</strong> Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">useNotifications()</code> in any component
              </p>
              <p>
                <strong>3. Show notifications:</strong> Call <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">notifications.success()</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">error()</code>, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-green-400 mb-2">Basic Usage:</h4>
              <pre className="bg-gray-800 p-3 rounded overflow-x-auto">
{`import { useNotifications } from '@/components/notifications';

function MyComponent() {
  const notifications = useNotifications();
  
  const handleSuccess = () => {
    notifications.success('Success!', 'Task completed successfully');
  };
  
  const handleError = () => {
    notifications.error('Error!', 'Something went wrong', {
      action: {
        label: 'Retry',
        onClick: () => console.log('Retrying...')
      }
    });
  };
}`}
              </pre>
            </div>

            <div>
              <h4 className="text-blue-400 mb-2">Advanced Configuration:</h4>
              <pre className="bg-gray-800 p-3 rounded overflow-x-auto">
{`notifications.showNotification({
  type: 'warning',
  title: 'Important Notice',
  message: 'Please review your settings',
  priority: 'urgent',
  duration: 0, // Persistent
  action: {
    label: 'Review',
    onClick: () => router.push('/settings')
  },
  metadata: {
    category: 'Settings',
    tags: ['urgent', 'settings', 'review']
  }
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 