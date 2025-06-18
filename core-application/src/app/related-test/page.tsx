'use client';

import React from 'react';
import { RelatedManager } from '@/components/related';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock bookmark data for testing
const mockBookmark = {
  id: '1',
  title: 'GitHub Repository',
  url: 'https://github.com/example/repo',
  description: 'A sample GitHub repository for development projects',
  folder_id: 'f1',
  is_favorite: false,
  is_archived: false,
  visit_count: 5,
  last_visited_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  favicon_url: 'https://github.com/favicon.ico',
  screenshot_url: null,
  user_id: 'demo-user',
  folder: {
    id: 'f1',
    name: 'Development',
    color: '#3B82F6',
    description: null,
    parent_id: null,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    user_id: 'demo-user'
  },
  tags: [
    { 
      id: 't1', 
      name: 'programming', 
      color: '#10B981',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      user_id: 'demo-user'
    },
    { 
      id: 't2', 
      name: 'github', 
      color: '#6366F1',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      user_id: 'demo-user'
    }
  ],
  preview_image: null
};

const mockAllBookmarks = [
  mockBookmark,
  {
    id: '2',
    title: 'Stack Overflow Question',
    url: 'https://stackoverflow.com/questions/example',
    description: 'How to implement related bookmarks in React',
    folder_id: 'f1',
    is_favorite: true,
    is_archived: false,
    visit_count: 12,
    last_visited_at: '2024-01-14T15:30:00Z',
    created_at: '2024-01-02T08:00:00Z',
    updated_at: '2024-01-14T15:30:00Z',
    favicon_url: 'https://stackoverflow.com/favicon.ico',
    screenshot_url: null,
    user_id: 'demo-user',
    folder: {
      id: 'f1',
      name: 'Development',
      color: '#3B82F6',
      description: null,
      parent_id: null,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      user_id: 'demo-user'
    },
    tags: [
      { 
        id: 't1', 
        name: 'programming', 
        color: '#10B981',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        user_id: 'demo-user'
      },
      { 
        id: 't3', 
        name: 'react', 
        color: '#F59E0B',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        user_id: 'demo-user'
      }
    ],
    preview_image: null
  },
  {
    id: '3',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/',
    description: 'Official TypeScript documentation and tutorials',
    folder_id: 'f2',
    is_favorite: false,
    is_archived: false,
    visit_count: 8,
    last_visited_at: '2024-01-13T12:00:00Z',
    created_at: '2024-01-03T14:00:00Z',
    updated_at: '2024-01-13T12:00:00Z',
    favicon_url: 'https://www.typescriptlang.org/favicon.ico',
    screenshot_url: null,
    user_id: 'demo-user',
    folder: {
      id: 'f2',
      name: 'Documentation',
      color: '#8B5CF6',
      description: null,
      parent_id: null,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      user_id: 'demo-user'
    },
    tags: [
      { 
        id: 't1', 
        name: 'programming', 
        color: '#10B981',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        user_id: 'demo-user'
      },
      { 
        id: 't4', 
        name: 'typescript', 
        color: '#EF4444',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        user_id: 'demo-user'
      }
    ],
    preview_image: null
  }
];

export default function RelatedTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔗 Related Bookmarks System Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Testing the Related Bookmarks functionality with mock data
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Target Bookmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Title:</strong> {mockBookmark.title}</p>
                    <p><strong>URL:</strong> {mockBookmark.url}</p>
                    <p><strong>Tags:</strong> {mockBookmark.tags.map(tag => tag.name).join(', ')}</p>
                    <p><strong>Folder:</strong> {mockBookmark.folder?.name}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Bookmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {mockAllBookmarks.length} bookmarks in the test dataset
                  </p>
                  <ul className="mt-2 space-y-1">
                    {mockAllBookmarks.map(bookmark => (
                      <li key={bookmark.id} className="text-sm">
                        • {bookmark.title}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Related Manager Component */}
        <RelatedManager
          targetBookmark={mockBookmark}
          allBookmarks={mockAllBookmarks}
          onBookmarkVisit={(bookmark) => {
            console.log('Visiting bookmark:', bookmark.title);
            window.open(bookmark.url, '_blank');
          }}
          onBookmarkViewDetails={(bookmark) => {
            console.log('Viewing details for:', bookmark.title);
            alert(`Viewing details for: ${bookmark.title}`);
          }}
          onBookmarkToggleFavorite={(bookmark) => {
            console.log('Toggling favorite for:', bookmark.title);
            alert(`Toggled favorite for: ${bookmark.title}`);
          }}
        />
      </div>
    </div>
  );
} 