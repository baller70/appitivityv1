import { BookmarkService, BookmarkWithRelations } from '../services'

export interface ForecastResult {
  bookmarkId: string
  expectedVisitsNext7Days: number
}

/**
 * AIForecastingEngine provides basic visit-count forecasts based on average
 * historical usage (visits divided by lifespan days).
 *
 * NOTE: This naive linear forecast can later be replaced with ML/ARIMA, etc.
 */
export class AIForecastingEngine {
  constructor(private readonly bookmarkService: BookmarkService) {}

  /** Forecast expected visits for next 7 days for each bookmark. */
  async forecastNextWeek(): Promise<ForecastResult[]> {
    const bookmarks = await this.bookmarkService.getBookmarks()
    const now = Date.now()

    const forecasts: ForecastResult[] = []
    for (const bm of bookmarks) {
      const visits = bm.visit_count ?? 0
      if (visits === 0) continue // nothing to forecast yet

      const createdAt = bm.created_at ? new Date(bm.created_at).getTime() : undefined
      if (!createdAt) continue

      const lifespanDays = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))
      const avgPerDay = visits / lifespanDays
      const expected = Math.round(avgPerDay * 7)
      forecasts.push({ bookmarkId: bm.id, expectedVisitsNext7Days: expected })
    }

    // Sort descending expected visits
    forecasts.sort((a, b) => b.expectedVisitsNext7Days - a.expectedVisitsNext7Days)
    return forecasts
  }

  /** Return bookmarks with highest expected visits next week (top N) */
  async topForecastedBookmarks(limit = 5): Promise<BookmarkWithRelations[]> {
    const forecasts = await this.forecastNextWeek()
    if (!forecasts.length) return []
    const topIds = forecasts.slice(0, limit).map(f => f.bookmarkId)
    const bookmarks = await this.bookmarkService.getBookmarks()
    const map = new Map(bookmarks.map(b => [b.id, b]))
    return topIds.map(id => map.get(id)).filter(Boolean) as BookmarkWithRelations[]
  }
} 