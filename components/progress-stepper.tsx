'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: string;
  completedSteps?: string[];
  className?: string;
}

export function ProgressStepper({ 
  steps, 
  currentStep, 
  completedSteps = [],
  className 
}: ProgressStepperProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-0 top-5 h-0.5 w-full bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
            }}
          />
        </div>
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id) || index < currentStepIndex;
            const isCurrent = step.id === currentStep;
            const isPending = index > currentStepIndex;
            
            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-all",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary shadow-lg",
                    isPending && "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Step label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCompleted && "text-primary",
                      isCurrent && "text-primary",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized version
export function MobileProgressStepper({ 
  steps, 
  currentStep, 
  completedSteps = [],
  className 
}: ProgressStepperProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];
  
  return (
    <div className={cn("w-full", className)}>
      {/* Current step info */}
      <div className="mb-4 text-center">
        <div className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
        <div className="mt-1 text-lg font-semibold">
          {currentStepData?.label}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`
          }}
        />
      </div>
      
      {/* Step dots */}
      <div className="mt-4 flex justify-center space-x-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentStepIndex;
          const isCurrent = step.id === currentStep;
          
          return (
            <div
              key={step.id}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                isCompleted && "bg-primary",
                isCurrent && "w-8 bg-primary",
                !isCompleted && !isCurrent && "bg-muted"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}