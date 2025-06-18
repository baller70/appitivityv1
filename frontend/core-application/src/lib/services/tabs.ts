/**
 * Browser Tabs Service
 * Handles saving current browser tabs as bookmarks
 */

export interface BrowserTab {
  id?: number;
  url: string;
  title: string;
  favIconUrl?: string;
  active?: boolean;
  windowId?: number;
  index?: number;
}

export interface SaveTabsOptions {
  folderId?: string;
  tags?: string[];
  createPlaylist?: boolean;
  playlistName?: string;
  playlistColor?: string;
  playlistIcon?: string;
}

export class TabsService {
  /**
   * Get all tabs from current browser window
   * Note: This requires browser extension or special permissions
   */
  static async getCurrentTabs(): Promise<BrowserTab[]> {
    // In a real implementation, this would use browser extension API
    // For now, we'll simulate with a demo implementation
    
    if (typeof window === 'undefined') {
      throw new Error('Tabs service only works in browser environment');
    }

    // Check if we have access to browser tabs (would require extension)
    if ('chrome' in window && (window as any).chrome?.tabs) {
      return new Promise((resolve) => {
        (window as any).chrome.tabs.query({ currentWindow: true }, (tabs: any[]) => {
          resolve(tabs.map((tab: any) => ({
            id: tab.id,
            url: tab.url,
            title: tab.title,
            favIconUrl: tab.favIconUrl,
            active: tab.active,
            windowId: tab.windowId,
            index: tab.index
          })));
        });
      });
    }

    // Fallback: Return current page as single tab
    return [{
      url: window.location.href,
      title: document.title,
      favIconUrl: this.getFaviconUrl(),
      active: true
    }];
  }

  /**
   * Save tabs as bookmarks
   */
  static async saveTabsAsBookmarks(
    tabs: BrowserTab[], 
    options: SaveTabsOptions = {}
  ): Promise<{ success: boolean; bookmarks: any[]; playlist?: any }> {
    try {
      const bookmarks = [];
      
      // Save each tab as a bookmark
      for (const tab of tabs) {
        const bookmarkData = {
          url: tab.url,
          title: tab.title,
          description: `Saved from browser tabs on ${new Date().toLocaleDateString()}`,
          folder_id: options.folderId || null,
          tags: options.tags || [],
          favicon_url: tab.favIconUrl
        };

        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookmarkData)
        });

        if (response.ok) {
          const result = await response.json();
          bookmarks.push(result.bookmark);
        }
      }

      let playlist = null;

      // Create playlist if requested
      if (options.createPlaylist && bookmarks.length > 0) {
        const playlistData = {
          name: options.playlistName || `Browser Session ${new Date().toLocaleDateString()}`,
          description: `Saved browser tabs from ${new Date().toLocaleString()}`,
          color: options.playlistColor || '#3B82F6',
          icon: options.playlistIcon || 'globe',
          bookmark_ids: bookmarks.map(b => b.id)
        };

        const playlistResponse = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playlistData)
        });

        if (playlistResponse.ok) {
          const playlistResult = await playlistResponse.json();
          playlist = playlistResult.playlist;
        }
      }

      return {
        success: true,
        bookmarks,
        playlist
      };
    } catch (error) {
      console.error('Error saving tabs as bookmarks:', error);
      throw error;
    }
  }

  /**
   * Get favicon URL for current page
   */
  private static getFaviconUrl(): string {
    const links = document.querySelectorAll('link[rel*="icon"]');
    for (const link of links) {
      const href = (link as HTMLLinkElement).href;
      if (href) return href;
    }
    
    // Fallback to default favicon
    return `${window.location.origin}/favicon.ico`;
  }

  /**
   * Filter tabs by criteria
   */
  static filterTabs(tabs: BrowserTab[], criteria: {
    excludeActive?: boolean;
    includeOnlyDomain?: string;
    excludeDomains?: string[];
    titleContains?: string;
  }): BrowserTab[] {
    return tabs.filter(tab => {
      if (criteria.excludeActive && tab.active) return false;
      
      if (criteria.includeOnlyDomain) {
        try {
          const domain = new URL(tab.url).hostname;
          if (!domain.includes(criteria.includeOnlyDomain)) return false;
        } catch {
          return false;
        }
      }

      if (criteria.excludeDomains?.length) {
        try {
          const domain = new URL(tab.url).hostname;
          if (criteria.excludeDomains.some(excluded => domain.includes(excluded))) {
            return false;
          }
        } catch {
          return false;
        }
      }

      if (criteria.titleContains) {
        if (!tab.title.toLowerCase().includes(criteria.titleContains.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Group tabs by domain
   */
  static groupTabsByDomain(tabs: BrowserTab[]): Record<string, BrowserTab[]> {
    const groups: Record<string, BrowserTab[]> = {};
    
    tabs.forEach(tab => {
      try {
        const domain = new URL(tab.url).hostname.replace('www.', '');
        if (!groups[domain]) {
          groups[domain] = [];
        }
        groups[domain].push(tab);
      } catch {
        // Invalid URL, group under 'other'
        if (!groups['other']) {
          groups['other'] = [];
        }
        groups['other'].push(tab);
      }
    });

    return groups;
  }

  /**
   * Estimate reading time for tabs (based on title length)
   */
  static estimateReadingTime(tabs: BrowserTab[]): number {
    // Simple estimation: 200 words per minute, ~5 chars per word
    const totalChars = tabs.reduce((sum, tab) => sum + tab.title.length, 0);
    const estimatedWords = totalChars / 5;
    return Math.ceil(estimatedWords / 200); // minutes
  }
} 