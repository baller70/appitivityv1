import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { TimeCapsulePage } from '../../components/time-capsule/time-capsule-page'
import DnaTabsWrapper from '../../components/dna-profile/dna-tabs-wrapper'

export default async function TimeCapsuleRoute() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DnaTabsWrapper />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TimeCapsulePage />
      </div>
    </div>
  )
} 