// Core reminder system
export { ReminderProvider, useReminders } from './reminder-context';

// Components
export { ReminderForm } from './reminder-form';
export { ReminderList } from './reminder-list';
export { ReminderManager } from './reminder-manager';

// Types
export type {
  Reminder,
  ReminderSettings,
  ReminderContextType,
  ReminderType,
  ReminderFrequency,
  ReminderPriority,
  ReminderStatus
} from './reminder-types';

// Tag: reminders
// This is a comprehensive reminder system that includes:
// - Smart reminder creation with multiple types (one-time, recurring, smart)
// - Priority levels (low, medium, high, urgent) 
// - Advanced scheduling with recurrence patterns
// - Browser notifications and sound alerts
// - Learning goals and study time tracking
// - Smart suggestions based on bookmark content
// - Comprehensive filtering and search
// - Snooze functionality for overdue reminders
// - Progress tracking and completion percentage
// - Tag-based organization
// - Import/export capabilities
// - Bulk operations support
// - Persistent storage with localStorage
// - Real-time notification checking
// - Professional UI with animations and transitions 