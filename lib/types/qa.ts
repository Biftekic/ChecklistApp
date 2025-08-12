// Q&A System types for Interactive Customization

export type QuestionType = 
  | 'single-select' 
  | 'multi-select' 
  | 'number' 
  | 'text' 
  | 'boolean' 
  | 'scale'
  | 'room-selector'
  | 'task-selector';

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number | boolean;
  description?: string;
  icon?: string;
  followUpQuestions?: string[]; // IDs of questions to show if this option is selected
  suggestedTasks?: string[]; // Task IDs to suggest when this option is selected
  suggestedRooms?: string[]; // Room IDs to suggest when this option is selected
}

export interface Question {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  category: string;
  order: number;
  required?: boolean;
  dependsOn?: {
    questionId: string;
    expectedValue?: any;
    condition?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'notEmpty';
  };
  options?: QuestionOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: any;
  timestamp: Date;
}

export interface QASession {
  id: string;
  templateId?: string;
  startedAt: Date;
  completedAt?: Date;
  answers: Answer[];
  currentQuestionIndex: number;
  suggestedRooms: string[];
  suggestedTasks: Record<string, string[]>; // roomId -> taskIds
  customRequirements: string[];
  estimatedTime?: number;
  serviceType?: string;
}

export interface TaskSuggestion {
  taskId: string;
  roomId: string;
  confidence: number; // 0-1 score for how relevant this task is
  reason: string; // Why this task was suggested
  isSelected: boolean;
  isEdited?: boolean;
  editedContent?: Partial<{
    name: string;
    description: string;
    estimatedTime: number;
    frequency: string;
    priority: string;
  }>;
}

export interface RoomSuggestion {
  roomId: string;
  confidence: number;
  reason: string;
  isSelected: boolean;
  suggestedTasks: TaskSuggestion[];
}

export interface QAResult {
  sessionId: string;
  templateId: string;
  serviceProfile: {
    type: string;
    size: string;
    frequency: string;
    specialRequirements: string[];
  };
  suggestedRooms: RoomSuggestion[];
  totalEstimatedTime: number;
  customTasks: Array<{
    roomId: string;
    task: {
      name: string;
      description: string;
      estimatedTime: number;
      priority: string;
    };
  }>;
}

export interface ConditionalLogic {
  id: string;
  conditions: Array<{
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: any;
    joinOperator?: 'AND' | 'OR';
  }>;
  actions: Array<{
    type: 'show-question' | 'hide-question' | 'suggest-task' | 'suggest-room' | 'set-value';
    targetId: string;
    value?: any;
  }>;
}

export interface QuestionFlow {
  id: string;
  name: string;
  description: string;
  initialQuestionId: string;
  questions: Question[];
  conditionalLogic: ConditionalLogic[];
  completionCriteria?: {
    minQuestions?: number;
    requiredQuestions?: string[];
  };
}