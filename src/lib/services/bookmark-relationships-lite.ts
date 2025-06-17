// Lightweight BookmarkRelationshipService for API routes - avoids heavy supabase-js import
import { normalizeUserId } from '../uuid-compat'
import { supabaseAdminLite } from '../supabase-lite'
import * as Sentry from '@sentry/nextjs'

// UUID validation regex (version 4 UUID)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export class BookmarkRelationshipServiceLite {
  private userId: string
  private originalUserId: string

  constructor(userId: string) {
    this.originalUserId = userId
    // Normalise Clerk IDs to Supabase UUIDs if needed
    this.userId = userId.startsWith('user_') ? normalizeUserId(userId) : userId
    console.log('📋 BookmarkRelationshipServiceLite initialized:', {
      original: this.originalUserId,
      normalized: this.userId
    })
  }

  /**
   * Creates a relationship row linking two bookmarks.
   * Any UNIQUE constraint violation (duplicate relationship) is ignored gracefully.
   */
  async createRelationship(bookmarkId: string, relatedBookmarkId: string) {
    try {
      console.log('🔗 Creating bookmark relationship:', {
        from: bookmarkId,
        to: relatedBookmarkId,
        user: this.userId
      })

      // Prevent self-references
      if (bookmarkId === relatedBookmarkId) {
        console.warn('⚠️ Prevented self-reference: bookmark cannot be related to itself')
        return { success: false, error: 'A bookmark cannot be related to itself' }
      }

      // Enhanced UUID validation with better error messages
      if (!isValidUUID(bookmarkId)) {
        const error = new Error(`Invalid bookmark ID format: ${bookmarkId}`)
        console.error('❌ Invalid bookmark ID:', bookmarkId)
        
        Sentry.captureException(error, {
          tags: {
            component: 'BookmarkRelationshipServiceLite',
            operation: 'createRelationship',
            errorType: 'invalid_uuid'
          },
          extra: {
            bookmarkId,
            relatedBookmarkId,
            userId: this.userId
          }
        })
        
        return { success: false, error: error.message }
      }

      if (!isValidUUID(relatedBookmarkId)) {
        const error = new Error(`Invalid related bookmark ID format: ${relatedBookmarkId}`)
        console.error('❌ Invalid related bookmark ID:', relatedBookmarkId)
        
        Sentry.captureException(error, {
          tags: {
            component: 'BookmarkRelationshipServiceLite',
            operation: 'createRelationship',
            errorType: 'invalid_related_uuid'
          },
          extra: {
            bookmarkId,
            relatedBookmarkId,
            userId: this.userId
          }
        })
        
        return { success: false, error: error.message }
      }

      // Verify both bookmarks exist and belong to user
      console.log('🔍 Verifying bookmark ownership...')
      const bookmark1 = await supabaseAdminLite.select('bookmarks', {
        select: 'id, user_id',
        id: bookmarkId
      })

      if (bookmark1.error) {
        console.error('❌ Failed to check bookmark 1:', bookmark1.error)
        Sentry.captureMessage('Bookmark verification failed', {
          level: 'error',
          tags: { operation: 'bookmark_verification' },
          extra: { bookmarkId, error: bookmark1.error }
        })
        return { success: false, error: 'Failed to verify bookmark: ' + bookmark1.error.message }
      }

      if (!bookmark1.data || bookmark1.data.length === 0) {
        console.error('❌ Bookmark 1 not found:', bookmarkId)
        return { success: false, error: 'Bookmark not found' }
      }

      const bookmark2 = await supabaseAdminLite.select('bookmarks', {
        select: 'id, user_id', 
        id: relatedBookmarkId
      })

      if (bookmark2.error) {
        console.error('❌ Failed to check bookmark 2:', bookmark2.error)
        Sentry.captureMessage('Related bookmark verification failed', {
          level: 'error',
          tags: { operation: 'related_bookmark_verification' },
          extra: { relatedBookmarkId, error: bookmark2.error }
        })
        return { success: false, error: 'Failed to verify related bookmark: ' + bookmark2.error.message }
      }

      if (!bookmark2.data || bookmark2.data.length === 0) {
        console.error('❌ Bookmark 2 not found:', relatedBookmarkId)
        return { success: false, error: 'Related bookmark not found' }
      }

      // Check ownership
      if (bookmark1.data[0].user_id !== this.userId) {
        console.error('❌ Bookmark 1 ownership mismatch:', {
          expected: this.userId,
          actual: bookmark1.data[0].user_id
        })
        return { success: false, error: 'You do not own this bookmark' }
      }

      if (bookmark2.data[0].user_id !== this.userId) {
        console.error('❌ Bookmark 2 ownership mismatch:', {
          expected: this.userId,
          actual: bookmark2.data[0].user_id
        })
        return { success: false, error: 'You do not own the related bookmark' }
      }

      console.log('✅ Ownership verified, creating relationship...')

      // Create the relationship
      const result = await supabaseAdminLite.insert('bookmark_relationships', {
        bookmark_id: bookmarkId,
        related_bookmark_id: relatedBookmarkId,
        relationship_type: 'related',
        created_by: this.userId
      })

      if (!result.error) {
        console.log('✅ Relationship created successfully:', result.data)
        
        // Track successful relationship creation
        Sentry.addBreadcrumb({
          message: 'Bookmark relationship created',
          level: 'info',
          data: {
            bookmarkId,
            relatedBookmarkId,
            userId: this.userId
          }
        })
        
        return { 
          success: true, 
          id: result.data?.[0]?.id,
          data: result.data?.[0]
        }
      } else {
        // Check if it's a duplicate constraint error
        if (result.error.message.includes('duplicate') || result.error.message.includes('unique')) {
          console.log('⚠️ Relationship already exists (duplicate ignored)')
          return { success: true, id: 'duplicate', message: 'Relationship already exists' }
        }
        
        console.error('❌ Failed to create relationship:', result.error)
        
        Sentry.captureMessage('Failed to create bookmark relationship', {
          level: 'error',
          tags: { operation: 'relationship_creation' },
          extra: {
            bookmarkId,
            relatedBookmarkId,
            userId: this.userId,
            error: result.error.message
          }
        })
        
        return { success: false, error: result.error.message }
      }
    } catch (error) {
      console.error('❌ Error in createRelationship:', error)
      
      Sentry.captureException(error, {
        tags: {
          component: 'BookmarkRelationshipServiceLite',
          operation: 'createRelationship'
        },
        extra: {
          bookmarkId,
          relatedBookmarkId,
          userId: this.userId
        }
      })
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error creating relationship' 
      }
    }
  }

  /**
   * Gets all relationships for a bookmark (both incoming and outgoing)
   */
  async getRelationshipsForBookmark(bookmarkId: string) {
    try {
      if (!isValidUUID(bookmarkId)) {
        return { success: false, error: `Invalid bookmark ID format: ${bookmarkId}` }
      }

      // Get relationships where this bookmark is the source
      const outgoingResult = await supabaseAdminLite.select('bookmark_relationships', {
        select: '*',
        bookmark_id: bookmarkId
      })

      // Get relationships where this bookmark is the target
      const incomingResult = await supabaseAdminLite.select('bookmark_relationships', {
        select: '*',
        related_bookmark_id: bookmarkId
      })

      if (outgoingResult.error && incomingResult.error) {
        console.error('❌ Failed to get relationships:', { outgoingResult, incomingResult })
        return { success: false, error: 'Failed to get relationships' }
      }

      const outgoing = outgoingResult.data || []
      const incoming = incomingResult.data || []
      const allRelationships = [...outgoing, ...incoming]

      console.log(`📋 Found ${allRelationships.length} total relationships for bookmark ${bookmarkId} (${outgoing.length} outgoing, ${incoming.length} incoming)`)
      
      return { 
        success: true, 
        data: allRelationships,
        outgoing,
        incoming,
        total: allRelationships.length
      }
    } catch (error) {
      console.error('❌ Error getting relationships:', error)
      
      Sentry.captureException(error, {
        tags: {
          component: 'BookmarkRelationshipServiceLite',
          operation: 'getRelationshipsForBookmark'
        },
        extra: { bookmarkId, userId: this.userId }
      })
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting relationships' 
      }
    }
  }
} 