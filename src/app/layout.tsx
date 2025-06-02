import type { Metadata } from 'next'
import { ReactNode } from 'react'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'AppOrganizer Dashboard',
  description: 'Personal bookmark and app organization tool',
  keywords: ['dashboard', 'bookmarks', 'organization', 'productivity'],
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 antialiased">
        {children}
      </body>
    </html>
  )
} 