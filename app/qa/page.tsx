'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionRenderer } from '@/components/qa/question-renderer';
import { TaskSelection } from '@/components/qa/task-selection';
import { useQAStore } from '@/lib/stores/qa-store';
import { useCustomizationStore } from '@/lib/stores/customization-store';
import { QAEngine } from '@/lib/services/qa-engine';
import { questionFlows } from '@/lib/services/qa-engine-old';
import { 
  Sparkles, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ListChecks
} from 'lucide-react';

export default function QAPage() {
  const router = useRouter();
  const [qaEngine, setQAEngine] = useState<QAEngine | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const {
    currentSession,
    currentQuestion,
    questionFlow,
    answeredQuestions,
    roomSuggestions,
    taskSuggestions,
    customTasks,
    startSession,
    setQuestionFlow,
    answerQuestion,
    getNextQuestion,
    goToPreviousQuestion,
    toggleRoomSelection,
    toggleTaskSelection,
    editTaskSuggestion,
    addCustomTask,
    removeCustomTask,
    getSessionResult,
    reset,
  } = useQAStore();

  const { setSelectedTemplate, setCurrentStep } = useCustomizationStore();

  useEffect(() => {
    // Initialize Q&A session
    startSession();
    setQuestionFlow(questionFlows.cleaning);
    
    // Initialize Q&A engine
    const engine = new QAEngine();
    setQAEngine(engine);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    // Generate suggestions when answers change
    if (qaEngine && currentSession) {
      qaEngine.setAnswers(currentSession.answers);
      
      // Check if we have enough answers to generate suggestions
      if (Object.keys(currentSession.answers).length >= 2) {
        const suggestions = qaEngine.generateRoomSuggestions();
        // Update store with suggestions
        // This would be connected to the store's suggestion management
      }
    }
  }, [currentSession?.answers, qaEngine]);

  const handleAnswerQuestion = (value: any) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, value);
    }
  };

  const handleNext = () => {
    const nextQuestion = getNextQuestion();
    if (!nextQuestion && !isReviewMode) {
      // Move to review mode
      setIsReviewMode(true);
      
      // Generate final suggestions
      if (qaEngine && currentSession) {
        qaEngine.setAnswers(currentSession.answers);
        const suggestions = qaEngine.generateRoomSuggestions();
        // Update store with final suggestions
      }
    }
  };

  const handlePrevious = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else {
      goToPreviousQuestion();
    }
  };

  const handleComplete = () => {
    // Get the session result
    const result = getSessionResult();
    
    // Find and set the recommended template
    if (qaEngine) {
      const recommendedTemplateId = qaEngine.getRecommendedTemplate();
      if (recommendedTemplateId) {
        // This would load the template and apply the customizations
        // For now, redirect to the template customization flow
        router.push(`/templates/${recommendedTemplateId}/rooms`);
      }
    }
  };

  const calculateProgress = () => {
    if (!questionFlow) return 0;
    const totalQuestions = questionFlow.questions.filter(q => !q.dependsOn || answeredQuestions.includes(q.id)).length;
    const answered = answeredQuestions.length;
    return totalQuestions > 0 ? (answered / totalQuestions) * 100 : 0;
  };

  const getTotalSelectedTasks = () => {
    let count = 0;
    roomSuggestions.forEach(room => {
      if (room.isSelected) {
        count += room.suggestedTasks.filter(t => t.isSelected).length;
      }
    });
    count += customTasks.length;
    return count;
  };

  const getEstimatedTime = () => {
    if (!qaEngine || !roomSuggestions.length) return 0;
    return qaEngine.calculateEstimatedTime(roomSuggestions);
  };

  if (!currentSession || !questionFlow) {
    return (
      <PageWrapper>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Loading Q&A System...</h2>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {isReviewMode ? 'Review & Customize' : `Question ${answeredQuestions.length + 1}`}
              </span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          {/* Main Content */}
          {!isReviewMode ? (
            // Question Mode
            <Card className="p-6">
              {currentQuestion && (
                <QuestionRenderer
                  question={currentQuestion}
                  value={currentSession.answers[currentQuestion.id]}
                  onChange={handleAnswerQuestion}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  canGoBack={answeredQuestions.length > 0}
                  canGoNext={true}
                />
              )}
            </Card>
          ) : (
            // Review Mode
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Your Custom Checklist is Ready!</h2>
                    <p className="text-muted-foreground">
                      Based on your answers, we've prepared a customized checklist for you.
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <ListChecks className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tasks</p>
                      <p className="text-lg font-semibold">{getTotalSelectedTasks()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Time</p>
                      <p className="text-lg font-semibold">{getEstimatedTime()} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-lg font-semibold">
                        {Math.round(
                          roomSuggestions.reduce((acc, r) => acc + r.confidence, 0) / 
                          Math.max(roomSuggestions.length, 1) * 100
                        )}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Task Selection */}
              <TaskSelection
                roomSuggestions={roomSuggestions}
                onToggleRoom={toggleRoomSelection}
                onToggleTask={toggleTaskSelection}
                onEditTask={editTaskSuggestion}
                onAddCustomTask={addCustomTask}
                onRemoveCustomTask={removeCustomTask}
                customTasks={customTasks}
              />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  Back to Questions
                </Button>
                <Button
                  size="lg"
                  onClick={handleComplete}
                  className="flex-1"
                >
                  Finalize Checklist
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Intelligent Customization</p>
                <p className="mt-1">
                  Our Q&A system learns from your answers to suggest the most relevant tasks. 
                  You can always edit, add, or remove tasks to perfectly match your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}