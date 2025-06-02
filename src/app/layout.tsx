import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import { Toaster } from '../components/ui/toaster'

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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
} 