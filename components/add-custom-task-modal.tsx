'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { TemplateTask } from '@/lib/types/template';

interface AddCustomTaskModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: TemplateTask) => void;
}

export function AddCustomTaskModal({ roomId, isOpen, onClose, onAdd }: AddCustomTaskModalProps) {
  const [newTask, setNewTask] = useState<Partial<TemplateTask>>({
    name: '',
    description: '',
    estimatedTime: 15,
    priority: 'medium',
    supplies: [],
    notes: '',
    isCustom: true
  });
  const [supplyInput, setSupplyInput] = useState('');
  
  const handleAdd = () => {
    if (newTask.name?.trim()) {
      const task: TemplateTask = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newTask.name.trim(),
        description: newTask.description || undefined,
        estimatedTime: newTask.estimatedTime || 15,
        priority: newTask.priority as 'low' | 'medium' | 'high' | undefined,
        supplies: newTask.supplies || [],
        notes: newTask.notes || undefined,
        isCustom: true
      };
      onAdd(task);
      resetForm();
    }
  };
  
  const resetForm = () => {
    setNewTask({
      name: '',
      description: '',
      estimatedTime: 15,
      priority: 'medium',
      supplies: [],
      notes: '',
      isCustom: true
    });
    setSupplyInput('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const addSupply = () => {
    if (supplyInput.trim()) {
      setNewTask({
        ...newTask,
        supplies: [...(newTask.supplies || []), supplyInput.trim()]
      });
      setSupplyInput('');
    }
  };
  
  const removeSupply = (index: number) => {
    setNewTask({
      ...newTask,
      supplies: newTask.supplies?.filter((_, i) => i !== index)
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Custom Task</DialogTitle>
          <DialogDescription>
            Create a new task for this room
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Task Name *</Label>
            <Input
              id="name"
              value={newTask.name || ''}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder="e.g., Clean light fixtures"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newTask.description || ''}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Optional detailed instructions..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="time">Estimated Time (minutes)</Label>
              <Input
                id="time"
                type="number"
                min="1"
                value={newTask.estimatedTime || 15}
                onChange={(e) => setNewTask({ 
                  ...newTask, 
                  estimatedTime: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority || 'medium'}
                onValueChange={(value) => setNewTask({ 
                  ...newTask, 
                  priority: value as 'low' | 'medium' | 'high' 
                })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Required Supplies</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a supply item..."
                value={supplyInput}
                onChange={(e) => setSupplyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSupply())}
              />
              <Button type="button" variant="outline" onClick={addSupply}>
                Add
              </Button>
            </div>
            {newTask.supplies && newTask.supplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newTask.supplies.map((supply, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {supply}
                    <button
                      onClick={() => removeSupply(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={newTask.notes || ''}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              placeholder="Any special instructions or reminders..."
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd}
            disabled={!newTask.name?.trim()}
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
