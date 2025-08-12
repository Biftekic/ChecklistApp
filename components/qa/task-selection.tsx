'use client';

import { useState } from 'react';
import { RoomSuggestion, TaskSuggestion } from '@/lib/types/qa';
import { TemplateTask } from '@/lib/types/template';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit2,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TaskSelectionProps {
  roomSuggestions: RoomSuggestion[];
  onToggleRoom: (roomId: string) => void;
  onToggleTask: (roomId: string, taskId: string) => void;
  onEditTask: (roomId: string, taskId: string, edits: Partial<TemplateTask>) => void;
  onAddCustomTask: (roomId: string, task: Partial<TemplateTask>) => void;
  onRemoveCustomTask: (roomId: string, taskIndex: number) => void;
  customTasks: Array<{ roomId: string; task: Partial<TemplateTask> }>;
}

export function TaskSelection({
  roomSuggestions,
  onToggleRoom,
  onToggleTask,
  onEditTask,
  onAddCustomTask,
  onRemoveCustomTask,
  customTasks,
}: TaskSelectionProps) {
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TemplateTask>>({});
  const [addingTaskToRoom, setAddingTaskToRoom] = useState<string | null>(null);
  const [newTaskForm, setNewTaskForm] = useState<Partial<TemplateTask>>({
    name: '',
    description: '',
    estimatedTime: 5,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const toggleRoomExpansion = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const startEditingTask = (task: TaskSuggestion) => {
    setEditingTask(`${task.roomId}-${task.taskId}`);
    const content = task.editedContent || {};
    setEditForm({
      ...content,
      frequency: content.frequency as "daily" | "weekly" | "monthly" | "as-needed" | undefined,
      priority: content.priority as "low" | "medium" | "high" | undefined,
    });
  };

  const saveTaskEdit = (roomId: string, taskId: string) => {
    onEditTask(roomId, taskId, editForm);
    setEditingTask(null);
    setEditForm({});
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  const startAddingTask = (roomId: string) => {
    setAddingTaskToRoom(roomId);
    setNewTaskForm({
      name: '',
      description: '',
      estimatedTime: 5,
      priority: 'medium',
    });
  };

  const saveNewTask = () => {
    if (addingTaskToRoom && newTaskForm.name) {
      onAddCustomTask(addingTaskToRoom, {
        ...newTaskForm,
        id: `custom-${Date.now()}`,
        isCustom: true,
      });
      setAddingTaskToRoom(null);
      setNewTaskForm({
        name: '',
        description: '',
        estimatedTime: 5,
        priority: 'medium',
      });
    }
  };

  const cancelNewTask = () => {
    setAddingTaskToRoom(null);
    setNewTaskForm({
      name: '',
      description: '',
      estimatedTime: 5,
      priority: 'medium' as 'low' | 'medium' | 'high',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-blue-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Highly Recommended';
    if (confidence >= 0.6) return 'Recommended';
    if (confidence >= 0.4) return 'Optional';
    return 'Low Priority';
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Select Tasks for Your Checklist</h3>
        <p className="text-sm text-muted-foreground">
          We've suggested tasks based on your requirements. Select what you need and customize as desired.
        </p>
      </div>

      {roomSuggestions.map((room) => {
        const isExpanded = expandedRooms.has(room.roomId);
        const roomCustomTasks = customTasks.filter(ct => ct.roomId === room.roomId);
        const selectedTaskCount = room.suggestedTasks.filter(t => t.isSelected).length + roomCustomTasks.length;
        const totalTaskCount = room.suggestedTasks.length + roomCustomTasks.length;

        return (
          <Card key={room.roomId} className="overflow-hidden">
            {/* Room Header */}
            <div
              className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
              onClick={() => toggleRoomExpansion(room.roomId)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={room.isSelected}
                  onCheckedChange={() => onToggleRoom(room.roomId)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <h4 className="font-medium">{room.roomId}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={getConfidenceColor(room.confidence)}>
                      {getConfidenceLabel(room.confidence)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {selectedTaskCount} of {totalTaskCount} tasks selected
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getConfidenceColor(room.confidence)}>
                  {Math.round(room.confidence * 100)}% match
                </Badge>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>

            {/* Room Tasks */}
            {isExpanded && (
              <div className="border-t p-4">
                <div className="space-y-3">
                  {/* Suggested Tasks */}
                  {room.suggestedTasks.map((task) => {
                    const isEditing = editingTask === `${task.roomId}-${task.taskId}`;

                    return (
                      <div
                        key={task.taskId}
                        className={`rounded-lg border p-3 ${
                          task.isSelected ? 'bg-primary/5' : 'bg-background'
                        }`}
                      >
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-3">
                            <Input
                              value={editForm.name || task.taskId}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="Task name"
                            />
                            <Textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Task description"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={editForm.estimatedTime || 5}
                                onChange={(e) => setEditForm({ ...editForm, estimatedTime: Number(e.target.value) })}
                                placeholder="Time (min)"
                                className="w-24"
                              />
                              <select
                                value={editForm.priority || 'medium'}
                                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                className="rounded-md border px-3 py-2"
                              >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveTaskEdit(task.roomId, task.taskId)}
                              >
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelTaskEdit}
                              >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task.isSelected}
                              onCheckedChange={() => onToggleTask(task.roomId, task.taskId)}
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">
                                    {task.editedContent?.name || task.taskId}
                                  </p>
                                  {(task.editedContent?.description || task.reason) && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {task.editedContent?.description || task.reason}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-3 text-sm">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.editedContent?.estimatedTime || 5} min
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {task.editedContent?.priority || 'medium'}
                                    </Badge>
                                    {task.isEdited && (
                                      <Badge variant="secondary" className="text-xs">
                                        Edited
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingTask(task)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Custom Tasks */}
                  {roomCustomTasks.map((customTask, index) => (
                    <div
                      key={`custom-${index}`}
                      className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={true} disabled />
                        <div className="flex-1">
                          <p className="font-medium">{customTask.task.name}</p>
                          {customTask.task.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {customTask.task.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {customTask.task.estimatedTime} min
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Custom Task
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveCustomTask(room.roomId, index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Task Form */}
                  {addingTaskToRoom === room.roomId ? (
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <div className="space-y-3">
                        <Input
                          value={newTaskForm.name}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, name: e.target.value })}
                          placeholder="Task name"
                          autoFocus
                        />
                        <Textarea
                          value={newTaskForm.description}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                          placeholder="Task description (optional)"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={newTaskForm.estimatedTime}
                            onChange={(e) => setNewTaskForm({ ...newTaskForm, estimatedTime: Number(e.target.value) })}
                            placeholder="Time (min)"
                            className="w-24"
                          />
                          <select
                            value={newTaskForm.priority}
                            onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                            className="rounded-md border px-3 py-2"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveNewTask} disabled={!newTaskForm.name}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Add Task
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelNewTask}>
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => startAddingTask(room.roomId)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom Task
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}