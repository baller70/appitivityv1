// Core notification system
export { NotificationProvider, useNotifications } from './notification-context';

// Components
export { NotificationToast } from './notification-toast';
export { NotificationContainer } from './notification-container';
export { NotificationCenter } from './notification-center';
export { NotificationBell } from './notification-bell';

// Types
export type {
  Notification,
  NotificationSettings,
  NotificationContextType,
  NotificationType,
  NotificationPriority,
  NotificationPosition
} from './notification-types';

// Tag: notifications
// This is a comprehensive notification system that includes:
// - Toast notifications with multiple types (success, error, warning, info)
// - Priority levels (low, medium, high, urgent)
// - Browser notifications support
// - Audio alerts with different sounds per type
// - Notification center with search and filtering
// - Persistent storage with localStorage
// - Auto-dismiss and manual controls
// - Rich metadata support (tags, categories, actions)
// - Responsive design with dark mode support
// - Animation and visual feedback
// - Notification bell with unread count badge 