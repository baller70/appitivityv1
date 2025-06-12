/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth, currentUser } from '@clerk/nextjs/server'
import { ensureUserProfile } from '../fix-database'

export async function ensureProfileMiddleware() {
  console.log('_ensureProfileMiddleware: Starting...')
  const { userId } = await auth()
  console.log('_ensureProfileMiddleware: Clerk userId:', userId)
  
  if (!userId) {
    // For demo mode, ensure demo user profile exists
    const demoUserId = 'demo-user'
    const demoEmail = 'demo@example.com'
    const demoName = 'Demo User'
    
    console.log('_ensureProfileMiddleware: No Clerk user, using demo mode')
    const result = await ensureUserProfile(demoUserId, demoEmail, demoName)
    if (!result.success) {
      console.error('_ensureProfileMiddleware: Failed to ensure demo user profile:', result.error)
      throw new Error('Failed to ensure demo user profile')
    }
    
    return { userId: demoUserId, email: demoEmail, name: demoName }
  }
  
  // For authenticated users, get their details from Clerk
  const user = await currentUser()
  if (!user) {
    console.error('_ensureProfileMiddleware: Clerk user ID exists but user not found')
    throw new Error('User not found')
  }
  
  const email = user.emailAddresses[0]?.emailAddress || `${userId}@example.com`
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
  
  console.log('_ensureProfileMiddleware: Ensuring profile for Clerk user:', { userId, email, name })
  const result = await ensureUserProfile(userId, email, name)
  if (!result.success) {
    console.error('_ensureProfileMiddleware: Failed to ensure user profile:', result.error)
    throw new Error('Failed to ensure user profile')
  }
  
  console.log('_ensureProfileMiddleware: Profile ensured successfully')
  return { userId, email, name }
} 