'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Edit, 
  Trash2, 
  Star, 
  Copy, 
  MoreVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Playlist } from '@/types/playlist';

interface PlaylistCardProps {
  playlist: Playlist;
  onLaunch: (playlistId: string) => void;
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlistId: string) => void;
  onDuplicate: (playlistId: string) => void;
  onToggleFavorite: (playlistId: string, isFavorite: boolean) => void;
}

export function PlaylistCard({
  playlist,
  onLaunch,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite
}: PlaylistCardProps) {
  const handleLaunch = () => {
    onLaunch(playlist.id);
  };

  const borderColor = playlist.color || '#cbd5e1';
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4" 
          style={{ borderLeftColor: borderColor }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: playlist.color || '#94a3b8' }}
            >
              {playlist.icon === 'star' ? '⭐' : 
               playlist.icon === 'heart' ? '❤️' : 
               playlist.icon === 'folder' ? '📁' : 
               playlist.icon === 'code' ? '💻' : 
               playlist.icon === 'design' ? '🎨' : '📋'}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{playlist.name.toUpperCase()}</h3>
              {playlist.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {playlist.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {playlist.is_favorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(playlist)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(playlist.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onToggleFavorite(playlist.id, !playlist.is_favorite)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {playlist.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(playlist.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {playlist.bookmark_count || 0} bookmarks
            </Badge>
            <span className="text-sm text-muted-foreground">
              Updated {playlist.updated_at ? new Date(playlist.updated_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <Button 
            onClick={handleLaunch}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!playlist.bookmark_count || playlist.bookmark_count === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            LAUNCH ALL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 