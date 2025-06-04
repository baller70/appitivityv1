"use client";

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ImportedBookmark {
  title: string;
  url: string;
  description?: string;
  folderId?: string;
  tagIds?: string[];
}

interface BookmarkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (bookmarks: ImportedBookmark[]) => Promise<void>;
}

export const BookmarkImportModal: React.FC<BookmarkImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [urlText, setUrlText] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!urlText.trim()) {
      toast.error('Please enter some URLs to import');
      return;
    }

    setImporting(true);
    try {
      // Parse URLs from text (one per line)
      const urls = urlText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && (line.startsWith('http://') || line.startsWith('https://')));

      if (urls.length === 0) {
        toast.error('No valid URLs found. Please enter URLs starting with http:// or https://');
        return;
      }

      const bookmarks: ImportedBookmark[] = urls.map(url => ({
        title: url, // Will be updated when the bookmark is created
        url: url
      }));

      await onImport(bookmarks);
      toast.success(`Successfully imported ${bookmarks.length} bookmarks!`);
      setUrlText('');
      onClose();
    } catch (error) {
      toast.error('Failed to import bookmarks');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Bookmarks
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter URLs to import (one per line)
              </label>
              <textarea
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                placeholder="https://example.com
https://github.com
https://stackoverflow.com"
                className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={importing}
              />
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>• Enter one URL per line</p>
              <p>• URLs must start with http:// or https://</p>
              <p>• Bookmark titles will be automatically fetched</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !urlText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? 'Importing...' : 'Import Bookmarks'}
          </button>
        </div>
      </div>
    </div>
  );
}; 