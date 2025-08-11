'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { RoomSelector } from '@/components/room-selector';
import { useCustomizationStore } from '@/lib/stores/customization-store';
import templates from '@/lib/data/templates';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { ProgressStepper, MobileProgressStepper } from '@/components/progress-stepper';
import { useViewport } from '@/hooks/use-viewport';

export default function RoomSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const { isMobile } = useViewport();
  
  const {
    selectedTemplate,
    setSelectedTemplate,
    selectedRooms,
    setCurrentStep,
    goToNextStep
  } = useCustomizationStore();
  
  // Load template if not already loaded
  useEffect(() => {
    if (!selectedTemplate || selectedTemplate.id !== templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setCurrentStep('rooms');
      } else {
        // Template not found, redirect to templates page
        router.push('/templates');
      }
    }
  }, [templateId, selectedTemplate, setSelectedTemplate, setCurrentStep, router]);
  
  const handleContinue = () => {
    if (selectedRooms.length === 0) {
      alert('Please select at least one room to continue.');
      return;
    }
    goToNextStep();
    router.push(`/templates/${templateId}/tasks`);
  };
  
  const handleBack = () => {
    router.push('/templates');
  };
  
  if (!selectedTemplate) {
    return (
      <PageWrapper>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-lg text-muted-foreground">Loading template...</div>
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Progress indicator */}
          <div className="mb-8">
            {isMobile ? (
              <MobileProgressStepper
                steps={[
                  { id: 'template', label: 'Template' },
                  { id: 'rooms', label: 'Rooms' },
                  { id: 'tasks', label: 'Tasks' },
                  { id: 'review', label: 'Review' }
                ]}
                currentStep="rooms"
                completedSteps={['template']}
              />
            ) : (
              <ProgressStepper
                steps={[
                  { id: 'template', label: 'Template', description: 'Choose base template' },
                  { id: 'rooms', label: 'Rooms', description: 'Select areas to clean' },
                  { id: 'tasks', label: 'Tasks', description: 'Customize tasks' },
                  { id: 'review', label: 'Review', description: 'Finalize checklist' }
                ]}
                currentStep="rooms"
                completedSteps={['template']}
              />
            )}
          </div>
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
              Select Rooms to Clean
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose which rooms to include in your {selectedTemplate.name} checklist
            </p>
          </div>
          
          {/* Room selector */}
          <RoomSelector />
          
          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                asChild
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={selectedRooms.length === 0}
                className="sm:w-auto"
              >
                Continue to Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}