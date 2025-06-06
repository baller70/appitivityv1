'use client';

import React, { useState } from 'react';
import { Filter, X, Check, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Separator } from './separator';
import { Badge } from './badge';

interface FilterState {
  contentType: 'all' | 'bookmarks' | 'notes' | 'tags';
  context: 'all' | 'personal' | 'work' | 'shared';
  sortBy: 'newest' | 'oldest' | 'title' | 'url' | 'recent' | 'visits' | 'favorites';
}

interface FilterPopoverProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterPopover({ filters, onFiltersChange }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const contentTypeOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'bookmarks', label: 'Bookmarks' },
    { value: 'notes', label: 'Notes' },
    { value: 'tags', label: 'Tags' },
  ] as const;

  const contextOptions = [
    { value: 'all', label: 'All Contexts' },
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'shared', label: 'Shared' },
  ] as const;

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'By Title' },
    { value: 'url', label: 'By URL' },
    { value: 'recent', label: 'Recently Visited' },
    { value: 'visits', label: 'Most Visited' },
    { value: 'favorites', label: 'Favorites' },
  ] as const;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.contentType !== 'all') count++;
    if (filters.context !== 'all') count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  const resetFilters = () => {
    onFiltersChange({
      contentType: 'all',
      context: 'all',
      sortBy: 'newest',
    });
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="relative flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm">Filter Bookmarks</h4>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Content Type Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-1">
                {contentTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.contentType === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateFilter('contentType', option.value)}
                    className="h-8 text-xs justify-start"
                  >
                    {filters.contentType === option.value && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Context Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Context
              </label>
              <div className="grid grid-cols-2 gap-1">
                {contextOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.context === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateFilter('context', option.value)}
                    className="h-8 text-xs justify-start"
                  >
                    {filters.context === option.value && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Sort By
              </label>
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateFilter('sortBy', option.value)}
                    className="w-full h-8 text-xs justify-start"
                  >
                    {filters.sortBy === option.value && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Active Filters
                </label>
                <div className="flex flex-wrap gap-1">
                  {filters.contentType !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {contentTypeOptions.find(o => o.value === filters.contentType)?.label}
                    </Badge>
                  )}
                  {filters.context !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {contextOptions.find(o => o.value === filters.context)?.label}
                    </Badge>
                  )}
                  {filters.sortBy !== 'newest' && (
                    <Badge variant="secondary" className="text-xs">
                      {sortOptions.find(o => o.value === filters.sortBy)?.label}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 