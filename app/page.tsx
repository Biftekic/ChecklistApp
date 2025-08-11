import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Camera, 
  MessageSquare, 
  Download,
  Sparkles,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';

export default function HomePage() {
  return (
    <PageWrapper>
      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 py-12 sm:px-6 sm:py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Checklists
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Professional Service Checklists
            <span className="block text-primary">Made Simple</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Generate customized checklists for any service industry. 
            From cleaning to maintenance, get professional templates in seconds.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/templates">
                Get Started
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
              <Link href="/ai-analysis">
                Try AI Analysis
                <Camera className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid - Mobile Optimized */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional checklists tailored to your specific needs
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Industry Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-built templates for cleaning, maintenance, hospitality, and more
              </p>
            </Card>
            
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Smart Customization</h3>
              <p className="text-sm text-muted-foreground">
                Answer simple questions to get a checklist perfectly suited to your needs
              </p>
            </Card>
            
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Photo Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Take a photo and let AI generate a detailed checklist automatically
              </p>
            </Card>
            
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Export Anywhere</h3>
              <p className="text-sm text-muted-foreground">
                Export to PDF, CSV, or integrate with your existing workflow
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Optimized */}
      <section className="bg-muted/30 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to your perfect checklist
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Choose Your Method</h3>
                <p className="text-muted-foreground">
                  Select a template, answer questions, or upload a photo
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Customize Details</h3>
                <p className="text-muted-foreground">
                  AI personalizes your checklist based on your specific requirements
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Export & Use</h3>
                <p className="text-muted-foreground">
                  Download, print, or integrate your checklist instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Shield className="h-4 w-4" />
            100% Free to Start
          </div>
          
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Streamline Your Workflow?
          </h2>
          
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of professionals using ChecklistApp to save time and ensure quality
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/templates">
                Create Your First Checklist
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile Optimized
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Instant Generation
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure & Private
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
