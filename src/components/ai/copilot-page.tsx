import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'

interface Alliance {
  tag: string
  bookmarks: { id: string; title: string; url: string }[]
}

interface Forecast {
  bookmarkId: string
  expectedVisitsNext7Days: number
  title?: string
  url?: string
}

interface CopilotData {
  alliances: Alliance[]
  searchResults: { id: string; title: string; url: string }[]
  summary: string | null
  predictions: { id: string; title: string; url: string }[]
  forecasts: Forecast[]
  learningPath: { id: string; title: string; url: string }[]
}

export function CopilotPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CopilotData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'alliances' | 'forecasts' | 'learning'>('overview')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const corePromise = fetch('/api/ai/copilot-core', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      }).then(r=>r.json())
      const predPromise = fetch('/api/ai/predictive-engine').then(r=>r.json())
      const forecastPromise = fetch('/api/ai/forecasting').then(r=>r.json())
      const learningPromise = query
        ? fetch('/api/ai/learning-path-generator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: query }),
          }).then(r=>r.json())
        : Promise.resolve({ path: [] })

      const [core, pred, fore, learn] = await Promise.all([corePromise,predPromise,forecastPromise,learningPromise])

      setData({
        ...core,
        predictions: pred.predictions || [],
        forecasts: fore.forecasts || [],
        learningPath: learn.path || [],
      })
    } catch (e:any) {
      setError(e.message||'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 overflow-auto">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Ask Copilot…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
        />
        <Button onClick={fetchData} disabled={loading} className="flex gap-1 items-center">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Go
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="alliances">Alliances</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            {data.summary ? (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{data.summary}</p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No summary available.</p>
            )}

            {/* Quick glance predictions list */}
            {data.predictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 3 Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {data.predictions.slice(0, 3).map((b) => (
                      <li key={b.id}>
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {b.title || b.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Predictions full list */}
          <TabsContent value="predictions">
            {data.predictions.length ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">Predicted Next Bookmarks <span className="text-sm font-normal text-muted-foreground">({data.predictions.length})</span></CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {data.predictions.map((b) => (
                      <li key={b.id}>
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {b.title || b.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No predictions yet.</p>
            )}
          </TabsContent>

          {/* Alliances */}
          <TabsContent value="alliances" className="space-y-4">
            {data.alliances.length ? (
              data.alliances.map((a) => (
                <Card key={a.tag}>
                  <CardHeader>
                    <CardTitle>#{a.tag}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {a.bookmarks.map((b) => (
                        <li key={b.id}>
                          <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {b.title || b.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No alliances found.</p>
            )}
          </TabsContent>

          {/* Forecasts */}
          <TabsContent value="forecasts">
            {data.forecasts.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Next-Week Visit Forecasts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 pr-2">
                    <ul className="space-y-1 list-decimal list-inside">
                      {data.forecasts.map((f, idx) => (
                        <li key={f.bookmarkId} className="flex justify-between">
                          <span>{idx+1}.</span>
                          <span className="flex-1 ml-2 truncate">{f.title || f.bookmarkId}</span>
                          <span className="text-muted-foreground">{f.expectedVisitsNext7Days}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No forecast data.</p>
            )}
          </TabsContent>

          {/* Learning Path */}
          <TabsContent value="learning">
            {data.learningPath.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Learning Path{query ? ` for "${query}"` : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-1">
                    {data.learningPath.map((b,i)=>(
                      <li key={b.id}>
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {b.title || b.url}
                        </a>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No learning suggestions.</p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 