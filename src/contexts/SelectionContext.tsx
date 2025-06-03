'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { BookmarkWithRelations } from '../lib/services/bookmarks';

interface SelectionContextType {
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: (items: BookmarkWithRelations[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
  getSelectedItems: (items: BookmarkWithRelations[]) => BookmarkWithRelations[];
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectItem = useCallback((id: string) => {
    setSelectedIds(prev => new Set([...prev, id]));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((items: BookmarkWithRelations[]) => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const getSelectedItems = useCallback((items: BookmarkWithRelations[]) => {
    return items.filter(item => selectedIds.has(item.id));
  }, [selectedIds]);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const value: SelectionContextType = {
    selectedIds,
    isSelectionMode,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    selectedCount: selectedIds.size,
    getSelectedItems,
    enterSelectionMode,
    exitSelectionMode
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
} 