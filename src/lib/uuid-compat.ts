/**
 * UUID compatibility layer for Clerk integration
 * Converts Clerk user IDs to UUID format for database compatibility
 */

import { createHash } from 'crypto'

// Namespace for generating consistent UUIDs from Clerk user IDs
const CLERK_UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Convert Clerk user ID to a consistent UUID using crypto hash
 * This creates a deterministic UUID from the Clerk user ID
 */
export function clerkIdToUuid(clerkId: string): string {
  if (!clerkId || typeof clerkId !== 'string' || clerkId.length === 0) {
    throw new Error(`Invalid clerkId provided: ${clerkId}`)
  }
  
  // Create a deterministic hash from the clerk ID
  const hash = createHash('sha256').update(clerkId + CLERK_UUID_NAMESPACE).digest('hex')
  
  // Format as UUID v4 (8-4-4-4-12)
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-')
}

/**
 * Check if a string is already a valid UUID
 */
export function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Normalize user ID - if it starts with 'user_', convert to UUID, otherwise return as-is
 * Special handling for demo-user to convert to a consistent UUID
 */
export function normalizeUserId(userId: string): string {
  if (!userId) return userId
  
  // Handle Clerk user IDs
  if (userId.startsWith('user_')) {
    return clerkIdToUuid(userId)
  }
  
  // Handle demo-user case - convert to a consistent UUID
  if (userId === 'demo-user') {
    return clerkIdToUuid('demo-user')
  }
  
  // If it's already a valid UUID, return as-is
  if (isValidUuid(userId)) {
    return userId
  }
  
  // For any other string, convert to a consistent UUID
  return clerkIdToUuid(userId)
}

/**
 * Generate a random UUID (for new records)
 */
export function generateUuid(): string {
  return crypto.randomUUID()
} 