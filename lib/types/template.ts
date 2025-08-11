// Template system types for ChecklistApp

export interface TemplateTask {
  id: string;
  name: string;
  description?: string;
  estimatedTime: number; // in minutes
  frequency?: "daily" | "weekly" | "monthly" | "as-needed";
  priority?: "low" | "medium" | "high";
  supplies?: string[];
  notes?: string;
  isCustom?: boolean;
  isSelected?: boolean;
}

export interface TemplateRoom {
  id: string;
  name: string;
  type: string;
  tasks: TemplateTask[];
  isSelected?: boolean;
  customTasks?: TemplateTask[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rooms: TemplateRoom[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  industry: Industry;
  description: string;
  categories: TemplateCategory[];
  estimatedTotalTime?: number;
  tags?: string[];
  compliance?: ComplianceStandard[];
  equipment?: Equipment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Industry {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ComplianceStandard {
  id: string;
  name: string;
  requirement: string;
  category?: string;
}

export interface Equipment {
  id: string;
  name: string;
  quantity?: number;
  notes?: string;
}

export interface GeneratedChecklist {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  rooms: TemplateRoom[];
  totalTasks: number;
  selectedTasks: number;
  estimatedTime: number;
  customTasks: TemplateTask[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface TemplateSelectionState {
  selectedTemplate: ChecklistTemplate | null;
  selectedRooms: string[];
  selectedTasks: Record<string, string[]>; // roomId -> taskIds[]
  customTasks: Record<string, TemplateTask[]>; // roomId -> custom tasks
  editedTasks: Record<string, Partial<TemplateTask>>; // taskId -> edits
}
