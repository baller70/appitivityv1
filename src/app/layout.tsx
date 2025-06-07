import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import { Toaster } from '../components/ui/toaster'
import { NotificationProvider, NotificationContainer } from '@/components/notifications'
import { ReminderProvider } from '@/components/reminders'
import StagewiseToolbar from '@/components/dev/stagewise-toolbar'

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
        <body className="bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 antialiased">
          <NotificationProvider>
            <ReminderProvider>
              {children}
              <NotificationContainer />
              <Toaster />
              <StagewiseToolbar />
            </ReminderProvider>
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  )
} 