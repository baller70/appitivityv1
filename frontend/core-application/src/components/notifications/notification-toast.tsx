'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Notification, type NotificationType } from './notification-types';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const typeStyles: Record<NotificationType, { 
  bg: string; 
  border: string; 
  icon: React.ComponentType<any>; 
  iconColor: string;
}> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
};

const priorityStyles = {
  low: 'ring-0',
  medium: 'ring-2 ring-offset-1',
  high: 'ring-2 ring-offset-2 ring-orange-300',
  urgent: 'ring-4 ring-offset-2 ring-red-400 animate-pulse'
};

export function NotificationToast({ 
  notification, 
  onDismiss, 
  onMarkAsRead,
  position 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const { bg, border, icon: Icon, iconColor } = typeStyles[notification.type];

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);
    
    // Mark as read when user interacts or after a delay
    const readTimer = setTimeout(() => {
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
    }, 2000);

    return () => clearTimeout(readTimer);
  }, [notification.id, notification.isRead, onMarkAsRead]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.onClick();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getAnimationClasses = () => {
    const isTop = position.includes('top');
    const isRight = position.includes('right');
    const isLeft = position.includes('left');
    const isCenter = position.includes('center');
    
    if (isExiting) {
      if (isRight) return 'translate-x-full opacity-0';
      if (isLeft) return '-translate-x-full opacity-0';
      if (isCenter) return isTop ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0';
    }
    
    if (!isVisible) {
      if (isRight) return 'translate-x-full opacity-0';
      if (isLeft) return '-translate-x-full opacity-0';
      if (isCenter) return isTop ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0';
    }
    
    return 'translate-x-0 translate-y-0 opacity-100';
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform',
        bg,
        border,
        priorityStyles[notification.priority],
        getAnimationClasses(),
        notification.isRead ? 'opacity-80' : 'opacity-100',
        'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="relative p-4">
        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-6">
                {notification.title}
              </p>
              {!notification.isRead && (
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">
              {notification.message}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{formatTime(notification.timestamp)}</span>
                
                {notification.metadata?.category && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{notification.metadata.category}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <div className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-medium',
                  notification.priority === 'urgent' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  notification.priority === 'high' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                  notification.priority === 'medium' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  notification.priority === 'low' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                )}>
                  {notification.priority}
                </div>
              </div>
            </div>
            
            {/* Action button */}
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action!.onClick();
                  handleDismiss();
                }}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {notification.action.label}
              </button>
            )}
            
            {/* Tags */}
            {notification.metadata?.tags && notification.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {notification.metadata.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
                {notification.metadata.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{notification.metadata.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar for timed notifications */}
        {notification.duration && notification.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className={cn(
                'h-full transition-all ease-linear',
                notification.type === 'success' && 'bg-green-500',
                notification.type === 'error' && 'bg-red-500',
                notification.type === 'warning' && 'bg-yellow-500',
                notification.type === 'info' && 'bg-blue-500'
              )}
              style={{
                width: '100%',
                animation: `shrink ${notification.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
} 