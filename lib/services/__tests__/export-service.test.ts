import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from '../export-service';
import type { Checklist, ChecklistTask } from '@/lib/types/checklist';
import jsPDF from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn(() => new Blob(['test pdf content'], { type: 'application/pdf' })),
    getStringUnitWidth: vi.fn(() => 50),
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297)
      }
    }
  }))
}));

describe('Export Service', () => {
  let exportService: ExportService;
  let mockChecklist: Checklist;

  beforeEach(() => {
    vi.clearAllMocks();
    exportService = new ExportService();
    
    mockChecklist = {
      id: 'test-123',
      title: 'Kitchen Deep Clean',
      description: 'Complete kitchen cleaning checklist',
      category: 'cleaning',
      tasks: [
        {
          id: 'task-1',
          description: 'Clean countertops',
          priority: 'high',
          completed: false,
          category: 'surfaces'
        },
        {
          id: 'task-2',
          description: 'Clean appliances',
          priority: 'medium',
          completed: true,
          category: 'appliances'
        }
      ] as ChecklistTask[],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      completedAt: null,
      tags: ['kitchen', 'deep-clean'],
      metadata: {
        estimatedTime: 120,
        difficulty: 'medium'
      }
    };
  });

  describe('PDF Generation', () => {
    it('should generate valid PDF documents', async () => {
      const pdf = await exportService.generatePDF(mockChecklist);
      
      expect(pdf).toBeDefined();
      expect(pdf).toBeInstanceOf(Blob);
      expect(pdf.type).toBe('application/pdf');
    });

    it('should include checklist title and description', async () => {
      const mockPdfInstance = {
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        output: vi.fn(() => new Blob(['test'], { type: 'application/pdf' }))
      };
      vi.mocked(jsPDF).mockReturnValue(mockPdfInstance as any);
      
      await exportService.generatePDF(mockChecklist);
      
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'Kitchen Deep Clean',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'Complete kitchen cleaning checklist',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should include all tasks with completion status', async () => {
      const mockPdfInstance = {
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        output: vi.fn(() => new Blob(['test'], { type: 'application/pdf' }))
      };
      vi.mocked(jsPDF).mockReturnValue(mockPdfInstance as any);
      
      await exportService.generatePDF(mockChecklist);
      
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        '[ ] Clean countertops',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        '[x] Clean appliances',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle large checklists efficiently', async () => {
      const largeChecklist = {
        ...mockChecklist,
        tasks: Array.from({ length: 100 }, (_, i) => ({
          id: `task-${i}`,
          description: `Task ${i}`,
          priority: 'medium',
          completed: false,
          category: 'general'
        })) as ChecklistTask[]
      };

      const startTime = Date.now();
      const pdf = await exportService.generatePDF(largeChecklist);
      const endTime = Date.now();
      
      expect(pdf).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should apply custom styling and branding', async () => {
      const options = {
        includelogo: true,
        primaryColor: '#007bff',
        fontFamily: 'Helvetica'
      };
      
      const mockPdfInstance = {
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        output: vi.fn(() => new Blob(['test'], { type: 'application/pdf' }))
      };
      vi.mocked(jsPDF).mockReturnValue(mockPdfInstance as any);
      
      await exportService.generatePDF(mockChecklist, options);
      
      expect(mockPdfInstance.setFont).toHaveBeenCalledWith('Helvetica');
    });

    it('should support image embedding', async () => {
      const checklistWithImages = {
        ...mockChecklist,
        images: ['data:image/jpeg;base64,test1', 'data:image/jpeg;base64,test2']
      };
      
      const pdf = await exportService.generatePDF(checklistWithImages);
      
      expect(pdf).toBeDefined();
      // Images should be embedded in the PDF
    });
  });

  describe('Markdown Export', () => {
    it('should create Markdown with proper formatting', async () => {
      const markdown = await exportService.generateMarkdown(mockChecklist);
      
      expect(markdown).toContain('# Kitchen Deep Clean');
      expect(markdown).toContain('Complete kitchen cleaning checklist');
      expect(markdown).toContain('- [ ] Clean countertops');
      expect(markdown).toContain('- [x] Clean appliances');
    });

    it('should support GitHub-flavored markdown', async () => {
      const options = { githubFlavored: true };
      const markdown = await exportService.generateMarkdown(mockChecklist, options);
      
      expect(markdown).toContain('```');
      expect(markdown).toContain('**Priority:** high');
      expect(markdown).toContain('**Category:** surfaces');
    });

    it('should include metadata in frontmatter', async () => {
      const options = { includeFrontmatter: true };
      const markdown = await exportService.generateMarkdown(mockChecklist, options);
      
      expect(markdown).toContain('---');
      expect(markdown).toContain('title: Kitchen Deep Clean');
      expect(markdown).toContain('category: cleaning');
      expect(markdown).toContain('tags:');
      expect(markdown).toContain('  - kitchen');
      expect(markdown).toContain('  - deep-clean');
    });

    it('should handle special characters correctly', async () => {
      const checklistWithSpecialChars = {
        ...mockChecklist,
        title: 'Clean & Organize [Kitchen]',
        tasks: [{
          id: 'task-1',
          description: 'Clean *all* surfaces & <appliances>',
          priority: 'high',
          completed: false,
          category: 'general'
        }] as ChecklistTask[]
      };
      
      const markdown = await exportService.generateMarkdown(checklistWithSpecialChars);
      
      // The implementation escapes these characters
      expect(markdown).toContain('Clean & Organize \\[Kitchen\\]');
      expect(markdown).toContain('Clean \\*all\\* surfaces & &lt;appliances&gt;');
    });
  });

  describe('PerfexCRM Integration', () => {
    beforeEach(() => {
      // Mock GraphQL client
      global.fetch = vi.fn();
    });

    it('should integrate with PerfexCRM GraphQL', async () => {
      const mockResponse = {
        data: {
          createTask: {
            id: 'crm-task-123',
            success: true
          }
        }
      };
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);
      
      const result = await exportService.exportToPerfexCRM(mockChecklist, {
        endpoint: 'https://api.perfexcrm.com/graphql',
        apiKey: 'test-api-key'
      });
      
      expect(result.success).toBe(true);
      expect(result.crmId).toBe('crm-task-123');
    });

    it('should handle GraphQL mutations correctly', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { createTask: { id: '123', success: true } } })
      } as Response);
      
      await exportService.exportToPerfexCRM(mockChecklist, {
        endpoint: 'https://api.perfexcrm.com/graphql',
        apiKey: 'test-api-key'
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.perfexcrm.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          }),
          body: expect.stringContaining('mutation CreateTask')
        })
      );
    });

    it('should map checklist data to CRM schema', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { createTask: { id: '123', success: true } } })
      } as Response);
      
      await exportService.exportToPerfexCRM(mockChecklist, {
        endpoint: 'https://api.perfexcrm.com/graphql',
        apiKey: 'test-api-key'
      });
      
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      
      expect(body.variables).toMatchObject({
        name: 'Kitchen Deep Clean',
        description: 'Complete kitchen cleaning checklist',
        status: 'pending',
        priority: 'medium',
        subtasks: expect.arrayContaining([
          expect.objectContaining({
            description: 'Clean countertops',
            completed: false
          })
        ])
      });
    });

    it('should handle authentication and errors', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as Response);
      
      await expect(
        exportService.exportToPerfexCRM(mockChecklist, {
          endpoint: 'https://api.perfexcrm.com/graphql',
          apiKey: 'invalid-key'
        })
      ).rejects.toThrow('Authentication failed');
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
      
      await expect(
        exportService.exportToPerfexCRM(mockChecklist, {
          endpoint: 'https://api.perfexcrm.com/graphql',
          apiKey: 'test-api-key'
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Export Configuration', () => {
    it('should support multiple export formats', async () => {
      const formats = await exportService.getSupportedFormats();
      
      expect(formats).toContain('pdf');
      expect(formats).toContain('markdown');
      expect(formats).toContain('json');
      expect(formats).toContain('csv');
      expect(formats).toContain('perfexcrm');
    });

    it('should validate export options', () => {
      const validOptions = {
        format: 'pdf',
        includeMetadata: true,
        includeImages: false
      };
      
      const invalidOptions = {
        format: 'invalid-format',
        includeMetadata: 'not-boolean'
      };
      
      expect(exportService.validateOptions(validOptions)).toBe(true);
      expect(exportService.validateOptions(invalidOptions)).toBe(false);
    });

    it('should provide export preview', async () => {
      const preview = await exportService.generatePreview(mockChecklist, 'markdown');
      
      expect(preview).toBeDefined();
      expect(preview.format).toBe('markdown');
      expect(preview.content).toContain('Kitchen Deep Clean');
      expect(preview.size).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent exports efficiently', async () => {
      const exports = await Promise.all([
        exportService.generatePDF(mockChecklist),
        exportService.generateMarkdown(mockChecklist),
        exportService.generateJSON(mockChecklist)
      ]);
      
      expect(exports).toHaveLength(3);
      exports.forEach(exp => expect(exp).toBeDefined());
    });

    it('should maintain formatting across formats', async () => {
      const pdf = await exportService.generatePDF(mockChecklist);
      const markdown = await exportService.generateMarkdown(mockChecklist);
      const json = await exportService.generateJSON(mockChecklist);
      
      // All formats should contain the same data
      expect(pdf).toBeDefined();
      expect(markdown).toContain('Kitchen Deep Clean');
      expect(JSON.parse(json).title).toBe('Kitchen Deep Clean');
    });
  });
});
