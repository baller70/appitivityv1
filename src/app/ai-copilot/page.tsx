import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AiCopilotTabsWrapper from '@/components/ai/ai-copilot-tabs-wrapper';

export default async function AICopilotRoute() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AiCopilotTabsWrapper />
    </div>
  );
} 