'use client'

import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import { Toaster } from '../components/ui/toaster'
import { NotificationProvider, NotificationContainer } from '@/components/notifications'
import { ReminderProvider } from '@/components/reminders'
import StagewiseToolbar from '@/components/dev/stagewise-toolbar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeAccentControls } from '@/components/ui/ThemeAccentControls'
import { AppProviders } from './providers'

export const metadata: Metadata = {
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
          <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap" rel="stylesheet" />
        </head>
        <body className="bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 antialiased">
          <AppProviders>
            <ThemeProvider>
              <NotificationProvider>
                <ReminderProvider>
                  {/* Global theme/accent controls */}
                  <div className="fixed top-2 right-4 z-50"><ThemeAccentControls /></div>

                  {children}
                  <NotificationContainer />
                  <Toaster />
                  <StagewiseToolbar />
                </ReminderProvider>
              </NotificationProvider>
            </ThemeProvider>
          </AppProviders>
        </body>
      </html>
    </ClerkProvider>
  )
} 