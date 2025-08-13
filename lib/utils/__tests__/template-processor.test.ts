import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateProcessor } from '../template-processor';

describe('TemplateProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = TemplateProcessor.generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = TemplateProcessor.generateId();
      const id2 = TemplateProcessor.generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('processTemplate', () => {
    it('should add ID if missing', () => {
      const template = { title: 'Test', sections: [] };
      const result = TemplateProcessor.processTemplate(template);
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should preserve existing ID', () => {
      const template = { id: 'existing-id', title: 'Test', sections: [] };
      const result = TemplateProcessor.processTemplate(template);
      expect(result.id).toBe('existing-id');
    });

    it('should process sections', () => {
      const template = {
        title: 'Test',
        sections: [
          { title: 'Section 1' },
          { title: 'Section 2' }
        ]
      };
      const result = TemplateProcessor.processTemplate(template);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].id).toBeDefined();
      expect(result.sections[1].id).toBeDefined();
    });

    it('should add timestamps', () => {
      const template = { title: 'Test', sections: [] };
      const result = TemplateProcessor.processTemplate(template);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('processSections', () => {
    it('should add IDs to sections without them', () => {
      const sections = [
        { title: 'Section 1' },
        { title: 'Section 2' }
      ];
      const result = TemplateProcessor.processSections(sections);
      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
    });

    it('should preserve existing section IDs', () => {
      const sections = [
        { id: 'sec-1', title: 'Section 1' },
        { title: 'Section 2' }
      ];
      const result = TemplateProcessor.processSections(sections);
      expect(result[0].id).toBe('sec-1');
      expect(result[1].id).toBeDefined();
      expect(result[1].id).not.toBe('sec-1');
    });

    it('should process items within sections', () => {
      const sections = [
        {
          title: 'Section 1',
          items: [
            { title: 'Item 1' },
            { title: 'Item 2' }
          ]
        }
      ];
      const result = TemplateProcessor.processSections(sections);
      expect(result[0].items[0].id).toBeDefined();
      expect(result[0].items[1].id).toBeDefined();
    });

    it('should handle sections without items', () => {
      const sections = [{ title: 'Section 1' }];
      const result = TemplateProcessor.processSections(sections);
      expect(result[0].items).toEqual([]);
    });
  });

  describe('mergeTemplates', () => {
    it('should merge two templates', () => {
      const template1 = {
        id: 't1',
        title: 'Template 1',
        sections: [{ id: 's1', title: 'Section 1' }]
      };
      const template2 = {
        id: 't2',
        title: 'Template 2',
        sections: [{ id: 's2', title: 'Section 2' }]
      };
      
      const result = TemplateProcessor.mergeTemplates(template1, template2);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].id).toBe('s1');
      expect(result.sections[1].id).toBe('s2');
    });

    it('should use first template properties', () => {
      const template1 = {
        id: 't1',
        title: 'Template 1',
        description: 'Desc 1',
        sections: []
      };
      const template2 = {
        id: 't2',
        title: 'Template 2',
        description: 'Desc 2',
        sections: []
      };
      
      const result = TemplateProcessor.mergeTemplates(template1, template2);
      expect(result.id).toBe('t1');
      expect(result.title).toBe('Template 1');
      expect(result.description).toBe('Desc 1');
    });
  });
});
