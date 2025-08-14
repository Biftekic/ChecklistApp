import type { ChecklistTemplate, ChecklistItem, ServiceType, PropertyType } from '@/lib/types/checklist';
import { randomUUID as uuidv4 } from 'crypto';

interface IndustryTemplate extends ChecklistTemplate {
  industry: string;
}

interface CustomizationOptions {
  addItems?: Partial<ChecklistItem>[];
  removeItemIds?: string[];
  updateItems?: Partial<ChecklistItem & { id: string }>[];
  reorderItems?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TemplateEngine {
  private templates: Map<string, IndustryTemplate> = new Map();
  private validServiceTypes: string[] = [
    'move_in',
    'move_out',
    'deep_clean',
    'regular',
    'post_construction',
    'airbnb'
  ,'standard-cleaning'];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Initialize with default templates
  }

  async loadIndustryTemplates(): Promise<IndustryTemplate[]> {
    const industries = [
      'residential',
      'commercial',
      'hotel',
      'healthcare',
      'restaurant',
      'retail',
      'office',
      'education',
      'fitness',
      'spa',
      'dental',
      'medical',
      'warehouse',
      'industrial',
      'vacation-rental'
    ];

    const templates: IndustryTemplate[] = [];

    industries.forEach((industry) => {
      const capitalizedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);
      const template: IndustryTemplate = {
        id: uuidv4(),
        name: `${capitalizedIndustry} Cleaning Template`,
        industry,
        serviceType: industry === 'residential' ? 'standard-cleaning' as ServiceType : 'regular' as ServiceType,
        propertyType: (industry === 'residential' ? 'apartment' : 'office') as PropertyType,
        defaultItems: this.getDefaultItemsForIndustry(industry),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };
      
      templates.push(template);
      this.templates.set(template.id, template);
    });

