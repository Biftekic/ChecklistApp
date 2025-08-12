import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateService } from '../template-service';
import type { ChecklistTemplate, ServiceType, PropertyType } from '../../types/checklist';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    service = new TemplateService();
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const template = await service.createTemplate({
        name: 'Move-out Cleaning',
        description: 'Complete move-out checklist',
        serviceType: 'move_out',
        propertyType: 'apartment',
        defaultItems: [
          { text: 'Clean all surfaces', category: 'general', order: 1 },
          { text: 'Vacuum carpets', category: 'general', order: 2 }
        ]
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Move-out Cleaning');
      expect(template.defaultItems).toHaveLength(2);
      expect(template.isDefault).toBe(false);
    });
  });

  describe('getDefaultTemplates', () => {
    it('should return default templates for service and property type', async () => {
      const templates = await service.getDefaultTemplates('move_out', 'apartment');
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.serviceType).toBe('move_out');
        expect(template.propertyType).toBe('apartment');
        expect(template.isDefault).toBe(true);
      });
    });

    it('should return empty array for unknown combination', async () => {
      const templates = await service.getDefaultTemplates('move_out', 'warehouse');
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBe(0);
    });
  });

  describe('getTemplate', () => {
    it('should retrieve a template by id', async () => {
      const created = await service.createTemplate({
        name: 'Test Template',
        serviceType: 'regular',
        propertyType: 'house',
        defaultItems: []
      });

      const retrieved = await service.getTemplate(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Template');
    });

    it('should return undefined for non-existent template', async () => {
      const retrieved = await service.getTemplate('non-existent');
      
      expect(retrieved).toBeUndefined();
    });
  });

  describe('updateTemplate', () => {
    it('should update template properties', async () => {
      const template = await service.createTemplate({
        name: 'Original Name',
        serviceType: 'regular',
        propertyType: 'apartment',
        defaultItems: []
      });

      const updated = await service.updateTemplate(template.id, {
        name: 'Updated Name',
        description: 'New description'
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('New description');
    });

    it('should add items to template', async () => {
      const template = await service.createTemplate({
        name: 'Test',
        serviceType: 'regular',
        propertyType: 'apartment',
        defaultItems: []
      });

      const updated = await service.updateTemplate(template.id, {
        defaultItems: [
          { text: 'New task 1', category: 'general', order: 1 },
          { text: 'New task 2', category: 'general', order: 2 }
        ]
      });

      expect(updated?.defaultItems).toHaveLength(2);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const template = await service.createTemplate({
        name: 'To Delete',
        serviceType: 'regular',
        propertyType: 'apartment',
        defaultItems: []
      });

      const result = await service.deleteTemplate(template.id);
      
      expect(result).toBe(true);
      const retrieved = await service.getTemplate(template.id);
      expect(retrieved).toBeUndefined();
    });

    it('should not delete default templates', async () => {
      const templates = await service.getDefaultTemplates('move_out', 'apartment');
      if (templates.length > 0) {
        const result = await service.deleteTemplate(templates[0].id);
        
        expect(result).toBe(false);
        const retrieved = await service.getTemplate(templates[0].id);
        expect(retrieved).toBeDefined();
      }
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates including defaults', async () => {
      await service.createTemplate({
        name: 'Custom Template',
        serviceType: 'regular',
        propertyType: 'house',
        defaultItems: []
      });

      const templates = await service.getAllTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      
      const hasDefault = templates.some(t => t.isDefault);
      const hasCustom = templates.some(t => !t.isDefault);
      
      expect(hasDefault).toBe(true);
      expect(hasCustom).toBe(true);
    });
  });
});