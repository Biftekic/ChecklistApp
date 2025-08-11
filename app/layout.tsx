import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ChecklistApp - Professional Service Checklists',
  description: 'Generate professional service checklists with AI-powered customization',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChecklistApp',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'ChecklistApp - Professional Service Checklists',
    description: 'Generate professional service checklists with AI-powered customization',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChecklistApp',
    description: 'Generate professional service checklists with AI-powered customization',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen-small font-sans antialiased">
        <div className="flex min-h-screen-small flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
