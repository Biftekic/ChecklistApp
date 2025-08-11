'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bed, 
  Users, 
  ChefHat, 
  Car,
  Building,
  Dumbbell,
  Bath,
  Home,
  Clock,
  CheckCircle2,
  Square,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ListTodo
} from 'lucide-react';
import { TemplateCategory, TemplateRoom } from '@/lib/types/template';
import { useCustomizationStore } from '@/lib/stores/customization-store';
import { cn } from '@/lib/utils';

// Icon mapping for room categories
const categoryIcons: Record<string, any> = {
  'guest-accommodations': Bed,
  'public-areas': Users,
  'food-service': ChefHat,
  'parking-areas': Car,
  'back-of-house': Building,
  'recreational-facilities': Dumbbell,
  'clinical-areas': Bath,
  'patient-areas': Home,
  'sales-floor': Building,
  'warehouse': Building,
  'default': Home
};

interface RoomCardProps {
  room: TemplateRoom;
  isSelected: boolean;
  onToggle: () => void;
  selectedTaskCount: number;
}

function RoomCard({ room, isSelected, onToggle, selectedTaskCount }: RoomCardProps) {
  const totalTasks = room.tasks.length;
  const totalTime = room.tasks.reduce((acc, task) => acc + task.estimatedTime, 0);
  
  return (
    <Card 
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onToggle}
    >
      <div className="p-4">
        {/* Checkbox indicator */}
        <div className="absolute right-3 top-3">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        
        {/* Room info */}
        <h4 className="mb-2 pr-8 font-semibold">{room.name}</h4>
        
        {/* Stats */}
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            <span>
              {isSelected ? `${selectedTaskCount}/${totalTasks}` : totalTasks} tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>~{Math.round(totalTime)} min</span>
          </div>
        </div>
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Selected
          </div>
        )}
      </div>
    </Card>
  );
}

interface CategorySectionProps {
  category: TemplateCategory;
  selectedRooms: string[];
  selectedTasks: Record<string, string[]>;
  onToggleRoom: (roomId: string) => void;
  onToggleCategory: () => void;
}

function CategorySection({ 
  category, 
  selectedRooms, 
  selectedTasks,
  onToggleRoom,
  onToggleCategory 
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = categoryIcons[category.id] || categoryIcons.default;
  
  const categoryRoomIds = category.rooms.map(r => r.id);
  const selectedCount = categoryRoomIds.filter(id => selectedRooms.includes(id)).length;
  const isFullySelected = selectedCount === category.rooms.length && category.rooms.length > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < category.rooms.length;
  
  return (
    <div className="space-y-3">
      {/* Category header */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {category.description} • {selectedCount}/{category.rooms.length} rooms selected
            </p>
          </div>
        </button>
        
        <Button
          size="sm"
          variant={isFullySelected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCategory();
          }}
          className="ml-2"
        >
          {isFullySelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      {/* Room cards */}
      {isExpanded && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {category.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={selectedRooms.includes(room.id)}
              onToggle={() => onToggleRoom(room.id)}
              selectedTaskCount={selectedTasks[room.id]?.length || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RoomSelector() {
  const {
    selectedTemplate,
    selectedRooms,
    selectedTasks,
    toggleRoom,
    selectAllRooms,
    deselectAllRooms,
    selectRoomsByCategory,
    deselectRoomsByCategory,
    getTotalEstimatedTime,
    getTotalSelectedTasks
  } = useCustomizationStore();
  
  if (!selectedTemplate) {
    return (
      <div className="text-center text-muted-foreground">
        No template selected. Please go back and select a template.
      </div>
    );
  }
  
  const totalRooms = selectedTemplate.categories.reduce(
    (acc, cat) => acc + cat.rooms.length, 
    0
  );
  
  const handleToggleCategory = (categoryId: string) => {
    const category = selectedTemplate.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const categoryRoomIds = category.rooms.map(r => r.id);
    const selectedCount = categoryRoomIds.filter(id => selectedRooms.includes(id)).length;
    
    if (selectedCount === category.rooms.length) {
      deselectRoomsByCategory(categoryId);
    } else {
      selectRoomsByCategory(categoryId);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="rounded-lg bg-muted/30 p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Selected Rooms:</span>{' '}
            <span className="font-semibold">{selectedRooms.length}/{totalRooms}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Tasks:</span>{' '}
            <span className="font-semibold">{getTotalSelectedTasks()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Estimated Time:</span>{' '}
            <span className="font-semibold">
              {Math.floor(getTotalEstimatedTime() / 60)}h {getTotalEstimatedTime() % 60}min
            </span>
          </div>
        </div>
      </div>
      
      {/* Global actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectAllRooms}
          disabled={selectedRooms.length === totalRooms}
        >
          Select All Rooms
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deselectAllRooms}
          disabled={selectedRooms.length === 0}
        >
          Deselect All
        </Button>
      </div>
      
      {/* Categories and rooms */}
      <div className="space-y-6">
        {selectedTemplate.categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            selectedRooms={selectedRooms}
            selectedTasks={selectedTasks}
            onToggleRoom={toggleRoom}
            onToggleCategory={() => handleToggleCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
}