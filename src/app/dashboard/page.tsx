import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { BookmarkHubDashboard } from '../../components/dashboard/bookmark-hub-dashboard';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Extract only the plain data we need to avoid serialization issues
  const userData = {
    id: user.id,
    firstName: user.firstName,
    email: user.emailAddresses[0]?.emailAddress
  };

  return <BookmarkHubDashboard userId={user.id} userData={userData} />;
} 