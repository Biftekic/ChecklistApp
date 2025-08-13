'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ChecklistPreview } from '@/components/checklist/checklist-preview';
import { ExportOptions } from '@/components/checklist/export-options';
import { ChecklistMetadata } from '@/components/checklist/checklist-metadata';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { useCustomizationStore } from '@/lib/stores/customization-store';
import { TemplateEngine } from '@/lib/services/template-engine';
import { GeneratedChecklist } from '@/lib/types/template';

import { ChecklistMetadataType } from '@/lib/types/checklist';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const {
    selectedTemplate,
    selectedRooms,
    selectedTasks,
    customTasks,
    editedTasks,
    setCurrentStep,
  } = useCustomizationStore();

  const [generatedChecklist, setGeneratedChecklist] = useState<GeneratedChecklist | null>(null);
  const [metadata, setMetadata] = useState<ChecklistMetadataType>({
    serviceType: 'regular',
    propertyType: 'apartment',
    includePhotos: false,
    rooms: [],
    customTasks: [],
    dateCreated: new Date(),
    lastModified: new Date(),
    clientName: '',
    location: '',
    serviceDate: new Date(),
    assignedStaff: [],
    notes: '',
  });
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    // Generate the checklist from the current state
    if (selectedTemplate) {
      const engine = new TemplateEngine();
      const checklist = engine.generateChecklist({
        selectedTemplate,
        selectedRooms,
        selectedTasks,
        customTasks,
        editedTasks,
      });
      setGeneratedChecklist(checklist);
    }
  }, [selectedTemplate, selectedRooms, selectedTasks, customTasks, editedTasks]);

  useEffect(() => {
    // Set the current step to review when this page loads
    setCurrentStep('review');
  }, [setCurrentStep]);

  const handleMetadataUpdate = (updatedMetadata: ChecklistMetadataType) => {
    setMetadata(updatedMetadata);
  };

  const handleEditClick = () => {
    router.push(`/templates/${params.id}/tasks`);
  };

  const handleBackClick = () => {
    router.push(`/templates/${params.id}/tasks`);
  };

  if (!generatedChecklist || !selectedTemplate) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold">No checklist found</h2>
            <p className="mb-4 text-muted-foreground">
              Please complete the template customization first.
            </p>
            <Button onClick={() => router.push('/templates')}>Go to Templates</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={`px-4 py-8 sm:px-6 sm:py-12 ${isPrintMode ? 'print:px-0' : ''}`}>
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBackClick}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Preview & Export</h1>
                  <p className="mt-1 text-muted-foreground">
                    Review your customized checklist and export in your preferred format
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEditClick}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Checklist
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Preview Section */}
            <div className="lg:col-span-2">
              {/* Metadata Form */}
              <div className="mb-8 print:hidden">
                <ChecklistMetadata metadata={metadata} onUpdate={handleMetadataUpdate} />
              </div>

              {/* Checklist Preview */}
              <ChecklistPreview
                checklist={generatedChecklist}
                template={selectedTemplate}
                metadata={metadata}
                isPrintMode={isPrintMode}
              />
            </div>

            {/* Export Options Sidebar */}
            <div className="print:hidden">
              <div className="sticky top-8">
                <ExportOptions
                  checklist={generatedChecklist}
                  metadata={metadata}
                  onPrintModeToggle={setIsPrintMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
