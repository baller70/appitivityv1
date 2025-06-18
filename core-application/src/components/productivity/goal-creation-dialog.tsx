'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiClient } from '../../lib/api/client';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder } from '../../types/supabase';

interface GoalCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

interface GoalFormData {
  targetType: 'bookmark' | 'folder';
  targetId: string;
  goalDescription: string;
  goalType: string;
  goalPriority: string;
  deadlineDate: string;
  goalNotes: string;
}

export function GoalCreationDialog({
  open,
  onOpenChange,
  onGoalCreated,
}: GoalCreationDialogProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<GoalFormData>({
    targetType: 'bookmark',
    targetId: '',
    goalDescription: '',
    goalType: '',
    goalPriority: 'medium',
    deadlineDate: '',
    goalNotes: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookmarksData, foldersData] = await Promise.all([
        apiClient.getBookmarks(),
        apiClient.getFolders()
      ]);
      setBookmarks(bookmarksData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (formData.targetType === 'bookmark' && formData.targetId) {
        // Update bookmark with goal
        await apiClient.updateBookmark(formData.targetId, {
          goal_description: formData.goalDescription,
          goal_type: formData.goalType,
          goal_status: 'pending',
          goal_priority: formData.goalPriority,
          goal_progress: 0,
          goal_notes: formData.goalNotes,
          deadline_date: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : null
        });
      } else if (formData.targetType === 'folder' && formData.targetId) {
        // Update folder with goal
        await apiClient.updateFolder(formData.targetId, {
          goal_description: formData.goalDescription,
          goal_type: formData.goalType,
          goal_status: 'pending',
          goal_priority: formData.goalPriority,
          goal_progress: 0,
          goal_notes: formData.goalNotes,
          deadline_date: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : null
        });
      }

      onGoalCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        targetType: 'bookmark',
        targetId: '',
        goalDescription: '',
        goalType: 'read',
        goalPriority: 'medium',
        deadlineDate: '',
        goalNotes: '',
      });
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError('Failed to create goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const bookmarkGoalTypes = [
    { value: 'read', label: 'Read' },
    { value: 'review', label: 'Review' },
    { value: 'complete', label: 'Complete' },
    { value: 'learn', label: 'Learn' },
    { value: 'research', label: 'Research' },
    { value: 'custom', label: 'Custom' },
  ];

  const folderGoalTypes = [
    { value: 'organize', label: 'Organize' },
    { value: 'complete_all', label: 'Complete All' },
    { value: 'review_all', label: 'Review All' },
    { value: 'learn_category', label: 'Learn Category' },
    { value: 'research_topic', label: 'Research Topic' },
    { value: 'custom', label: 'Custom' },
  ];

  const currentGoalTypes = formData.targetType === 'bookmark' ? bookmarkGoalTypes : folderGoalTypes;

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Type Selection */}
          <div className="space-y-2">
            <Label>Goal Target</Label>
            <Select
              value={formData.targetType}
              onValueChange={(value: 'bookmark' | 'folder') => 
                setFormData({ ...formData, targetType: value, targetId: '' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookmark">📚 Bookmark</SelectItem>
                <SelectItem value="folder">📁 Folder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Selection */}
          <div className="space-y-2">
            <Label>
              Select {formData.targetType === 'bookmark' ? 'Bookmark' : 'Folder'} *
            </Label>
            <Select
              value={formData.targetId}
              onValueChange={(value) => setFormData({ ...formData, targetId: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${formData.targetType}...`} />
              </SelectTrigger>
              <SelectContent>
                {formData.targetType === 'bookmark' 
                  ? bookmarks.map((bookmark) => (
                      <SelectItem key={bookmark.id} value={bookmark.id}>
                        {bookmark.title}
                      </SelectItem>
                    ))
                  : folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        📁 {folder.name}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <Label htmlFor="goal-description">
              Goal Description *
            </Label>
            <Textarea
              id="goal-description"
              placeholder="Describe what you want to achieve..."
              value={formData.goalDescription}
              onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Select
              value={formData.goalType}
              onValueChange={(value) => setFormData({ ...formData, goalType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal type..." />
              </SelectTrigger>
              <SelectContent>
                {currentGoalTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority and Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.goalPriority}
                onValueChange={(value) => setFormData({ ...formData, goalPriority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline-date">Deadline (optional)</Label>
              <Input
                id="deadline-date"
                type="date"
                value={formData.deadlineDate}
                onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
              />
            </div>
          </div>

          {/* Goal Notes */}
          <div className="space-y-2">
            <Label htmlFor="goal-notes">Notes (optional)</Label>
            <Textarea
              id="goal-notes"
              placeholder="Additional notes about this goal..."
              value={formData.goalNotes}
              onChange={(e) => setFormData({ ...formData, goalNotes: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.targetId || !formData.goalDescription.trim() || submitting}
            >
              {submitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 