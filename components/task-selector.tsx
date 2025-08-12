'use client';

import { useState } from 'react';
import { useCustomizationStore } from '@/lib/stores/customization-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateTask } from '@/lib/types/template';

interface TaskSelectorProps {
  onEditTask: (task: TemplateTask, roomId: string) => void;
  onAddCustomTask: (roomId: string) => void;
  onDeleteCustomTask: (roomId: string, taskId: string) => void;
}

export function TaskSelector({ 
  onEditTask, 
  onAddCustomTask, 
  onDeleteCustomTask 
}: TaskSelectorProps) {
  const {
    selectedTemplate,
    selectedRooms,
    selectedTasks,
    customTasks,
    editedTasks,
    toggleTask,
    selectAllTasksInRoom,
    deselectAllTasksInRoom
  } = useCustomizationStore();
  
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(selectedRooms));
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!selectedTemplate) return null;
  
  const toggleRoomExpansion = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };
  
  const getTaskWithEdits = (task: TemplateTask): TemplateTask => {
    const edits = editedTasks[task.id];
    return edits ? { ...task, ...edits } : task;
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };
  
  const filteredRooms = selectedTemplate.categories
    .flatMap(cat => cat.rooms)
    .filter(room => selectedRooms.includes(room.id));
  
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {/* Rooms with tasks */}
      {filteredRooms.map(room => {
        const roomTasks = room.tasks.filter(task => 
          searchQuery === '' || 
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const roomCustomTasks = customTasks[room.id] || [];
        const selectedTaskIds = selectedTasks[room.id] || [];
        const isExpanded = expandedRooms.has(room.id);
        const allTasksSelected = roomTasks.length > 0 && 
          roomTasks.every(task => selectedTaskIds.includes(task.id));
        const someTasksSelected = roomTasks.some(task => selectedTaskIds.includes(task.id));
        
        return (
          <Card key={room.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRoomExpansion(room.id)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge variant="secondary">
                    {selectedTaskIds.length + roomCustomTasks.length} tasks
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allTasksSelected}
                    indeterminate={!allTasksSelected && someTasksSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllTasksInRoom(room.id);
                      } else {
                        deselectAllTasksInRoom(room.id);
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Select all</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddCustomTask(room.id)}
                    className="ml-2"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {/* Standard tasks */}
                  {roomTasks.map(task => {
                    const taskWithEdits = getTaskWithEdits(task);
                    const isSelected = selectedTaskIds.includes(task.id);
                    const hasEdits = !!editedTasks[task.id];
                    
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                          isSelected ? "bg-accent/50" : "bg-background hover:bg-accent/20"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTask(room.id, task.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-medium",
                                  hasEdits && "text-primary"
                                )}>
                                  {taskWithEdits.name}
                                </span>
                                {hasEdits && (
                                  <Badge variant="outline" className="text-xs">
                                    Edited
                                  </Badge>
                                )}
                              </div>
                              {taskWithEdits.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {taskWithEdits.description}
                                </p>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditTask(taskWithEdits, room.id)}
                              className="ml-2"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {taskWithEdits.estimatedTime} min
                            </span>
                            {taskWithEdits.priority && (
                              <span className={cn(
                                "flex items-center gap-1",
                                getPriorityColor(taskWithEdits.priority)
                              )}>
                                <AlertCircle className="h-3 w-3" />
                                {taskWithEdits.priority}
                              </span>
                            )}
                            {taskWithEdits.supplies && taskWithEdits.supplies.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {taskWithEdits.supplies.length} supplies
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Custom tasks */}
                  {roomCustomTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
                    >
                      <Checkbox
                        checked={true}
                        disabled
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{task.name}</span>
                              <Badge className="text-xs">Custom</Badge>
                            </div>
                            {task.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditTask(task, room.id)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteCustomTask(room.id, task.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedTime} min
                          </span>
                          {task.priority && (
                            <span className={cn(
                              "flex items-center gap-1",
                              getPriorityColor(task.priority)
                            )}>
                              <AlertCircle className="h-3 w-3" />
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
