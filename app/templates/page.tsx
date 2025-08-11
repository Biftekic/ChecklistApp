import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Home, 
  Building2, 
  Sparkles, 
  Wrench,
  Hotel,
  ShoppingBag,
  GraduationCap,
  Heart,
  Truck,
  ChevronRight
} from 'lucide-react';

const templates = [
  {
    id: 'residential',
    name: 'Residential Cleaning',
    description: 'House cleaning, apartments, and home maintenance',
    icon: Home,
    color: 'bg-blue-500',
    popular: true,
  },
  {
    id: 'office',
    name: 'Office & Commercial',
    description: 'Office buildings, retail spaces, and commercial properties',
    icon: Building2,
    color: 'bg-green-500',
    popular: true,
  },
  {
    id: 'airbnb',
    name: 'Airbnb & Vacation Rentals',
    description: 'Short-term rental turnover and guest preparation',
    icon: Sparkles,
    color: 'bg-purple-500',
    popular: true,
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Repairs',
    description: 'Property maintenance, inspections, and repair checklists',
    icon: Wrench,
    color: 'bg-orange-500',
  },
  {
    id: 'hospitality',
    name: 'Hotels & Hospitality',
    description: 'Hotel rooms, restaurants, and hospitality services',
    icon: Hotel,
    color: 'bg-pink-500',
  },
  {
    id: 'retail',
    name: 'Retail & Stores',
    description: 'Retail spaces, shopping centers, and storefronts',
    icon: ShoppingBag,
    color: 'bg-indigo-500',
  },
  {
    id: 'educational',
    name: 'Schools & Educational',
    description: 'Classrooms, universities, and educational facilities',
    icon: GraduationCap,
    color: 'bg-yellow-500',
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Medical offices, clinics, and healthcare facilities',
    icon: Heart,
    color: 'bg-red-500',
  },
  {
    id: 'moveinout',
    name: 'Move In/Out Cleaning',
    description: 'Deep cleaning for moving in or out of properties',
    icon: Truck,
    color: 'bg-teal-500',
  },
];

export default function TemplatesPage() {
  return (
    <PageWrapper>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              Choose Your Template
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Select an industry template to get started. Each template is fully customizable 
              to match your specific needs.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card 
                  key={template.id} 
                  className="group relative overflow-hidden transition-all hover:shadow-lg"
                >
                  {template.popular && (
                    <div className="absolute right-2 top-2 z-10">
                      <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                        Popular
                      </span>
                    </div>
                  )}
                  
                  <Link href={`/templates/${template.id}/rooms`} className="block p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <div className={`${template.color} rounded-lg p-3 text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold group-hover:text-primary">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm font-medium text-primary">
                      Customize Template
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>

          {/* Custom Template Option */}
          <div className="mt-8">
            <Card className="overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                  <div className="mb-4 sm:mb-0 sm:mr-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">
                      Can't find what you're looking for?
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Create a custom checklist from scratch or use our AI to analyze your space
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild>
                        <Link href="/customize">
                          Create Custom Checklist
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/ai-analysis">
                          Use AI Photo Analysis
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