    return templates;
  }

  async loadTemplatesByIndustry(industry: string): Promise<IndustryTemplate[]> {
    const allTemplates = await this.loadIndustryTemplates();
    return allTemplates.filter(template => template.industry === industry);
  }

  async customizeTemplate(
    template: ChecklistTemplate,
    options: CustomizationOptions
  ): Promise<ChecklistTemplate> {
    const customized = { ...template };
    let items = [...(template.defaultItems || [])];

    // Update existing items
    if (options.updateItems) {
      items = items.map(item => {
        const update = options.updateItems?.find(u => u.id === (item as any).id);
        if (update) {
          return { ...item, ...update };
        }
        return item;
      });
    }

    // Add new items
    if (options.addItems) {
      const newItems = options.addItems.map((item, index) => ({
        text: item.text || '',
        category: item.category || 'general',
        completed: false,
        order: items.length + index + 1,
        estimatedTime: item.estimatedTime,
        ...item
      } as Omit<ChecklistItem, "id" | "completed">));
      items = [...items, ...newItems];
    }

    // Remove items
    if (options.removeItemIds && options.removeItemIds.length > 0) {
      items = items.filter(item => !options.removeItemIds?.includes((item as any).id));
    }

    // Reorder items
    if (options.reorderItems) {
      const reorderedItems: Omit<ChecklistItem, "id" | "completed">[] = [];
      options.reorderItems.forEach(id => {
        const item = items.find(i => (i as any).id === id);
        if (item) {
          reorderedItems.push(item);
        }
      });
      // Add any items not in the reorder list at the end
      items.forEach(item => {
        if (!options.reorderItems?.includes((item as any).id)) {
          reorderedItems.push(item);
        }
      });
      items = reorderedItems;
    }

    customized.defaultItems = items;
    customized.updatedAt = new Date();
    return customized;
  }

  validateTemplate(template: any): ValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    // Validate service type
    if (!template.serviceType || !this.validServiceTypes.includes(template.serviceType)) {
      errors.push('Invalid service type');
    }

    // Check for at least one task
    if (!template.defaultItems || template.defaultItems.length === 0) {
      errors.push('Template must have at least one task');
    }

    // Validate property type
    if (!template.propertyType) {
      errors.push('Property type is required');
    }

    // Validate items structure
    if (template.defaultItems) {
      template.defaultItems.forEach((item: any, index: number) => {
        if (!item.text || item.text.trim() === '') {
          errors.push(`Task ${index + 1} must have text`);
        }
        if (!item.category) {
          errors.push(`Task ${index + 1} must have a category`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getDefaultItemsForIndustry(industry: string): Omit<ChecklistItem, "id" | "completed">[] {
    const baseItems: Omit<ChecklistItem, "id" | "completed">[] = [
      { text: 'Check and restock supplies', category: 'preparation', order: 1 },
      { text: 'Dust surfaces', category: 'general', order: 2 },
      { text: 'Vacuum floors', category: 'floors', order: 3 },
      { text: 'Mop floors', category: 'floors', order: 4 },
      { text: 'Empty trash bins', category: 'general', order: 5 },
      { text: 'Clean windows', category: 'general', order: 6 }
    ];

    // Add industry-specific items
    switch (industry) {
      case 'residential':
        baseItems.push(
          { text: 'Clean kitchen counters', category: 'kitchen', order: 7 },
          { text: 'Clean bathroom fixtures', category: 'bathroom', order: 8 }
        );
        break;
      case 'hotel':
        baseItems.push(
          { text: 'Change bed linens', category: 'bedroom', order: 7 },
          { text: 'Restock minibar', category: 'amenities', order: 8 }
        );
        break;
      case 'restaurant':
        baseItems.push(
          { text: 'Sanitize tables', category: 'dining', order: 7 },
          { text: 'Deep clean kitchen equipment', category: 'kitchen', order: 8 }
        );
        break;
      case 'healthcare':
        baseItems.push(
          { text: 'Disinfect medical equipment', category: 'medical', order: 7 },
          { text: 'Sanitize waiting area', category: 'public', order: 8 }
        );
        break;
    }

    return baseItems;
  }

  async mergeTemplateWithQA(
    template: ChecklistTemplate,
    qaResponses: Record<string, any>
  ): Promise<ChecklistTemplate> {
    // If no QA responses, return original template
    if (!qaResponses || Object.keys(qaResponses).length === 0) {
      return template;
    }

    let mergedTemplate = { ...template };
    let items = [...(template.defaultItems || [])];
    let nextOrder = Math.max(...items.map(i => i.order || 0), 0) + 1;

    // Handle room-specific tasks
    if (qaResponses.rooms && Array.isArray(qaResponses.rooms)) {
      for (const room of qaResponses.rooms) {
        const roomCategory = room.replace('_', ' ');
        
        // Add basic room tasks if not already present
        const hasRoomTasks = items.some(item => 
          item.category === room || item.category === roomCategory
        );
        
        if (!hasRoomTasks) {
          items.push({
            text: `Clean ${roomCategory}`,
            category: room,
            completed: false,
            order: nextOrder++
          });
          
          // Add specific tasks based on room type
          if (room === 'bedroom') {
            items.push({
              text: 'Make bed and change linens',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              text: 'Dust furniture and nightstands',
              category: room,
              completed: false,
              order: nextOrder++
            });
          } else if (room === 'bathroom') {
            items.push({
              text: 'Clean toilet and sanitize',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              text: 'Scrub shower/tub',
              category: room,
              completed: false,
              order: nextOrder++
            });
          } else if (room === 'kitchen') {
            items.push({
              text: 'Clean countertops and sink',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              text: 'Wipe down appliances',
              category: room,
              completed: false,
              order: nextOrder++
            });
          } else if (room === 'living_room') {
            items.push({
              text: 'Vacuum upholstery',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              text: 'Dust entertainment center',
              category: room,
              completed: false,
              order: nextOrder++
            });
          }
        }
      }
    }

    // Handle pet-friendly cleaning
    if (qaResponses.petFriendly === true) {
      items.push({
        text: 'Remove pet hair from furniture',
        category: 'general',
        completed: false,
        order: nextOrder++
      });
      items.push({
        text: 'Clean pet areas and bowls',
        category: 'general',
        completed: false,
        order: nextOrder++
      });
    }

    // Handle deep clean areas
    if (qaResponses.deepCleanAreas && Array.isArray(qaResponses.deepCleanAreas)) {
      for (const area of qaResponses.deepCleanAreas) {
        items.push({
          text: `Deep clean ${area}`,
          category: area.toLowerCase(),
          completed: false,
          order: nextOrder++
        });
      }
    }

    // Handle special requests
    if (qaResponses.specialRequests && typeof qaResponses.specialRequests === 'string') {
      items.push({
        text: `Special: ${qaResponses.specialRequests}`,
        category: 'special',
        completed: false,
        order: nextOrder++
      });
    }

    // Handle priority-based reordering
    if (qaResponses.priority) {
      const priorityCategory = qaResponses.priority.toLowerCase();
      
      // Separate priority items from others
      const priorityItems = items.filter(item => 
        item.category === priorityCategory
      );
      const otherItems = items.filter(item => 
        item.category !== priorityCategory
      );
      
      // Reorder with priority items first
      let reorderedItems = [...priorityItems, ...otherItems];
      reorderedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      
      items = reorderedItems;
    }

    // Handle focus areas (similar to priority but doesn't reorder)
    if (qaResponses.focusAreas && Array.isArray(qaResponses.focusAreas)) {
      // Just ensures these areas have tasks, already handled by rooms logic
    }

    // Handle number of bedrooms (add multiple bedroom task sets)
    if (qaResponses.numberOfBedrooms && typeof qaResponses.numberOfBedrooms === 'number') {
      const existingBedroomTasks = items.filter(item => item.category === 'bedroom');
      
      // If we need more bedroom tasks for multiple bedrooms
      if (qaResponses.numberOfBedrooms > 1 && existingBedroomTasks.length < qaResponses.numberOfBedrooms * 2) {
        for (let i = 2; i <= qaResponses.numberOfBedrooms; i++) {
          items.push({
            text: `Clean bedroom #${i}`,
            category: 'bedroom',
            completed: false,
            order: nextOrder++
          });
        }
      }
    }

    mergedTemplate.defaultItems = items;
    mergedTemplate.updatedAt = new Date();
    
    return mergedTemplate;
  }

  exportChecklist(checklist: any, format: 'csv' | 'json' | 'pdf' = 'csv'): string {
    if (format === 'csv') {
      let csv = 'Room,Task,Priority,Status,Notes\n';
      
      if (checklist.rooms) {
        checklist.rooms.forEach((room: any) => {
          const tasks = [
            ...(room.tasks || []).filter((t: any) => t.isSelected),
            ...(room.customTasks || [])
          ];
          
          tasks.forEach((task: any) => {
            csv += `"${room.name}","${task.name}","${task.priority || 'normal'}","pending","${task.notes || ''}"\n`;
          });
        });
      }
      
      return csv;
    }
    
    return JSON.stringify(checklist, null, 2);
  }

  generateChecklist(options: any): any {
    // Generate a checklist from the provided options
    const checklist = {
      id: uuidv4(),
      name: options.selectedTemplate?.name || 'Custom Checklist',
      rooms: options.selectedRooms || [],
      selectedTasks: 0,
      customTasks: options.customTasks || [],
      estimatedTime: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Calculate total tasks and estimated time
    let totalTasks = 0;
    let totalTime = 0;
    
    checklist.rooms.forEach((room: any) => {
      const tasks = [
        ...(room.tasks || []).filter((t: any) => t.isSelected),
        ...(room.customTasks || [])
      ];
      
      totalTasks += tasks.length;
      tasks.forEach((task: any) => {
        totalTime += task.estimatedTime || 30; // Default 30 minutes per task
      });
    });
    
    checklist.selectedTasks = totalTasks;
    checklist.estimatedTime = totalTime;
    
    return checklist;
  }
}
