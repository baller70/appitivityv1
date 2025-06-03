'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Tag as TagIcon,
  Folder as FolderIcon,
  Heart,
  Archive
} from 'lucide-react';
import { SearchService, type SearchFilters } from '../../lib/services/search';
import type { Folder, Tag } from '../../types/supabase';

interface AdvancedSearchBarProps {
  userId: string;
  value: string;
  onChange: (value: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  folders: Folder[];
  tags: Tag[];
  placeholder?: string;
  className?: string;
}

export function AdvancedSearchBar({ 
  userId,
  value, 
  onChange, 
  onFiltersChange,
  folders,
  tags,
  placeholder = "Search bookmarks...", 
  className = "" 
}: AdvancedSearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchService] = useState(() => new SearchService(userId));
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (value.length >= 2) {
        const results = await searchService.getSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [value, searchService]);

  // Handle search input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    const newFilters = { ...filters, query: newValue };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    const newFilters = { ...filters, query: suggestion };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle filter changes
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = { query: value };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Handle tag filter toggle
  const toggleTagFilter = (tagId: string) => {
    const currentTagIds = filters.tagIds || [];
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId];
    
    updateFilters({ tagIds: newTagIds.length > 0 ? newTagIds : undefined });
  };

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'query' && filters[key as keyof SearchFilters] !== undefined
  ).length;

  return (
    <div className={`relative ${className}`}>
      {/* Main search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-24"
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={(e) => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => {
              if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                setShowSuggestions(false);
              }
            }, 150);
          }}
        />
        
        {/* Filter button */}
        <Button
          variant={showFilters ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2"
        >
          <Filter className="h-3 w-3 mr-1" />
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
            >
              <Search className="inline h-3 w-3 mr-2 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Advanced Filters</h3>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Folder Filter */}
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  <FolderIcon className="inline h-3 w-3 mr-1" />
                  Folder
                </Label>
                <select
                  value={filters.folderId || ''}
                  onChange={(e) => updateFilters({ folderId: e.target.value || undefined })}
                  className="w-full mt-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                >
                  <option value="">All folders</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filters */}
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</Label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center space-x-2 text-sm">
                    <Switch
                      checked={filters.isFavorite === true}
                      onCheckedChange={(checked) => updateFilters({ isFavorite: checked ? true : undefined })}
                    />
                    <Heart className="h-3 w-3" />
                    <span>Favorites</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <Switch
                      checked={filters.isArchived === true}
                      onCheckedChange={(checked) => updateFilters({ isArchived: checked ? true : undefined })}
                    />
                    <Archive className="h-3 w-3" />
                    <span>Archived</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="inline h-3 w-3 mr-1" />
                  Date Range
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
                    className="text-xs"
                  />
                  <span className="text-xs">to</span>
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Content Filter */}
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Content</Label>
                <label className="flex items-center space-x-2 text-sm mt-1">
                  <Switch
                    checked={filters.hasDescription === true}
                    onCheckedChange={(checked) => updateFilters({ hasDescription: checked ? true : undefined })}
                  />
                  <span>Has description</span>
                </label>
              </div>
            </div>

            {/* Tag Filters */}
            {tags.length > 0 && (
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  <TagIcon className="inline h-3 w-3 mr-1" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={filters.tagIds?.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTagFilter(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 