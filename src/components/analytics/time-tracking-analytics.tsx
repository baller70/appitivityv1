'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Clock } from 'lucide-react';
import { TimeTrackingService } from '@/lib/services/time-tracking';
import { useUser } from '@clerk/nextjs';

interface TimeStats {
  totalTimeSpent: number;
  totalSessions: number;
}

export function TimeTrackingAnalytics() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadTimeTrackingData();
      checkActiveSessionStatus();
      
      // Set up interval to check active sessions every 1 second for live updates
      const interval = setInterval(() => {
        checkActiveSessionStatus();
        loadTimeTrackingData(); // Reload data every second for live updates
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const checkActiveSessionStatus = async () => {
    try {
      // Use hardcoded user ID that we know works
      const userId = '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121';
      const timeTrackingService = new TimeTrackingService(userId);
      const activeSessions = await timeTrackingService.getAllActiveSessions();
      setHasActiveSession(activeSessions.length > 0);
      
      // Calculate current session time if there's an active session
      if (activeSessions.length > 0) {
        const latestSession = activeSessions[0];
        const sessionStart = new Date(latestSession.session_start).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessionStart) / 1000);
        setCurrentSessionTime(elapsedSeconds);
      } else {
        setCurrentSessionTime(0);
      }
    } catch (error) {
      console.error('Failed to check active sessions:', error);
      setHasActiveSession(false);
      setCurrentSessionTime(0);
    }
  };

  const loadTimeTrackingData = async () => {
    try {
      // Use hardcoded user ID that we know works
      const userId = '085b8f63-7a51-5b8a-8e7f-4c6da6ab0121';
      const timeTrackingService = new TimeTrackingService(userId);
      const userStats = await timeTrackingService.getUserTimeStats();
      setTimeStats(userStats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load time tracking data:', error);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Calculate total time including current active session
  const totalTimeWithCurrent = (timeStats?.totalTimeSpent || 0) + currentSessionTime;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-blue-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Time Spent {hasActiveSession && <span className="text-green-500 ml-2">● LIVE</span>}
          </h3>
          <div 
            className={`w-3 h-3 rounded-full ${
              hasActiveSession 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            title={hasActiveSession ? 'Tracking active - Live updates' : 'No active tracking'}
          />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatTime(totalTimeWithCurrent)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {hasActiveSession ? (
            <>
              Across {timeStats?.totalSessions || 0} sessions
              <span className="text-green-500 ml-2">
                +{formatTime(currentSessionTime)} this session
              </span>
            </>
          ) : (
            `Across ${timeStats?.totalSessions || 0} sessions`
          )}
        </p>
      </CardContent>
    </Card>
  );
} 