'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
  Settings,
  Edit2,
  MoreHorizontal,
  X,
  Calendar,
  Flag,
  Tag,
  FileText,
  Timer,
  Filter,
  ChevronDown,
  Search,
  CheckCircle2,
  Circle,
  Star,
  BarChart3,
  Eye,
  Heart,
  GitBranch,
  Share2,
  Edit,
  ArrowRight,
  GripVertical,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  pomodorosCompleted: number;
  estimatedPomodoros?: number;
  duration?: number; // Custom duration in minutes
  category?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags?: string[];
  isFavorite?: boolean; // New property for favoriting tasks
  isVisible?: boolean; // New property for hiding/showing tasks
}

interface TaskList {
  id: string;
  name: string;
  description?: string;
  taskIds: string[]; // Order matters for sequential execution
  createdAt: Date;
  completedAt?: Date;
  isActive: boolean;
  totalEstimatedTime: number; // in minutes
}

interface ListSession {
  id: string;
  listId: string;
  currentTaskIndex: number;
  startTime: Date;
  endTime?: Date;
  completedTasks: string[];
  isCompleted: boolean;
}

interface TimerSession {
  id: string;
  taskId: string | null;
  listId?: string | null;
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
}

type TabType = 'timer' | 'tasks' | 'lists' | 'progress' | 'settings';

