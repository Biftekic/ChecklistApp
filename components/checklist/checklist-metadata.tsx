'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChecklistMetadataType } from '@/lib/types/checklist';
import { X, Plus, Save } from 'lucide-react';

interface ChecklistMetadataProps {
  metadata: ChecklistMetadataType;
  onUpdate: (metadata: ChecklistMetadataType) => void;
}

export function ChecklistMetadata({ metadata, onUpdate }: ChecklistMetadataProps) {
  const [localMetadata, setLocalMetadata] = useState(metadata);
  const [newStaffMember, setNewStaffMember] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof ChecklistMetadataType, value: any) => {
    setLocalMetadata((prev: ChecklistMetadataType) => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleAddStaff = () => {
    if (newStaffMember.trim()) {
      const updatedStaff = [...localMetadata.assignedStaff, newStaffMember.trim()];
      handleInputChange('assignedStaff', updatedStaff);
      setNewStaffMember('');
    }
  };

  const handleRemoveStaff = (index: number) => {
    const updatedStaff = localMetadata.assignedStaff.filter((_: string, i: number) => i !== index);
    handleInputChange('assignedStaff', updatedStaff);
  };

  const handleSave = () => {
    onUpdate(localMetadata);
    setHasChanges(false);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Details</h3>
        {hasChanges && (
          <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={localMetadata.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Enter client or company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Service Location</Label>
            <Input
              id="location"
              value={localMetadata.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter address or location name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceDate">Service Date</Label>
            <Input
              id="serviceDate"
              type="date"
              value={localMetadata.serviceDate}
              onChange={(e) => handleInputChange('serviceDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedStaff">Assigned Staff</Label>
            <div className="flex gap-2">
              <Input
                id="assignedStaff"
                value={newStaffMember}
                onChange={(e) => setNewStaffMember(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStaff();
                  }
                }}
                placeholder="Add staff member"
              />
              <Button
                onClick={handleAddStaff}
                size="icon"
                variant="outline"
                disabled={!newStaffMember.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {localMetadata.assignedStaff.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {localMetadata.assignedStaff.map((staff: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {staff}
                    <button
                      onClick={() => handleRemoveStaff(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={localMetadata.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter any special instructions or notes for this service"
            rows={3}
          />
        </div>
      </div>
    </Card>
  );
}