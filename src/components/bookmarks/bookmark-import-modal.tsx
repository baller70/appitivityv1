'use client';

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FolderOpen, 
  ExternalLink,
  Settings,
  Import,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { bookmarkImportService, type ImportResult, type ImportOptions, type ImportedBookmark } from '../../lib/services/bookmark-import';

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
  const [step, setStep] = useState<'upload' | 'preview' | 'options' | 'importing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    mergeFolders: true,
    includeSubfolders: true,
    defaultFolder: 'Imported'
  });
  const [, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setStep('preview');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      
      try {
        const format = bookmarkImportService.detectFileFormat(content);
        let result: ImportResult;
        
        if (format === 'html') {
          result = bookmarkImportService.parseBookmarkHtml(content, importOptions);
        } else if (format === 'json') {
          result = bookmarkImportService.parseBookmarkJson(content, importOptions);
        } else {
          toast.error('Unsupported file format. Please use HTML or JSON bookmark exports.');
          setStep('upload');
          return;
        }
        
        setImportResult(result);
      } catch (error) {
        toast.error('Failed to parse bookmark file');
        console.error('Import error:', error);
        setStep('upload');
      }
    };
    
    reader.readAsText(file);
  }, [importOptions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'text/html' || file.type === 'application/json' || file.name.endsWith('.html') || file.name.endsWith('.json'))) {
      handleFileSelect(file);
    } else {
      toast.error('Please select a valid bookmark file (.html or .json)');
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleOptionsChange = () => {
    if (fileContent && importResult) {
      // Re-process with new options
      const format = bookmarkImportService.detectFileFormat(fileContent);
      let result: ImportResult;
      
      if (format === 'html') {
        result = bookmarkImportService.parseBookmarkHtml(fileContent, importOptions);
      } else {
        result = bookmarkImportService.parseBookmarkJson(fileContent, importOptions);
      }
      
      setImportResult(result);
    }
  };

  const handleImport = async () => {
    if (!importResult || !importResult.bookmarks.length) {
      toast.error('No bookmarks to import');
      return;
    }

    setImporting(true);
    setStep('importing');
    setImportProgress(0);

    try {
      // Simulate progress for user experience
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onImport(importResult.bookmarks);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setStep('complete');
      
      toast.success(`Successfully imported ${importResult.summary.bookmarksFound} bookmarks!`);
    } catch (error) {
      toast.error('Failed to import bookmarks');
      console.error('Import error:', error);
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setSelectedFile(null);
    setFileContent('');
    setImportResult(null);
    setImporting(false);
    setImportProgress(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Import className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Bookmarks
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {['upload', 'preview', 'options', 'importing', 'complete'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${
                  step === s ? 'bg-blue-600' :
                  ['upload', 'preview', 'options'].indexOf(step) > index ? 'bg-green-500' :
                  'bg-gray-300 dark:bg-gray-600'
                }`} />
                <span className={`ml-2 text-sm ${
                  step === s ? 'text-blue-600 dark:text-blue-400 font-medium' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
                {index < 4 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select Your Bookmark File
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose an HTML or JSON bookmark export file from your browser
                </p>
              </div>

              {/* File Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
              >
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your bookmark file here
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Or click to browse and select a file
                </p>
                <input
                  type="file"
                  accept=".html,.json"
                  onChange={handleFileInput}
                  className="hidden"
                  id="bookmark-file-input"
                />
                <label
                  htmlFor="bookmark-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>

              {/* Browser Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  How to export bookmarks:
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <div><strong>Chrome:</strong> Menu → Bookmarks → Bookmark manager → ⋮ → Export bookmarks</div>
                  <div><strong>Firefox:</strong> Menu → Bookmarks → Manage bookmarks → Import and Backup → Export to HTML</div>
                  <div><strong>Safari:</strong> File → Export Bookmarks</div>
                  <div><strong>Edge:</strong> Menu → Favorites → ⋯ → Export to file</div>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && importResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Import Preview
                </h3>
                <button
                  onClick={() => setStep('options')}
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Options
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                        {importResult.summary.bookmarksFound}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">Bookmarks</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                        {importResult.summary.foldersFound}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Folders</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                        {importResult.summary.duplicatesFound}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Duplicates</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                        {importResult.summary.errorsFound}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">Errors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Bookmarks */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Sample Bookmarks ({Math.min(importResult.bookmarks.length, 5)} of {importResult.bookmarks.length})
                  </h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {importResult.bookmarks.slice(0, 5).map((bookmark, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {bookmark.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {bookmark.url}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              {bookmark.folder}
                            </span>
                            {bookmark.tags.map(tag => (
                              <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Folders List */}
              {importResult.folders.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Folders to Create
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {importResult.folders.map((folder, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          {folder}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Options
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="skipDuplicates"
                    checked={importOptions.skipDuplicates}
                    onChange={(e) => {
                      setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }));
                      handleOptionsChange();
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="skipDuplicates" className="text-gray-900 dark:text-white">
                    Skip duplicate bookmarks
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="mergeFolders"
                    checked={importOptions.mergeFolders}
                    onChange={(e) => {
                      setImportOptions(prev => ({ ...prev, mergeFolders: e.target.checked }));
                      handleOptionsChange();
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="mergeFolders" className="text-gray-900 dark:text-white">
                    Merge with existing folders
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="includeSubfolders"
                    checked={importOptions.includeSubfolders}
                    onChange={(e) => {
                      setImportOptions(prev => ({ ...prev, includeSubfolders: e.target.checked }));
                      handleOptionsChange();
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="includeSubfolders" className="text-gray-900 dark:text-white">
                    Include subfolders
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default folder for orphaned bookmarks
                  </label>
                  <input
                    type="text"
                    value={importOptions.defaultFolder || ''}
                    onChange={(e) => {
                      setImportOptions(prev => ({ ...prev, defaultFolder: e.target.value }));
                      handleOptionsChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Imported"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('preview')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back to Preview
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-6 text-center">
              <div>
                <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Importing Bookmarks...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we import your bookmarks
                </p>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {importProgress}% complete
              </p>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="space-y-6 text-center">
              <div>
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Import Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Successfully imported {importResult.summary.bookmarksFound} bookmarks
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p><strong>Bookmarks imported:</strong> {importResult.summary.bookmarksFound}</p>
                  <p><strong>Folders created:</strong> {importResult.summary.foldersFound}</p>
                  {importResult.summary.duplicatesFound > 0 && (
                    <p><strong>Duplicates skipped:</strong> {importResult.summary.duplicatesFound}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {selectedFile && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                File: {selectedFile.name}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {step === 'complete' ? 'Close' : 'Cancel'}
            </button>
            
            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={!importResult || importResult.bookmarks.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {importResult?.summary.bookmarksFound || 0} Bookmarks
              </button>
            )}
            
            {step === 'options' && (
              <button
                onClick={handleImport}
                disabled={!importResult || importResult.bookmarks.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Bookmarks
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 