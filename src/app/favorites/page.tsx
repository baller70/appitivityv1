import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FavoritesPage } from '../../components/favorites/favorites-page';

export default async function Favorites() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <FavoritesPage userId={userId} />;
} 