'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Plus,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiClient } from '../../lib/api/client';
import { GoalCreationDialog } from './goal-creation-dialog';
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';
import type { Folder } from '../../types/supabase';

interface ProductivityDashboardProps {
  userId: string;
}

interface GoalItem {
  id: string;
  title: string;
  type: 'bookmark' | 'folder';
  goal_description: string | null;
  goal_type: string | null;
  goal_status: string | null;
  goal_priority: string | null;
  goal_progress: number | null;
  deadline_date: string | null;
  url: string | null;
  folder_name: string | null;
}

export function ProductivityDashboard({ userId }: ProductivityDashboardProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalDialog, setShowGoalDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

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
      console.error('Failed to load productivity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = () => {
    // Reload data to show the new goal
    loadData();
  };

  // Process goals from both bookmarks and folders
  const goals = useMemo(() => {
    const bookmarkGoals: GoalItem[] = bookmarks
      .filter(b => b.goal_description || b.deadline_date)
      .map(b => ({
        id: b.id,
        title: b.title,
        type: 'bookmark' as const,
        goal_description: b.goal_description || null,
        goal_type: b.goal_type || null,
        goal_status: b.goal_status || null,
        goal_priority: b.goal_priority || null,
        goal_progress: b.goal_progress || null,
        deadline_date: b.deadline_date || null,
        url: b.url,
        folder_name: b.folder?.name || null
      }));

    const folderGoals: GoalItem[] = folders
      .filter(f => f.goal_description || f.deadline_date)
      .map(f => ({
        id: f.id,
        title: f.name,
        type: 'folder' as const,
        goal_description: f.goal_description || null,
        goal_type: f.goal_type || null,
        goal_status: f.goal_status || null,
        goal_priority: f.goal_priority || null,
        goal_progress: f.goal_progress || null,
        deadline_date: f.deadline_date || null,
        url: null,
        folder_name: null
      }));

    return [...bookmarkGoals, ...folderGoals];
  }, [bookmarks, folders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PRODUCTIVITY DASHBOARD</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your goals and deadlines</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600"
          onClick={() => setShowGoalDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Set New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No goals found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start setting goals for your bookmarks and folders to track your progress.
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => setShowGoalDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Set Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {goal.title}
                    </h3>
                    {goal.goal_description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {goal.goal_description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{goal.type.toUpperCase()}</Badge>
                      {goal.goal_status && (
                        <Badge variant="secondary">{goal.goal_status}</Badge>
                      )}
                      {goal.goal_priority && (
                        <Badge 
                          variant={goal.goal_priority === 'urgent' ? 'destructive' : 'outline'}
                        >
                          {goal.goal_priority.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {goal.url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={goal.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Creation Dialog */}
      <GoalCreationDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
        onGoalCreated={handleGoalCreated}
      />
    </div>
  );
} 