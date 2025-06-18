'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PLAYLIST_COLORS, PLAYLIST_ICONS, Playlist } from '@/types/playlist';

interface EditPlaylistDialogProps {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function EditPlaylistDialog({ playlist, open, onOpenChange, onSubmit }: EditPlaylistDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'list',
    is_favorite: false
  });

  useEffect(() => {
    if (playlist) {
      setFormData({
        name: playlist.name ?? '',
        description: playlist.description ?? '',
        color: playlist.color ?? '#3B82F6',
        icon: playlist.icon ?? 'list',
        is_favorite: playlist.is_favorite ?? false
      });
    }
  }, [playlist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit({ ...formData, id: playlist.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>EDIT PLAYLIST</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">NAME</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter playlist name..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">DESCRIPTION</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>COLOR</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {PLAYLIST_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label>ICON</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {PLAYLIST_ICONS.slice(0, 8).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`p-2 rounded border ${
                      formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon === 'star' ? '⭐' : 
                     icon === 'heart' ? '❤️' : 
                     icon === 'folder' ? '📁' : 
                     icon === 'code' ? '💻' : 
                     icon === 'design' ? '🎨' : '📋'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              CANCEL
            </Button>
            <Button type="submit">
              UPDATE PLAYLIST
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 