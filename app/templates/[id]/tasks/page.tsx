'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { TaskSelector } from '@/components/task-selector';
import { TaskEditModal } from '@/components/task-edit-modal';
import { AddCustomTaskModal } from '@/components/add-custom-task-modal';
import { useCustomizationStore } from '@/lib/stores/customization-store';
import templates from '@/lib/data/templates';
import { ArrowLeft, ArrowRight, Home, Clock, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { ProgressStepper, MobileProgressStepper } from '@/components/progress-stepper';
import { useViewport } from '@/hooks/use-viewport';
import { TemplateTask } from '@/lib/types/template';
import { Card, CardContent } from '@/components/ui/card';

export default function TaskSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const { isMobile } = useViewport();
  
  const [editingTask, setEditingTask] = useState<{task: TemplateTask, roomId: string} | null>(null);
  const [addingTaskToRoom, setAddingTaskToRoom] = useState<string | null>(null);
  
  const {
    selectedTemplate,
    setSelectedTemplate,
    selectedRooms,
    selectedTasks,
    customTasks,
    editedTasks,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    getTotalEstimatedTime,
    getTotalSelectedTasks,
    editTask,
    addCustomTask,
    removeCustomTask,
    editCustomTask
  } = useCustomizationStore();
  
  // Load template if not already loaded
  useEffect(() => {
    if (!selectedTemplate || selectedTemplate.id !== templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setCurrentStep('tasks');
      } else {
        router.push('/templates');
      }
    } else {
      setCurrentStep('tasks');
    }
  }, [templateId, selectedTemplate, setSelectedTemplate, setCurrentStep, router]);
  
  // Redirect if no rooms selected
  useEffect(() => {
    if (selectedTemplate && selectedRooms.length === 0) {
      router.push(`/templates/\${templateId}/rooms`);
    }
  }, [selectedRooms, selectedTemplate, templateId, router]);
  
  const handleContinue = () => {
    const totalTasks = getTotalSelectedTasks();
    if (totalTasks === 0) {
      alert('Please select at least one task to continue.');
      return;
    }
    goToNextStep();
    router.push(`/templates/\${templateId}/preview`);
  };
  
  const handleBack = () => {
    goToPreviousStep();
    router.push(`/templates/\${templateId}/rooms`);
  };
  
  const handleEditTask = (task: TemplateTask, roomId: string) => {
    setEditingTask({ task, roomId });
  };
  
  const handleSaveTaskEdit = (updates: Partial<TemplateTask>) => {
    if (editingTask) {
      if (editingTask.task.isCustom) {
        editCustomTask(editingTask.roomId, editingTask.task.id, updates);
      } else {
        editTask(editingTask.task.id, updates);
      }
      setEditingTask(null);
    }
  };
  
  const handleAddCustomTask = (task: TemplateTask) => {
    if (addingTaskToRoom) {
      addCustomTask(addingTaskToRoom, task);
      setAddingTaskToRoom(null);
    }
  };
  
  const handleDeleteCustomTask = (roomId: string, taskId: string) => {
    removeCustomTask(roomId, taskId);
  };
  
  const totalEstimatedTime = getTotalEstimatedTime();
  const totalSelectedTasks = getTotalSelectedTasks();
  
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
        <div className="mx-auto max-w-7xl">
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
                currentStep="tasks"
                completedSteps={['template', 'rooms']}
              />
            ) : (
              <ProgressStepper
                steps={[
                  { id: 'template', label: 'Template', description: 'Choose base template' },
                  { id: 'rooms', label: 'Rooms', description: 'Select areas to clean' },
                  { id: 'tasks', label: 'Tasks', description: 'Customize tasks' },
                  { id: 'review', label: 'Review', description: 'Finalize checklist' }
                ]}
                currentStep="tasks"
                completedSteps={['template', 'rooms']}
              />
            )}
          </div>
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
              Customize Your Tasks
            </h1>
            <p className="text-lg text-muted-foreground">
              Select and customize tasks for each room in your checklist
            </p>
          </div>
          
          {/* Summary Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Selected Rooms</div>
                  <div className="text-2xl font-bold">{selectedRooms.length}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                  <div className="text-2xl font-bold">{totalSelectedTasks}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estimated Time</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Task selector */}
          <TaskSelector 
            onEditTask={handleEditTask}
            onAddCustomTask={setAddingTaskToRoom}
            onDeleteCustomTask={handleDeleteCustomTask}
          />
          
          {/* Edit Task Modal */}
          {editingTask && (
            <TaskEditModal
              task={editingTask.task}
              isOpen={!!editingTask}
              onClose={() => setEditingTask(null)}
              onSave={handleSaveTaskEdit}
            />
          )}
          
          {/* Add Custom Task Modal */}
          {addingTaskToRoom && (
            <AddCustomTaskModal
              roomId={addingTaskToRoom}
              isOpen={!!addingTaskToRoom}
              onClose={() => setAddingTaskToRoom(null)}
              onAdd={handleAddCustomTask}
            />
          )}
          
          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rooms
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
                disabled={totalSelectedTasks === 0}
                className="sm:w-auto"
              >
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
