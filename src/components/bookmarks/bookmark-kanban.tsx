"use client";

import React, {
  Dispatch,
  SetStateAction,
  useState,
  DragEvent,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type BookmarkWithRelations } from "../../lib/services/bookmarks";
import { type Folder } from "../../types/supabase";
import { BookmarkCard } from "./bookmark-card";
import { toast } from "sonner";

type KanbanColumn = "uncategorized" | "folder1" | "folder2" | "folder3";

interface BookmarkKanbanProps {
  bookmarks: BookmarkWithRelations[];
  folders: Folder[];
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onOpenDetail: (bookmark: BookmarkWithRelations) => void;
}

export const BookmarkKanban = ({
  bookmarks,
  folders,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
}: BookmarkKanbanProps) => {
  return (
    <div className={cn("h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white")}>
      <Board
        bookmarks={bookmarks}
        folders={folders}
        onBookmarkUpdated={onBookmarkUpdated}
        onBookmarkDeleted={onBookmarkDeleted}
        onOpenDetail={onOpenDetail}
      />
    </div>
  );
};

const Board = ({
  bookmarks,
  folders,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
}: BookmarkKanbanProps) => {
  // Group bookmarks by folder
  const uncategorizedBookmarks = bookmarks.filter(bookmark => !bookmark.folder);
  const availableFolders = folders.slice(0, 3); // Show only first 3 folders for kanban

  return (
    <div className="flex h-full w-full gap-6 overflow-x-auto p-6">
      {/* Uncategorized Column */}
      <Column
        title="Uncategorized"
        column="uncategorized"
        folderId={null}
        headingColor="text-gray-600 dark:text-gray-400"
        bookmarks={uncategorizedBookmarks}
        allBookmarks={bookmarks}
        folders={folders}
        onBookmarkUpdated={onBookmarkUpdated}
        onBookmarkDeleted={onBookmarkDeleted}
        onOpenDetail={onOpenDetail}
      />

      {/* Folder Columns */}
      {availableFolders.map((folder, index) => {
        const folderBookmarks = bookmarks.filter(bookmark => bookmark.folder?.id === folder.id);
        return (
          <Column
            key={folder.id}
            title={folder.name}
            column={`folder${index + 1}` as KanbanColumn}
            folderId={folder.id}
            headingColor="text-blue-600 dark:text-blue-400"
            bookmarks={folderBookmarks}
            allBookmarks={bookmarks}
            folders={folders}
            onBookmarkUpdated={onBookmarkUpdated}
            onBookmarkDeleted={onBookmarkDeleted}
            onOpenDetail={onOpenDetail}
          />
        );
      })}

      {/* Add more columns if there are more folders */}
      {folders.length > 3 && (
        <div className="w-56 shrink-0 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center">
            <div className="mb-2">+{folders.length - 3} more folders</div>
            <div className="text-xs">Switch to other views to see all</div>
          </div>
        </div>
      )}
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  bookmarks: BookmarkWithRelations[];
  allBookmarks: BookmarkWithRelations[];
  folders: Folder[];
  column: KanbanColumn;
  folderId: string | null;
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onOpenDetail: (bookmark: BookmarkWithRelations) => void;
};

const Column = ({
  title,
  headingColor,
  bookmarks,
  allBookmarks,
  folders,
  column,
  folderId,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, bookmark: BookmarkWithRelations) => {
    e.dataTransfer.setData("bookmarkId", bookmark.id);
  };

  const handleDragEnd = async (e: DragEvent) => {
    e.preventDefault();
    setActive(false);
    
    const bookmarkId = e.dataTransfer.getData("bookmarkId");
    if (!bookmarkId) return;

    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    // Check if the bookmark is being moved to the same column
    const currentFolderId = bookmark.folder?.id || null;
    if (currentFolderId === folderId) return;

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookmarkId,
          folder_id: folderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      const updatedBookmark = await response.json();
      
      // Update the bookmark with the new folder information
      const bookmarkWithFolder = {
        ...updatedBookmark,
        folder: folderId ? folders.find(f => f.id === folderId) || null : null,
      };

      onBookmarkUpdated(bookmarkWithFolder);
      toast.success(`Bookmark moved to ${folderId ? title : 'Uncategorized'}`);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to move bookmark');
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  return (
    <div className="w-80 shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`font-semibold text-lg ${headingColor}`}>{title}</h3>
        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm text-gray-600 dark:text-gray-400">
          {bookmarks.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "h-full w-full rounded-lg p-3 transition-colors",
          active 
            ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700" 
            : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent"
        )}
      >
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {bookmarks.map((bookmark) => (
            <KanbanBookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              folders={folders}
              allBookmarks={allBookmarks}
              onBookmarkUpdated={onBookmarkUpdated}
              onBookmarkDeleted={onBookmarkDeleted}
              onOpenDetail={onOpenDetail}
              handleDragStart={handleDragStart}
            />
          ))}
          {bookmarks.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-sm">No bookmarks</div>
              <div className="text-xs">Drag bookmarks here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type KanbanBookmarkCardProps = {
  bookmark: BookmarkWithRelations;
  folders: Folder[];
  allBookmarks: BookmarkWithRelations[];
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onOpenDetail: (bookmark: BookmarkWithRelations) => void;
  handleDragStart: (e: DragEvent, bookmark: BookmarkWithRelations) => void;
};

const KanbanBookmarkCard = ({
  bookmark,
  folders,
  allBookmarks,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
  handleDragStart,
}: KanbanBookmarkCardProps) => {
  // Calculate total visits for percentage calculation
  const totalVisits = allBookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0);
  
  return (
    <div
      draggable="true"
      onDragStart={(e) => handleDragStart(e, bookmark)}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        layout
        layoutId={bookmark.id}
      >
        <BookmarkCard
          bookmark={bookmark}
          onUpdated={onBookmarkUpdated}
          onDeleted={() => onBookmarkDeleted(bookmark.id)}
          onOpenDetail={() => onOpenDetail(bookmark)}
          folders={folders}
          totalBookmarkVisits={totalVisits}
        />
      </motion.div>
    </div>
  );
}; 