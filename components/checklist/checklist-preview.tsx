'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GeneratedChecklist, ChecklistTemplate } from '@/lib/types/template';
import { ChecklistMetadataType } from '@/lib/types/checklist';
import { Clock, MapPin, Calendar, Users, FileText, Hash, Sparkles } from 'lucide-react';interface ChecklistPreviewProps {
  checklist: GeneratedChecklist;
  template: ChecklistTemplate;
  metadata: ChecklistMetadataType;
  isPrintMode: boolean;
}

export function ChecklistPreview({
  checklist,
  template,
  metadata,
  isPrintMode
}: ChecklistPreviewProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  return (
    <Card className={`overflow-hidden ${isPrintMode ? 'shadow-none border-0' : ''}`}>
      {/* Header Section */}
      <div className="border-b bg-muted/30 px-6 py-4 print:bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{template.name}</h2>
            <p className="mt-1 text-muted-foreground">{template.description}</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {template.industry.name}
          </Badge>
        </div>
      </div>      {/* Metadata Section */}
      {(metadata.clientName || metadata.location || metadata.serviceDate || metadata.assignedStaff.length > 0) && (
        <div className="border-b bg-muted/10 px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metadata.clientName && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium">{metadata.clientName}</p>
                </div>
              </div>
            )}
            {metadata.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{metadata.location}</p>
                </div>
              </div>
            )}
            {metadata.serviceDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Service Date</p>
                  <p className="font-medium">{new Date(metadata.serviceDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}            {metadata.assignedStaff.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Staff</p>
                  <p className="font-medium">{metadata.assignedStaff.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
          {metadata.notes && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm">{metadata.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-b px-6 py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{checklist.selectedTasks}</p>
          </div>          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Est. Time</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatTime(checklist.estimatedTime)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Rooms</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{checklist.rooms.length}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Custom Tasks</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{checklist.customTasks.length}</p>
          </div>
        </div>
      </div>      {/* Rooms and Tasks */}
      <div className="p-6">
        <div className="space-y-6">
          {checklist.rooms.map((room, roomIndex) => {
            const allTasks = [
              ...room.tasks.filter(t => t.isSelected),
              ...(room.customTasks || [])
            ];

            if (allTasks.length === 0) return null;

            return (
              <div key={room.id} className={`${roomIndex > 0 ? 'break-inside-avoid' : ''}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{room.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {allTasks.length} {allTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <div className="space-y-2">
                  {allTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox 
                        className="mt-0.5 print:border-2" 
                        disabled={!isPrintMode}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">                          <div className="flex-1">
                            <p className="font-medium">
                              {task.isCustom && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  Custom
                                </Badge>
                              )}
                              {task.name}
                            </p>
                            {task.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            {task.priority && (
                              <Badge 
                                variant={
                                  task.priority === 'high' ? 'destructive' :
                                  task.priority === 'medium' ? 'default' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {task.priority}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(task.estimatedTime)}
                            </span>
                          </div>
                        </div>                        {task.supplies && task.supplies.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Supplies needed:</p>
                            <p className="text-sm">{task.supplies.join(', ')}</p>
                          </div>
                        )}
                        {task.notes && (
                          <p className="mt-2 text-sm italic text-muted-foreground">
                            Note: {task.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer for print */}
      {isPrintMode && (
        <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground print:block hidden">
          <p>Generated on {new Date().toLocaleDateString()} • ChecklistApp</p>
        </div>
      )}
    </Card>
  );
}