import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportOptions } from '../export-options';
import { ExportService } from '@/lib/services/export-service';

// Mock the export service
vi.mock('@/lib/services/export-service');

describe('Export Options Component', () => {
  let mockExportService: any;
  const mockChecklist = {
    id: 'test-123',
    title: 'Test Checklist',
    description: 'Test description',
    tasks: [
      { id: '1', description: 'Task 1', completed: false, priority: 'high' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockExportService = {
      generatePDF: vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
      generateMarkdown: vi.fn().mockResolvedValue('# Test Checklist'),
      generateJSON: vi.fn().mockResolvedValue('{"title": "Test Checklist"}'),
      generateCSV: vi.fn().mockResolvedValue('Task,Priority\nTask 1,high'),
      exportToPerfexCRM: vi.fn().mockResolvedValue({ success: true, crmId: '123' }),
      getSupportedFormats: vi.fn().mockResolvedValue(['pdf', 'markdown', 'json', 'csv', 'perfexcrm']),
      generatePreview: vi.fn().mockResolvedValue({
        format: 'markdown',
        content: '# Test Checklist',
        size: 100
      })
    };
    
    (ExportService as any).mockImplementation(() => mockExportService);
  });

  describe('Component Rendering', () => {
    it('should render export button', () => {
      render(<ExportOptions checklist={mockChecklist} />);
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should show export dialog when button clicked', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/choose export format/i)).toBeInTheDocument();
    });

    it('should display all available export formats', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/pdf/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/markdown/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/json/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/csv/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/perfexcrm/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export to PDF format', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      expect(mockExportService.generatePDF).toHaveBeenCalledWith(mockChecklist, expect.any(Object));
    });

    it('should export to Markdown format', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/markdown/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      expect(mockExportService.generateMarkdown).toHaveBeenCalledWith(mockChecklist, expect.any(Object));
    });

    it('should show preview before export', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/markdown/i));
      
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
        expect(screen.getByText(/# Test Checklist/)).toBeInTheDocument();
      });
    });

    it('should handle export to PerfexCRM', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/perfexcrm/i));
      
      // Should show API key input
      expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/endpoint/i)).toBeInTheDocument();
      
      await userEvent.type(screen.getByLabelText(/api key/i), 'test-key');
      await userEvent.type(screen.getByLabelText(/endpoint/i), 'https://api.test.com');
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      
      expect(mockExportService.exportToPerfexCRM).toHaveBeenCalledWith(
        mockChecklist,
        expect.objectContaining({
          apiKey: 'test-key',
          endpoint: 'https://api.test.com'
        })
      );
    });
  });

  describe('Options Configuration', () => {
    it('should allow including metadata', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      
      const metadataCheckbox = screen.getByLabelText(/include metadata/i);
      expect(metadataCheckbox).toBeInTheDocument();
      
      await userEvent.click(metadataCheckbox);
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      expect(mockExportService.generatePDF).toHaveBeenCalledWith(
        mockChecklist,
        expect.objectContaining({
          includeMetadata: true
        })
      );
    });

    it('should allow including images', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      
      const imagesCheckbox = screen.getByLabelText(/include images/i);
      expect(imagesCheckbox).toBeInTheDocument();
      
      await userEvent.click(imagesCheckbox);
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      expect(mockExportService.generatePDF).toHaveBeenCalledWith(
        mockChecklist,
        expect.objectContaining({
          includeImages: true
        })
      );
    });
  });

  describe('User Feedback', () => {
    it('should show loading state during export', async () => {
      mockExportService.generatePDF.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(new Blob(['pdf'])), 100))
      );
      
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText(/exporting/i)).not.toBeInTheDocument();
      });
    });

    it('should show success message after export', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/exported successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle export errors gracefully', async () => {
      mockExportService.generatePDF.mockRejectedValue(new Error('Export failed'));
      
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Management', () => {
    it('should close dialog on cancel', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close dialog after successful export', async () => {
      render(<ExportOptions checklist={mockChecklist} />);
      
      await userEvent.click(screen.getByRole('button', { name: /export/i }));
      await userEvent.click(screen.getByLabelText(/pdf/i));
      await userEvent.click(screen.getByRole('button', { name: /download/i }));
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
