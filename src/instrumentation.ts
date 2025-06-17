import * as Sentry from "@sentry/nextjs";

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: "https://2de6f1f7b38e0ecdddd33c0e87f5c4b8@o4505989077295104.ingest.sentry.io/4506880883638272",
      
      // Capture 100% of the transactions
      tracesSampleRate: 1.0,
      
      // Capture 100% of the errors for debugging
      sampleRate: 1.0,
      
      // Add specific error tracking for bookmark relationships
      beforeSend(event, hint) {
        // Tag bookmark relationship errors for easy filtering
        if (event.exception) {
          const error = hint.originalException
          if (error instanceof Error) {
            if (error.message.includes('relationship') || 
                error.stack?.includes('bookmark-relationships') ||
                error.message.includes('invalid input syntax for type uuid')) {
              // Add specific tags for relationship errors
              event.tags = {
                ...event.tags,
                feature: 'bookmark_relationships',
                priority: 'high'
              }
              
              // Add context
              event.contexts = {
                ...event.contexts,
                bookmark_relationship: {
                  component: 'relationship_creation',
                  error_category: 'uuid_validation'
                }
              }
            }
          }
        }
        return event
      },
      
      // Enhanced error reporting
      integrations: [
        Sentry.httpIntegration({
          breadcrumbs: true
        })
      ],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: "https://2de6f1f7b38e0ecdddd33c0e87f5c4b8@o4505989077295104.ingest.sentry.io/4506880883638272",
      tracesSampleRate: 1.0,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
