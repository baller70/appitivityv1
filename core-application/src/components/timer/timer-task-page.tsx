'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check,
  Clock,
  Target,
  List,
  Settings,
  Coffee,
  Volume2,
  VolumeX,
  Globe,
  ExternalLink,
  X,
  CheckCircle,
  ArrowLeft,
  Edit3,
  Calendar,
  Tag,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '@/components/notifications';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  estimatedPomodoros: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  pomodorosCompleted: number;
  listId?: string;
}

interface TaskList {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  taskIds: string[];
}

interface TimerSettings {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  volume: number;
}

interface PomodoroSession {
  id: string;
  type: 'focus' | 'short-break' | 'long-break';
  taskId?: string;
  taskTitle?: string;
  completedAt: Date;
  duration: number;
}

type TabType = 'timer' | 'tasks' | 'lists' | 'settings' | 'completed' | 'notifications';
type TimerMode = 'focus' | 'short-break' | 'long-break';

export function TimerTaskPage() {
  const router = useRouter();
  
  // Timer state
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<TimerMode>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Bookmark context state
  const [bookmarkContext, setBookmarkContext] = useState<{
    id: string;
    title: string;
    url: string;
    favicon?: string;
  } | null>(null);

  // Task management state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
  const [newTaskEstimatedPomodoros, setNewTaskEstimatedPomodoros] = useState(1);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskFormForList, setShowTaskFormForList] = useState<string | null>(null);

  // List management state
  const [lists, setLists] = useState<TaskList[]>([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListDueDate, setNewListDueDate] = useState<Date | null>(null);
  const [newListPriority, setNewListPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newListTags, setNewListTags] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const [selectedList, setSelectedList] = useState<TaskList | null>(null);

  // Session tracking
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);

  // Settings state
  const [settings, setSettings] = useState<TimerSettings>({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    volume: 0.5
  });

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Audio context for notifications
  const playSound = useCallback((frequency: number = 800, duration: number = 200) => {
    if (!settings.soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  }, [settings.soundEnabled, settings.volume]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('pomodoro-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed.map((task: Partial<Task>) => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          estimatedPomodoros: task.estimatedPomodoros ?? 1,
          priority: task.priority ?? 'medium',
          tags: task.tags ?? [],
          description: task.description ?? undefined
        } as Task)));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }

    const savedLists = localStorage.getItem('pomodoro-lists');
    if (savedLists) {
      try {
        const parsed = JSON.parse(savedLists);
        setLists(parsed.map((list: Partial<TaskList>) => ({
          ...list,
          createdAt: list.createdAt ? new Date(list.createdAt) : new Date(),
          completedAt: list.completedAt ? new Date(list.completedAt) : undefined,
          dueDate: list.dueDate ? new Date(list.dueDate) : undefined,
          priority: list.priority ?? 'medium',
          tags: list.tags ?? [],
          taskIds: list.taskIds ?? []
        } as TaskList)));
      } catch (error) {
        console.error('Error loading lists:', error);
      }
    }

    const savedSessions = localStorage.getItem('pomodoro-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed.map((session: Partial<PomodoroSession>) => ({
          ...session,
          completedAt: session.completedAt ? new Date(session.completedAt) : new Date()
        } as PomodoroSession)));
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }

    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    const savedPomodoros = localStorage.getItem('pomodoro-completed-count');
    if (savedPomodoros) {
      setCompletedPomodoros(parseInt(savedPomodoros, 10) || 0);
    }

    // Load timer state
    const savedTimerState = localStorage.getItem('pomodoro-timer-state');
    if (savedTimerState) {
      try {
        const parsed = JSON.parse(savedTimerState);
        if (parsed.currentMode) setCurrentMode(parsed.currentMode);
        if (parsed.time !== undefined) setTime(parsed.time);
        if (parsed.selectedTask) {
          // Find the task in the loaded tasks
          setTimeout(() => {
            setTasks(currentTasks => {
              const foundTask = currentTasks.find(t => t.id === parsed.selectedTask.id);
              if (foundTask) setSelectedTask(foundTask);
              return currentTasks;
            });
          }, 100);
        }
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }

    // Check for bookmark context from modal
    const bookmarkContextData = localStorage.getItem('pomodoroBookmarkContext');
    if (bookmarkContextData) {
      try {
        const context = JSON.parse(bookmarkContextData);
        setBookmarkContext(context);
        // Clear the context after loading to prevent stale data
        localStorage.removeItem('pomodoroBookmarkContext');
      } catch (error) {
        console.error('Error loading bookmark context:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomodoro-lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro-completed-count', completedPomodoros.toString());
  }, [completedPomodoros]);

  // Save timer state (but not when running to avoid overwriting frequently)
  useEffect(() => {
    if (!isRunning) {
      const timerState = {
        currentMode,
        time,
        selectedTask,
        activeTab
      };
      localStorage.setItem('pomodoro-timer-state', JSON.stringify(timerState));
    }
  }, [currentMode, selectedTask, activeTab, isRunning, time]);

  // Save data before page unload to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Force save all data before leaving
      localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
      localStorage.setItem('pomodoro-lists', JSON.stringify(lists));
      localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
      localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
      localStorage.setItem('pomodoro-completed-count', completedPomodoros.toString());
      
      const timerState = {
        currentMode,
        time,
        selectedTask,
        activeTab
      };
      localStorage.setItem('pomodoro-timer-state', JSON.stringify(timerState));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tasks, lists, sessions, settings, completedPomodoros, currentMode, time, selectedTask, activeTab]);

  // Periodically save data every 30 seconds when timer is running
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        localStorage.setItem('pomodoro-timer-state', JSON.stringify({
          currentMode,
          time,
          selectedTask,
          activeTab
        }));
      }, 30000); // Save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isRunning, currentMode, time, selectedTask, activeTab]);

  // Initialize timer when mode changes
  useEffect(() => {
    switch (currentMode) {
      case 'focus':
        setTime(settings.focusTime * 60);
        break;
      case 'short-break':
        setTime(settings.shortBreak * 60);
        break;
      case 'long-break':
        setTime(settings.longBreak * 60);
        break;
    }
  }, [currentMode, settings]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleTimerComplete = () => {
    // Play completion sound
    playSound(1000, 500);
    
    // Create session record
    const session: PomodoroSession = {
      id: Date.now().toString(),
      type: currentMode,
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title,
      completedAt: new Date(),
      duration: currentMode === 'focus' ? settings.focusTime : 
                currentMode === 'short-break' ? settings.shortBreak : settings.longBreak
    };
    
    setSessions(prev => [...prev, session]);

    if (currentMode === 'focus') {
      // Increment pomodoro count
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Update task pomodoro count
      if (selectedTask) {
        setTasks(prev => prev.map(task => 
          task.id === selectedTask.id 
            ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
            : task
        ));
      }

      // Determine next break type
      const shouldTakeLongBreak = newCount % settings.longBreakInterval === 0;
      const nextMode = shouldTakeLongBreak ? 'long-break' : 'short-break';
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: `Time for a ${shouldTakeLongBreak ? 'long' : 'short'} break`,
          icon: '/timer-icon.png'
        });
      }

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setCurrentMode(nextMode);
        setIsRunning(true);
      } else {
        setCurrentMode(nextMode);
      }
    } else {
      // Break complete
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break Complete!', {
          body: 'Ready for another pomodoro?',
          icon: '/timer-icon.png'
        });
      }

      // Auto-start next pomodoro if enabled
      if (settings.autoStartPomodoros) {
        setCurrentMode('focus');
        setIsRunning(true);
      } else {
        setCurrentMode('focus');
      }
    }
  };

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Timer controls
  const startTimer = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };
  
  const pauseTimer = () => setIsRunning(false);
  
  const resetTimer = () => {
    setIsRunning(false);
    switch (currentMode) {
      case 'focus':
        setTime(settings.focusTime * 60);
        break;
      case 'short-break':
        setTime(settings.shortBreak * 60);
        break;
      case 'long-break':
        setTime(settings.longBreak * 60);
        break;
    }
  };

  const switchMode = (mode: TimerMode) => {
    setIsRunning(false);
    setCurrentMode(mode);
  };

  // Task management
  const createTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        completed: false,
        createdAt: new Date(),
        dueDate: newTaskDueDate || undefined,
        estimatedPomodoros: newTaskEstimatedPomodoros,
        priority: newTaskPriority,
        tags: newTaskTags.split(',').map(tag => tag.trim()).filter(Boolean),
        pomodorosCompleted: 0
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate(null);
      setNewTaskEstimatedPomodoros(1);
      setNewTaskPriority('medium');
      setNewTaskTags('');
      setShowTaskForm(false);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const selectTask = (task: Task) => {
    setSelectedTask(task);
    setActiveTab('timer');
  };

  // Settings handlers
  const updateSettings = (key: keyof TimerSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // List management functions
  const createList = () => {
    if (!newListTitle.trim()) return;
    
    const newList: TaskList = {
      id: Date.now().toString(),
      title: newListTitle.trim(),
      description: newListDescription.trim(),
      completed: false,
      createdAt: new Date(),
      dueDate: newListDueDate || undefined,
      priority: newListPriority,
      tags: newListTags.split(',').map(tag => tag.trim()).filter(Boolean),
      taskIds: []
    };
    
    setLists(prev => [...prev, newList]);
    setNewListTitle('');
    setNewListDescription('');
    setNewListDueDate(null);
    setNewListPriority('medium');
    setNewListTags('');
    setShowListForm(false);
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    // Remove list reference from tasks
    setTasks(prev => prev.map(task => 
      task.listId === listId ? { ...task, listId: undefined } : task
    ));
    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
  };

  const toggleListComplete = (listId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        const isCompleting = !list.completed;
        return {
          ...list,
          completed: isCompleting,
          completedAt: isCompleting ? new Date() : undefined
        };
      }
      return list;
    }));
  };

  const addTaskToList = (taskId: string, listId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, listId } : task
    ));
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, taskIds: [...list.taskIds.filter(id => id !== taskId), taskId] }
        : { ...list, taskIds: list.taskIds.filter(id => id !== taskId) }
    ));
  };

  const removeTaskFromList = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, listId: undefined } : task
    ));
    setLists(prev => prev.map(list => ({
      ...list,
      taskIds: list.taskIds.filter(id => id !== taskId)
    })));
  };

  // Create task for specific list
  const createTaskForList = (listId: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      completed: false,
      createdAt: new Date(),
      dueDate: newTaskDueDate || undefined,
      estimatedPomodoros: newTaskEstimatedPomodoros,
      priority: newTaskPriority,
      tags: newTaskTags.split(',').map(tag => tag.trim()).filter(Boolean),
      pomodorosCompleted: 0,
      listId: listId
    };
    
    setTasks(prev => [...prev, newTask]);
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, taskIds: [...list.taskIds, newTask.id] }
        : list
    ));
    
    resetTaskForm();
    setShowTaskFormForList(null);
  };

  // Reset task form fields
  const resetTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(null);
    setNewTaskEstimatedPomodoros(1);
    setNewTaskPriority('medium');
    setNewTaskTags('');
  };

  // Get mode display info
  const getModeInfo = () => {
    switch (currentMode) {
      case 'focus':
        return { 
          title: 'FOCUS TIME', 
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          icon: Target
        };
      case 'short-break':
        return { 
          title: 'SHORT BREAK', 
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          icon: Coffee
        };
      case 'long-break':
        return { 
          title: 'LONG BREAK', 
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          icon: Coffee
        };
    }
  };

  const modeInfo = getModeInfo();
  const Icon = modeInfo.icon;

  // Calculate stats
  const todaysSessions = sessions.filter(s => {
    const today = new Date();
    const sessionDate = s.completedAt;
    return sessionDate.toDateString() === today.toDateString();
  }).length;

  const totalFocusTime = sessions
    .filter(s => s.type === 'focus')
    .reduce((total, s) => total + s.duration, 0);

  const tabs = [
    { id: 'timer' as const, label: 'Timer', icon: Clock },
    { id: 'tasks' as const, label: 'Tasks', icon: Target },
    { id: 'lists' as const, label: 'Lists', icon: List },
    { id: 'completed' as const, label: 'Completed', icon: CheckCircle },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  // Try to go back to previous page, fallback to dashboard
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/dashboard');
                  }
                }}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                POMODORO FOCUS TIMER
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationBell variant="minimal" size="sm" />
              {/* Close button for popup/tab navigation */}
              <Button
                onClick={() => {
                  // Try to close the tab if opened from bookmark popup
                  if (window.opener) {
                    window.close();
                  } else {
                    // Use router navigation instead of window.history.back()
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push('/dashboard');
                    }
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <nav className="flex items-center space-x-8 px-6" aria-label="Tabs">
          {/* Back Navigation */}
          {activeTab !== 'timer' && (
            <Button
              onClick={() => setActiveTab('timer')}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Timer
            </Button>
          )}
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6">
        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto">
            {/* Mode Selector */}
            <div className="flex justify-center space-x-2 mb-8">
              <Button
                onClick={() => switchMode('focus')}
                variant={currentMode === 'focus' ? 'default' : 'outline'}
                className={cn(
                  currentMode === 'focus' && 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                <Target className="h-4 w-4 mr-2" />
                Focus
              </Button>
              <Button
                onClick={() => switchMode('short-break')}
                variant={currentMode === 'short-break' ? 'default' : 'outline'}
                className={cn(
                  currentMode === 'short-break' && 'bg-green-600 hover:bg-green-700'
                )}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Short Break
              </Button>
              <Button
                onClick={() => switchMode('long-break')}
                variant={currentMode === 'long-break' ? 'default' : 'outline'}
                className={cn(
                  currentMode === 'long-break' && 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Long Break
              </Button>
            </div>

            {/* Current Mode Display */}
            <div className={cn("text-center mb-8 p-6 rounded-lg", modeInfo.bgColor)}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Icon className={cn("h-6 w-6", modeInfo.color)} />
                <h2 className={cn("text-xl font-bold", modeInfo.color)}>
                  {modeInfo.title}
                </h2>
              </div>
              
              {currentMode === 'focus' && completedPomodoros > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Session {completedPomodoros + 1} • Next break in {completedPomodoros % settings.longBreakInterval === settings.longBreakInterval - 1 ? settings.longBreak : settings.shortBreak} minutes
                </p>
              )}
            </div>

            {/* Task Selection */}
            {currentMode === 'focus' && (
              <div className="text-center mb-8">
                {selectedTask ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">FOCUSING ON</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTask.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedTask.pomodorosCompleted} pomodoros completed
                    </p>
                  </div>
                ) : bookmarkContext ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">🔗 FOCUSING ON BOOKMARK</p>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 rounded-lg overflow-hidden flex-shrink-0">
                        {bookmarkContext.favicon ? (
                          <img 
                            src={bookmarkContext.favicon} 
                            alt="Site favicon" 
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Globe className={`w-4 h-4 text-blue-500 ${bookmarkContext.favicon ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{bookmarkContext.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{bookmarkContext.url}</p>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-3">
                      <Button 
                        onClick={() => window.open(bookmarkContext.url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Site
                      </Button>
                      <Button 
                        onClick={() => setBookmarkContext(null)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('tasks')}
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Select Task
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">NO TASK SELECTED</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">CHOOSE A TASK TO FOCUS ON</p>
                    <Button 
                      onClick={() => setActiveTab('tasks')}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Select Task
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-gray-900 dark:text-white mb-8 font-mono">
                {formatTime(time)}
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-1000",
                    currentMode === 'focus' ? "bg-blue-600" :
                    currentMode === 'short-break' ? "bg-green-600" : "bg-purple-600"
                  )}
                  style={{ 
                    width: `${((
                      currentMode === 'focus' ? settings.focusTime * 60 :
                      currentMode === 'short-break' ? settings.shortBreak * 60 :
                      settings.longBreak * 60
                    ) - time) / (
                      currentMode === 'focus' ? settings.focusTime * 60 :
                      currentMode === 'short-break' ? settings.shortBreak * 60 :
                      settings.longBreak * 60
                    ) * 100}%` 
                  }}
                />
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    size="lg"
                    className={cn(
                      "px-8 py-3 text-lg text-white",
                      currentMode === 'focus' ? "bg-blue-600 hover:bg-blue-700" :
                      currentMode === 'short-break' ? "bg-green-600 hover:bg-green-700" :
                      "bg-purple-600 hover:bg-purple-700"
                    )}
                    disabled={time === 0}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {time === (currentMode === 'focus' ? settings.focusTime * 60 : 
                             currentMode === 'short-break' ? settings.shortBreak * 60 : 
                             settings.longBreak * 60) ? 'START' : 'RESUME'}
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    size="lg"
                    variant="outline"
                    className="px-8 py-3 text-lg"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    PAUSE
                  </Button>
                )}
                
                <Button
                  onClick={resetTimer}
                  size="lg"
                  variant="outline"
                  className="px-6 py-3"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Session Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Progress</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed Pomodoros:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{completedPomodoros}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Until Long Break:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {settings.longBreakInterval - (completedPomodoros % settings.longBreakInterval)} sessions
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TASK MANAGEMENT</h1>
              <Button 
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>

            {/* Task Creation Form */}
            {showTaskForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor="task-title">Title *</Label>
                      <Input
                        id="task-title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Enter task title..."
                        className="mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="task-description">Description</Label>
                      <Textarea
                        id="task-description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Enter task description (optional)..."
                        className="mt-1 h-20"
                      />
                    </div>

                    {/* Due Date and Estimated Pomodoros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="task-due-date">Due Date</Label>
                        <Input
                          id="task-due-date"
                          type="date"
                          value={newTaskDueDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => setNewTaskDueDate(e.target.value ? new Date(e.target.value) : null)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-pomodoros">Estimated Pomodoros</Label>
                        <div className="flex items-center mt-1 space-x-2">
                          <Timer className="h-4 w-4 text-gray-500" />
                          <Input
                            id="task-pomodoros"
                            type="number"
                            min="1"
                            max="20"
                            value={newTaskEstimatedPomodoros}
                            onChange={(e) => setNewTaskEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Priority and Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="task-priority">Priority</Label>
                        <Select value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Low</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>Medium</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="high">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>High</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="task-tags">Tags</Label>
                        <div className="flex items-center mt-1 space-x-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <Input
                            id="task-tags"
                            value={newTaskTags}
                            onChange={(e) => setNewTaskTags(e.target.value)}
                            placeholder="work, urgent, personal..."
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-2">
                      <Button onClick={createTask} disabled={!newTaskTitle.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowTaskForm(false);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                          setNewTaskDueDate(null);
                          setNewTaskEstimatedPomodoros(1);
                          setNewTaskPriority('medium');
                          setNewTaskTags('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Task List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks yet</p>
                    <p className="text-sm text-gray-400 mb-4">Create your first task</p>
                    <Button 
                      onClick={() => setShowTaskForm(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                      selectedTask?.id === task.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => selectTask(task)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                                              <div className="flex items-start space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                            task.completed 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "border-gray-300 hover:border-green-500"
                          )}
                        >
                          {task.completed && <Check className="h-3 w-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={cn(
                              "font-medium",
                              task.completed 
                                ? "line-through text-gray-500" 
                                : "text-gray-900 dark:text-white"
                            )}>
                              {task.title}
                            </h3>
                            {/* Priority indicator */}
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              task.priority === 'high' ? 'bg-red-500' :
                              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            )}></div>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Timer className="h-3 w-3" />
                              <span>{task.pomodorosCompleted}/{task.estimatedPomodoros}</span>
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className={cn(
                                  new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500' : ''
                                )}>
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                            <span>Created {task.createdAt.toLocaleDateString()}</span>
                          </div>
                          {/* Tags */}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                        
                        <div className="flex items-center space-x-2">
                          {selectedTask?.id === task.id && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Selected
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LIST MANAGEMENT</h1>
              <Button 
                onClick={() => setShowListForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </div>

            {/* List Creation Form */}
            {showListForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor="list-title">Title *</Label>
                      <Input
                        id="list-title"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Enter list title..."
                        className="mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="list-description">Description</Label>
                      <Textarea
                        id="list-description"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        placeholder="Enter list description (optional)..."
                        className="mt-1 h-20"
                      />
                    </div>

                    {/* Due Date and Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="list-due-date">Due Date</Label>
                        <Input
                          id="list-due-date"
                          type="date"
                          value={newListDueDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => setNewListDueDate(e.target.value ? new Date(e.target.value) : null)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="list-priority">Priority</Label>
                        <Select value={newListPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewListPriority(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Low</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>Medium</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="high">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>High</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label htmlFor="list-tags">Tags</Label>
                      <div className="flex items-center mt-1 space-x-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <Input
                          id="list-tags"
                          value={newListTags}
                          onChange={(e) => setNewListTags(e.target.value)}
                          placeholder="project, work, personal..."
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-2">
                      <Button onClick={createList} disabled={!newListTitle.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create List
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowListForm(false);
                          setNewListTitle('');
                          setNewListDescription('');
                          setNewListDueDate(null);
                          setNewListPriority('medium');
                          setNewListTags('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No lists yet</p>
                      <p className="text-sm text-gray-400 mb-4">Create your first list to organize tasks</p>
                      <Button 
                        onClick={() => setShowListForm(true)}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create List
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                lists.map((list) => {
                  const listTasks = tasks.filter(task => task.listId === list.id);
                  const completedTasks = listTasks.filter(task => task.completed);
                  const progress = listTasks.length > 0 ? (completedTasks.length / listTasks.length) * 100 : 0;
                  
                  return (
                    <Card 
                      key={list.id} 
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                        list.completed && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      )}
                      onClick={() => setSelectedList(list)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleListComplete(list.id);
                              }}
                              className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center",
                                list.completed 
                                  ? "bg-green-500 border-green-500 text-white" 
                                  : "border-gray-300 hover:border-green-500"
                              )}
                            >
                              {list.completed && <Check className="h-3 w-3" />}
                            </button>
                            <h3 className={cn(
                              "font-semibold",
                              list.completed 
                                ? "line-through text-gray-500" 
                                : "text-gray-900 dark:text-white"
                            )}>
                              {list.title}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteList(list.id);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {list.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {list.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {completedTasks.length}/{listTasks.length} tasks
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-400">
                          Created {list.createdAt.toLocaleDateString()}
                          {list.completed && list.completedAt && (
                            <> • Completed {list.completedAt.toLocaleDateString()}</>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Selected List Details */}
            {selectedList && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedList.title}</span>
                      {selectedList.completed && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedList(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedList.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {selectedList.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Tasks in this list:</h4>
                    {tasks.filter(task => task.listId === selectedList.id).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No tasks in this list yet</p>
                    ) : (
                      tasks
                        .filter(task => task.listId === selectedList.id)
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleTaskComplete(task.id)}
                                className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                                  task.completed 
                                    ? "bg-green-500 border-green-500 text-white" 
                                    : "border-gray-300 hover:border-green-500"
                                )}
                              >
                                {task.completed && <Check className="h-2 w-2" />}
                              </button>
                              <span className={cn(
                                "text-sm",
                                task.completed 
                                  ? "line-through text-gray-500" 
                                  : "text-gray-900 dark:text-white"
                              )}>
                                {task.title}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTaskFromList(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))
                    )}
                    
                    {/* Create new task for this list */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Add tasks to this list:
                        </h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTaskFormForList(selectedList.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create New Task
                        </Button>
                      </div>

                      {/* New task creation form for this list */}
                      {showTaskFormForList === selectedList.id && (
                        <Card className="mb-4">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="list-task-title">Task Title</Label>
                                <Input
                                  id="list-task-title"
                                  value={newTaskTitle}
                                  onChange={(e) => setNewTaskTitle(e.target.value)}
                                  placeholder="Enter task title..."
                                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && createTaskForList(selectedList.id)}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="list-task-description">Description</Label>
                                <Textarea
                                  id="list-task-description"
                                  value={newTaskDescription}
                                  onChange={(e) => setNewTaskDescription(e.target.value)}
                                  placeholder="Enter task description (optional)..."
                                  rows={2}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="list-task-pomodoros">Estimated Pomodoros</Label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <Timer className="h-4 w-4 text-gray-500" />
                                    <Input
                                      id="list-task-pomodoros"
                                      type="number"
                                      min="1"
                                      max="20"
                                      value={newTaskEstimatedPomodoros}
                                      onChange={(e) => setNewTaskEstimatedPomodoros(parseInt(e.target.value) || 1)}
                                      className="flex-1"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="list-task-priority">Priority</Label>
                                  <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as 'low' | 'medium' | 'high')}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span>Low</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="medium">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          <span>Medium</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="high">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span>High</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="list-task-due-date">Due Date</Label>
                                  <Input
                                    id="list-task-due-date"
                                    type="date"
                                    value={newTaskDueDate ? newTaskDueDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setNewTaskDueDate(e.target.value ? new Date(e.target.value) : null)}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="list-task-tags">Tags</Label>
                                <div className="flex items-center mt-1 space-x-2">
                                  <Tag className="h-4 w-4 text-gray-500" />
                                  <Input
                                    id="list-task-tags"
                                    value={newTaskTags}
                                    onChange={(e) => setNewTaskTags(e.target.value)}
                                    placeholder="work, urgent, project..."
                                    className="flex-1"
                                  />
                                </div>
                              </div>

                              <div className="flex space-x-3">
                                <Button 
                                  onClick={() => createTaskForList(selectedList.id)} 
                                  disabled={!newTaskTitle.trim()}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Task to List
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setShowTaskFormForList(null);
                                    resetTaskForm();
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Add existing tasks to list */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Or add existing tasks:
                        </h6>
                        <div className="space-y-2">
                          {tasks
                            .filter(task => !task.listId || task.listId !== selectedList.id)
                            .map(task => (
                              <div key={task.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-900 dark:text-white">{task.title}</span>
                                  {task.priority && (
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      task.priority === 'high' ? 'bg-red-500' :
                                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    )} />
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addTaskToList(task.id, selectedList.id)}
                                >
                                  Add to List
                                </Button>
                              </div>
                            ))}
                          {tasks.filter(task => !task.listId || task.listId !== selectedList.id).length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-2">
                              All tasks are already assigned to lists
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}



        {activeTab === 'completed' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">COMPLETED ASSIGNMENTS</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completed Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Completed Tasks</span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {tasks.filter(task => task.completed).length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.filter(task => task.completed).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No completed tasks yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tasks
                        .filter(task => task.completed)
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .map(task => {
                          const taskList = task.listId ? lists.find(list => list.id === task.listId) : null;
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white line-through">
                                    {task.title}
                                  </h3>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span>{task.pomodorosCompleted} pomodoros</span>
                                    <span>•</span>
                                    <span>Created {task.createdAt.toLocaleDateString()}</span>
                                    {taskList && (
                                      <>
                                        <span>•</span>
                                        <span className="text-blue-600 dark:text-blue-400">
                                          List: {taskList.title}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTaskComplete(task.id)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Lists */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Completed Lists</span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {lists.filter(list => list.completed).length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lists.filter(list => list.completed).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No completed lists yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {lists
                        .filter(list => list.completed)
                        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
                        .map(list => {
                          const listTasks = tasks.filter(task => task.listId === list.id);
                          const completedTasks = listTasks.filter(task => task.completed);
                          return (
                            <div key={list.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white line-through">
                                      {list.title}
                                    </h3>
                                    {list.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 line-through">
                                        {list.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleListComplete(list.id)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex-shrink-0"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="mt-3 text-xs text-gray-500 space-y-1">
                                <div className="flex justify-between">
                                  <span>Tasks completed:</span>
                                  <span>{completedTasks.length}/{listTasks.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Created:</span>
                                  <span>{list.createdAt.toLocaleDateString()}</span>
                                </div>
                                {list.completedAt && (
                                  <div className="flex justify-between">
                                    <span>Completed:</span>
                                    <span>{list.completedAt.toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Completion Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {tasks.filter(task => task.completed).length}
                  </div>
                  <p className="text-sm text-gray-500">Total Completed Tasks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {lists.filter(list => list.completed).length}
                  </div>
                  <p className="text-sm text-gray-500">Total Completed Lists</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {tasks.filter(task => task.completed).reduce((total, task) => total + task.pomodorosCompleted, 0)}
                  </div>
                  <p className="text-sm text-gray-500">Pomodoros on Completed Tasks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round((tasks.filter(task => task.completed).length / Math.max(tasks.length, 1)) * 100)}%
                  </div>
                  <p className="text-sm text-gray-500">Task Completion Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
            
            <div className="space-y-6">
              {/* Timer Durations */}
              <Card>
                <CardHeader>
                  <CardTitle>Timer Durations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="focus-time">Focus Time (minutes)</Label>
                      <Input
                        id="focus-time"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.focusTime}
                        onChange={(e) => updateSettings('focusTime', parseInt(e.target.value) || 25)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="short-break">Short Break (minutes)</Label>
                      <Input
                        id="short-break"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.shortBreak}
                        onChange={(e) => updateSettings('shortBreak', parseInt(e.target.value) || 5)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="long-break">Long Break (minutes)</Label>
                      <Input
                        id="long-break"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.longBreak}
                        onChange={(e) => updateSettings('longBreak', parseInt(e.target.value) || 15)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="long-break-interval">Long Break Interval (sessions)</Label>
                    <Input
                      id="long-break-interval"
                      type="number"
                      min="2"
                      max="8"
                      value={settings.longBreakInterval}
                      onChange={(e) => updateSettings('longBreakInterval', parseInt(e.target.value) || 4)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Take a long break after every {settings.longBreakInterval} focus sessions
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Auto-start Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Auto-start Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
                      <p className="text-sm text-gray-500">Automatically start break timers when focus sessions complete</p>
                    </div>
                    <Switch
                      id="auto-start-breaks"
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) => updateSettings('autoStartBreaks', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-start-pomodoros">Auto-start Focus Sessions</Label>
                      <p className="text-sm text-gray-500">Automatically start focus sessions when breaks complete</p>
                    </div>
                    <Switch
                      id="auto-start-pomodoros"
                      checked={settings.autoStartPomodoros}
                      onCheckedChange={(checked) => updateSettings('autoStartPomodoros', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sound Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Sound & Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-enabled">Sound Notifications</Label>
                      <p className="text-sm text-gray-500">Play sound when timers complete</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sound-enabled"
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) => updateSettings('soundEnabled', checked)}
                      />
                      {settings.soundEnabled ? (
                        <Volume2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {settings.soundEnabled && (
                    <div>
                      <Label htmlFor="volume">Volume</Label>
                      <Input
                        id="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.volume}
                        onChange={(e) => updateSettings('volume', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Quiet</span>
                        <span>Loud</span>
                      </div>
                      <Button
                        onClick={() => playSound(800, 200)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Test Sound
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reset Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Reset Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={() => {
                        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                          setSettings({
                            focusTime: 25,
                            shortBreak: 5,
                            longBreak: 15,
                            longBreakInterval: 4,
                            autoStartBreaks: false,
                            autoStartPomodoros: false,
                            soundEnabled: true,
                            volume: 0.5
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Settings to Defaults
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (confirm('Clear all session data? This cannot be undone.')) {
                          setSessions([]);
                          setCompletedPomodoros(0);
                        }
                      }}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Clear All Session Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 