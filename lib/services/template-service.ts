import type { 
  ChecklistTemplate,
  ServiceType,
  PropertyType,
  ChecklistItem
} from '../types/checklist';

interface CreateTemplateData {
  name: string;
  description?: string;
  serviceType: ServiceType;
  propertyType: PropertyType;
  defaultItems: Omit<ChecklistItem, 'id' | 'completed'>[];
}

interface UpdateTemplateData {
  name?: string;
  description?: string;
  defaultItems?: Omit<ChecklistItem, 'id' | 'completed'>[];
}

export class TemplateService {
  private templates: Map<string, ChecklistTemplate> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeDefaultTemplates();
  }

  private generateId(): string {
    return `template-${this.nextId++}`;
  }

  private initializeDefaultTemplates(): void {
    // Move-out apartment template
    this.templates.set('default-moveout-apartment', {
      id: 'default-moveout-apartment',
      name: 'Standard Move-out Cleaning - Apartment',
      description: 'Complete checklist for apartment move-out cleaning',
      serviceType: 'move_out',
      propertyType: 'apartment',
      defaultItems: [
        { text: 'Remove all personal belongings', category: 'general', order: 1 },
        { text: 'Clean all kitchen appliances inside and out', category: 'kitchen', order: 2 },
        { text: 'Clean kitchen cabinets and drawers', category: 'kitchen', order: 3 },
        { text: 'Clean bathroom fixtures and tiles', category: 'bathroom', order: 4 },
        { text: 'Vacuum all carpets and rugs', category: 'general', order: 5 },
        { text: 'Mop all hard floors', category: 'general', order: 6 },
        { text: 'Clean all windows and window sills', category: 'general', order: 7 },
        { text: 'Wipe down all walls and baseboards', category: 'general', order: 8 },
        { text: 'Clean light fixtures and ceiling fans', category: 'general', order: 9 },
        { text: 'Empty and clean all closets', category: 'general', order: 10 }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    });

    // Deep clean house template
    this.templates.set('default-deepclean-house', {
      id: 'default-deepclean-house',
      name: 'Deep Cleaning - House',
      description: 'Comprehensive deep cleaning checklist for houses',
      serviceType: 'deep_clean',
      propertyType: 'house',
      defaultItems: [
        { text: 'Deep clean all carpets', category: 'general', order: 1 },
        { text: 'Clean inside oven and refrigerator', category: 'kitchen', order: 2 },
        { text: 'Scrub bathroom grout', category: 'bathroom', order: 3 },
        { text: 'Dust and clean all vents', category: 'general', order: 4 },
        { text: 'Clean garage floor', category: 'garage', order: 5 },
        { text: 'Power wash exterior surfaces', category: 'exterior', order: 6 }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    });

    // Regular cleaning apartment template
    this.templates.set('default-regular-apartment', {
      id: 'default-regular-apartment',
      name: 'Regular Cleaning - Apartment',
      description: 'Standard regular cleaning checklist for apartments',
      serviceType: 'regular',
      propertyType: 'apartment',
      defaultItems: [
        { text: 'Dust all surfaces', category: 'general', order: 1 },
        { text: 'Vacuum floors', category: 'general', order: 2 },
        { text: 'Clean kitchen counters', category: 'kitchen', order: 3 },
        { text: 'Clean bathroom', category: 'bathroom', order: 4 },
        { text: 'Take out trash', category: 'general', order: 5 },
        { text: 'Make beds', category: 'bedroom', order: 6 }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    });
  }

  async createTemplate(data: CreateTemplateData): Promise<ChecklistTemplate> {
    const template: ChecklistTemplate = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      serviceType: data.serviceType,
      propertyType: data.propertyType,
      defaultItems: data.defaultItems,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    };

    this.templates.set(template.id, template);
    return template;
  }

  async getDefaultTemplates(
    serviceType: ServiceType,
    propertyType: PropertyType
  ): Promise<ChecklistTemplate[]> {
    const templates = Array.from(this.templates.values());
    return templates.filter(
      t => t.isDefault && 
      t.serviceType === serviceType && 
      t.propertyType === propertyType
    );
  }

  async getTemplate(id: string): Promise<ChecklistTemplate | undefined> {
    return this.templates.get(id);
  }

  async updateTemplate(
    id: string,
    data: UpdateTemplateData
  ): Promise<ChecklistTemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) {
      return undefined;
    }

    if (data.name !== undefined) {
      template.name = data.name;
    }
    if (data.description !== undefined) {
      template.description = data.description;
    }
    if (data.defaultItems !== undefined) {
      template.defaultItems = data.defaultItems;
    }

    template.updatedAt = new Date();
    return template;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template || template.isDefault) {
      return false;
    }

    return this.templates.delete(id);
  }

  async getAllTemplates(): Promise<ChecklistTemplate[]> {
    return Array.from(this.templates.values());
  }
}