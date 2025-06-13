import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Settings() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Redirect to the enhanced settings page which now contains all functionality
  redirect('/features/settings');
} 