'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function TemplateError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Template Error</h2>
          <p className="text-muted-foreground max-w-md">
            There was a problem loading this template. Please try again or select a different
            template.
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/templates')}>
            Back to templates
          </Button>
        </div>
      </div>
    </div>
  );
}
