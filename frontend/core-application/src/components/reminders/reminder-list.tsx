'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Bell, 
  Play, 
  Pause, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Copy,
  MoreHorizontal,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type Reminder } from './reminder-types';

interface ReminderListProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onComplete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  className?: string;
}

export function ReminderList({ 
  reminders, 
  onEdit, 
  onComplete, 
  onPause, 
  onResume, 
  onDelete, 
  onDuplicate,
  onSnooze,
  className 
}: ReminderListProps) {
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays > 0 && diffDays <= 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const isOverdue = (reminder: Reminder) => {
    return reminder.status === 'active' && 
           reminder.scheduledFor < new Date() && 
           !reminder.lastTriggered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (reminders.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No reminders yet</p>
        <p className="text-gray-400 text-sm">Create your first reminder to get started</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {reminders.map((reminder) => (
        <Card 
          key={reminder.id} 
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            isOverdue(reminder) && "border-red-200 bg-red-50",
            reminder.status === 'completed' && "opacity-75"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className={cn(
                    "font-medium text-sm truncate",
                    reminder.status === 'completed' && "line-through text-gray-500"
                  )}>
                    {reminder.title}
                  </h4>
                  
                  {isOverdue(reminder) && (
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>

                {/* Description */}
                {reminder.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {reminder.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(reminder.scheduledFor)}</span>
                  </div>
                  
                  {reminder.estimatedStudyTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{reminder.estimatedStudyTime}m</span>
                    </div>
                  )}

                  {reminder.type === 'recurring' && reminder.frequency && (
                    <div className="flex items-center space-x-1">
                      <RotateCcw className="h-3 w-3" />
                      <span>{reminder.frequency}</span>
                    </div>
                  )}
                </div>

                {/* Tags and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getPriorityColor(reminder.priority)}>
                      {reminder.priority}
                    </Badge>
                    
                    <Badge variant="outline" className={getStatusColor(reminder.status)}>
                      {reminder.status}
                    </Badge>

                    {reminder.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {reminder.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {reminder.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{reminder.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  {reminder.completionPercentage !== undefined && (
                    <div className="text-xs text-gray-500">
                      {reminder.completionPercentage}% complete
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Quick Actions */}
                {reminder.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComplete(reminder.id)}
                    className="h-8 w-8 p-0"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </Button>
                )}

                {reminder.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResume(reminder.id)}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4 text-blue-600" />
                  </Button>
                )}

                {reminder.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPause(reminder.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Pause className="h-4 w-4 text-yellow-600" />
                  </Button>
                )}

                {reminder.status === 'paused' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResume(reminder.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="h-4 w-4 text-green-600" />
                  </Button>
                )}

                {/* More Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(reminder)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit reminder
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onDuplicate(reminder.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>

                    {isOverdue(reminder) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSnooze(reminder.id, 15)}>
                          Snooze 15 minutes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSnooze(reminder.id, 60)}>
                          Snooze 1 hour
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSnooze(reminder.id, 1440)}>
                          Snooze 1 day
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onDelete(reminder.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 