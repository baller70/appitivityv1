'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Repeat, Target, Tag, Volume2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { type Reminder, type ReminderType, type ReminderFrequency, type ReminderPriority } from './reminder-types';

interface ReminderFormProps {
  reminder?: Partial<Reminder>;
  bookmarkId: string;
  onSubmit: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'>) => void;
  onCancel: () => void;
  className?: string;
}

export function ReminderForm({ reminder, bookmarkId, onSubmit, onCancel, className }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    type: reminder?.type || 'one-time' as ReminderType,
    priority: reminder?.priority || 'medium' as ReminderPriority,
    status: reminder?.status || 'active',
    scheduledFor: reminder?.scheduledFor ? new Date(reminder.scheduledFor).toISOString().slice(0, 16) : '',
    frequency: reminder?.frequency || 'daily' as ReminderFrequency,
    estimatedStudyTime: reminder?.estimatedStudyTime || 30,
    enableBrowserNotification: reminder?.enableBrowserNotification ?? true,
    enableSoundAlert: reminder?.enableSoundAlert ?? true,
    tags: reminder?.tags?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.scheduledFor) {
      return;
    }

    const reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'occurrenceCount'> = {
      bookmarkId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      priority: formData.priority,
      status: formData.status as any,
      scheduledFor: new Date(formData.scheduledFor),
      frequency: formData.type === 'recurring' ? formData.frequency : undefined,
      estimatedStudyTime: formData.estimatedStudyTime,
      enableBrowserNotification: formData.enableBrowserNotification,
      enableEmailNotification: false,
      enableSoundAlert: formData.enableSoundAlert,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    onSubmit(reminderData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{reminder ? 'Edit Reminder' : 'Create New Reminder'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter reminder title..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: ReminderType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="smart">Smart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: ReminderPriority) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="scheduledFor" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Scheduled For *</span>
            </Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              required
            />
          </div>

          {formData.type === 'recurring' && (
            <div>
              <Label htmlFor="frequency" className="flex items-center space-x-2">
                <Repeat className="h-4 w-4" />
                <span>Frequency</span>
              </Label>
              <Select value={formData.frequency} onValueChange={(value: ReminderFrequency) => 
                setFormData(prev => ({ ...prev, frequency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="estimatedStudyTime" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Study Time: {formData.estimatedStudyTime} minutes</span>
            </Label>
            <Slider
              value={[formData.estimatedStudyTime]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, estimatedStudyTime: value }))}
              max={120}
              min={5}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="study, review, practice (comma-separated)"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Notifications</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="browserNotification"
                  checked={formData.enableBrowserNotification}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, enableBrowserNotification: !!checked }))
                  }
                />
                <Label htmlFor="browserNotification" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Browser notifications</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soundAlert"
                  checked={formData.enableSoundAlert}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, enableSoundAlert: !!checked }))
                  }
                />
                <Label htmlFor="soundAlert" className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <span>Sound alerts</span>
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {reminder ? 'Update Reminder' : 'Create Reminder'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 