import { BookmarkService } from '../services'
import { AIAllianceService } from './alliances'
import { AIBookmarkFinder } from './bookmark-finder'
import { AIBookmarkSummary } from './bookmark-summary'
import { AIPredictiveEngine } from './predictive-engine'
import { AIForecastingEngine } from './forecasting'
import { AIRealTimeRefresher } from './real-time-refresher'
import { AILearningPathGenerator } from './learning-path-generator'

export class AICopilotCore {
  private alliance: AIAllianceService
  private finder: AIBookmarkFinder
  private summarizer: AIBookmarkSummary
  private predictor: AIPredictiveEngine
  private forecaster: AIForecastingEngine
  private refresher: AIRealTimeRefresher
  private learner: AILearningPathGenerator

  constructor(private readonly bookmarkService: BookmarkService) {
    this.alliance = new AIAllianceService(bookmarkService)
    this.finder = new AIBookmarkFinder(bookmarkService)
    this.summarizer = new AIBookmarkSummary(bookmarkService)
    this.predictor = new AIPredictiveEngine(bookmarkService)
    this.forecaster = new AIForecastingEngine(bookmarkService)
    this.refresher = new AIRealTimeRefresher(bookmarkService)
    this.learner = new AILearningPathGenerator(bookmarkService)
  }

  /** Return dashboard suggestions: alliances list and recent summary */
  async dashboardOverview(query?: string) {
    const alliances = await this.alliance.recommendAlliances()
    const searchResults = query ? await this.finder.find(query) : []
    let summary: string | null = null
    if (searchResults.length > 0) {
      const res = await this.summarizer.summarize(searchResults[0].id)
      summary = res.summary
    }
    return { alliances, searchResults, summary }
  }

  /** Get top predicted bookmarks */
  async predictions(limit = 5) {
    return this.predictor.predictNext(limit)
  }

  /** Get visit forecasts for next week */
  async forecasts() {
    return this.forecaster.forecastNextWeek()
  }

  /** Get bookmarks updated since timestamp */
  async updates(since?: string) {
    return this.refresher.getUpdates(since)
  }

  /** Build a learning path */
  async learningPath(topic?: string, limit = 10) {
    return this.learner.generatePath({ topic, limit })
  }
} 