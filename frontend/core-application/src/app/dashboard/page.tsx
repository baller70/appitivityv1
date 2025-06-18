import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { DashboardMain } from '../../components/dashboard/dashboard-main';

export default async function DashboardPage() {
  const user = await currentUser();
  
  // Fallback user data if not authenticated (for development)
  const userData = {
    id: user?.id || 'demo-user',
    firstName: user?.firstName || 'Demo',
    email: user?.emailAddresses[0]?.emailAddress || 'demo@example.com'
  };

  return (
    <DashboardMain 
      userId={userData.id}
      userData={userData}
    />
  );
} 