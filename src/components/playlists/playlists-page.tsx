'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, BarChart3, List } from 'lucide-react';
import { PlaylistCard } from '@/components/playlists/playlist-card';
import { CreatePlaylistDialog } from '@/components/playlists/create-playlist-dialog';
import { EditPlaylistDialog } from '@/components/playlists/edit-playlist-dialog';
import { PlaylistAnalytics } from '@/components/playlists/playlist-analytics';
import { Playlist } from '@/types/playlist';
import { DnaPageHeader } from '@/components/dna-profile/dna-page-header';
import DnaTabsWrapper from '@/components/dna-profile/dna-tabs-wrapper';

interface PlaylistsPageProps {
  userId: string;
}

export function PlaylistsPage({ userId }: PlaylistsPageProps) {
  const { user } = useUser();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // Load playlists
  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (playlistData: any) => {
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlistData)
      });
      
      if (response.ok) {
        await loadPlaylists();
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleEditPlaylist = async (playlistData: any) => {
    try {
      const response = await fetch(`/api/playlists/${playlistData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlistData)
      });
      
      if (response.ok) {
        await loadPlaylists();
        setEditingPlaylist(null);
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  const handleLaunchPlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/launch`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Launched ${result.opened} bookmarks successfully!`);
      }
    } catch (error) {
      console.error('Failed to launch playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handleDuplicatePlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/duplicate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to duplicate playlist:', error);
    }
  };

  const handleToggleFavorite = async (playlistId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: isFavorite })
      });
      
      if (response.ok) {
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading playlists...</div>;
  }

  return (
    <div>
      <DnaTabsWrapper />
      {/* Standardized Header */}
      <DnaPageHeader 
        title="PLAYLISTS"
        description="Create and manage bookmark playlists for quick launching"
      >
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Playlist
        </Button>
      </DnaPageHeader>
      
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="playlists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="playlists" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="playlists" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                FILTER
              </Button>
            </div>

            {/* Playlists Grid */}
            {filteredPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">NO PLAYLISTS YET</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first playlist to organize and launch bookmarks together
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  CREATE YOUR FIRST PLAYLIST
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onLaunch={handleLaunchPlaylist}
                    onEdit={setEditingPlaylist}
                    onDelete={handleDeletePlaylist}
                    onDuplicate={handleDuplicatePlaylist}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <PlaylistAnalytics />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreatePlaylistDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreatePlaylist}
        />
        
        {editingPlaylist && (
          <EditPlaylistDialog
            playlist={editingPlaylist}
            open={!!editingPlaylist}
            onOpenChange={(open) => !open && setEditingPlaylist(null)}
            onSubmit={handleEditPlaylist}
          />
        )}
      </div>
    </div>
  );
} 