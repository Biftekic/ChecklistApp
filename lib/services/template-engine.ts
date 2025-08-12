import type { Template, ChecklistItem } from '@/lib/types/checklist';
import { v4 as uuidv4 } from 'uuid';

interface IndustryTemplate extends Template {
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
  private validServiceTypes = [
    'standard-cleaning',
    'deep-cleaning',
    'move-in-cleaning',
    'move-out-cleaning',
    'post-construction'
  ];

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
      const template = {
        id: uuidv4(),
        name: `${capitalizedIndustry} Cleaning Template`,
        industry,
        serviceType: 'standard-cleaning',
        propertyType: industry === 'residential' ? 'residential' : 'commercial',
        items: this.getDefaultItemsForIndustry(industry),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      } as IndustryTemplate;
      
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
    template: Template,
    options: CustomizationOptions
  ): Promise<Template> {
    const customized = { ...template };
    let items = [...template.items];

    // Update existing items
    if (options.updateItems) {
      items = items.map(item => {
        const update = options.updateItems?.find(u => u.id === item.id);
        if (update) {
          return { ...item, ...update };
        }
        return item;
      });
    }

    // Add new items
    if (options.addItems) {
      const newItems = options.addItems.map((item, index) => ({
        id: uuidv4(),
        text: item.text || '',
        category: item.category || 'general',
        completed: false,
        order: items.length + index + 1,
        estimatedTime: item.estimatedTime,
        ...item
      } as ChecklistItem));
      items = [...items, ...newItems];
    }

    // Remove items
    if (options.removeItemIds && options.removeItemIds.length > 0) {
      items = items.filter(item => !options.removeItemIds?.includes(item.id));
    }

    // Reorder items
    if (options.reorderItems) {
      const reorderedItems: ChecklistItem[] = [];
      options.reorderItems.forEach(id => {
        const item = items.find(i => i.id === id);
        if (item) {
          reorderedItems.push(item);
        }
      });
      // Add any items not in the reorder list at the end
      items.forEach(item => {
        if (!options.reorderItems?.includes(item.id)) {
          reorderedItems.push(item);
        }
      });
      items = reorderedItems;
    }

    customized.items = items;
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
    if (!template.items || template.items.length === 0) {
      errors.push('Template must have at least one task');
    }

    // Validate property type
    if (!template.propertyType) {
      errors.push('Property type is required');
    }

    // Validate items structure
    if (template.items) {
      template.items.forEach((item: any, index: number) => {
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

  private getDefaultItemsForIndustry(industry: string): ChecklistItem[] {
    const baseItems: ChecklistItem[] = [
      { id: uuidv4(), text: 'Check and restock supplies', category: 'preparation', completed: false, order: 1 },
      { id: uuidv4(), text: 'Dust surfaces', category: 'general', completed: false, order: 2 },
      { id: uuidv4(), text: 'Vacuum floors', category: 'floors', completed: false, order: 3 },
      { id: uuidv4(), text: 'Mop floors', category: 'floors', completed: false, order: 4 },
      { id: uuidv4(), text: 'Empty trash bins', category: 'general', completed: false, order: 5 },
      { id: uuidv4(), text: 'Clean windows', category: 'general', completed: false, order: 6 }
    ];

    // Add industry-specific items
    switch (industry) {
      case 'residential':
        baseItems.push(
          { id: uuidv4(), text: 'Clean kitchen counters', category: 'kitchen', completed: false, order: 7 },
          { id: uuidv4(), text: 'Clean bathroom fixtures', category: 'bathroom', completed: false, order: 8 }
        );
        break;
      case 'hotel':
        baseItems.push(
          { id: uuidv4(), text: 'Change bed linens', category: 'bedroom', completed: false, order: 7 },
          { id: uuidv4(), text: 'Restock minibar', category: 'amenities', completed: false, order: 8 }
        );
        break;
      case 'restaurant':
        baseItems.push(
          { id: uuidv4(), text: 'Sanitize tables', category: 'dining', completed: false, order: 7 },
          { id: uuidv4(), text: 'Deep clean kitchen equipment', category: 'kitchen', completed: false, order: 8 }
        );
        break;
      case 'healthcare':
        baseItems.push(
          { id: uuidv4(), text: 'Disinfect medical equipment', category: 'medical', completed: false, order: 7 },
          { id: uuidv4(), text: 'Sanitize waiting area', category: 'public', completed: false, order: 8 }
        );
        break;
    }

    return baseItems;
  }

  async mergeTemplateWithQA(
    template: Template,
    qaResponses: Record<string, any>
  ): Promise<Template> {
    // If no QA responses, return original template
    if (!qaResponses || Object.keys(qaResponses).length === 0) {
      return template;
    }

    let mergedTemplate = { ...template };
    let items = [...template.items];
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
            id: uuidv4(),
            text: `Clean ${roomCategory}`,
            category: room,
            completed: false,
            order: nextOrder++
          });
          
          // Add specific tasks based on room type
          if (room === 'bedroom') {
            items.push({
              id: uuidv4(),
              text: 'Make bed and change linens',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              id: uuidv4(),
              text: 'Dust furniture and nightstands',
              category: room,
              completed: false,
              order: nextOrder++
            });
          } else if (room === 'bathroom') {
            items.push({
              id: uuidv4(),
              text: 'Clean toilet and sanitize',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              id: uuidv4(),
              text: 'Scrub shower/tub',
              category: room,
              completed: false,
              order: nextOrder++
            });
          } else if (room === 'kitchen') {
            items.push({
              id: uuidv4(),
              text: 'Clean countertops and sink',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              id: uuidv4(),
              text: 'Wipe down appliances',
              category: room,
              completed: false,
              order: nextOrder++
            });
          } else if (room === 'living_room') {
            items.push({
              id: uuidv4(),
              text: 'Vacuum upholstery',
              category: room,
              completed: false,
              order: nextOrder++
            });
            items.push({
              id: uuidv4(),
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
        id: uuidv4(),
        text: 'Remove pet hair from furniture',
        category: 'general',
        completed: false,
        order: nextOrder++
      });
      items.push({
        id: uuidv4(),
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
          id: uuidv4(),
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
        id: uuidv4(),
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
            id: uuidv4(),
            text: `Clean bedroom #${i}`,
            category: 'bedroom',
            completed: false,
            order: nextOrder++
          });
        }
      }
    }

    mergedTemplate.items = items;
    mergedTemplate.updatedAt = new Date();
    
    return mergedTemplate;
  }
}