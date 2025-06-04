import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { BookmarkHubDashboard } from '../../components/dashboard/bookmark-hub-dashboard';

export default async function DashboardPage() {
  const user = await currentUser();
  
  // Fallback user data if not authenticated (for development)
  const userData = {
    id: user?.id || 'demo-user',
    firstName: user?.firstName || 'Demo',
    email: user?.emailAddresses[0]?.emailAddress || 'demo@example.com'
  };

  return (
    <BookmarkHubDashboard 
      userId={userData.id}
      userData={userData}
    />
  );
} 