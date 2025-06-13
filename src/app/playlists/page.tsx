import { PlaylistsPage } from '@/components/playlists/playlists-page';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function PlaylistsRoute() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlaylistsPage userId={userId} />
      </div>
    </div>
  );
} 