'use client';

import React, { useState } from 'react';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationIframeProps {
  className?: string;
  height?: string;
}

export function NotificationIframe({ className = '', height = '600px' }: NotificationIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewWindow = () => {
    window.open('/notifications-test', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
  };

  if (hasError) {
    return (
      <div className={`border rounded-lg p-8 bg-gray-50 dark:bg-gray-800 text-center ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Notification System
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The notification system couldn't be loaded in this view.
        </p>
        <Button onClick={openInNewWindow} className="mx-auto">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Window
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative border rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg z-10"
          style={{ height }}
        >
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading notification system...
            </p>
          </div>
        </div>
      )}
      
      <iframe 
        src="/notifications-test" 
        className={`w-full border-0 rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ height }}
        title="Notification System"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      
      {/* Quick access button */}
      <div className="absolute top-2 right-2 z-20">
        <Button
          size="sm"
          variant="outline"
          onClick={openInNewWindow}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          title="Open in new window"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 