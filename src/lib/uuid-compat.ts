/**
 * UUID compatibility layer for Clerk integration
 * Converts Clerk user IDs to UUID format for database compatibility
 */

import { v5 as uuidv5 } from 'uuid'

// Namespace for generating consistent UUIDs from Clerk user IDs
const CLERK_UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Convert Clerk user ID to a consistent UUID using uuid v5
 * This creates a deterministic UUID from the Clerk user ID
 */
export function clerkIdToUuid(clerkId: string): string {
  if (!clerkId || typeof clerkId !== 'string' || clerkId.length === 0) {
    throw new Error(`Invalid clerkId provided: ${clerkId}`)
  }
  return uuidv5(clerkId, CLERK_UUID_NAMESPACE)
}

/**
 * Check if a string is already a valid UUID
 */
export function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Normalize user ID - convert Clerk format to UUID if needed
 */
export function normalizeUserId(userId: string | null | undefined): string {
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    throw new Error(`Invalid userId provided to normalizeUserId: ${userId}`)
  }
  
  // If it's already a valid UUID, return as-is
  if (isValidUuid(userId)) {
    return userId
  }
  
  // Convert Clerk user ID to UUID format
  return clerkIdToUuid(userId)
}

/**
 * Generate a random UUID (for new records)
 */
export function generateUuid(): string {
  return crypto.randomUUID()
} 