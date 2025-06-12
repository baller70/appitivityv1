import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { EnhancedSearchDashboard } from '../../components/search/enhanced-search-dashboard'

export default async function SearchPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedSearchDashboard userId={userId} />
    </div>
  )
} 