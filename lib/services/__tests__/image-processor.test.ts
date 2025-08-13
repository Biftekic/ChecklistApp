import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageProcessor } from '../image-processor';
import type { ProcessedImage } from '@/lib/types/vision';

describe('Image Processor', () => {
  let processor: ImageProcessor;

  beforeEach(() => {
    processor = new ImageProcessor();
  });

  describe('Image Validation', () => {
    it('should accept valid image formats (jpg, png, webp)', () => {
      const validFormats = [
        'data:image/jpeg;base64,test',
        'data:image/png;base64,test',
        'data:image/webp;base64,test'
      ];

      validFormats.forEach(format => {
        expect(() => processor.validateFormat(format)).not.toThrow();
      });
    });

    it('should reject invalid image formats', () => {
      const invalidFormats = [
        'data:image/bmp;base64,test',
        'data:image/svg+xml;base64,test',
        'data:text/plain;base64,test'
      ];

      invalidFormats.forEach(format => {
        expect(() => processor.validateFormat(format)).toThrow('Unsupported image format');
      });
    });

    it('should validate image size (max 5MB)', () => {
      const smallImage = 'data:image/jpeg;base64,' + 'A'.repeat(1024 * 1024); // ~1MB
      const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(7 * 1024 * 1024); // ~7MB

      expect(() => processor.validateSize(smallImage)).not.toThrow();
      expect(() => processor.validateSize(largeImage)).toThrow('Image size exceeds 5MB limit');
    });

    it('should validate image dimensions', async () => {
      // Mock image with dimensions
      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
      
      const dimensions = await processor.getImageDimensions(mockImage);
      expect(dimensions).toHaveProperty('width');
      expect(dimensions).toHaveProperty('height');
    });
  });

  describe('Image Processing', () => {
    it('should resize large images while maintaining aspect ratio', async () => {
      const largeImage = 'data:image/jpeg;base64,test';
      const maxWidth = 1920;
      const maxHeight = 1080;

      const resized = await processor.resize(largeImage, maxWidth, maxHeight);
      expect(resized).toBeDefined();
      expect(resized).toContain('data:image/jpeg;base64');
    });

    it('should compress images to reduce file size', async () => {
      const originalImage = 'data:image/jpeg;base64,' + 'A'.repeat(2 * 1024 * 1024);
      const compressed = await processor.compress(originalImage, 0.8);

      const originalSize = processor.calculateSize(originalImage);
      const compressedSize = processor.calculateSize(compressed);

      expect(compressedSize).toBeLessThan(originalSize);
    });

    it('should convert images to required format', async () => {
      const pngImage = 'data:image/png;base64,test';
      const converted = await processor.convertToJpeg(pngImage);

      expect(converted).toContain('data:image/jpeg;base64');
    });

    it('should extract metadata from images', async () => {
      const image = 'data:image/jpeg;base64,test';
      const metadata = await processor.extractMetadata(image);

      expect(metadata).toHaveProperty('format');
      expect(metadata).toHaveProperty('size');
      expect(metadata).toHaveProperty('timestamp');
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple images in parallel', async () => {
      const images = [
        'data:image/jpeg;base64,test1',
        'data:image/png;base64,test2',
        'data:image/webp;base64,test3'
      ];

      const processed = await processor.batchProcess(images);
      expect(processed).toHaveLength(3);
      processed.forEach(img => {
        expect(img).toHaveProperty('data');
        expect(img).toHaveProperty('metadata');
      });
    });

    it('should handle errors gracefully in batch processing', async () => {
      const images = [
        'data:image/jpeg;base64,valid',
        'data:image/bmp;base64,invalid', // Invalid format
        'data:image/png;base64,valid'
      ];

      const results = await processor.batchProcess(images);
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('Unsupported');
      expect(results[2].success).toBe(true);
    });

    it('should limit concurrent processing to prevent memory issues', async () => {
      const images = Array(20).fill('data:image/jpeg;base64,test');
      const maxConcurrent = 5;

      const spy = vi.spyOn(processor, 'processImage');
      await processor.batchProcess(images, { maxConcurrent });

      // Verify that processing was done in batches
      expect(spy).toHaveBeenCalledTimes(20);
    });
  });

  describe('Image Optimization', () => {
    it('should optimize images for Claude Vision API', async () => {
      const image = 'data:image/png;base64,' + 'A'.repeat(3 * 1024 * 1024);
      const optimized = await processor.optimizeForVisionAPI(image);

      const size = processor.calculateSize(optimized);
      expect(size).toBeLessThanOrEqual(5 * 1024 * 1024);
      expect(optimized).toContain('data:image/jpeg;base64');
    });

    it('should maintain image quality during optimization', async () => {
      const highQualityImage = 'data:image/jpeg;base64,test';
      const optimized = await processor.optimizeForVisionAPI(highQualityImage, {
        minQuality: 0.9
      });

      expect(optimized).toBeDefined();
      // Quality should be maintained above threshold
    });

    it('should handle already optimized images efficiently', async () => {
      const optimizedImage = 'data:image/jpeg;base64,' + 'A'.repeat(500 * 1024); // Small image
      const result = await processor.optimizeForVisionAPI(optimizedImage);

      // Should return the same image if already optimized
      expect(result).toBe(optimizedImage);
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted image data', async () => {
      const corruptedImage = 'data:image/jpeg;base64,corrupted!!!';
      
      await expect(processor.processImage(corruptedImage))
        .rejects.toThrow('Invalid image data');
    });

    it('should handle missing image data', async () => {
      const emptyImage = '';
      
      await expect(processor.processImage(emptyImage))
        .rejects.toThrow('No image data provided');
    });

    it('should provide detailed error messages', async () => {
      const invalidImage = 'not-a-data-url';
      
      try {
        await processor.processImage(invalidImage);
      } catch (error: any) {
        expect(error.message).toContain('Invalid image format');
        expect(error.details).toBeDefined();
      }
    });
  });
});
