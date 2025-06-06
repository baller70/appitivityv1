import { RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
} 