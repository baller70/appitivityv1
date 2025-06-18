import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookmarkService } from '@/lib/services'
import { AIForecastingEngine } from '@/lib/ai/forecasting'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const engine = new AIForecastingEngine(new BookmarkService(userId))
    const forecasts = await engine.forecastNextWeek()
    return NextResponse.json({ forecasts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal error' }, { status: 500 })
  }
} 