interface TaskListProps {
  tasks: Task[];
  taskFilter: string;
  taskSort: string;
  setTaskFilter: (filter: string) => void;
  selectedTask: Task | null;
  toggleTaskComplete: (taskId: string) => void;
  selectTask: (task: Task) => void;
  openTaskModal: (task?: Task) => void;
  deleteTask: (taskId: string) => void;
  getPriorityColor: (priority: Task['priority']) => string;
  timerSettings: { focusTime: number };
  draggedMainTaskId: string | null;
  onMainTaskDragStart: (taskId: string) => void;
  onMainTaskDragOver: (e: React.DragEvent) => void;
  onMainTaskDrop: (e: React.DragEvent, dropTaskId: string) => void;
  // New props for enhanced functionality
  toggleTaskFavorite: (taskId: string) => void;
  toggleTaskVisibility: (taskId: string) => void;
  shareTask: (task: Task) => void;
  duplicateTask: (task: Task) => void;
  searchQuery: string;
  showOnlyFavorites: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  taskFilter, 
  taskSort, 
  setTaskFilter,
  selectedTask,
  toggleTaskComplete,
  selectTask,
  openTaskModal,
  deleteTask,
  getPriorityColor,
  timerSettings,
  draggedMainTaskId,
  onMainTaskDragStart,
  onMainTaskDragOver,
  onMainTaskDrop,
  toggleTaskFavorite,
  toggleTaskVisibility,
  shareTask,
  duplicateTask,
  searchQuery,
  showOnlyFavorites
}) => {
  // Filter tasks based on selected filter, search query, and other criteria
  const filteredTasks = tasks.filter(task => {
    // Basic visibility filter - hide tasks marked as not visible
    if (task.isVisible === false) return false;
    
    // Favorites filter
    if (showOnlyFavorites && !task.isFavorite) return false;
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesNotes = task.notes?.toLowerCase().includes(query);
      const matchesCategory = task.category?.toLowerCase().includes(query);
      const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesTitle && !matchesNotes && !matchesCategory && !matchesTags) {
        return false;
      }
    }
    
    // Standard filter
    switch (taskFilter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'high-priority':
        return (task.priority === 'high' || task.priority === 'urgent') && !task.completed;
      case 'today':
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === today.toDateString();
      case 'work':
        return task.category?.toLowerCase() === 'work' && !task.completed;
      case 'personal':
        return task.category?.toLowerCase() === 'personal' && !task.completed;
      case 'favorites':
        return task.isFavorite;
      default:
        return true;
    }
  });

  // Sort tasks based on selected sort option
  filteredTasks.sort((a, b) => {
    switch (taskSort) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        return bPriority - aPriority;
      case 'completion':
        const aCompletion = a.estimatedPomodoros ? (a.pomodorosCompleted / a.estimatedPomodoros) : 0;
        const bCompletion = b.estimatedPomodoros ? (b.pomodorosCompleted / b.estimatedPomodoros) : 0;
        return bCompletion - aCompletion;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (filteredTasks.length > 0) {
    return (
      <div className="space-y-3">
        {/* Filter results info */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Showing {filteredTasks.length} of {tasks.length} tasks
            {taskFilter !== 'all' && ` (${taskFilter.replace('-', ' ')})`}
          </span>
          {taskFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskFilter('all')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Clear filter
            </Button>
          )}
        </div>
        
        {filteredTasks.map((task, index) => (
          <div
            key={task.id}
            onDragOver={onMainTaskDragOver}
            onDrop={(e) => onMainTaskDrop(e, task.id)}
            className={cn(
              "group flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-lg border transition-all hover:shadow-md relative",
              selectedTask?.id === task.id && "ring-2 ring-blue-500 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10",
              task.completed && "opacity-60 bg-gray-50 dark:bg-gray-800/50",
              !task.completed && "border-gray-200 dark:border-gray-700",
              draggedMainTaskId === task.id && "opacity-50 scale-95",
              draggedMainTaskId && draggedMainTaskId !== task.id && "ring-2 ring-blue-300 dark:ring-blue-600 bg-blue-50 dark:bg-blue-900/10"
            )}
          >
            {/* Drag Handle */}
            <div 
              draggable
              onDragStart={() => onMainTaskDragStart(task.id)}
              className="flex-shrink-0 cursor-move opacity-30 group-hover:opacity-70 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={() => toggleTaskComplete(task.id)}
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                task.completed 
                  ? "bg-green-500 border-green-500 text-white" 
                  : "border-gray-300 dark:border-gray-600 hover:border-green-500"
              )}
            >
              {task.completed && <Check className="h-4 w-4" />}
            </button>

            <div 
              className="flex-1 cursor-pointer min-w-0"
              onClick={() => !task.completed && selectTask(task)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-lg font-medium truncate",
                    task.completed 
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {task.pomodorosCompleted} / {task.estimatedPomodoros || '?'} pomodoros
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Duration: {task.duration || timerSettings.focusTime}m
                      {task.duration && task.duration !== timerSettings.focusTime && (
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          (Custom)
                        </span>
                      )}
                    </div>
                    {task.category && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {task.category}
                      </span>
                    )}
                    {task.priority && task.priority !== 'medium' && (
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                    {selectedTask?.id === task.id && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                        SELECTED
                      </span>
                    )}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskFavorite(task.id);
                }}
                className={cn(
                  "text-yellow-500 hover:text-yellow-600",
                  task.isFavorite && "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                )}
                title={task.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={cn("h-4 w-4", task.isFavorite && "fill-current")} />
              </Button>

              {/* Visibility Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskVisibility(task.id);
                }}
                className="text-gray-500 hover:text-gray-600"
                title={task.isVisible === false ? "Show task" : "Hide task"}
              >
                <Eye className="h-4 w-4" />
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  shareTask(task);
                }}
                className="text-blue-500 hover:text-blue-600"
                title="Share task"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {/* Duplicate Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateTask(task);
                }}
                className="text-green-500 hover:text-green-600"
                title="Duplicate task"
              >
                <GitBranch className="h-4 w-4" />
              </Button>

              {/* Edit Button */}
              {!task.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTaskModal(task);
                  }}
                  className="text-gray-500 hover:text-gray-600"
                  title="Edit task"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No tasks yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Create your first task to get started with focused work sessions.
          Break your work into manageable chunks and track your progress.
        </p>
        <Button
          onClick={() => openTaskModal()}
          className="px-6 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create your first task
        </Button>
      </div>
    );
  } else {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No tasks match your filter
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Try adjusting your filter criteria or create a new task.
        </p>
        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setTaskFilter('all')}
          >
            Clear Filter
          </Button>
          <Button onClick={() => openTaskModal()}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
    );
  }
};

export function TimerTaskComponent() {
  // Timer state
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Task management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingModalTask, setEditingModalTask] = useState<Task | null>(null);

  // List management
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedList, setSelectedList] = useState<TaskList | null>(null);
  const [currentListSession, setCurrentListSession] = useState<ListSession | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showTaskSelectionModal, setShowTaskSelectionModal] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  const [draggedMainTaskId, setDraggedMainTaskId] = useState<string | null>(null);

  // List modal data
  const [listModalData, setListModalData] = useState({
    name: '',
    description: '',
    selectedTaskIds: [] as string[]
  });

  // Sessions and Analytics
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [listSessions, setListSessions] = useState<ListSession[]>([]);

  // Task filter and sort state
  const [taskFilter, setTaskFilter] = useState('all');
  const [taskSort, setTaskSort] = useState('newest');

  // New functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  // Task editing modal state
  const [modalTaskData, setModalTaskData] = useState({
    title: '',
    estimatedPomodoros: 1,
    duration: 25, // Default 25 minutes
    category: '',
    notes: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    tags: [] as string[],
    newTag: ''
  });

  // Settings state
  const [timerSettings, setTimerSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4
  });

  // Additional task editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('Loading data from localStorage...');
    try {
      const savedTasks = localStorage.getItem('timer-tasks');
      const savedSessions = localStorage.getItem('timer-sessions');
      const savedSettings = localStorage.getItem('timer-settings');
      const savedLists = localStorage.getItem('timer-lists');
      const savedListSessions = localStorage.getItem('timer-list-sessions');

      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        console.log('Loading tasks from localStorage:', parsedTasks.length, 'tasks');
        setTasks(parsedTasks.map((task: Partial<Task>) => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        } as Task)));
      } else {
        console.log('No saved tasks found');
      }

      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        console.log('Loading sessions from localStorage:', parsedSessions.length, 'sessions');
        setSessions(parsedSessions.map((session: Partial<TimerSession>) => ({
          ...session,
          startTime: session.startTime ? new Date(session.startTime) : new Date(),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        } as TimerSession)));
      } else {
        console.log('No saved sessions found');
      }

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loading settings from localStorage:', parsedSettings);
        setTimerSettings(parsedSettings);
        setInitialTime(parsedSettings.focusTime * 60);
        setTime(parsedSettings.focusTime * 60);
      } else {
        console.log('No saved settings found, using defaults');
      }

      if (savedLists) {
        const parsedLists = JSON.parse(savedLists);
        console.log('Loading lists from localStorage:', parsedLists.length, 'lists');
        setTaskLists(parsedLists.map((list: Partial<TaskList>) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          completedAt: list.completedAt ? new Date(list.completedAt) : undefined
        })));
      } else {
        console.log('No saved lists found');
      }

      if (savedListSessions) {
        const parsedListSessions = JSON.parse(savedListSessions);
        console.log('Loading list sessions from localStorage:', parsedListSessions.length, 'list sessions');
        setListSessions(parsedListSessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        })));
      } else {
        console.log('No saved list sessions found');
      }
      
      console.log('localStorage data loading complete');
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timer-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('timer-settings', JSON.stringify(timerSettings));
  }, [timerSettings]);

  useEffect(() => {
    localStorage.setItem('timer-list-sessions', JSON.stringify(listSessions));
  }, [listSessions]);

  useEffect(() => {
    if (selectedTask) {
      localStorage.setItem('pomodoro-selected-task', JSON.stringify(selectedTask));
    } else {
      localStorage.removeItem('pomodoro-selected-task');
    }
  }, [selectedTask]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      // Timer completed
      setIsRunning(false);
      
      if (selectedTask) {
        // Update task progress
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id 
            ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
            : task
        );
        setTasks(updatedTasks);
        
        // Force immediate localStorage save for tasks
        try {
          localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
          console.log('Task progress saved after pomodoro completion');
        } catch (error) {
          console.error('Error saving task progress:', error);
        }

        // Record session
        const session: TimerSession = {
          id: Date.now().toString(),
          taskId: selectedTask.id,
          listId: selectedList?.id || null,
          duration: initialTime,
          completed: true,
          startTime: new Date(Date.now() - initialTime * 1000),
          endTime: new Date()
        };
        setSessions(prev => [...prev, session]);

        // If in list mode, automatically move to next task
        if (currentListSession && selectedList) {
          completeCurrentTaskInList();
        }
      }
      
      // Reset timer
      setTime(initialTime);
    }

    return () => clearInterval(interval);
  }, [isRunning, time, selectedTask, initialTime, currentListSession, selectedList]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingModalTask(task);
      setModalTaskData({
        title: task.title,
        estimatedPomodoros: task.estimatedPomodoros || 1,
        duration: task.duration || 25,
        category: task.category || '',
        notes: task.notes || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        tags: task.tags || [],
        newTag: ''
      });
    } else {
      setEditingModalTask(null);
      setModalTaskData({
        title: '',
        estimatedPomodoros: 1,
        duration: 25,
        category: '',
        notes: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
        newTag: ''
      });
    }
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingModalTask(null);
  };

  const saveTaskFromModal = () => {
    if (!modalTaskData.title.trim()) return;

    const taskData = {
      title: modalTaskData.title.trim(),
      estimatedPomodoros: modalTaskData.estimatedPomodoros,
      duration: modalTaskData.duration,
      category: modalTaskData.category,
      notes: modalTaskData.notes,
      priority: modalTaskData.priority,
      dueDate: modalTaskData.dueDate ? new Date(modalTaskData.dueDate) : undefined,
      tags: modalTaskData.tags
    };

    let updatedTasks: Task[];

    if (editingModalTask) {
      // Update existing task
      updatedTasks = tasks.map(task =>
        task.id === editingModalTask.id
          ? { ...task, ...taskData }
          : task
      );
      
      // Update selected task if it's being edited
      if (selectedTask?.id === editingModalTask.id) {
        setSelectedTask(prev => prev ? { ...prev, ...taskData } : null);
      }
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date(),
        pomodorosCompleted: 0,
        ...taskData
      };
      updatedTasks = [...tasks, newTask];
      console.log('Creating new task:', newTask);
    }

    // Update state
    setTasks(updatedTasks);
    
    // Force immediate localStorage save
    try {
      localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
      console.log('Tasks saved to localStorage:', updatedTasks.length, 'tasks');
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }

    closeTaskModal();
  };

  const addTag = () => {
    if (modalTaskData.newTag.trim() && !modalTaskData.tags.includes(modalTaskData.newTag.trim())) {
      setModalTaskData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setModalTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const createTask = () => {
    openTaskModal();
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    // Force immediate localStorage save
    try {
      localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
      console.log('Task deleted and saved to localStorage. Remaining tasks:', updatedTasks.length);
    } catch (error) {
      console.error('Error saving tasks after deletion:', error);
    }
    
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    // Force immediate localStorage save
    try {
      localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
      console.log('Task completion status saved to localStorage');
    } catch (error) {
      console.error('Error saving task completion status:', error);
    }
  };

  const selectTask = (task: Task) => {
    setSelectedTask(task);
    
    // Use task's custom duration if available, otherwise use default focus time
    const taskDuration = task.duration || timerSettings.focusTime;
    const seconds = taskDuration * 60;
    setInitialTime(seconds);
    setTime(seconds);
    
    setActiveTab('timer');
  };

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
  };

  const saveTaskEdit = () => {
    if (!editTaskTitle.trim() || !editingTask) return;
    
    setTasks(prev => prev.map(task =>
      task.id === editingTask.id ? { ...task, title: editTaskTitle.trim() } : task
    ));
    
    setEditingTask(null);
    setEditTaskTitle('');
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditTaskTitle('');
  };

  const updateTimerLength = (minutes: number) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    if (!isRunning) {
      setTime(seconds);
    }
  };

  // List Management Functions
  const createNewList = () => {
    setListModalData({ name: '', description: '', selectedTaskIds: [] });
    setEditingList(null);
    setShowListModal(true);
  };

  const editList = (list: TaskList) => {
    setListModalData({
      name: list.name,
      description: list.description || '',
      selectedTaskIds: [...list.taskIds]
    });
    setEditingList(list);
    setShowListModal(true);
  };

  const saveList = () => {
    if (!listModalData.name.trim()) return;

    const totalTime = listModalData.selectedTaskIds.reduce((total, taskId) => {
      const task = tasks.find(t => t.id === taskId);
      return total + ((task?.estimatedPomodoros || 1) * timerSettings.focusTime);
    }, 0);

    let updatedLists: TaskList[];

    if (editingList) {
      // Update existing list
      updatedLists = taskLists.map(list => 
        list.id === editingList.id 
          ? {
              ...list,
              name: listModalData.name,
              description: listModalData.description,
              taskIds: listModalData.selectedTaskIds,
              totalEstimatedTime: totalTime
            }
          : list
      );
      console.log('Updating existing list:', editingList.id);
    } else {
      // Create new list
      const newList: TaskList = {
        id: Date.now().toString(),
        name: listModalData.name,
        description: listModalData.description,
        taskIds: listModalData.selectedTaskIds,
        createdAt: new Date(),
        isActive: false,
        totalEstimatedTime: totalTime
      };
      updatedLists = [...taskLists, newList];
      console.log('Creating new list:', newList);
    }

    // Update state
    setTaskLists(updatedLists);
    
    // Force immediate localStorage save
    try {
      localStorage.setItem('timer-lists', JSON.stringify(updatedLists));
      console.log('Lists saved to localStorage:', updatedLists.length, 'lists');
    } catch (error) {
      console.error('Error saving lists to localStorage:', error);
    }

    setShowListModal(false);
    setEditingList(null);
  };

  const deleteList = (listId: string) => {
    const updatedLists = taskLists.filter(list => list.id !== listId);
    setTaskLists(updatedLists);
    
    // Force immediate localStorage save
    try {
      localStorage.setItem('timer-lists', JSON.stringify(updatedLists));
      console.log('List deleted and saved to localStorage. Remaining lists:', updatedLists.length);
    } catch (error) {
      console.error('Error saving lists after deletion:', error);
    }
    
    if (selectedList?.id === listId) {
      setSelectedList(null);
      setCurrentListSession(null);
    }
  };

  const loadListIntoTimer = (list: TaskList) => {
    if (list.taskIds.length === 0) return;

    const firstTask = tasks.find(t => t.id === list.taskIds[0]);
    if (!firstTask) return;

    // Create new list session
    const session: ListSession = {
      id: Date.now().toString(),
      listId: list.id,
      currentTaskIndex: 0,
      startTime: new Date(),
      completedTasks: [],
      isCompleted: false
    };

    setCurrentListSession(session);
    setSelectedList(list);
    setSelectedTask(firstTask);
    
    // Use first task's custom duration
    const taskDuration = firstTask.duration || timerSettings.focusTime;
    const seconds = taskDuration * 60;
    setInitialTime(seconds);
    setTime(seconds);
    
    setActiveTab('timer');
  };

  const completeCurrentTaskInList = () => {
    if (!currentListSession || !selectedList) return;

    const currentTask = tasks.find(t => t.id === selectedList.taskIds[currentListSession.currentTaskIndex]);
    if (!currentTask) return;

    // Mark current task as completed
    toggleTaskComplete(currentTask.id);

    // Update session
    const updatedSession = {
      ...currentListSession,
      completedTasks: [...currentListSession.completedTasks, currentTask.id]
    };

    // Move to next task or complete the list
    const nextIndex = currentListSession.currentTaskIndex + 1;
    if (nextIndex < selectedList.taskIds.length) {
      const nextTask = tasks.find(t => t.id === selectedList.taskIds[nextIndex]);
      if (nextTask) {
        const updatedSession = {
          ...currentListSession,
          currentTaskIndex: nextIndex
        };
        setCurrentListSession(updatedSession);
        setSelectedTask(nextTask);
        
        // Use next task's custom duration
        const taskDuration = nextTask.duration || timerSettings.focusTime;
        const seconds = taskDuration * 60;
        setInitialTime(seconds);
        setTime(seconds);
        setIsRunning(false);
      }
    } else {
      // Complete the entire list
      updatedSession.isCompleted = true;
      updatedSession.endTime = new Date();
      setCurrentListSession(updatedSession);
      setListSessions(prev => [...prev, updatedSession]);
      
      // Mark list as completed
      setTaskLists(prev => prev.map(list => 
        list.id === selectedList.id 
          ? { ...list, isActive: false, completedAt: new Date() }
          : list
      ));

      setSelectedList(null);
      setSelectedTask(null);
      setCurrentListSession(null);
    }
  };

  const skipToNextTaskInList = () => {
    if (!currentListSession || !selectedList) return;

    const nextIndex = currentListSession.currentTaskIndex + 1;
    if (nextIndex < selectedList.taskIds.length) {
      const nextTask = tasks.find(t => t.id === selectedList.taskIds[nextIndex]);
      if (nextTask) {
        const updatedSession = {
          ...currentListSession,
          currentTaskIndex: nextIndex
        };
        setCurrentListSession(updatedSession);
        setSelectedTask(nextTask);
        resetTimer();
      }
    }
  };

  // Drag and Drop Functions
  const handleDragStart = (index: number) => {
    setDraggedTaskIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedTaskIndex === null || draggedTaskIndex === dropIndex) {
      setDraggedTaskIndex(null);
      return;
    }

    if (editingList) {
      // Reorder tasks in the list being edited
      const newTaskIds = [...listModalData.selectedTaskIds];
      const draggedTaskId = newTaskIds[draggedTaskIndex];
      
      // Remove from old position
      newTaskIds.splice(draggedTaskIndex, 1);
      
      // Insert at new position
      newTaskIds.splice(dropIndex, 0, draggedTaskId);
      
      setListModalData(prev => ({ ...prev, selectedTaskIds: newTaskIds }));
    }

    setDraggedTaskIndex(null);
  };

  // Main Task List Drag and Drop Functions
  const handleMainTaskDragStart = (taskId: string) => {
    setDraggedMainTaskId(taskId);
  };

  const handleMainTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMainTaskDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 Drop event:', { draggedMainTaskId, targetTaskId });
    
    if (!draggedMainTaskId || draggedMainTaskId === targetTaskId) {
      setDraggedMainTaskId(null);
      return;
    }

    try {
      const draggedIndex = tasks.findIndex(task => task.id === draggedMainTaskId);
      const targetIndex = tasks.findIndex(task => task.id === targetTaskId);

      if (draggedIndex === -1 || targetIndex === -1) {
        console.error('❌ Could not find task indices:', { draggedIndex, targetIndex });
        setDraggedMainTaskId(null);
        return;
      }

      console.log('🔄 Reordering tasks:', { 
        draggedIndex, 
        targetIndex,
        draggedTask: tasks[draggedIndex].title,
        targetTask: tasks[targetIndex].title 
      });

      // Create new tasks array with reordered items
      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, movedTask);
      
      // Update state and save to localStorage immediately
      setTasks(newTasks);
      
      try {
        localStorage.setItem('timer-tasks', JSON.stringify(newTasks));
        console.log('✅ Task order saved successfully');
      } catch (error) {
        console.error('❌ Failed to save reordered tasks:', error);
      }

    } catch (error) {
      console.error('❌ Error in handleMainTaskDrop:', error);
    } finally {
      setDraggedMainTaskId(null);
    }
  };

  const handleTaskSelectionToggle = (taskId: string) => {
    setListModalData(prev => ({
      ...prev,
      selectedTaskIds: prev.selectedTaskIds.includes(taskId)
        ? prev.selectedTaskIds.filter(id => id !== taskId)
        : [...prev.selectedTaskIds, taskId]
    }));
  };

  // Statistics
  const activeTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalPomodoros = tasks.reduce((sum, task) => sum + task.pomodorosCompleted, 0);
  const todaysSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length;

  const progress = initialTime > 0 ? ((initialTime - time) / initialTime) * 100 : 0;

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  // New utility functions
  const toggleTaskFavorite = (taskId: string) => {
    console.log('🌟 Toggling favorite for task:', taskId);
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, isFavorite: !task.isFavorite }
          : task
      );
      setTasks(updatedTasks);
      
      // Immediate save to localStorage
      localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
      console.log('✅ Task favorite status updated and saved');
    } catch (error) {
      console.error('❌ Error toggling task favorite:', error);
    }
  };

  const toggleTaskVisibility = (taskId: string) => {
    console.log('👁️ Toggling visibility for task:', taskId);
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, isVisible: task.isVisible === false ? true : false }
          : task
      );
      setTasks(updatedTasks);
      
      // Immediate save to localStorage
      localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
      console.log('✅ Task visibility updated and saved');
    } catch (error) {
      console.error('❌ Error toggling task visibility:', error);
    }
  };

  const shareTask = (task: Task) => {
    console.log('📤 Sharing task:', task.title);
    const shareText = `Task: ${task.title}${task.notes ? `\nNotes: ${task.notes}` : ''}${task.category ? `\nCategory: ${task.category}` : ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Pomodoro Task',
        text: shareText,
      }).catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        console.log('✅ Task details copied to clipboard');
        // You could show a toast notification here
      }).catch(error => {
        console.error('❌ Error copying to clipboard:', error);
      });
    }
  };

  const duplicateTask = (task: Task) => {
    console.log('🔄 Duplicating task:', task.title);
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        title: `${task.title} (Copy)`,
        completed: false,
        pomodorosCompleted: 0,
        createdAt: new Date(),
        isFavorite: false, // Reset favorite status for duplicate
        isVisible: true // Ensure duplicate is visible
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      // Immediate save to localStorage
      localStorage.setItem('timer-tasks', JSON.stringify(updatedTasks));
      console.log('✅ Task duplicated and saved');
    } catch (error) {
      console.error('❌ Error duplicating task:', error);
    }
  };

  const clearCompletedTasks = () => {
    console.log('🗑️ Clearing completed tasks');
    try {
      const activeTasks = tasks.filter(task => !task.completed);
      setTasks(activeTasks);
      
      // Immediate save to localStorage
      localStorage.setItem('timer-tasks', JSON.stringify(activeTasks));
      console.log('✅ Completed tasks cleared and saved');
    } catch (error) {
      console.error('❌ Error clearing completed tasks:', error);
    }
  };

  const exportTasksData = () => {
    console.log('📊 Exporting tasks data');
    try {
      const exportData = {
        tasks,
        sessions,
        taskLists,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Tasks data exported');
    } catch (error) {
      console.error('❌ Error exporting tasks data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'timer', label: 'Timer', icon: Clock },
              { id: 'tasks', label: 'Tasks', icon: Target },
              { id: 'lists', label: 'Lists', icon: List },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="max-w-4xl mx-auto">
            {/* Timer Display */}
            <div className="text-center mb-12">
              <div className="text-9xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                {formatTime(time)}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Timer Status */}
              <div className="mb-8">
                {selectedTask ? (
                  <div>
                    <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      FOCUSING ON
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {selectedTask.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Duration: {selectedTask.duration || timerSettings.focusTime} minutes
                      {selectedTask.duration && selectedTask.duration !== timerSettings.focusTime && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                      NO TASK SELECTED
                    </div>
                    <div className="text-lg text-gray-500 dark:text-gray-500">
                      CHOOSE A TASK TO FOCUS ON
                    </div>
                  </div>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-4 mb-12">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    disabled={!selectedTask}
                    className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {time === initialTime ? 'FOCUS' : 'RESUME'}
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    className="px-8 py-3 text-lg font-semibold"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    PAUSE
                  </Button>
                )}
                
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="px-6 py-3 text-lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  RESET
                </Button>

                {/* Next Task Button - only show when in list mode */}
                {currentListSession && selectedList && (
                  <Button
                    onClick={skipToNextTaskInList}
                    variant="outline"
                    className="px-6 py-3 text-lg"
                    disabled={currentListSession.currentTaskIndex >= selectedList.taskIds.length - 1}
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    NEXT TASK
                  </Button>
                )}
              </div>

              {/* List Progress - only show when in list mode */}
              {currentListSession && selectedList && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      List Progress: {selectedList.name}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currentListSession.currentTaskIndex + 1} of {selectedList.taskIds.length} tasks
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedList.taskIds.map((taskId, index) => {
                      const task = tasks.find(t => t.id === taskId);
                      if (!task) return null;
                      
                      const isCompleted = currentListSession.completedTasks.includes(taskId);
                      const isCurrent = index === currentListSession.currentTaskIndex;
                      
                      return (
                        <div 
                          key={taskId}
                          className={cn(
                            "flex items-center p-3 rounded-lg border",
                            isCompleted 
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                              : isCurrent
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                              : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                          )}
                        >
                          <div className="mr-3">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : isCurrent ? (
                              <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={cn(
                              "font-medium",
                              isCompleted 
                                ? "text-green-900 dark:text-green-100 line-through"
                                : isCurrent
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-gray-900 dark:text-white"
                            )}>
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {task.pomodorosCompleted} / {task.estimatedPomodoros || '?'} pomodoros
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              Duration: {task.duration || timerSettings.focusTime}m
                              {task.duration && task.duration !== timerSettings.focusTime && (
                                <span className="ml-1 text-blue-600 dark:text-blue-400">
                                  (Custom)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Task Selection */}
            {tasks.filter(task => !task.completed).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select a task to focus on:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks.filter(task => !task.completed).slice(0, 6).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => selectTask(task)}
                      className={cn(
                        "text-left p-4 rounded-lg transition-all border",
                        selectedTask?.id === task.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.pomodorosCompleted} / {task.estimatedPomodoros || '?'} pomodoros
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Duration: {task.duration || timerSettings.focusTime}m
                            {task.duration && task.duration !== timerSettings.focusTime && (
                              <span className="ml-1 text-blue-600 dark:text-blue-400">
                                (Custom)
                              </span>
                            )}
                          </div>
                          {task.priority && task.priority !== 'medium' && (
                            <span className={cn(
                              "inline-block px-2 py-1 rounded-full text-xs font-medium mt-2",
                              getPriorityColor(task.priority)
                            )}>
                              {task.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {selectedTask?.id === task.id && (
                          <div className="ml-2 w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setActiveTab('tasks')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  View All Tasks
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTasks} active • {completedTasks} completed
                </div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {totalPomodoros} total pomodoros
                </div>
              </div>
            </div>

            {/* Task Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Task Management
                </h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setShowDetailedAnalytics(!showDetailedAnalytics)}
                    variant="outline"
                    size="sm"
                    title="Toggle Analytics"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    variant="outline"
                    size="sm"
                    title="Advanced Filters"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={exportTasksData}
                    variant="outline"
                    size="sm"
                    title="Export Data"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => openTaskModal()}
                    className="px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks by title, notes, category, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filters and Sorting */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter Tasks
                  </label>
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Tasks</option>
                    <option value="active">Active Tasks</option>
                    <option value="completed">Completed Tasks</option>
                    <option value="high-priority">High Priority</option>
                    <option value="today">Due Today</option>
                    <option value="work">Work Category</option>
                    <option value="personal">Personal Category</option>
                    <option value="favorites">Favorites</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={taskSort}
                    onChange={(e) => setTaskSort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority (High to Low)</option>
                    <option value="completion">By Completion %</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={showOnlyFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className="text-xs"
                >
                  <Star className={cn("h-3 w-3 mr-1", showOnlyFavorites && "fill-current")} />
                  Favorites Only
                </Button>
                {tasks.filter(t => t.completed).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompletedTasks}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear Completed
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Advanced Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Priority Filter */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                      <select className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Any Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    {/* Date Range */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                      <select className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Any Date</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                        <option value="no-date">No Due Date</option>
                      </select>
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Category</label>
                      <select className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Any Category</option>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              {showDetailedAnalytics && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Analytics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">{tasks.filter(t => t.isFavorite).length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Favorites</div>
                    </div>
                    <div>
                      <div className="text-red-600 dark:text-red-400 font-semibold">{tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length}</div>
                      <div className="text-gray-600 dark:text-gray-400">High Priority</div>
                    </div>
                    <div>
                      <div className="text-green-600 dark:text-green-400 font-semibold">{Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%</div>
                      <div className="text-gray-600 dark:text-gray-400">Completion</div>
                    </div>
                    <div>
                      <div className="text-purple-600 dark:text-purple-400 font-semibold">{tasks.reduce((sum, t) => sum + t.pomodorosCompleted, 0)}</div>
                      <div className="text-gray-600 dark:text-gray-400">Pomodoros</div>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Use search, filters and sorting to organize your tasks. Create new tasks with advanced options like priority, estimated pomodoros, due dates, and more.
              </p>
            </div>

            {/* Task list */}
            <TaskList 
              tasks={tasks}
              taskFilter={taskFilter}
              taskSort={taskSort}
              setTaskFilter={setTaskFilter}
              selectedTask={selectedTask}
              toggleTaskComplete={toggleTaskComplete}
              selectTask={selectTask}
              openTaskModal={openTaskModal}
              deleteTask={deleteTask}
              getPriorityColor={getPriorityColor}
              timerSettings={timerSettings}
              draggedMainTaskId={draggedMainTaskId}
              onMainTaskDragStart={handleMainTaskDragStart}
              onMainTaskDragOver={handleMainTaskDragOver}
              onMainTaskDrop={handleMainTaskDrop}
              toggleTaskFavorite={toggleTaskFavorite}
              toggleTaskVisibility={toggleTaskVisibility}
              shareTask={shareTask}
              duplicateTask={duplicateTask}
              searchQuery={searchQuery}
              showOnlyFavorites={showOnlyFavorites}
            />
          </div>
        )}

        {/* Lists Tab */}
        {activeTab === 'lists' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Task Lists</h2>
              <Button onClick={createNewList} className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </div>

            {/* Lists Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{taskLists.length}</div>
                <div className="text-gray-600 dark:text-gray-400">Total Lists</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {taskLists.filter(list => list.completedAt).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Completed Lists</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {taskLists.filter(list => list.isActive).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Active Lists</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {Math.round(taskLists.reduce((total, list) => total + list.totalEstimatedTime, 0) / 60)}h
                </div>
                <div className="text-gray-600 dark:text-gray-400">Total Estimated Time</div>
              </div>
            </div>

            {/* Lists Grid */}
            {taskLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taskLists.map((list) => (
                  <div key={list.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    {/* List Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {list.name}
                        </h3>
                        {list.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {list.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => editList(list)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteList(list.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* List Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tasks:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {list.taskIds.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Estimated Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.round(list.totalEstimatedTime / 60 * 10) / 10}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          list.completedAt 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : list.isActive
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        )}>
                          {list.completedAt ? 'Completed' : list.isActive ? 'Active' : 'Ready'}
                        </span>
                      </div>
                    </div>

                    {/* Task Preview */}
                    {list.taskIds.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tasks:</div>
                        <div className="space-y-1">
                          {list.taskIds.slice(0, 3).map((taskId, index) => {
                            const task = tasks.find(t => t.id === taskId);
                            if (!task) return null;
                            return (
                              <div key={taskId} className="flex items-center text-sm">
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                <span className="text-gray-900 dark:text-white truncate">
                                  {task.title}
                                </span>
                              </div>
                            );
                          })}
                          {list.taskIds.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{list.taskIds.length - 3} more tasks
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => loadListIntoTimer(list)}
                        disabled={list.taskIds.length === 0}
                        className="flex-1"
                        variant={list.isActive ? "default" : "outline"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {list.isActive ? 'Continue' : 'Start List'}
                      </Button>
                    </div>

                    {/* Creation Date */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Created {new Date(list.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No lists yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first task list to organize your work and focus sessions.
                </p>
                <Button onClick={createNewList}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First List
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Progress & Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{totalPomodoros}</div>
                <div className="text-gray-600 dark:text-gray-400">Total Pomodoros</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todaysSessions}</div>
                <div className="text-gray-600 dark:text-gray-400">Today's Sessions</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completedTasks}</div>
                <div className="text-gray-600 dark:text-gray-400">Completed Tasks</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activeTasks}</div>
                <div className="text-gray-600 dark:text-gray-400">Active Tasks</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(-10).reverse().map((session) => {
                    const task = tasks.find(t => t.id === session.taskId);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {task ? task.title : 'Unknown Task'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.floor(session.duration / 60)} minutes
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No sessions completed yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h2>
            
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Timer Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Focus Time (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={timerSettings.focusTime}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setTimerSettings(prev => ({ ...prev, focusTime: value }));
                        updateTimerLength(value);
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Break (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={timerSettings.shortBreak}
                      onChange={(e) => setTimerSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Long Break (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={timerSettings.longBreak}
                      onChange={(e) => setTimerSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Editing Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingModalTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeTaskModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <Input
                  placeholder="What would you like to work on?"
                  value={modalTaskData.title}
                  onChange={(e) => setModalTaskData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-base"
                />
              </div>

              {/* Estimated Pomodoros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Pomodoros
                </label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={modalTaskData.estimatedPomodoros}
                  onChange={(e) => setModalTaskData(prev => ({ ...prev, estimatedPomodoros: parseInt(e.target.value) || 1 }))}
                />
              </div>

              {/* Task Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Duration (minutes)
                </label>
                <div className="space-y-3">
                  {/* Preset Duration Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[5, 15, 25, 30, 45, 60].map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={modalTaskData.duration === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => setModalTaskData(prev => ({ ...prev, duration: preset }))}
                        className={cn(
                          "text-sm",
                          modalTaskData.duration === preset 
                            ? "bg-blue-600 text-white" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        {preset}m
                      </Button>
                    ))}
                  </div>
                  {/* Custom Duration Input */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Custom:</span>
                    <Input
                      type="number"
                      min="1"
                      max="240"
                      value={modalTaskData.duration}
                      onChange={(e) => setModalTaskData(prev => ({ ...prev, duration: parseInt(e.target.value) || 25 }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={modalTaskData.priority}
                  onChange={(e) => setModalTaskData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Input
                  placeholder="Work, Personal, Study, etc."
                  value={modalTaskData.category}
                  onChange={(e) => setModalTaskData(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={modalTaskData.dueDate}
                  onChange={(e) => setModalTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={modalTaskData.newTag}
                    onChange={(e) => setModalTaskData(prev => ({ ...prev, newTag: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {modalTaskData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes about this task..."
                  value={modalTaskData.notes}
                  onChange={(e) => setModalTaskData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeTaskModal}>
                Cancel
              </Button>
              <Button 
                onClick={saveTaskFromModal}
                disabled={!modalTaskData.title.trim()}
              >
                {editingModalTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List Creation/Editing Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingList ? 'Edit List' : 'Create New List'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowListModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - List Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    List Name *
                  </label>
                  <Input
                    placeholder="My focus session list"
                    value={listModalData.name}
                    onChange={(e) => setListModalData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this list is for..."
                    value={listModalData.description}
                    onChange={(e) => setListModalData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* List Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Execution Order ({listModalData.selectedTaskIds.length} tasks)
                  </label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 max-h-80 overflow-y-auto">
                    {listModalData.selectedTaskIds.length > 0 ? (
                      <div className="space-y-2">
                        {listModalData.selectedTaskIds.map((taskId, index) => {
                          const task = tasks.find(t => t.id === taskId);
                          if (!task) return null;
                          
                          return (
                            <div
                              key={taskId}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              className={cn(
                                "flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border cursor-move hover:shadow-md transition-shadow",
                                draggedTaskIndex === index ? "opacity-50" : "",
                                "border-gray-200 dark:border-gray-700"
                              )}
                            >
                              <GripVertical className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                  {index + 1}. {task.title}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {task.estimatedPomodoros || 1} pomodoro{(task.estimatedPomodoros || 1) > 1 ? 's' : ''} • {task.category || 'Uncategorized'}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTaskSelectionToggle(taskId)}
                                className="ml-2 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <List className="h-8 w-8 mx-auto mb-2" />
                        <p>No tasks selected yet</p>
                        <p className="text-sm">Select tasks from the right to build your list</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Time */}
                {listModalData.selectedTaskIds.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Estimated Total Time
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(listModalData.selectedTaskIds.reduce((total, taskId) => {
                        const task = tasks.find(t => t.id === taskId);
                        return total + ((task?.estimatedPomodoros || 1) * timerSettings.focusTime);
                      }, 0) / 60 * 10) / 10} hours
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {listModalData.selectedTaskIds.reduce((total, taskId) => {
                        const task = tasks.find(t => t.id === taskId);
                        return total + (task?.estimatedPomodoros || 1);
                      }, 0)} total pomodoros
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Task Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Tasks
                  </label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const allTaskIds = tasks.filter(t => !t.completed).map(t => t.id);
                      setListModalData(prev => ({ ...prev, selectedTaskIds: allTaskIds }));
                    }}
                  >
                    Select All
                  </Button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                  {tasks.filter(t => !t.completed).length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tasks.filter(t => !t.completed).map((task) => (
                        <div 
                          key={task.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={listModalData.selectedTaskIds.includes(task.id)}
                              onChange={() => handleTaskSelectionToggle(task.id)}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {task.estimatedPomodoros || 1} pomodoro{(task.estimatedPomodoros || 1) > 1 ? 's' : ''} • {task.category || 'Uncategorized'}
                                {task.priority && task.priority !== 'medium' && (
                                  <span className={cn(
                                    "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                                    getPriorityColor(task.priority)
                                  )}>
                                    {task.priority.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {task.notes && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {task.notes}
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Target className="h-8 w-8 mx-auto mb-2" />
                      <p>No active tasks available</p>
                      <p className="text-sm">Create some tasks first to build a list</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowListModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveList}
                disabled={!listModalData.name.trim() || listModalData.selectedTaskIds.length === 0}
              >
                {editingList ? 'Update List' : 'Create List'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 