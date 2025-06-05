'use client';

import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from './notification-context';
import { NotificationCenter } from './notification-center';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  variant?: 'default' | 'ghost' | 'minimal';
}

export function NotificationBell({ 
  className, 
  size = 'md', 
  showBadge = true,
  variant = 'default' 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getUnreadCount, getNotificationsByPriority } = useNotifications();

  const unreadCount = getUnreadCount();
  const urgentCount = getNotificationsByPriority('urgent').length;
  const hasNotifications = unreadCount > 0;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'ghost':
        return 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800';
      case 'minimal':
        return 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200';
      default:
        return 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          buttonSizeClasses[size],
          getVariantClasses(),
          hasNotifications && urgentCount > 0 && 'animate-pulse',
          className
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {/* Bell Icon */}
        {hasNotifications ? (
          <BellRing className={cn(
            sizeClasses[size],
            urgentCount > 0 && 'text-red-500 dark:text-red-400'
          )} />
        ) : (
          <Bell className={sizeClasses[size]} />
        )}

        {/* Notification Badge */}
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            {/* Urgent indicator (red pulse) */}
            {urgentCount > 0 && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            )}
            
            {/* Count badge */}
            <span
              className={cn(
                'relative inline-flex items-center justify-center rounded-full text-xs font-semibold leading-none',
                unreadCount < 10 ? 'h-5 w-5' : 'h-5 px-1.5',
                urgentCount > 0 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}

        {/* Subtle glow effect for urgent notifications */}
        {urgentCount > 0 && (
          <span className="absolute inset-0 rounded-lg bg-red-500/20 blur-sm animate-pulse"></span>
        )}
      </button>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
} 