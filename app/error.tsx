'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Something went wrong!</h1>
          <p className="text-muted-foreground max-w-md text-lg">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 max-w-2xl text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Show error details (Development only)
              </summary>
              <div className="mt-4 space-y-2">
                <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg border">
                  <strong>Message:</strong> {error.message}
                </pre>
                {error.stack && (
                  <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg border overflow-auto max-h-64">
                    <strong>Stack:</strong>
                    {'\n'}
                    {error.stack}
                  </pre>
                )}
                {error.digest && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Error ID:</strong> {error.digest}
                  </p>
                )}
              </div>
            </details>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={reset} size="lg">
            Try again
          </Button>
          <Button variant="outline" size="lg" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
