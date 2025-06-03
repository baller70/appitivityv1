'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  TrendingUp,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  pomodorosCompleted: number;
}

type TabType = 'timer' | 'tasks' | 'lists' | 'progress' | 'settings';

export function TimerTaskPage() {
  // Timer state
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Task management state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('timer-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        })));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('timer-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Timer completed - could add notification here
      if (selectedTask) {
        // Increment pomodoro count for selected task
        setTasks(prev => prev.map(task => 
          task.id === selectedTask.id 
            ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
            : task
        ));
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time, selectedTask]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Timer controls
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(25 * 60);
  };

  // Task management
  const createTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        createdAt: new Date(),
        pomodorosCompleted: 0
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
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

  const tabs = [
    { id: 'timer' as const, label: 'Timer', icon: Clock },
    { id: 'tasks' as const, label: 'Tasks', icon: Target },
    { id: 'lists' as const, label: 'Lists', icon: List },
    { id: 'progress' as const, label: 'Progress', icon: TrendingUp },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
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
                <Icon className="h-4 w-4" />
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
            {/* Task Selection */}
            <div className="text-center mb-8">
              {selectedTask ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">FOCUSING ON</p>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTask.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedTask.pomodorosCompleted} pomodoros completed
                  </p>
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

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-gray-900 dark:text-white mb-8 font-mono">
                {formatTime(time)}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    size="lg"
                    className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={time === 0}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {time === 25 * 60 ? 'FOCUS' : 'RESUME'}
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
                  <div className="flex space-x-3">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title..."
                      onKeyPress={(e) => e.key === 'Enter' && createTask()}
                      className="flex-1"
                    />
                    <Button onClick={createTask} disabled={!newTaskTitle.trim()}>
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowTaskForm(false);
                        setNewTaskTitle('');
                      }}
                    >
                      Cancel
                    </Button>
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
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task.id);
                            }}
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center",
                              task.completed 
                                ? "bg-green-500 border-green-500 text-white" 
                                : "border-gray-300 hover:border-green-500"
                            )}
                          >
                            {task.completed && <Check className="h-3 w-3" />}
                          </button>
                          <div>
                            <h3 className={cn(
                              "font-medium",
                              task.completed 
                                ? "line-through text-gray-500" 
                                : "text-gray-900 dark:text-white"
                            )}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {task.pomodorosCompleted} pomodoros • Created {task.createdAt.toLocaleDateString()}
                            </p>
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
          <div className="max-w-4xl mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lists</h2>
            <p className="text-gray-500 dark:text-gray-400">Organize your tasks into custom lists</p>
            <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {tasks.reduce((sum, task) => sum + task.pomodorosCompleted, 0)}
                  </div>
                  <p className="text-sm text-gray-500">Total Pomodoros</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {tasks.filter(task => task.completed).length}
                  </div>
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {tasks.length}
                  </div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Timer and notification settings
                </p>
                <p className="text-sm text-gray-400 text-center mt-2">Coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 