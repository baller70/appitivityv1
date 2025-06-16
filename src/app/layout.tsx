import React, { ReactNode } from 'react'
import './globals.css'
import { ThemeAccentControls } from '@/components/ui/ThemeAccentControls'
import { AppProviders } from './providers'
import { ChunkErrorBoundary } from '@/components/ChunkErrorBoundary'

export const metadata = {
  title: 'AppOrganizer Dashboard',
  description: 'Personal bookmark and app organization tool',
  keywords: ['dashboard', 'bookmarks', 'organization', 'productivity'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ChunkErrorBoundary>
          <AppProviders>
            <ThemeAccentControls />
            {children}
          </AppProviders>
        </ChunkErrorBoundary>
      </body>
    </html>
  )
} 