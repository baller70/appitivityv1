'use client';

import React, { useState } from 'react';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';

export default function TestAutoTrackingPage() {
  const { user, isLoaded } = useUser();
  const [selectedBookmarkId, setSelectedBookmarkId] = useState('b5c1b3c6-7773-4afb-bb15-ae3720348395');
  
  const {
    isTracking,
    elapsedTime,
    activeSession,
    timeStats,
    error,
    startTracking,
    stopTracking,
    formattedElapsedTime
  } = useTimeTracking({
    bookmarkId: selectedBookmarkId,
    autoStart: true,
    sessionType: 'view'
  });

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Auto Time Tracking Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? user.emailAddresses?.[0]?.emailAddress : 'Not signed in'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Is Loaded:</strong> {isLoaded ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Tracking Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Bookmark ID:</strong> {selectedBookmarkId}</p>
                <p><strong>Is Tracking:</strong> {isTracking ? '🟢 Active' : '🔴 Inactive'}</p>
                <p><strong>Elapsed Time:</strong> {formattedElapsedTime}</p>
                <p><strong>Active Session ID:</strong> {activeSession?.id || 'None'}</p>
              </div>
              <div>
                <p><strong>Total Sessions:</strong> {timeStats?.totalSessions || 0}</p>
                <p><strong>Total Time:</strong> {timeStats?.totalTimeSpent || 0}s</p>
                <p><strong>Error:</strong> {error || 'None'}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={startTracking}
                disabled={isTracking}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Manual Tracking
              </Button>
              <Button 
                onClick={stopTracking}
                disabled={!isTracking}
                variant="destructive"
              >
                Stop Tracking
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>1. <strong>Auto-Start Test:</strong> This page should automatically start tracking when you load it (if signed in)</p>
            <p>2. <strong>Console Logs:</strong> Open browser console to see detailed tracking logs with 🕒 emojis</p>
            <p>3. <strong>Expected Behavior:</strong> Green status and elapsed time counting up</p>
            <p>4. <strong>Manual Controls:</strong> Use buttons above to manually start/stop for testing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}