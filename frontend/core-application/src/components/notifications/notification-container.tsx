'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from './notification-context';
import { NotificationToast } from './notification-toast';
import { cn } from '@/lib/utils';

export function NotificationContainer() {
  const { notifications, settings, dismissNotification, markAsRead } = useNotifications();

  // Only show notifications that aren't dismissed
  const visibleNotifications = notifications.filter(n => !n.isDismissed);

  if (!settings.enabled || visibleNotifications.length === 0) {
    return null;
  }

  const getPositionClasses = () => {
    switch (settings.position) {
      case 'top-right':
        return 'top-4 right-4 flex-col';
      case 'top-left':
        return 'top-4 left-4 flex-col';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2 flex-col items-center';
      case 'bottom-right':
        return 'bottom-4 right-4 flex-col-reverse';
      case 'bottom-left':
        return 'bottom-4 left-4 flex-col-reverse';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2 flex-col-reverse items-center';
      default:
        return 'top-4 right-4 flex-col';
    }
  };

  const containerContent = (
    <div
      className={cn(
        'fixed z-50 pointer-events-none flex space-y-3 w-full max-w-sm',
        getPositionClasses()
      )}
      style={{ 
        maxWidth: settings.position.includes('center') ? '28rem' : '24rem'
      }}
    >
      {visibleNotifications
        .slice(0, settings.maxVisible)
        .map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
            onMarkAsRead={markAsRead}
            position={settings.position}
          />
        ))}
      
      {/* Show count of additional notifications if there are more */}
      {visibleNotifications.length > settings.maxVisible && (
        <div className="pointer-events-auto">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium text-center shadow-lg">
            +{visibleNotifications.length - settings.maxVisible} more notifications
          </div>
        </div>
      )}
    </div>
  );

  // Render to portal to ensure proper z-index stacking
  if (typeof window !== 'undefined') {
    return createPortal(containerContent, document.body);
  }

  return null;
} 