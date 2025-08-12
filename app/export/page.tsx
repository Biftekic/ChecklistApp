'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileText,
  Table,
  Printer,
  Mail,
  Share2,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function ExportPage() {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCopy = (format: string) => {
    setCopiedFormat(format);
    // Simulate copy to clipboard
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional PDF with your branding',
      icon: FileText,
      action: () => {
        /* TODO: Implement PDF export */
      },
    },
    {
      id: 'csv',
      name: 'CSV File',
      description: 'Import into spreadsheets or databases',
      icon: Table,
      action: () => {
        /* TODO: Implement CSV export */
      },
    },
    {
      id: 'print',
      name: 'Print',
      description: 'Print-optimized layout',
      icon: Printer,
      action: () => window.print(),
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Send via email',
      icon: Mail,
      action: () => {
        /* TODO: Implement email sending */
      },
    },
  ];

  const integrations = [
    {
      name: 'Perfex CRM',
      description: 'Import directly to your CRM',
      connected: false,
    },
    {
      name: 'Google Sheets',
      description: 'Sync with Google Sheets',
      connected: false,
    },
    {
      name: 'Notion',
      description: 'Add to Notion workspace',
      connected: false,
    },
    {
      name: 'Trello',
      description: 'Create Trello cards',
      connected: false,
    },
  ];

  return (
    <PageWrapper>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Success Message */}
          <div className="mb-8 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Your checklist is ready!
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  Choose how you&apos;d like to export or share your customized checklist.
                </p>
              </div>
            </div>
          </div>

          {/* Checklist Preview */}
          <Card className="mb-8 overflow-hidden">
            <div className="border-b bg-muted/30 px-6 py-4">
              <h2 className="text-lg font-semibold">Checklist Preview</h2>
            </div>
            <div className="p-6">
              <h3 className="mb-4 text-xl font-bold">Office Cleaning Checklist</h3>
              <div className="space-y-3">
                {[
                  'Reception Area',
                  'Meeting Rooms',
                  'Workstations',
                  'Kitchen/Break Room',
                  'Restrooms',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded border-2 border-muted-foreground/30" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">... and 15 more items</p>
            </div>
          </Card>

          {/* Export Options */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Export Options</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={option.action}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-medium">{option.name}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Share Options */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Share</h2>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="text-sm font-mono">app.checklistapp.com/s/abc123xyz</span>
                <Button size="sm" variant="ghost" onClick={() => handleCopy('link')}>
                  {copiedFormat === 'link' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button size="sm" variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </Card>
          </div>

          {/* Integrations */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Integrations</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {integrations.map((integration) => (
                <Card key={integration.name} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button size="sm" variant={integration.connected ? 'secondary' : 'outline'}>
                      {integration.connected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Button variant="outline" size="lg">
              Edit Checklist
            </Button>
            <Button size="lg">Create Another</Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
