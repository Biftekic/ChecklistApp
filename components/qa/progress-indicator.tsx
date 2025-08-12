'use client';

import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  current: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export function ProgressIndicator({
  steps,
  orientation = 'horizontal',
  showLabels = true,
}: ProgressIndicatorProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`${isHorizontal ? 'w-full' : 'h-full'}`}>
      <div
        className={`flex ${
          isHorizontal ? 'items-center justify-between' : 'flex-col space-y-4'
        }`}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.completed;
          const isCurrent = step.current;

          return (
            <div
              key={step.id}
              className={`flex ${
                isHorizontal
                  ? 'flex-1 items-center'
                  : 'items-start'
              }`}
            >
              {/* Step Indicator */}
              <div className="relative flex items-center">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                    ${
                      isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'border-primary bg-background text-primary'
                        : 'border-muted-foreground bg-background text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                {/* Step Label */}
                {showLabels && (
                  <div
                    className={`
                      ${isHorizontal ? 'absolute top-12 left-1/2 -translate-x-1/2' : 'ml-4'}
                      ${isCurrent ? 'font-medium' : ''}
                    `}
                  >
                    <p
                      className={`
                        whitespace-nowrap text-sm
                        ${
                          isCompleted
                            ? 'text-primary'
                            : isCurrent
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      `}
                    >
                      {step.label}
                    </p>
                    {step.description && !isHorizontal && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    ${
                      isHorizontal
                        ? 'h-0.5 flex-1 mx-2'
                        : 'w-0.5 h-8 ml-5 mt-2'
                    }
                    ${
                      isCompleted
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simplified Progress Bar Component
interface SimpleProgressProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export function SimpleProgress({
  current,
  total,
  label,
  showPercentage = true,
}: SimpleProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Question Progress Component
interface QuestionProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export function QuestionProgress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
}: QuestionProgressProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium">Progress</h4>
        <span className="text-xs text-muted-foreground">
          {answeredQuestions} of {totalQuestions} answered
        </span>
      </div>
      
      <SimpleProgress
        current={answeredQuestions}
        total={totalQuestions}
        showPercentage={false}
      />
      
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowRight className="h-3 w-3" />
        <span>Question {currentQuestion} of {totalQuestions}</span>
      </div>
    </div>
  );
}