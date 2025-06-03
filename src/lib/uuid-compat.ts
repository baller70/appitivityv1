/**
 * UUID compatibility layer for Clerk integration
 * Temporarily converts Clerk user IDs to UUID format for database compatibility
 */

import { v5 as uuidv5 } from 'uuid'

// Namespace for generating consistent UUIDs from Clerk user IDs
const CLERK_UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Convert Clerk user ID to a consistent UUID
 * This creates a deterministic UUID from the Clerk user ID
 */
export function clerkIdToUuid(clerkId: string): string {
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
 * Convert user ID to UUID format if needed
 */
export function normalizeUserId(userId: string): string {
  if (isValidUuid(userId)) {
    return userId
  }
  return clerkIdToUuid(userId)
} 