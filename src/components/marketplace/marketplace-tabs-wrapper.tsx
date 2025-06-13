'use client'

import dynamic from 'next/dynamic'

const MarketplaceTabs = dynamic(() => import('./marketplace-tabs'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Loading marketplace...</p>
      </div>
    </div>
  )
})

export function MarketplaceTabsWrapper() {
  return <MarketplaceTabs />
}

export default MarketplaceTabsWrapper 