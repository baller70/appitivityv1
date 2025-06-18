'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api/client';
import { Button } from '../../../components/ui/button';
import { BookmarkWithRelations } from '../../../lib/services/bookmarks';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, ExternalLink, Edit, Star, Calendar, Eye, Folder, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function BookmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bookmark, setBookmark] = useState<BookmarkWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookmark = async () => {
      try {
        setLoading(true);
        const bookmarkId = params.id as string;
        
        // Get all bookmarks and find the one with matching ID
        const bookmarks = await apiClient.getBookmarks();
        const foundBookmark = bookmarks.find(b => b.id === bookmarkId);
        
        if (!foundBookmark) {
          setError('Bookmark not found');
          return;
        }
        
        setBookmark(foundBookmark);
      } catch (_error) {
        console.error('Failed to load bookmark:', _error);
        setError('Failed to load bookmark');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadBookmark();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bookmark) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Bookmark not found'}
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      // TODO: Implement favorite toggle API call
      toast.success(bookmark.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bookmark Details
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Title and Favicon */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              {bookmark.favicon_url ? (
                <Image
                  src={bookmark.favicon_url}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {bookmark.title}
              </h2>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-2"
              >
                {bookmark.url}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className="flex items-center gap-2"
              >
                <Star className={`w-4 h-4 ${bookmark.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {bookmark.is_favorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard?edit=${bookmark.id}`)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>

          {/* Description */}
          {bookmark.description && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {bookmark.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Folder */}
            {bookmark.folder && (
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Folder:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: bookmark.folder.color || '#6b7280' }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                  {bookmark.folder.name.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Visit Count */}
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Visits:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {bookmark.visit_count || 0} times
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Created:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(bookmark.created_at || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Updated Date */}
            {bookmark.updated_at && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Updated:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(bookmark.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Tag className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Visit Bookmark
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(bookmark.url)}
              className="flex items-center gap-2"
            >
              Copy URL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 