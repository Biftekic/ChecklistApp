import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChecklistService } from '../checklist-service';
import type { Checklist, ChecklistItem, ChecklistTemplate } from '../../types/checklist';

describe('ChecklistService', () => {
  let service: ChecklistService;

  beforeEach(() => {
    service = new ChecklistService();
  });

  describe('createChecklist', () => {
    it('should create a new checklist from template', async () => {
      const template: ChecklistTemplate = {
        id: 'template-1',
        name: 'Move-out Template',
        serviceType: 'move_out',
        propertyType: 'apartment',
        defaultItems: [
          { text: 'Clean windows', category: 'general', order: 1 },
          { text: 'Vacuum carpets', category: 'general', order: 2 }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };

      const checklist = await service.createChecklistFromTemplate(template);

      expect(checklist.id).toBeDefined();
      expect(checklist.name).toBe('Move-out Template');
      expect(checklist.items).toHaveLength(2);
      expect(checklist.items[0].text).toBe('Clean windows');
      expect(checklist.items[0].completed).toBe(false);
    });

    it('should create an empty checklist', async () => {
      const checklist = await service.createEmptyChecklist(
        'Custom Checklist',
        'regular',
        'house'
      );

      expect(checklist.id).toBeDefined();
      expect(checklist.name).toBe('Custom Checklist');
      expect(checklist.items).toHaveLength(0);
      expect(checklist.serviceType).toBe('regular');
      expect(checklist.propertyType).toBe('house');
    });
  });

  describe('updateChecklistItem', () => {
    it('should toggle item completion status', async () => {
      const checklist = await service.createEmptyChecklist('Test', 'regular', 'apartment');
      const item = await service.addItemToChecklist(checklist.id, {
        text: 'Test task',
        category: 'general'
      });

      const updated = await service.toggleItemCompletion(checklist.id, item.id);

      expect(updated.completed).toBe(true);
    });

    it('should update item text', async () => {
      const checklist = await service.createEmptyChecklist('Test', 'regular', 'apartment');
      const item = await service.addItemToChecklist(checklist.id, {
        text: 'Old text',
        category: 'general'
      });

      const updated = await service.updateItemText(checklist.id, item.id, 'New text');

      expect(updated.text).toBe('New text');
    });
  });

  describe('addItemToChecklist', () => {
    it('should add a new item to checklist', async () => {
      const checklist = await service.createEmptyChecklist('Test', 'regular', 'apartment');
      
      const item = await service.addItemToChecklist(checklist.id, {
        text: 'New task',
        category: 'kitchen'
      });

      expect(item.id).toBeDefined();
      expect(item.text).toBe('New task');
      expect(item.category).toBe('kitchen');
      expect(item.completed).toBe(false);
    });

    it('should add custom item with all properties', async () => {
      const checklist = await service.createEmptyChecklist('Test', 'regular', 'apartment');
      
      const item = await service.addItemToChecklist(checklist.id, {
        text: 'Custom task',
        category: 'bedroom',
        notes: 'Special instructions',
        timeEstimate: 45
      });

      expect(item.notes).toBe('Special instructions');
      expect(item.timeEstimate).toBe(45);
    });
  });

  describe('removeItemFromChecklist', () => {
    it('should remove an item from checklist', async () => {
      const checklist = await service.createEmptyChecklist('Test', 'regular', 'apartment');
      const item = await service.addItemToChecklist(checklist.id, {
        text: 'Task to remove',
        category: 'general'
      });

      const result = await service.removeItemFromChecklist(checklist.id, item.id);

      expect(result).toBe(true);
      const updatedChecklist = await service.getChecklist(checklist.id);
      expect(updatedChecklist?.items).toHaveLength(0);
    });
  });

  describe('getChecklist', () => {
    it('should retrieve a checklist by id', async () => {
      const created = await service.createEmptyChecklist('Test', 'regular', 'apartment');
      
      const retrieved = await service.getChecklist(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test');
    });

    it('should return undefined for non-existent checklist', async () => {
      const retrieved = await service.getChecklist('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllChecklists', () => {
    it('should retrieve all checklists', async () => {
      await service.createEmptyChecklist('Checklist 1', 'regular', 'apartment');
      await service.createEmptyChecklist('Checklist 2', 'move_out', 'house');

      const checklists = await service.getAllChecklists();

      expect(checklists.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('deleteChecklist', () => {
    it('should delete a checklist', async () => {
      const checklist = await service.createEmptyChecklist('To Delete', 'regular', 'apartment');

      const result = await service.deleteChecklist(checklist.id);

      expect(result).toBe(true);
      const retrieved = await service.getChecklist(checklist.id);
      expect(retrieved).toBeUndefined();
    });
  });
});
