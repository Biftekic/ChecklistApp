import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoUpload } from '../photo-upload';
import { ClaudeVisionService } from '@/lib/services/claude-vision';
import { ImageProcessor } from '@/lib/services/image-processor';

// Mock the services
vi.mock('@/lib/services/claude-vision');
vi.mock('@/lib/services/image-processor');

describe('PhotoUpload Component', () => {
  let mockVisionService: any;
  let mockImageProcessor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = vi.fn(() => ({
      readAsDataURL: vi.fn(function(this: any, file: File) {
        setTimeout(() => {
          // Return different data based on file type
          const result = file.type === 'image/bmp' 
            ? 'data:image/bmp;base64,test' 
            : 'data:image/jpeg;base64,test';
          this.onload?.({ target: { result } });
        }, 0);
      }),
      onload: null,
      onerror: null,
    })) as any;
    
    mockVisionService = {
      analyzeImage: vi.fn().mockResolvedValue({
        tasks: [],
        summary: 'Test summary',
        confidence: 0.9
      })
    };
    
    mockImageProcessor = {
      validateFormat: vi.fn(),
      validateSize: vi.fn(),
      optimizeForVisionAPI: vi.fn().mockResolvedValue('data:image/jpeg;base64,optimized'),
      processImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,processed')
    };
    
    (ClaudeVisionService as any).mockImplementation(() => mockVisionService);
    (ImageProcessor as any).mockImplementation(() => mockImageProcessor);
  });

  describe('Component Rendering', () => {
    it('should render upload button', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument();
    });

    it('should render drag and drop area', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      expect(screen.getByText(/drag.*drop.*photo/i)).toBeInTheDocument();
    });

    it('should show file input with correct accept attributes', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const input = screen.getByTestId('photo-upload-input');
      expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('should allow multiple file selection', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} multiple />);
      
      const input = screen.getByTestId('photo-upload-input');
      expect(input).toHaveAttribute('multiple');
    });
  });

  describe('File Upload', () => {
    it('should handle single file upload', async () => {
      const onTasksDetected = vi.fn();
      render(<PhotoUpload onTasksDetected={onTasksDetected} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(mockImageProcessor.validateFormat).toHaveBeenCalled();
      });
    });

    it('should handle multiple file upload', async () => {
      const onTasksDetected = vi.fn();
      render(<PhotoUpload onTasksDetected={onTasksDetected} multiple />);
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' })
      ];
      
      const input = screen.getByTestId('photo-upload-input');
      await userEvent.upload(input, files);
      
      await waitFor(() => {
        expect(mockImageProcessor.validateFormat).toHaveBeenCalledTimes(2);
      });
    });

    it('should reject invalid file formats', async () => {
      mockImageProcessor.validateFormat.mockImplementation((data) => {
        // Check if it's BMP data
        if (data.includes('image/bmp')) {
          throw new Error('Unsupported image format');
        }
      });
      
      const onTasksDetected = vi.fn();
      render(<PhotoUpload onTasksDetected={onTasksDetected} />);
      
      const file = new File(['test'], 'test.bmp', { type: 'image/bmp' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('Unsupported image format')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(onTasksDetected).not.toHaveBeenCalled();
    });

    it('should reject files larger than 5MB', async () => {
      mockImageProcessor.validateSize.mockImplementation(() => {
        throw new Error('Image size exceeds 5MB limit');
      });
      
      const onTasksDetected = vi.fn();
      render(<PhotoUpload onTasksDetected={onTasksDetected} />);
      
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      
      const input = screen.getByTestId('photo-upload-input');
      await userEvent.upload(input, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText('Image size exceeds 5MB limit')).toBeInTheDocument();
      });
      
      expect(onTasksDetected).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag enter', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const dropZone = screen.getByTestId('drop-zone');
      fireEvent.dragEnter(dropZone);
      
      expect(dropZone).toHaveClass('drag-active');
    });

    it('should handle drag leave', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const dropZone = screen.getByTestId('drop-zone');
      
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('drag-active');
      
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('drag-active');
    });

    it('should handle file drop', async () => {
      const onTasksDetected = vi.fn();
      render(<PhotoUpload onTasksDetected={onTasksDetected} />);
      
      const dropZone = screen.getByTestId('drop-zone');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as any;
      dropEvent.dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => file }],
        types: ['Files']
      };
      
      fireEvent(dropZone, dropEvent);
      
      await waitFor(() => {
        expect(mockImageProcessor.validateFormat).toHaveBeenCalled();
      });
    });

    it('should prevent default drag behavior', () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const dropZone = screen.getByTestId('drop-zone');
      
      const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
      fireEvent(dropZone, dragOverEvent);
      
      expect(dragOverEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Image Processing', () => {
    it('should show loading state during processing', async () => {
      mockImageProcessor.processImage.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
      });
    });

    it('should display image preview after upload', async () => {
      // The component displays the optimized image, not the processed one
      mockImageProcessor.optimizeForVisionAPI.mockResolvedValue('data:image/jpeg;base64,optimized');
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        const preview = screen.getByAltText('Uploaded photo');
        expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,optimized');
      });
    });

    it('should optimize image before analysis', async () => {
      mockImageProcessor.optimizeForVisionAPI.mockResolvedValue('data:image/jpeg;base64,optimized');
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(mockImageProcessor.optimizeForVisionAPI).toHaveBeenCalled();
      });
    });
  });

  describe('AI Analysis', () => {
    it('should call vision service after upload', async () => {
      const mockTasks = [
        { id: '1', description: 'Clean counters', priority: 'high' }
      ];
      
      mockVisionService.analyzeImage.mockResolvedValue({
        tasks: mockTasks,
        summary: 'Kitchen cleaning needed',
        confidence: 0.9
      });
      
      mockImageProcessor.processImage.mockResolvedValue('data:image/jpeg;base64,test');
      
      const onTasksDetected = vi.fn();
      render(<PhotoUpload onTasksDetected={onTasksDetected} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(mockVisionService.analyzeImage).toHaveBeenCalled();
        expect(onTasksDetected).toHaveBeenCalledWith(mockTasks);
      });
    });

    it('should display detected tasks', async () => {
      const mockTasks = [
        { id: '1', description: 'Clean counters', priority: 'high', confidence: 0.9 },
        { id: '2', description: 'Organize cabinets', priority: 'medium', confidence: 0.7 }
      ];
      
      mockVisionService.analyzeImage.mockResolvedValue({
        tasks: mockTasks,
        summary: 'Kitchen cleaning needed',
        confidence: 0.9
      });
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('Clean counters')).toBeInTheDocument();
        expect(screen.getByText('Organize cabinets')).toBeInTheDocument();
      });
    });

    it('should show confidence scores when enabled', async () => {
      const mockTasks = [
        { id: '1', description: 'Clean counters', priority: 'high', confidence: 0.95 }
      ];
      
      mockVisionService.analyzeImage.mockResolvedValue({
        tasks: mockTasks,
        summary: 'Test',
        confidence: 0.9
      });
      
      render(<PhotoUpload onTasksDetected={vi.fn()} showConfidence />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('95%')).toBeInTheDocument();
      });
    });

    it('should handle analysis errors gracefully', async () => {
      mockVisionService.analyzeImage.mockRejectedValue(new Error('API error'));
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('API error')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('User Interaction', () => {
    it('should allow removing uploaded image', async () => {
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByAltText('Uploaded photo')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole('button', { name: /remove/i });
      await userEvent.click(removeButton);
      
      expect(screen.queryByAltText('Uploaded photo')).not.toBeInTheDocument();
    });

    it('should allow retrying analysis', async () => {
      mockVisionService.analyzeImage
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce({
          tasks: [{ id: '1', description: 'Test task', priority: 'high' }],
          summary: 'Test',
          confidence: 0.9
        });
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('API error')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test task')).toBeInTheDocument();
      });
    });

    it('should disable upload during processing', async () => {
      // Make processing take longer
      mockImageProcessor.processImage.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('data:image/jpeg;base64,processed'), 500))
      );
      
      render(<PhotoUpload onTasksDetected={vi.fn()} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByTestId('photo-upload-input') as HTMLInputElement;
      const uploadButton = screen.getByRole('button', { name: /upload photo/i });
      
      await userEvent.upload(input, file);
      
      // Check that button is disabled during processing
      expect(uploadButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // After processing, the image is displayed and upload button is removed
      expect(screen.getByAltText('Uploaded photo')).toBeInTheDocument();
    });
  });
});
