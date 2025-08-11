import Dexie, { Table } from 'dexie';
import { ChecklistMetadataType } from '@/lib/types/checklist';
import { GeneratedChecklist, ChecklistTemplate } from '@/lib/types/template';

export interface SavedChecklist {
  id?: number;
  name: string;
  template: ChecklistTemplate;
  checklist: GeneratedChecklist;
  metadata: ChecklistMetadataType;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'completed' | 'exported';
}

export interface ChecklistDraft {
  id?: number;
  templateId: string;
  selectedRooms: string[];
  selectedTasks: Record<string, string[]>;
  customTasks: Record<string, any[]>;
  editedTasks: Record<string, any>;
  metadata: Partial<ChecklistMetadataType>;
  createdAt: Date;
  updatedAt: Date;
}

export class ChecklistDatabase extends Dexie {
  savedChecklists!: Table<SavedChecklist>;
  drafts!: Table<ChecklistDraft>;

  constructor() {
    super('ChecklistAppDB');
    
    this.version(1).stores({
      savedChecklists: '++id, name, status, createdAt, updatedAt',
      drafts: '++id, templateId, createdAt, updatedAt'
    });
  }
}

export const db = new ChecklistDatabase();

// Helper functions for database operations
export const checklistDb = {
  // Save a completed checklist
  async saveChecklist(checklist: Omit<SavedChecklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await db.savedChecklists.add({
      ...checklist,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  // Get all saved checklists
  async getChecklists(): Promise<SavedChecklist[]> {
    return await db.savedChecklists.toArray();
  },

  // Get a specific checklist
  async getChecklist(id: number): Promise<SavedChecklist | undefined> {
    return await db.savedChecklists.get(id);
  },

  // Update a checklist
  async updateChecklist(id: number, updates: Partial<SavedChecklist>): Promise<number> {
    return await db.savedChecklists.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete a checklist
  async deleteChecklist(id: number): Promise<void> {
    await db.savedChecklists.delete(id);
  },

  // Save a draft
  async saveDraft(draft: Omit<ChecklistDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await db.drafts.add({
      ...draft,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  // Get all drafts
  async getDrafts(): Promise<ChecklistDraft[]> {
    return await db.drafts.toArray();
  },

  // Get a specific draft
  async getDraft(id: number): Promise<ChecklistDraft | undefined> {
    return await db.drafts.get(id);
  },

  // Update a draft
  async updateDraft(id: number, updates: Partial<ChecklistDraft>): Promise<number> {
    return await db.drafts.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete a draft
  async deleteDraft(id: number): Promise<void> {
    await db.drafts.delete(id);
  },

  // Clear all data (useful for testing)
  async clearAll(): Promise<void> {
    await db.savedChecklists.clear();
    await db.drafts.clear();
  }
};
