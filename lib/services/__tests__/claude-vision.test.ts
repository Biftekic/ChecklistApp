import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { VisionAnalysisRequest, VisionAnalysisResponse, DetectedTask } from '@/lib/types/vision';

// Mock the Anthropic SDK before importing the service
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: mockCreate
    }
  }))
}));

// Import after mocking
import { ClaudeVisionService } from '../claude-vision';
import Anthropic from '@anthropic-ai/sdk';

describe('Claude Vision Service', () => {
  let service: ClaudeVisionService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with Anthropic API key from environment', () => {
      service = new ClaudeVisionService();
      expect(service).toBeDefined();
      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      });
    });

    it('should throw error if API key is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new ClaudeVisionService()).toThrow('ANTHROPIC_API_KEY is required');
    });

    it('should configure correct model version (claude-3-opus-20240229)', () => {
      service = new ClaudeVisionService();
      expect(service.getConfig().model).toBe('claude-3-opus-20240229');
    });

    it('should set appropriate max tokens and temperature', () => {
      service = new ClaudeVisionService();
      const config = service.getConfig();
      expect(config.maxTokens).toBe(4096);
      expect(config.temperature).toBe(0.3);
    });
  });

  describe('Image Analysis', () => {
    beforeEach(() => {
      service = new ClaudeVisionService();
    });

    it('should accept image in base64 format', async () => {
      const request: VisionAnalysisRequest = {
        images: [{
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
          type: 'base64'
        }]
      };

      mockCreate.mockResolvedValueOnce({
        content: [{ text: JSON.stringify({ tasks: [] }) }]
      });

      const response = await service.analyzeImage(request);
      expect(response).toBeDefined();
    });

    it('should validate image format (jpg, png, webp)', async () => {
      const request: VisionAnalysisRequest = {
        images: [{
          data: 'data:image/bmp;base64,Qk1...',
          type: 'base64'
        }]
      };

      await expect(service.analyzeImage(request)).rejects.toThrow('Unsupported image format');
    });

    it('should reject images larger than 5MB', async () => {
      const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(7 * 1024 * 1024);
      const request: VisionAnalysisRequest = {
        images: [{
          data: largeImage,
          type: 'base64'
        }]
      };

      await expect(service.analyzeImage(request)).rejects.toThrow('Image size exceeds 5MB limit');
    });
  });

  describe('Task Detection', () => {
    beforeEach(() => {
      service = new ClaudeVisionService();
    });

    it('should detect cleaning tasks from image', async () => {
      const request: VisionAnalysisRequest = {
        images: [{ data: 'data:image/jpeg;base64,test', type: 'base64' }]
      };

      const mockTasks: DetectedTask[] = [
        {
          id: '1',
          description: 'Wipe down counters',
          area: 'kitchen counter',
          priority: 'high',
          confidence: 0.92,
          category: 'cleaning'
        }
      ];

      mockCreate.mockResolvedValueOnce({
        content: [{ 
          text: JSON.stringify({ 
            tasks: mockTasks,
            summary: 'Kitchen cleaning needed',
            confidence: 0.9
          }) 
        }]
      });

      const response = await service.analyzeImage(request);
      expect(response.tasks).toHaveLength(1);
      expect(response.tasks[0].category).toBe('cleaning');
    });

    it('should provide confidence scores for each task', async () => {
      const request: VisionAnalysisRequest = {
        images: [{ data: 'data:image/jpeg;base64,test', type: 'base64' }],
        includeConfidence: true
      };

      const mockTasks: DetectedTask[] = [
        { id: '1', description: 'Task 1', area: 'area1', priority: 'high', confidence: 0.95, category: 'cleaning' },
        { id: '2', description: 'Task 2', area: 'area2', priority: 'medium', confidence: 0.75, category: 'organizing' }
      ];

      mockCreate.mockResolvedValueOnce({
        content: [{ text: JSON.stringify({ tasks: mockTasks }) }]
      });

      const response = await service.analyzeImage(request);
      
      expect(response.tasks[0].confidence).toBe(0.95);
      expect(response.tasks[1].confidence).toBe(0.75);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      service = new ClaudeVisionService();
    });

    it('should handle API rate limiting with exponential backoff', async () => {
      const request: VisionAnalysisRequest = {
        images: [{ data: 'data:image/jpeg;base64,test', type: 'base64' }]
      };

      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).headers = {
        'retry-after': '2'
      };

      mockCreate
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          content: [{ text: JSON.stringify({ tasks: [] }) }]
        });

      const start = Date.now();
      const response = await service.analyzeImage(request);
      const duration = Date.now() - start;

      expect(response).toBeDefined();
      expect(duration).toBeGreaterThanOrEqual(1000); // Should wait at least 1 second
    });

    it('should provide fallback for API failures', async () => {
      const request: VisionAnalysisRequest = {
        images: [{ data: 'data:image/jpeg;base64,test', type: 'base64' }]
      };

      mockCreate.mockRejectedValue(
        new Error('API unavailable')
      );

      const response = await service.analyzeImage(request);
      
      // Should return fallback response
      expect(response.tasks).toEqual([]);
      expect(response.summary).toContain('unable to analyze');
      expect(response.confidence).toBe(0);
    });
  });
});
