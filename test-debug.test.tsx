// Debug test to see what's happening
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoUpload } from '../components/ui/photo-upload';
import { ClaudeVisionService } from '../lib/services/claude-vision';
import { ImageProcessor } from '../lib/services/image-processor';

// Mock the services
vi.mock('../lib/services/claude-vision');
vi.mock('../lib/services/image-processor');

describe('Debug PhotoUpload', () => {
  let mockVisionService;
  let mockImageProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = vi.fn(() => ({
      readAsDataURL: vi.fn(function(file) {
        console.log('FileReader called with file type:', file.type);
        setTimeout(() => {
          const result = file.type === 'image/bmp' 
            ? 'data:image/bmp;base64,test' 
            : 'data:image/jpeg;base64,test';
          console.log('FileReader result:', result);
          this.onload?.({ target: { result } });
        }, 0);
      }),
      onload: null,
      onerror: null,
    }));
    
    mockVisionService = {
      analyzeImage: vi.fn().mockResolvedValue({
        tasks: [],
        summary: 'Test summary',
        confidence: 0.9
      })
    };
    
    mockImageProcessor = {
      validateFormat: vi.fn((data) => {
        console.log('validateFormat called with data:', data?.substring(0, 50));
        if (data.includes('image/bmp')) {
          console.log('Throwing error for BMP');
          throw new Error('Unsupported image format');
        }
      }),
      validateSize: vi.fn(),
      optimizeForVisionAPI: vi.fn().mockResolvedValue('data:image/jpeg;base64,optimized'),
      processImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,processed')
    };
    
    ClaudeVisionService.mockImplementation(() => mockVisionService);
    ImageProcessor.mockImplementation(() => mockImageProcessor);
  });

  it('should reject invalid file formats', async () => {
    const onTasksDetected = vi.fn();
    const { container } = render(<PhotoUpload onTasksDetected={onTasksDetected} />);
    
    const file = new File(['test'], 'test.bmp', { type: 'image/bmp' });
    const input = screen.getByTestId('photo-upload-input');
    
    console.log('Uploading file...');
    await userEvent.upload(input, file);
    
    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Container HTML:', container.innerHTML);
    
    // Try to find error in various ways
    const errorText = container.querySelector('.text-red-800');
    console.log('Error element:', errorText?.textContent);
    
    await waitFor(() => {
      const errorEl = container.querySelector('.text-red-800');
      expect(errorEl).toBeTruthy();
      expect(errorEl?.textContent).toBe('Unsupported image format');
    }, { timeout: 3000 });
    
    expect(onTasksDetected).not.toHaveBeenCalled();
  });
});
