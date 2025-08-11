'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  ChevronLeft, 
  Building2,
  MapPin,
  Clock,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

function CustomizeContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get('template');
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    propertyType: '',
    propertySize: '',
    frequency: '',
    teamSize: '',
    specialRequirements: '',
  });

  const steps = [
    {
      id: 1,
      title: 'Property Details',
      icon: Building2,
      questions: [
        {
          id: 'propertyType',
          label: 'What type of property?',
          type: 'select',
          options: ['House', 'Apartment', 'Office', 'Retail Space', 'Other'],
        },
        {
          id: 'propertySize',
          label: 'Property size',
          type: 'input',
          placeholder: 'e.g., 100 sq meters, 3 bedrooms',
        },
      ],
    },
    {
      id: 2,
      title: 'Service Frequency',
      icon: Clock,
      questions: [
        {
          id: 'frequency',
          label: 'How often will this service be performed?',
          type: 'select',
          options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'One-time'],
        },
      ],
    },
    {
      id: 3,
      title: 'Team & Requirements',
      icon: Users,
      questions: [
        {
          id: 'teamSize',
          label: 'Team size',
          type: 'select',
          options: ['1 person', '2-3 people', '4-5 people', 'More than 5'],
        },
        {
          id: 'specialRequirements',
          label: 'Any special requirements?',
          type: 'textarea',
          placeholder: 'e.g., eco-friendly products, pet-safe cleaning',
        },
      ],
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate checklist
      window.location.href = '/export';
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  return (
    <PageWrapper>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round((currentStep / steps.length) * 100)}% Complete</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
              {currentStepData.title}
            </h1>
            {template && (
              <p className="text-sm text-muted-foreground">
                Customizing: {template.charAt(0).toUpperCase() + template.slice(1)} Template
              </p>
            )}
          </div>

          {/* Questions */}
          <Card className="p-6">
            <div className="space-y-6">
              {currentStepData.questions.map((question) => (
                <div key={question.id}>
                  <label className="mb-2 block text-sm font-medium">
                    {question.label}
                  </label>
                  
                  {question.type === 'select' && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options?.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange(question.id, option)}
                          className={`rounded-lg border-2 p-3 text-left transition-all ${
                            answers[question.id as keyof typeof answers] === option
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{option}</span>
                            {answers[question.id as keyof typeof answers] === option && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'input' && (
                    <Input
                      placeholder={question.placeholder}
                      value={answers[question.id as keyof typeof answers]}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="h-12"
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <textarea
                      placeholder={question.placeholder}
                      value={answers[question.id as keyof typeof answers]}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="mt-6 flex gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === steps.length ? (
                <>
                  Generate Checklist
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomizeContent />
    </Suspense>
  );
}
