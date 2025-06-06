'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, Folder as FolderIcon, Bookmark as BookmarkIcon, ArrowLeft, FolderOpen, Crown, Users, User, Settings, Search, SortAsc, SortDesc, Filter, ChevronLeft, ChevronRight, GripVertical, Edit3, X, Briefcase, Target, Star, Building, Lightbulb, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { type Folder } from '../../types/supabase';
import { type BookmarkWithRelations } from '../../lib/services/bookmarks';
import { FolderHierarchyManager, type FolderHierarchyAssignment, type HierarchyLevel } from './folder-hierarchy-manager';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '../ui/dropdown-menu';

interface FolderOrgChartViewProps {
  folders: Folder[];
  bookmarks: BookmarkWithRelations[];
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddBookmarkToFolder: (folderId: string) => void;
  onDropBookmarkToFolder: (folderId: string, bookmark: BookmarkWithRelations) => void;
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onOpenDetail: (bookmark: BookmarkWithRelations) => void;
  currentFolderId?: string | null;
  onFolderNavigate: (folderId: string | null) => void;
  selectedFolder?: Folder | null;
}

interface HierarchySection {
  id: string;
  title: string;
  iconName: string;
  colorName: string;
  order: number;
}

export function FolderOrgChartView({
  folders,
  bookmarks,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onAddBookmarkToFolder,
  onDropBookmarkToFolder,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
  currentFolderId,
  onFolderNavigate,
  selectedFolder,
}: FolderOrgChartViewProps) {
  
  // Hierarchy management state
  const [hierarchyAssignments, setHierarchyAssignments] = useState<FolderHierarchyAssignment[]>([]);
  const [isHierarchyManagerOpen, setIsHierarchyManagerOpen] = useState(false);
  const [bookmarkPages, setBookmarkPages] = useState<Record<string, number>>({});
  
  const BOOKMARKS_PER_PAGE = 5;
  
  // Available icons for hierarchy sections
  const availableIcons = [
    { name: 'Crown', icon: Crown },
    { name: 'Users', icon: Users },
    { name: 'User', icon: User },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Target', icon: Target },
    { name: 'Star', icon: Star },
    { name: 'Building', icon: Building },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Zap', icon: Zap },
  ];

  // Available colors for hierarchy sections (subtle colors)
  const availableColors = [
    { name: 'Purple-Blue', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: '#8b5cf6' },
    { name: 'Emerald-Teal', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: '#10b981' },
    { name: 'Orange-Red', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: '#f97316' },
    { name: 'Blue-Indigo', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: '#3b82f6' },
    { name: 'Pink-Rose', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', accent: '#ec4899' },
    { name: 'Amber-Yellow', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: '#f59e0b' },
    { name: 'Violet-Purple', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', accent: '#8b5cf6' },
    { name: 'Cyan-Sky', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', accent: '#06b6d4' },
  ];

  // Default hierarchy sections
  const defaultHierarchySections: HierarchySection[] = [
    { id: 'director', title: 'DIRECTOR', iconName: 'Crown', colorName: 'Purple-Blue', order: 0 },
    { id: 'teams', title: 'TEAMS', iconName: 'Users', colorName: 'Emerald-Teal', order: 1 },
    { id: 'collaborators', title: 'COLLABORATORS', iconName: 'User', colorName: 'Orange-Red', order: 2 },
  ];

  const [hierarchySections, setHierarchySections] = useState<HierarchySection[]>(defaultHierarchySections);
  const [isEditingLane, setIsEditingLane] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionIcon, setNewSectionIcon] = useState('Crown');
  const [newSectionColor, setNewSectionColor] = useState('Purple-Blue');
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bookmarks' | 'recent' | 'alphabetical'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [contentFilter, setContentFilter] = useState<'all' | 'folders' | 'bookmarks'>('all');
  const [hierarchyFilter, setHierarchyFilter] = useState<'all' | 'director' | 'teams' | 'collaborators' | 'unassigned'>('all');

  // Load hierarchy assignments from localStorage
  useEffect(() => {
    const savedAssignments = localStorage.getItem('folder-hierarchy-assignments');
    if (savedAssignments) {
      setHierarchyAssignments(JSON.parse(savedAssignments));
    }
  }, []);

  // Save hierarchy assignments to localStorage
  const handleHierarchyAssignmentsChange = (assignments: FolderHierarchyAssignment[]) => {
    setHierarchyAssignments(assignments);
    localStorage.setItem('folder-hierarchy-assignments', JSON.stringify(assignments));
  };

  // Helper functions for hierarchy sections
  const getIconForSection = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Crown;
  };

  const getColorForSection = (colorName: string) => {
    const colorData = availableColors.find(color => color.name === colorName);
    return colorData || availableColors[0];
  };

  // Add new section to the lane
  const addNewSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: HierarchySection = {
      id: `section_${Date.now()}`,
      title: newSectionTitle.toUpperCase(),
      iconName: newSectionIcon,
      colorName: newSectionColor,
      order: hierarchySections.length,
    };

    setHierarchySections([...hierarchySections, newSection]);
    setNewSectionTitle('');
    setNewSectionIcon('Crown');
    setNewSectionColor('Purple-Blue');
  };

  // Remove section from the lane
  const removeSection = (sectionId: string) => {
    setHierarchySections(sections => 
      sections.filter(section => section.id !== sectionId)
        .map((section, index) => ({ ...section, order: index }))
    );
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) {
      setDraggedSectionIndex(null);
      return;
    }

    const newSections = [...hierarchySections];
    const draggedSection = newSections[draggedSectionIndex];
    
    // Remove dragged section
    newSections.splice(draggedSectionIndex, 1);
    
    // Insert at new position
    newSections.splice(targetIndex, 0, draggedSection);
    
    // Update order property
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setHierarchySections(reorderedSections);
    setDraggedSectionIndex(null);
  };

  // Get folders for each hierarchy level
  const getFoldersForLevel = (level: HierarchyLevel): Folder[] => {
    const assignedFolderIds = hierarchyAssignments
      .filter(a => a.level === level)
      .sort((a, b) => a.order - b.order)
      .map(a => a.folderId);
    
    return assignedFolderIds
      .map(id => folders.find(f => f.id === id))
      .filter(Boolean) as Folder[];
  };

  // Get unassigned folders (default to 'teams' level)
  const getUnassignedFolders = (): Folder[] => {
    const assignedIds = new Set(hierarchyAssignments.map(a => a.folderId));
    return folders.filter(f => !assignedIds.has(f.id));
  };
  
  // Get folder color styling
  const getFolderColor = (folder: Folder) => {
    return folder.color || '#3b82f6';
  };

  const getContrastColor = (backgroundColor: string) => {
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Get relevant data based on current navigation
  const relevantFolders = currentFolderId 
    ? folders.filter(folder => folder.parent_id === currentFolderId)
    : folders.filter(folder => !folder.parent_id);
    
  const relevantBookmarks = currentFolderId
    ? bookmarks.filter(bookmark => bookmark.folder_id === currentFolderId)
    : [];

  // Count items per folder
  const getFolderCount = (folderId: string) => {
    const directBookmarks = bookmarks.filter(bookmark => bookmark.folder_id === folderId).length;
    const subfolders = folders.filter(folder => folder.parent_id === folderId).length;
    return { bookmarks: directBookmarks, folders: subfolders };
  };

  // Get current folder
  const currentFolder = currentFolderId ? folders.find(f => f.id === currentFolderId) : null;

  // Handle folder click navigation
  const handleFolderClick = (folderId: string) => {
    onFolderNavigate(folderId);
  };

  // Handle bookmark click
  const handleBookmarkClick = (bookmark: BookmarkWithRelations) => {
    onOpenDetail(bookmark);
  };

  // Helper function to get hierarchy assignments in the correct format
  const getHierarchyAssignments = () => {
    return hierarchyAssignments.map((a: FolderHierarchyAssignment) => ({
      folderId: a.folderId,
      levelId: a.level
    }));
  };

  // Pagination helper functions
  const getCurrentBookmarkPage = (folderId: string) => {
    return bookmarkPages[folderId] || 1;
  };

  const setBookmarkPage = (folderId: string, page: number) => {
    setBookmarkPages(prev => ({ ...prev, [folderId]: page }));
  };

  const getPaginatedBookmarks = (bookmarks: BookmarkWithRelations[], folderId: string) => {
    const currentPage = getCurrentBookmarkPage(folderId);
    const startIndex = (currentPage - 1) * BOOKMARKS_PER_PAGE;
    const endIndex = startIndex + BOOKMARKS_PER_PAGE;
    return bookmarks.slice(startIndex, endIndex);
  };

  const getTotalPages = (bookmarksCount: number) => {
    return Math.ceil(bookmarksCount / BOOKMARKS_PER_PAGE);
  };

  // Filter and sort folders based on current filters
  const filteredAndSortedFolders = useMemo(() => {
    let filtered = folders;

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(folder =>
        folder.name.toLowerCase().includes(query) ||
        folder.description?.toLowerCase().includes(query)
      );
    }

    // Hierarchy filter
    if (hierarchyFilter !== 'all') {
      const assignments = getHierarchyAssignments();
      const assignmentMap = new Map(assignments.map((a: {folderId: string, levelId: string}) => [a.folderId, a.levelId]));
      
      if (hierarchyFilter === 'unassigned') {
        filtered = filtered.filter(folder => !assignmentMap.has(folder.id));
      } else {
        filtered = filtered.filter(folder => assignmentMap.get(folder.id) === hierarchyFilter);
      }
    }

    // Sort folders
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'bookmarks':
          aValue = getFolderCount(a.id).bookmarks;
          bValue = getFolderCount(b.id).bookmarks;
          break;
        case 'recent':
          aValue = new Date(a.updated_at || a.created_at || Date.now()).getTime();
          bValue = new Date(b.updated_at || b.created_at || Date.now()).getTime();
          break;
        case 'alphabetical':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        return sortOrder === 'desc' 
          ? bValue.toString().localeCompare(aValue.toString())
          : aValue.toString().localeCompare(bValue.toString());
      }
    });

    return filtered;
  }, [folders, searchTerm, hierarchyFilter, sortBy, sortOrder, hierarchyAssignments]);

  // Filter bookmarks for the current view
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [bookmarks, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const assignments = getHierarchyAssignments();
    const assignmentMap = new Map(assignments.map((a: {folderId: string, levelId: string}) => [a.folderId, a.levelId]));
    
    const directorFolders = filteredAndSortedFolders.filter(f => assignmentMap.get(f.id) === 'director').length;
    const teamsFolders = filteredAndSortedFolders.filter(f => assignmentMap.get(f.id) === 'teams').length;
    const collaboratorsFolders = filteredAndSortedFolders.filter(f => assignmentMap.get(f.id) === 'collaborators').length;
    const unassignedFolders = filteredAndSortedFolders.filter(f => !assignmentMap.has(f.id)).length;
    const totalBookmarks = filteredBookmarks.length;

    return {
      directorFolders,
      teamsFolders,
      collaboratorsFolders,
      unassignedFolders,
      totalFolders: filteredAndSortedFolders.length,
      totalBookmarks
    };
  }, [filteredAndSortedFolders, filteredBookmarks, hierarchyAssignments]);

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
        {/* Main Content - No sidebar margin */}
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl mb-6">
                <FolderOpen className="w-12 h-12 text-white" />
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-6 shadow-lg inline-block border-2 border-blue-200 dark:border-blue-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedFolder ? `HIERARCHY VIEW - ${selectedFolder.name.toUpperCase()}` : 'ORGANIZATIONAL HIERARCHY VIEW'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {selectedFolder 
                    ? `Hierarchical view of ${selectedFolder.name} folder contents`
                    : 'Manage and visualize your folder organization across hierarchical levels'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Filtering and Controls Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 mb-8 shadow-lg">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  HIERARCHY MANAGEMENT
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Filter and organize your folders across organizational levels
                </p>
              </div>

              {/* Stats Overview */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.directorFolders}</span> director
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.teamsFolders}</span> teams
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.collaboratorsFolders}</span> collaborators
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.unassignedFolders}</span> unassigned
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.totalBookmarks}</span> bookmarks
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search folders and bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Hierarchy Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    {hierarchyFilter === 'all' ? 'All Levels' : 
                     hierarchyFilter === 'unassigned' ? 'Unassigned' :
                     hierarchySections.find(l => l.id === hierarchyFilter)?.title || 'Filter'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuCheckboxItem
                    checked={hierarchyFilter === 'all'}
                    onCheckedChange={() => setHierarchyFilter('all')}
                  >
                    All Levels
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {hierarchySections.map((level) => (
                    <DropdownMenuCheckboxItem
                      key={level.id}
                      checked={hierarchyFilter === level.id}
                      onCheckedChange={() => setHierarchyFilter(level.id as any)}
                    >
                      <level.icon className="h-4 w-4 mr-2" />
                      {level.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={hierarchyFilter === 'unassigned'}
                    onCheckedChange={() => setHierarchyFilter('unassigned')}
                  >
                    Unassigned
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-40">
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                    Sort by {sortBy === 'name' ? 'Name' : sortBy === 'bookmarks' ? 'Bookmarks' : sortBy === 'recent' ? 'Recent' : 'Alphabetical'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Sort by Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('bookmarks')}>
                    Sort by Bookmark Count
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('recent')}>
                    Sort by Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                    Sort Alphabetically
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Manage Hierarchy Button */}
              <Button
                onClick={() => setIsHierarchyManagerOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Hierarchy</span>
              </Button>
            </div>
          </div>

          {/* Main Content - Team Level */}
          {!currentFolderId && relevantFolders.length > 0 && (
            <div className="space-y-12 relative">
              {/* Dotted line from header */}
              <div className="flex justify-center">
                <div className="w-px h-16 border-l-2 border-dotted border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Main Container with Vertical Lane */}
              <div className="relative flex">
                {/* Draggable Vertical Hierarchy Lane */}
                <div className="w-24 flex flex-col mr-6 sticky top-0">
                  {/* Lane Header with Edit Button */}
                  <div className="flex items-center justify-center mb-2 h-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingLane(!isEditingLane)}
                      className="p-1 h-6 w-6"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>

                  {hierarchySections.sort((a, b) => a.order - b.order).map((section, index) => {
                    const IconComponent = getIconForSection(section.iconName);
                    const colors = getColorForSection(section.colorName);
                    
                    return (
                      <div
                        key={section.id}
                        className={`flex-1 min-h-64 flex items-center justify-center border-r-2 relative ${colors.border} ${colors.bg} transition-all duration-200 ${
                          draggedSectionIndex === index ? 'opacity-50' : ''
                        }`}
                        draggable={isEditingLane}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {/* Drag Handle */}
                        {isEditingLane && (
                          <div className="absolute top-2 right-2 cursor-move">
                            <GripVertical className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Remove Button */}
                        {isEditingLane && hierarchySections.length > 1 && (
                          <button
                            onClick={() => removeSection(section.id)}
                            className="absolute top-2 left-2 p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        )}

                        <div className="transform -rotate-90 whitespace-nowrap">
                          <div className={`${colors.text} px-3 py-2 flex items-center gap-1 border-2 ${colors.border} bg-transparent rounded-md`}>
                            <IconComponent className="w-3 h-3" />
                            <span className="text-sm font-semibold tracking-wide">{section.title}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Section Button */}
                  {isEditingLane && (
                    <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="space-y-2">
                        <Input
                          placeholder="Section title"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                          className="text-xs h-6"
                        />
                        
                        <div className="flex gap-1">
                          {/* Icon Selector */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="p-1 h-6 w-8">
                                {React.createElement(getIconForSection(newSectionIcon), { className: "w-3 h-3" })}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {availableIcons.map((icon) => (
                                <DropdownMenuItem
                                  key={icon.name}
                                  onClick={() => setNewSectionIcon(icon.name)}
                                >
                                  <icon.icon className="w-4 h-4 mr-2" />
                                  {icon.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Color Selector */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="p-1 h-6 w-8">
                                <div 
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: getColorForSection(newSectionColor).accent }}
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {availableColors.map((color) => (
                                <DropdownMenuItem
                                  key={color.name}
                                  onClick={() => setNewSectionColor(color.name)}
                                >
                                  <div 
                                    className="w-4 h-4 rounded-full border mr-2"
                                    style={{ backgroundColor: color.accent }}
                                  />
                                  {color.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <Button
                          onClick={addNewSection}
                          size="sm"
                          disabled={!newSectionTitle.trim()}
                          className="w-full h-6 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hierarchical Folders Display */}
                <div className="flex-1 space-y-20">
                {hierarchySections.map((section) => {
                  const levelFolders = getFoldersForLevel(section.id as HierarchyLevel);
                  const unassignedFolders = section.id === 'teams' ? getUnassignedFolders() : [];
                  const allLevelFolders = [...levelFolders, ...unassignedFolders];
                  
                  return (
                    <div key={section.id} className="relative">
                      {/* Section Header with Add Folder Button */}
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {section.title} LEVEL ({allLevelFolders.length})
                        </h3>
                        <Button
                          onClick={onCreateFolder}
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Folder
                        </Button>
                      </div>
                      
                      {/* Folders Grid */}
                      {allLevelFolders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {allLevelFolders.map((folder) => {
                          const counts = getFolderCount(folder.id);
                          const folderColor = getFolderColor(folder);
                          const textColor = getContrastColor(folderColor);
                          const folderBookmarks = bookmarks.filter(bookmark => bookmark.folder_id === folder.id);
                          
                          return (
                            <div key={folder.id} className="flex flex-col items-center space-y-6">
                              {/* Team Leader Circle */}
                              <div className="relative">
                                <div 
                                  className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center cursor-pointer transform transition-all duration-200 hover:scale-110 hover:shadow-xl border-4 border-white dark:border-slate-700"
                                  style={{ backgroundColor: folderColor }}
                                  onClick={() => handleFolderClick(folder.id)}
                                >
                                  <FolderIcon className="w-10 h-10" style={{ color: textColor }} />
                                </div>
                                
                                {/* Connection line to team name */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-6 border-l-2 border-dotted border-gray-300 dark:border-gray-600"></div>
                              </div>

                              {/* Team Name Card */}
                              <Card 
                                className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg border-2"
                                style={{ borderColor: folderColor }}
                                onClick={() => handleFolderClick(folder.id)}
                              >
                                <CardContent className="px-6 py-4 text-center">
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {folder.name.toUpperCase()}
                                  </h3>
                                  <p className="text-sm font-medium mb-3" style={{ color: folderColor }}>
                                    {counts.folders > 0 
                                      ? `${counts.folders} SUBFOLDER${counts.folders !== 1 ? 'S' : ''}`
                                      : `${counts.bookmarks} BOOKMARK${counts.bookmarks !== 1 ? 'S' : ''}`
                                    }
                                  </p>
                                  
                                  {/* Add Bookmark Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddBookmarkToFolder(folder.id);
                                    }}
                                    className="text-xs w-full"
                                    style={{ borderColor: folderColor, color: folderColor }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Bookmark
                                  </Button>
                                </CardContent>
                              </Card>

                              {/* Connection line to collaborators */}
                              {folderBookmarks.length > 0 && (
                                <>
                                  <div className="w-px h-8 border-l-2 border-dotted border-gray-300 dark:border-gray-600"></div>
                                  
                                  {/* Collaborators (Bookmarks) - Single dotted outline around all bookmarks with pagination */}
                                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 w-full max-w-sm bg-gray-50/30 dark:bg-slate-800/30 relative">
                                    <div className="grid grid-cols-1 gap-3">
                                      {getPaginatedBookmarks(folderBookmarks, folder.id).map((bookmark) => (
                                        <Card 
                                          key={bookmark.id}
                                          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg bg-white dark:bg-slate-800"
                                          onClick={() => handleBookmarkClick(bookmark)}
                                        >
                                          <CardContent className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center flex-shrink-0">
                                                <BookmarkIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                  {bookmark.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                  {new URL(bookmark.url).hostname}
                                                </p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                    
                                    {/* Pagination Controls */}
                                    {folderBookmarks.length > BOOKMARKS_PER_PAGE && (
                                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setBookmarkPage(folder.id, Math.max(1, getCurrentBookmarkPage(folder.id) - 1))}
                                          disabled={getCurrentBookmarkPage(folder.id) === 1}
                                          className="p-1 h-6 w-6"
                                        >
                                          <ChevronLeft className="w-3 h-3" />
                                        </Button>
                                        
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {getCurrentBookmarkPage(folder.id)} / {getTotalPages(folderBookmarks.length)}
                                        </span>
                                        
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setBookmarkPage(folder.id, Math.min(getTotalPages(folderBookmarks.length), getCurrentBookmarkPage(folder.id) + 1))}
                                          disabled={getCurrentBookmarkPage(folder.id) === getTotalPages(folderBookmarks.length)}
                                          className="p-1 h-6 w-6"
                                        >
                                          <ChevronRight className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Show placeholder if no bookmarks */}
                              {folderBookmarks.length === 0 && (
                                <>
                                  <div className="w-px h-8 border-l-2 border-dotted border-gray-300 dark:border-gray-600"></div>
                                  
                                  <div className="text-center py-4">
                                    <div className="text-gray-400 dark:text-gray-500 text-sm">
                                      No bookmarks yet
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 dark:text-gray-500 text-sm">
                            No folders in this level yet
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Add Folder Button */}
              <div className="text-center mt-16">
                <Button
                  onClick={onCreateFolder}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Folder
                </Button>
              </div>
            </div>
          )}

          {/* Folder Drill-Down View */}
          {currentFolderId && (
            <div className="space-y-12">
              {/* Dotted line from header */}
              <div className="flex justify-center">
                <div className="w-px h-16 border-l-2 border-dotted border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Subfolders and Bookmarks */}
              <div className="max-w-6xl mx-auto">
                
                {/* Subfolders Section */}
                {relevantFolders.length > 0 && (
                  <div className="mb-16">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">SUBFOLDERS</h2>
                      <div className="w-px h-8 border-l-2 border-dotted border-gray-300 dark:border-gray-600 mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {relevantFolders.map((folder) => {
                        const folderColor = getFolderColor(folder);
                        const textColor = getContrastColor(folderColor);
                        const counts = getFolderCount(folder.id);
                        
                        return (
                          <div key={folder.id} className="flex flex-col items-center space-y-4">
                            <div 
                              className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center cursor-pointer transform transition-all duration-200 hover:scale-110 hover:shadow-xl border-4 border-white dark:border-slate-700"
                              style={{ backgroundColor: folderColor }}
                              onClick={() => handleFolderClick(folder.id)}
                            >
                              <FolderIcon className="w-8 h-8" style={{ color: textColor }} />
                            </div>
                            
                            <Card 
                              className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 w-full"
                              style={{ borderColor: folderColor }}
                              onClick={() => handleFolderClick(folder.id)}
                            >
                              <CardContent className="px-4 py-3 text-center">
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                  {folder.name.toUpperCase()}
                                </h3>
                                <p className="text-xs font-medium mb-3" style={{ color: folderColor }}>
                                  {counts.bookmarks} BOOKMARK{counts.bookmarks !== 1 ? 'S' : ''}
                                </p>
                                
                                {/* Add Bookmark Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddBookmarkToFolder(folder.id);
                                  }}
                                  className="text-xs w-full"
                                  style={{ borderColor: folderColor, color: folderColor }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Bookmark
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bookmarks Section */}
                {relevantBookmarks.length > 0 && (
                  <div className="relative">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">BOOKMARKS</h2>
                      <div className="w-px h-8 border-l-2 border-dotted border-gray-300 dark:border-gray-600 mx-auto"></div>
                    </div>
                    
                    {/* Single dotted outline around all bookmarks in drill-down view */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50/30 dark:bg-slate-800/30 max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {relevantBookmarks.map((bookmark) => (
                          <Card 
                            key={bookmark.id}
                            className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg bg-white dark:bg-slate-800"
                            onClick={() => handleBookmarkClick(bookmark)}
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col items-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center">
                                  <BookmarkIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div className="text-center">
                                  <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                    {bookmark.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                    {new URL(bookmark.url).hostname}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Bookmark Button */}
                <div className="text-center mt-12">
                  <Button
                    onClick={() => onAddBookmarkToFolder(currentFolderId)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Bookmark to {currentFolder?.name}
                  </Button>
                </div>

                {/* Empty folder state */}
                {relevantFolders.length === 0 && relevantBookmarks.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                      <BookmarkIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      EMPTY FOLDER
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      This folder doesn't have any bookmarks yet. Start by adding your first bookmark.
                    </p>
                    
                    <Button
                      onClick={() => onAddBookmarkToFolder(currentFolderId)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="w-6 h-6 mr-2" />
                      Add Your First Bookmark
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!currentFolderId && relevantFolders.length === 0 && (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                <FolderIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                NO FOLDERS YET
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Create your first folder to organize your bookmarks in this beautiful organizational structure.
              </p>
              
              <Button
                onClick={onCreateFolder}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-6 h-6 mr-2" />
                Create Your First Folder
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchy Manager Modal */}
      <FolderHierarchyManager
        folders={folders}
        assignments={hierarchyAssignments}
        onAssignmentsChange={handleHierarchyAssignmentsChange}
        isOpen={isHierarchyManagerOpen}
        onToggle={() => setIsHierarchyManagerOpen(false)}
      />
    </>
  );
} 