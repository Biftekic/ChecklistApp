'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GeneratedChecklist } from '@/lib/types/template';
import { ChecklistMetadataType } from '@/app/templates/[id]/preview/page';
import { templateEngine } from '@/lib/services/template-engine';
import { 
  Download, 
  FileText, 
  Table, 
  Printer,
  Copy,
  Share2,
  CheckCircle2,
  FileJson,
  Eye,
  EyeOff
} from 'lucide-react';

interface ExportOptionsProps {
  checklist: GeneratedChecklist;
  metadata: ChecklistMetadataType;
  onPrintModeToggle: (enabled: boolean) => void;
}

export function ExportOptions({ 
  checklist, 
  metadata, 
  onPrintModeToggle 
}: ExportOptionsProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isPrintPreview, setIsPrintPreview] = useState(false);  const handleExportJSON = () => {
    const exportData = {
      ...checklist,
      metadata,
      exportDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-${checklist.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = templateEngine.exportChecklist(checklist, 'csv');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-${checklist.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = formatChecklistAsText();
      await navigator.clipboard.writeText(text);
      setCopiedFormat('clipboard');
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatChecklistAsText = () => {
    let text = `${checklist.name}\n`;
    text += `${'='.repeat(50)}\n\n`;
    
    if (metadata.clientName) text += `Client: ${metadata.clientName}\n`;
    if (metadata.location) text += `Location: ${metadata.location}\n`;
    if (metadata.serviceDate) text += `Service Date: ${new Date(metadata.serviceDate).toLocaleDateString()}\n`;
    if (metadata.assignedStaff.length > 0) text += `Staff: ${metadata.assignedStaff.join(', ')}\n`;
    if (metadata.notes) text += `Notes: ${metadata.notes}\n`;
    
    text += `\nTotal Tasks: ${checklist.selectedTasks}\n`;
    text += `Estimated Time: ${Math.floor(checklist.estimatedTime / 60)}h ${checklist.estimatedTime % 60}m\n`;
    text += `\n${'='.repeat(50)}\n\n`;    checklist.rooms.forEach(room => {
      const allTasks = [
        ...room.tasks.filter(t => t.isSelected),
        ...(room.customTasks || [])
      ];
      
      if (allTasks.length === 0) return;
      
      text += `\n${room.name}\n`;
      text += `${'-'.repeat(room.name.length)}\n`;
      
      allTasks.forEach(task => {
        text += `[ ] ${task.name}`;
        if (task.estimatedTime) text += ` (${task.estimatedTime} min)`;
        if (task.priority) text += ` [${task.priority}]`;
        if (task.isCustom) text += ` [CUSTOM]`;
        text += '\n';
        if (task.description) text += `    ${task.description}\n`;
        if (task.supplies && task.supplies.length > 0) {
          text += `    Supplies: ${task.supplies.join(', ')}\n`;
        }
        if (task.notes) text += `    Note: ${task.notes}\n`;
      });
    });
    
    return text;
  };  const togglePrintPreview = () => {
    const newValue = !isPrintPreview;
    setIsPrintPreview(newValue);
    onPrintModeToggle(newValue);
  };

  const exportOptions = [
    {
      id: 'json',
      name: 'Export as JSON',
      description: 'Save and load later',
      icon: FileJson,
      action: handleExportJSON,
    },
    {
      id: 'csv',
      name: 'Export as CSV',
      description: 'Open in Excel or Google Sheets',
      icon: Table,
      action: handleExportCSV,
    },
    {
      id: 'print',
      name: 'Print / PDF',
      description: 'Print or save as PDF',
      icon: Printer,
      action: handlePrint,
    },
    {
      id: 'copy',
      name: 'Copy to Clipboard',
      description: 'Paste anywhere as text',
      icon: Copy,
      action: handleCopyToClipboard,
    },
  ];  return (
    <div className="space-y-6">
      {/* Print Preview Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Print Preview</h4>
            <p className="text-sm text-muted-foreground">
              Toggle print-friendly layout
            </p>
          </div>
          <Button
            onClick={togglePrintPreview}
            variant={isPrintPreview ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isPrintPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Export Options</h3>
        <div className="space-y-2">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isCopied = copiedFormat === option.id;
            
            return (
              <Button
                key={option.id}
                onClick={option.action}
                variant="outline"
                className="w-full justify-start"
                disabled={isCopied}
              >
                <div className="flex items-center gap-3">
                  {isCopied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <div className="text-left">
                    <p className="font-medium">{option.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isCopied ? 'Copied!' : option.description}
                    </p>
                  </div>
                </div>
                {!isCopied && <Download className="ml-auto h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Share Options */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Share</h3>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Shareable Link</p>
            <p className="mt-1 font-mono text-sm">
              app.checklistapp.com/s/{checklist.id.slice(0, 8)}
            </p>
          </div>
          <Button variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Generate Share Link
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-muted/50 p-4">
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          Checklist Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Tasks:</span>
            <span className="font-medium">{checklist.selectedTasks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rooms:</span>
            <span className="font-medium">{checklist.rooms.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Time:</span>
            <span className="font-medium">
              {Math.floor(checklist.estimatedTime / 60)}h {checklist.estimatedTime % 60}m
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custom Tasks:</span>
            <span className="font-medium">{checklist.customTasks.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}