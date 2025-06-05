'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  X,
  Search,
  Settings,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from './notification-context';
import { type Notification, type NotificationType, type NotificationPriority } from './notification-types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

type FilterType = 'all' | NotificationType | 'unread' | 'urgent';

export function NotificationCenter({ isOpen, onClose, className }: NotificationCenterProps) {
  const {
    notifications,
    dismissNotification,
    markAsRead,
    clearAll,
    clearAllRead,
    getUnreadCount,
    getNotificationsByType,
    getNotificationsByPriority
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const typeIcons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter(n => !n.isDismissed);

    // Apply type/status filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'urgent':
        filtered = filtered.filter(n => n.priority === 'urgent');
        break;
      case 'success':
      case 'error':
      case 'warning':
      case 'info':
        filtered = filtered.filter(n => n.type === filter);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.metadata?.category?.toLowerCase().includes(query) ||
        n.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, filter, searchQuery]);

  const unreadCount = getUnreadCount();
  const urgentCount = getNotificationsByPriority('urgent').length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4',
      className
    )}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} unread
                {urgentCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                    {urgentCount} urgent
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {[
                { key: 'all', label: 'All', count: notifications.filter(n => !n.isDismissed).length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'urgent', label: 'Urgent', count: urgentCount },
                { key: 'success', label: 'Success', count: getNotificationsByType('success').length },
                { key: 'error', label: 'Errors', count: getNotificationsByType('error').length },
                { key: 'warning', label: 'Warnings', count: getNotificationsByType('warning').length },
                { key: 'info', label: 'Info', count: getNotificationsByType('info').length },
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as FilterType)}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                    filter === filterOption.key
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  <span>{filterOption.label}</span>
                  {filterOption.count > 0 && (
                    <span className={cn(
                      'px-1.5 py-0.5 rounded-full text-xs',
                      filter === filterOption.key
                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                    )}>
                      {filterOption.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={clearAllRead}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Clear read notifications"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={clearAll}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">
                {searchQuery ? 'Try adjusting your search or filters' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer',
                      notification.isRead
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
                      notification.priority === 'urgent' && 'ring-2 ring-red-300 dark:ring-red-700'
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                      if (notification.action) {
                        notification.action.onClick();
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={cn(
                        'h-5 w-5 mt-0.5 flex-shrink-0',
                        notification.type === 'success' && 'text-green-600 dark:text-green-400',
                        notification.type === 'error' && 'text-red-600 dark:text-red-400',
                        notification.type === 'warning' && 'text-yellow-600 dark:text-yellow-400',
                        notification.type === 'info' && 'text-blue-600 dark:text-blue-400'
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(notification.timestamp)}</span>
                            
                            {notification.metadata?.category && (
                              <>
                                <span>•</span>
                                <span>{notification.metadata.category}</span>
                              </>
                            )}
                          </div>
                          
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

                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action!.onClick();
                              dismissNotification(notification.id);
                            }}
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}

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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 