import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AICopilotPage from '@/components/ai/ai-copilot-page';

export default async function AICopilotRoute() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <AICopilotPage />;
} 