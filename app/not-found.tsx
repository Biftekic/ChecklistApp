import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary/20 sm:text-9xl">404</h1>
          <div className="-mt-8">
            <h2 className="text-2xl font-bold sm:text-3xl">Page Not Found</h2>
          </div>
        </div>

        <p className="mb-8 max-w-md text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or
          doesn&apos;t exist.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/templates">
              <Search className="mr-2 h-4 w-4" />
              Browse Templates
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <Button variant="ghost" size="sm" asChild>
            <a href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
