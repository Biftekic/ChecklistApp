import { describe, it, expect } from 'vitest';
import type { 
  Checklist, 
  ChecklistItem, 
  ChecklistTemplate,
  ServiceType,
  PropertyType,
  Room
} from '../checklist';

describe('Checklist Domain Models', () => {
  describe('ChecklistItem', () => {
    it('should have required properties', () => {
      const item: ChecklistItem = {
        id: 'item-1',
        text: 'Clean windows',
        completed: false,
        category: 'cleaning',
        order: 1
      };

      expect(item.id).toBeDefined();
      expect(item.text).toBeDefined();
      expect(item.completed).toBeDefined();
      expect(item.category).toBeDefined();
    });
  });

  describe('Checklist', () => {
    it('should have required properties', () => {
      const checklist: Checklist = {
        id: 'checklist-1',
        name: 'Move-out Cleaning',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        serviceType: 'move_out',
        propertyType: 'apartment'
      };

      expect(checklist.id).toBeDefined();
      expect(checklist.name).toBeDefined();
      expect(checklist.items).toBeDefined();
      expect(checklist.createdAt).toBeInstanceOf(Date);
      expect(checklist.updatedAt).toBeInstanceOf(Date);
    });
  });
});
