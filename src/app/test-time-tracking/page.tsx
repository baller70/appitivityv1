'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, CheckCircle } from 'lucide-react';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import { useUser } from '@clerk/nextjs';

export default function TestTimeTrackingPage() {
  const { user } = useUser();
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  
  // Sample bookmark IDs for testing
  const sampleBookmarks = [
    { id: 'test-bookmark-1', title: 'Google Search', url: 'https://google.com' },
    { id: 'test-bookmark-2', title: 'GitHub', url: 'https://github.com' },
    { id: 'test-bookmark-3', title: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ];

  // Time tracking for the selected bookmark
  const timeTracking = useTimeTracking({
    bookmarkId: selectedBookmark || '',
    sessionType: 'view',
    autoStart: false,
    metadata: { source: 'test_page' }
  });

  const handleSelectBookmark = (bookmarkId: string) => {
    if (timeTracking.isTracking) {
      timeTracking.stopTracking();
    }
    setSelectedBookmark(bookmarkId);
  };

  const handleStartAutoTracking = () => {
    if (selectedBookmark && !timeTracking.isTracking) {
      timeTracking.startTracking();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Time Tracking Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page demonstrates the automatic time tracking functionality for bookmarks.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Signed in as: {user.emailAddresses[0]?.emailAddress}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span>Not signed in - Time tracking will be limited</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select a Bookmark to Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleBookmarks.map(bookmark => (
              <Button
                key={bookmark.id}
                variant={selectedBookmark === bookmark.id ? "default" : "outline"}
                className="h-auto p-4 text-left"
                onClick={() => handleSelectBookmark(bookmark.id)}
              >
                <div>
                  <div className="font-medium">{bookmark.title}</div>
                  <div className="text-sm text-gray-500 truncate">{bookmark.url}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBookmark && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking for: {sampleBookmarks.find(b => b.id === selectedBookmark)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant={timeTracking.isTracking ? "default" : "secondary"}>
                  {timeTracking.isTracking ? "🟢 Active" : "⚫ Stopped"}
                </Badge>
                
                {timeTracking.isTracking && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Elapsed: {timeTracking.formatElapsedTime(timeTracking.elapsedTime)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleStartAutoTracking}
                  disabled={!selectedBookmark || timeTracking.isTracking}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Auto-Tracking
                </Button>
                
                <Button
                  onClick={timeTracking.stopTracking}
                  disabled={!timeTracking.isTracking}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Tracking
                </Button>
              </div>

              {timeTracking.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <strong>Error:</strong> {timeTracking.error}
                  </p>
                </div>
              )}

              {timeTracking.isTracking && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ Automatic time tracking is working! Session started successfully.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 