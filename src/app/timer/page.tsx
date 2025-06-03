'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Settings, Palette, CheckCircle } from 'lucide-react';

type TimerStyle = 'professional' | 'sport' | 'casual';

export default function TimerPage() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [timerStyle, setTimerStyle] = useState<TimerStyle>('professional');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer duration options
  const durations = [
    { label: 'Pomodoro', value: 25 * 60, description: '25 min focus' },
    { label: 'Short Break', value: 5 * 60, description: '5 min break' },
    { label: 'Long Break', value: 15 * 60, description: '15 min break' },
    { label: 'Deep Work', value: 50 * 60, description: '50 min focus' },
    { label: 'Quick Task', value: 10 * 60, description: '10 min task' },
    { label: 'Study Session', value: 30 * 60, description: '30 min study' },
  ];

  // Timer styles
  const styles = [
    { 
      id: 'professional' as TimerStyle, 
      label: 'Professional', 
      description: 'Clean and focused',
      colors: 'from-blue-500 to-purple-600',
      bgColors: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
    },
    { 
      id: 'sport' as TimerStyle, 
      label: 'Sport', 
      description: 'Energetic and dynamic',
      colors: 'from-orange-500 to-red-600',
      bgColors: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    },
    { 
      id: 'casual' as TimerStyle, 
      label: 'Casual', 
      description: 'Relaxed and comfortable',
      colors: 'from-green-500 to-teal-600',
      bgColors: 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20'
    },
  ];

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const selectDuration = (duration: number) => {
    if (!isRunning) {
      setTime(duration);
      setInitialTime(duration);
    }
  };

  const currentStyle = styles.find(s => s.id === timerStyle) || styles[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentStyle.bgColors} dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="flex h-screen">
        {/* Left Sidebar - Timer Options */}
        <div className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timer Options</h2>
          </div>
          
          <div className="space-y-3">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => selectDuration(duration.value)}
                disabled={isRunning}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  initialTime === duration.value
                    ? `bg-gradient-to-r ${currentStyle.colors} text-white shadow-md`
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{duration.label}</div>
                    <div className={`text-sm ${
                      initialTime === duration.value 
                        ? 'text-white/80' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {duration.description}
                    </div>
                  </div>
                  {initialTime === duration.value && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tips</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Use Pomodoro for focused work</li>
              <li>• Take breaks between sessions</li>
              <li>• Customize duration for your needs</li>
            </ul>
          </div>
        </div>

        {/* Main Timer Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 mr-3 text-gray-600 dark:text-gray-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Focus Timer
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Stay focused and productive with customizable timing
            </p>
          </div>

          {/* Timer Circle */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center">
              {/* Progress Ring */}
              <div className="relative w-72 h-72 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={timerStyle === 'professional' ? '#3B82F6' : timerStyle === 'sport' ? '#F97316' : '#10B981'} />
                      <stop offset="100%" stopColor={timerStyle === 'professional' ? '#8B5CF6' : timerStyle === 'sport' ? '#DC2626' : '#0D9488'} />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
                    {formatTime(time)}
                  </div>
                  <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Focus Session
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={toggleTimer}
                  className={`w-16 h-16 bg-gradient-to-r ${currentStyle.colors} hover:scale-105 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  {isRunning ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>
                
                <button
                  onClick={resetTimer}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Status */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>{isRunning ? 'Running' : 'Paused'}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Timer Styles */}
        <div className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timer Styles</h2>
          </div>
          
          <div className="space-y-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setTimerStyle(style.id)}
                className={`w-full p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                  timerStyle === style.id
                    ? `bg-gradient-to-r ${style.colors} text-white shadow-md`
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{style.label}</div>
                  {timerStyle === style.id && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
                <div className={`text-sm ${
                  timerStyle === style.id 
                    ? 'text-white/80' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {style.description}
                </div>
                <div className={`mt-2 h-2 rounded-full bg-gradient-to-r ${style.colors}`}></div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">About Styles</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Professional: Clean, focused</li>
              <li>• Sport: Energetic, motivating</li>
              <li>• Casual: Relaxed, comfortable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 