import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { BookmarkServiceLite } from '../../../../lib/services/bookmarks-lite'
import { AISearchService, AISearchQuery } from '../../../../lib/services/ai-search'
import { ensureUserProfile } from '../../../../lib/fix-database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists and get the actual profile ID
    let actualUserId = userId
    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const fullName = user.firstName || ''
      const profileResult = await ensureUserProfile(userId, email, fullName)
      
      if (!profileResult.success) {
        return NextResponse.json(
          { error: 'Failed to ensure user profile', details: profileResult.error }, 
          { status: 500 }
        )
      }
      
      // Use the actual profile ID from the database
      if (profileResult.userId) {
        actualUserId = profileResult.userId
      }
    } else {
      // For demo mode, still need to ensure we have the right user ID
      const profileResult = await ensureUserProfile(userId, '', '')
      if (profileResult.success && profileResult.userId) {
        actualUserId = profileResult.userId
      }
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const intent = searchParams.get('intent') as AISearchQuery['intent']
    const timeframe = searchParams.get('timeframe') as AISearchQuery['timeframe']
    const contentType = searchParams.get('contentType') as AISearchQuery['contentType']
    const useAI = searchParams.get('ai') === 'true'

    console.log('GET search - using actualUserId:', actualUserId)
    const bookmarkService = new BookmarkServiceLite(actualUserId)
    
    if (useAI && query) {
      // Use AI-enhanced search
      const aiSearchService = new AISearchService(actualUserId)
      const allBookmarks = await bookmarkService.getBookmarks()
      
      const aiQuery: AISearchQuery = {
        query,
        intent,
        timeframe,
        contentType
      }
      
      const result = await aiSearchService.aiSearch(aiQuery, allBookmarks)
      return NextResponse.json(result)
    } else {
      // Use traditional search
      const bookmarks = await bookmarkService.searchBookmarks(query)
      return NextResponse.json({
        bookmarks,
        totalResults: bookmarks.length,
        relevanceScore: bookmarks.length > 0 ? 0.7 : 0,
        contextMatches: [],
        semanticMatches: [],
        suggestions: [],
        relatedQueries: []
      })
    }
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search bookmarks' },
      { status: 500 }
    )
  }
} 