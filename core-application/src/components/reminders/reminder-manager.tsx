'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search, Bell, Clock, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReminders } from './reminder-context';
import { ReminderForm } from './reminder-form';
import { ReminderList } from './reminder-list';
import { type Reminder, type ReminderStatus, type ReminderPriority } from './reminder-types';
import { toast } from 'sonner';

interface ReminderManagerProps {
  bookmarkId: string;
  bookmarkTitle: string;
  className?: string;
}

type FilterType = 'all' | 'active' | 'completed' | 'overdue' | 'upcoming';

export function ReminderManager({ bookmarkId, bookmarkTitle, className }: ReminderManagerProps) {
  const {
    createReminder,
    updateReminder,
    deleteReminder,
    duplicateReminder,
    markComplete,
    markIncomplete,
    pauseReminder,
    resumeReminder,
    snoozeReminder,
    getRemindersByBookmark,
    getOverdueReminders,
    getUpcomingReminders,
    generateSmartSuggestions
  } = useReminders();

  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReminderPriority | 'all'>('all');

  // Get reminders for this bookmark
  const bookmarkReminders = getRemindersByBookmark(bookmarkId);
  const overdueReminders = getOverdueReminders().filter(r => r.bookmarkId === bookmarkId);
  const upcomingReminders = getUpcomingReminders(24).filter(r => r.bookmarkId === bookmarkId);

  // Filter and search reminders
  const filteredReminders = useMemo(() => {
    let filtered = bookmarkReminders;

    // Apply filter type
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(r => r.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(r => r.status === 'completed');
        break;
      case 'overdue':
        filtered = overdueReminders;
        break;
      case 'upcoming':
        filtered = upcomingReminders;
        break;
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by scheduled date
    return filtered.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }, [bookmarkReminders, overdueReminders, upcomingReminders, filterType, priorityFilter, searchQuery]);

  const handleCreateReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'>) => {
    createReminder(reminderData);
    setShowForm(false);
    toast.success('Reminder created successfully!');
  };

  const handleUpdateReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'>) => {
    if (!editingReminder) return;
    
    updateReminder(editingReminder.id, reminderData);
    setEditingReminder(null);
    setShowForm(false);
    toast.success('Reminder updated successfully!');
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleComplete = (id: string) => {
    markComplete(id);
    toast.success('Reminder marked as completed!');
  };

  const handlePause = (id: string) => {
    pauseReminder(id);
    toast.info('Reminder paused');
  };

  const handleResume = (id: string) => {
    resumeReminder(id);
    toast.success('Reminder resumed');
  };

  const handleDelete = (id: string) => {
    deleteReminder(id);
    toast.success('Reminder deleted');
  };

  const handleDuplicate = (id: string) => {
    duplicateReminder(id);
    toast.success('Reminder duplicated');
  };

  const handleSnooze = (id: string, minutes: number) => {
    snoozeReminder(id, minutes);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    toast.success(`Reminder snoozed for ${timeText}`);
  };

  const createSmartReminder = (suggestion: Partial<Reminder>) => {
    const reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'> = {
      bookmarkId,
      title: suggestion.title || 'Smart Reminder',
      description: suggestion.description,
      type: suggestion.type || 'one-time',
      priority: suggestion.priority || 'medium',
      status: 'active',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      frequency: suggestion.frequency,
      estimatedStudyTime: suggestion.estimatedStudyTime || 30,
      enableBrowserNotification: true,
      enableEmailNotification: false,
      enableSoundAlert: true,
      tags: suggestion.tags || [],
      learningGoal: suggestion.learningGoal
    };

    createReminder(reminderData);
    toast.success('Smart reminder created!');
  };

  const stats = {
    total: bookmarkReminders.length,
    active: bookmarkReminders.filter(r => r.status === 'active').length,
    completed: bookmarkReminders.filter(r => r.status === 'completed').length,
    overdue: overdueReminders.length
  };

  if (showForm) {
    return (
      <div className={className}>
        <ReminderForm
          reminder={editingReminder || undefined}
          bookmarkId={bookmarkId}
          onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
          onCancel={() => {
            setShowForm(false);
            setEditingReminder(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Smart Reminders</h3>
          <p className="text-sm text-gray-600">
            Set intelligent reminders for &ldquo;{bookmarkTitle}&rdquo;
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-gray-500">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Suggestions */}
      {bookmarkReminders.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Smart Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Get started with these intelligent reminder suggestions:
            </p>
            <div className="space-y-2">
              {generateSmartSuggestions(bookmarkId).map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{suggestion.title}</div>
                    <div className="text-xs text-gray-600">{suggestion.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createSmartReminder(suggestion)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      {bookmarkReminders.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: ReminderPriority | 'all') => setPriorityFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reminder List */}
      <ReminderList
        reminders={filteredReminders}
        onEdit={handleEdit}
        onComplete={handleComplete}
        onPause={handlePause}
        onResume={handleResume}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onSnooze={handleSnooze}
      />

      {/* Results info */}
      {searchQuery && (
        <div className="text-sm text-gray-500 text-center">
          {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
} 