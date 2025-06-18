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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Clock, 
  Folder, 
  Tag, 
  Play,
  Check,
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import { TabsService, BrowserTab } from '@/lib/services/tabs';
import { PLAYLIST_COLORS, PLAYLIST_ICONS } from '@/types/playlist';

interface SaveTabsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: { bookmarks: any[]; playlist?: any }) => void;
}

export function SaveTabsDialog({ open, onOpenChange, onSuccess }: SaveTabsDialogProps) {
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [groupedTabs, setGroupedTabs] = useState<Record<string, BrowserTab[]>>({});
  
  const [options, setOptions] = useState({
    folderId: '',
    tags: [] as string[],
    createPlaylist: true,
    playlistName: '',
    playlistColor: '#3B82F6',
    playlistIcon: 'globe'
  });

  const [filters, setFilters] = useState({
    excludeActive: false,
    includeOnlyDomain: '',
    excludeDomains: ['chrome-extension', 'moz-extension'],
    titleContains: ''
  });

  // Load tabs when dialog opens
  useEffect(() => {
    if (open) {
      loadTabs();
    }
  }, [open]);

  // Update grouped tabs when tabs or filters change
  useEffect(() => {
    const filteredTabs = TabsService.filterTabs(tabs, filters);
    const grouped = TabsService.groupTabsByDomain(filteredTabs);
    setGroupedTabs(grouped);
    
    // Auto-select all filtered tabs
    const tabUrls = filteredTabs.map(tab => tab.url);
    setSelectedTabs(new Set(tabUrls));
  }, [tabs, filters]);

  // Auto-generate playlist name
  useEffect(() => {
    if (selectedTabs.size > 0 && !options.playlistName) {
      const domains = Array.from(selectedTabs).map(url => {
        try {
          return new URL(url).hostname.replace('www.', '');
        } catch {
          return 'unknown';
        }
      });
      
      const uniqueDomains = [...new Set(domains)];
      const name = uniqueDomains.length === 1 
        ? `${uniqueDomains[0]} Session`
        : `Browser Session ${new Date().toLocaleDateString()}`;
      
      setOptions(prev => ({ ...prev, playlistName: name }));
    }
  }, [selectedTabs]);

  const loadTabs = async () => {
    setLoadingTabs(true);
    try {
      const currentTabs = await TabsService.getCurrentTabs();
      setTabs(currentTabs);
    } catch (error) {
      console.error('Error loading tabs:', error);
      // Fallback: create demo tabs for testing
      setTabs([
        {
          url: window.location.href,
          title: document.title,
          favIconUrl: '/favicon.ico',
          active: true
        }
      ]);
    } finally {
      setLoadingTabs(false);
    }
  };

  const handleTabToggle = (url: string) => {
    const newSelected = new Set(selectedTabs);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedTabs(newSelected);
  };

  const handleSelectAll = () => {
    const allUrls = Object.values(groupedTabs).flat().map(tab => tab.url);
    setSelectedTabs(new Set(allUrls));
  };

  const handleSelectNone = () => {
    setSelectedTabs(new Set());
  };

  const handleSave = async () => {
    if (selectedTabs.size === 0) return;

    setLoading(true);
    try {
      const selectedTabsArray = Object.values(groupedTabs)
        .flat()
        .filter(tab => selectedTabs.has(tab.url));

      const result = await TabsService.saveTabsAsBookmarks(selectedTabsArray, options);
      
      onSuccess?.(result);
      onOpenChange(false);
      
      // Reset form
      setSelectedTabs(new Set());
      setOptions({
        folderId: '',
        tags: [],
        createPlaylist: true,
        playlistName: '',
        playlistColor: '#3B82F6',
        playlistIcon: 'globe'
      });
    } catch (error) {
      console.error('Error saving tabs:', error);
    } finally {
      setLoading(false);
    }
  };

  const estimatedTime = TabsService.estimateReadingTime(
    Object.values(groupedTabs).flat().filter(tab => selectedTabs.has(tab.url))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            SAVE BROWSER TABS AS BOOKMARKS
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Tabs List */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Browser Tabs</h3>
                <Badge variant="secondary">{Object.values(groupedTabs).flat().length} tabs</Badge>
                {selectedTabs.size > 0 && (
                  <Badge variant="default">{selectedTabs.size} selected</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTabs}
                  disabled={loadingTabs}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingTabs ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  Select None
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeActive"
                    checked={filters.excludeActive}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, excludeActive: !!checked }))
                    }
                  />
                  <Label htmlFor="excludeActive" className="text-sm">Exclude active tab</Label>
                </div>
                <Input
                  placeholder="Title contains..."
                  value={filters.titleContains}
                  onChange={(e) => setFilters(prev => ({ ...prev, titleContains: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Tabs by Domain */}
            <ScrollArea className="flex-1">
              {loadingTabs ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading tabs...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedTabs).map(([domain, domainTabs]) => (
                    <div key={domain} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{domain.toUpperCase()}</h4>
                        <Badge variant="outline">{domainTabs.length} tabs</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {domainTabs.map((tab, index) => (
                          <div
                            key={`${tab.url}-${index}`}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                          >
                            <Checkbox
                              checked={selectedTabs.has(tab.url)}
                              onCheckedChange={() => handleTabToggle(tab.url)}
                            />
                            {tab.favIconUrl && (
                              <img 
                                src={tab.favIconUrl} 
                                alt="" 
                                className="w-4 h-4"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{tab.title}</p>
                              <p className="text-xs text-gray-500 truncate">{tab.url}</p>
                            </div>
                            {tab.active && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Options Panel */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Save Options</h3>
              
              {/* Playlist Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createPlaylist"
                    checked={options.createPlaylist}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, createPlaylist: !!checked }))
                    }
                  />
                  <Label htmlFor="createPlaylist">Create playlist</Label>
                </div>

                {options.createPlaylist && (
                  <>
                    <div>
                      <Label htmlFor="playlistName">Playlist Name</Label>
                      <Input
                        id="playlistName"
                        value={options.playlistName}
                        onChange={(e) => setOptions(prev => ({ ...prev, playlistName: e.target.value }))}
                        placeholder="Enter playlist name..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Color</Label>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          {PLAYLIST_COLORS.slice(0, 6).map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded border-2 ${
                                options.playlistColor === color ? 'border-gray-900' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setOptions(prev => ({ ...prev, playlistColor: color }))}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Icon</Label>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {PLAYLIST_ICONS.slice(0, 4).map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              className={`p-1 rounded border text-xs ${
                                options.playlistIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                              }`}
                              onClick={() => setOptions(prev => ({ ...prev, playlistIcon: icon }))}
                            >
                              {icon === 'star' ? '⭐' : 
                               icon === 'heart' ? '❤️' : 
                               icon === 'folder' ? '📁' : 
                               icon === 'globe' ? '🌐' : '📋'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Selected tabs:</span>
                  <span className="font-medium">{selectedTabs.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique domains:</span>
                  <span className="font-medium">{Object.keys(groupedTabs).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. reading time:</span>
                  <span className="font-medium">{estimatedTime}m</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={handleSave}
                disabled={selectedTabs.size === 0 || loading}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                SAVE {selectedTabs.size} TABS
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 