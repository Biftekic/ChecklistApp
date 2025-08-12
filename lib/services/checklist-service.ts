import type { 
  Checklist, 
  ChecklistItem, 
  ChecklistTemplate,
  ServiceType,
  PropertyType 
} from '../types/checklist';

export class ChecklistService {
  private checklists: Map<string, Checklist> = new Map();
  private nextId = 1;

  private generateId(): string {
    return `checklist-${this.nextId++}`;
  }

  private generateItemId(): string {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createChecklistFromTemplate(template: ChecklistTemplate): Promise<Checklist> {
    const checklist: Checklist = {
      id: this.generateId(),
      name: template.name,
      items: template.defaultItems.map((item, index) => ({
        ...item,
        id: this.generateItemId(),
        completed: false,
        order: item.order || index + 1
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      serviceType: template.serviceType,
      propertyType: template.propertyType,
      templateId: template.id
    };

    this.checklists.set(checklist.id, checklist);
    return checklist;
  }

  async createEmptyChecklist(
    name: string,
    serviceType: ServiceType,
    propertyType: PropertyType
  ): Promise<Checklist> {
    const checklist: Checklist = {
      id: this.generateId(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      serviceType,
      propertyType
    };

    this.checklists.set(checklist.id, checklist);
    return checklist;
  }

  async addItemToChecklist(
    checklistId: string,
    itemData: Omit<ChecklistItem, 'id' | 'completed' | 'order'>
  ): Promise<ChecklistItem> {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) {
      throw new Error('Checklist not found');
    }

    const item: ChecklistItem = {
      ...itemData,
      id: this.generateItemId(),
      completed: false,
      order: checklist.items.length + 1
    };

    checklist.items.push(item);
    checklist.updatedAt = new Date();
    return item;
  }

  async toggleItemCompletion(
    checklistId: string,
    itemId: string
  ): Promise<ChecklistItem> {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) {
      throw new Error('Checklist not found');
    }

    const item = checklist.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    item.completed = !item.completed;
    checklist.updatedAt = new Date();
    return item;
  }

  async updateItemText(
    checklistId: string,
    itemId: string,
    newText: string
  ): Promise<ChecklistItem> {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) {
      throw new Error('Checklist not found');
    }

    const item = checklist.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    item.text = newText;
    checklist.updatedAt = new Date();
    return item;
  }

  async removeItemFromChecklist(
    checklistId: string,
    itemId: string
  ): Promise<boolean> {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) {
      return false;
    }

    const initialLength = checklist.items.length;
    checklist.items = checklist.items.filter(i => i.id !== itemId);
    
    if (checklist.items.length < initialLength) {
      checklist.updatedAt = new Date();
      return true;
    }
    
    return false;
  }

  async getChecklist(id: string): Promise<Checklist | undefined> {
    return this.checklists.get(id);
  }

  async getAllChecklists(): Promise<Checklist[]> {
    return Array.from(this.checklists.values());
  }

  async deleteChecklist(id: string): Promise<boolean> {
    return this.checklists.delete(id);
  }
}