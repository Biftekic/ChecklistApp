'use client';

import { useState, useEffect } from 'react';
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

interface TaskEditModalProps {
  task: TemplateTask;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<TemplateTask>) => void;
}

export function TaskEditModal({ task, isOpen, onClose, onSave }: TaskEditModalProps) {
  const [editedTask, setEditedTask] = useState<TemplateTask>(task);
  const [supplyInput, setSupplyInput] = useState('');
  
  useEffect(() => {
    setEditedTask(task);
  }, [task]);
  
  const handleSave = () => {
    onSave(editedTask);
  };
  
  const addSupply = () => {
    if (supplyInput.trim()) {
      setEditedTask({
        ...editedTask,
        supplies: [...(editedTask.supplies || []), supplyInput.trim()]
      });
      setSupplyInput('');
    }
  };
  
  const removeSupply = (index: number) => {
    setEditedTask({
      ...editedTask,
      supplies: editedTask.supplies?.filter((_, i) => i !== index)
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Customize this task for your specific needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
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
                value={editedTask.estimatedTime}
                onChange={(e) => setEditedTask({ 
                  ...editedTask, 
                  estimatedTime: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={editedTask.priority || 'medium'}
                onValueChange={(value) => setEditedTask({ 
                  ...editedTask, 
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
            {editedTask.supplies && editedTask.supplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {editedTask.supplies.map((supply, index) => (
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
              value={editedTask.notes || ''}
              onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
