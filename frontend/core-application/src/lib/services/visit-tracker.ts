/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiClient } from '../api/client';
import { bookmarkCache } from './bookmark-cache';
import { toast } from 'sonner';

export class VisitTracker {
  private static instance: VisitTracker;
  private pendingVisits = new Map<string, number>();
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  private constructor() {
    this.startFlushInterval();
  }

  static getInstance(): VisitTracker {
    if (!VisitTracker.instance) {
      VisitTracker.instance = new VisitTracker();
    }
    return VisitTracker.instance;
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flushPendingVisits();
    }, this.FLUSH_INTERVAL);
  }

  async trackVisit(bookmarkId: string, url: string): Promise<void> {
    // Increment local counter
    const currentCount = this.pendingVisits.get(bookmarkId) || 0;
    this.pendingVisits.set(bookmarkId, currentCount + 1);

    // Update cache immediately for UI responsiveness
    const cached = bookmarkCache.getCachedBookmarks();
    if (cached) {
      const bookmark = cached.find(b => b.id === bookmarkId);
      if (bookmark) {
        bookmarkCache.optimisticUpdate(bookmarkId, {
          visit_count: (bookmark.visit_count || 0) + 1,
          last_visited_at: new Date().toISOString()
        });
      }
    }

    // Open URL in new tab
    window.open(url, '_blank');
  }

  private async flushPendingVisits() {
    if (this.pendingVisits.size === 0) return;

    // Copy and clear pending visits
    const visitsToFlush = new Map(this.pendingVisits);
    this.pendingVisits.clear();

    // Send updates to server
    for (const [bookmarkId, visitCount] of visitsToFlush) {
      try {
        await this.updateVisitCount(bookmarkId, visitCount);
      } catch (error) {
        console.error(`Failed to update visit count for bookmark ${bookmarkId}:`, error);
        // Re-add to pending if failed
        const currentPending = this.pendingVisits.get(bookmarkId) || 0;
        this.pendingVisits.set(bookmarkId, currentPending + visitCount);
      }
    }
  }

  private async updateVisitCount(bookmarkId: string, incrementBy: number): Promise<void> {
    try {
      const response = await fetch(`/api/bookmarks/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookmarkId,
          incrementBy
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visit count');
      }

      const result = await response.json();
      
      // Update cache with server response
      if (result.bookmark) {
        bookmarkCache.optimisticUpdate(bookmarkId, result.bookmark);
      }
    } catch (error) {
      console.error('Error updating visit count:', error);
      throw error;
    }
  }

  // Force flush all pending visits
  async flush(): Promise<void> {
    await this.flushPendingVisits();
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }
}

// Export singleton instance
export const visitTracker = VisitTracker.getInstance();

// Ensure cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    visitTracker.flush();
  });
} 