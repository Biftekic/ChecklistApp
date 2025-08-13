import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AICacheService } from '../ai-cache';
import type { VisionAnalysisResponse } from '@/lib/types/vision';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    aiCache: {
      add: vi.fn(),
      get: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
          toArray: vi.fn(),
          delete: vi.fn()
        })),
        below: vi.fn(() => ({
          toArray: vi.fn()
        }))
      })),
      clear: vi.fn(),
      bulkDelete: vi.fn(),
      toArray: vi.fn(),
      orderBy: vi.fn(() => ({
        toArray: vi.fn()
      }))
    }
  }
}));

describe('AI Cache Service', () => {
  let cacheService: AICacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheService = new AICacheService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same images', () => {
      const imageData = 'data:image/jpeg;base64,test123';
      
      const key1 = cacheService.generateCacheKey(imageData);
      const key2 = cacheService.generateCacheKey(imageData);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
    });

    it('should generate different keys for different images', () => {
      const image1 = 'data:image/jpeg;base64,test123';
      const image2 = 'data:image/jpeg;base64,test456';

      const key1 = cacheService.generateCacheKey(image1);
      const key2 = cacheService.generateCacheKey(image2);

      expect(key1).not.toBe(key2);
    });

    it('should handle image arrays for batch caching', () => {
      const images = [
        'data:image/jpeg;base64,test1',
        'data:image/jpeg;base64,test2'
      ];

      const key = cacheService.generateBatchKey(images);
      expect(key).toBeDefined();
      expect(key).toMatch(/^batch_[a-f0-9]{64}$/);
    });
  });

  describe('Cache Storage', () => {
    it('should store vision analysis results in cache', async () => {
      const imageData = 'data:image/jpeg;base64,test';
      const analysisResult: VisionAnalysisResponse = {
        tasks: [
          {
            id: '1',
            description: 'Clean counters',
            area: 'kitchen',
            priority: 'high',
            confidence: 0.9,
            category: 'cleaning'
          }
        ],
        summary: 'Kitchen needs cleaning',
        confidence: 0.85,
        timestamp: new Date()
      };

      await cacheService.store(imageData, analysisResult);

      expect(db.aiCache.add).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.any(String),
          imageHash: expect.any(String),
          response: analysisResult,
          createdAt: expect.any(Date),
          expiresAt: expect.any(Date)
        })
      );
    });

    it('should set appropriate expiration times', async () => {
      const imageData = 'data:image/jpeg;base64,test';
      const result = { tasks: [], summary: '', confidence: 0, timestamp: new Date() };
      const ttlHours = 24;

      await cacheService.store(imageData, result, { ttl: ttlHours });

      expect(db.aiCache.add).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date)
        })
      );

      const call = (db.aiCache.add as any).mock.calls[0][0];
      const expirationTime = call.expiresAt.getTime() - call.createdAt.getTime();
      expect(expirationTime).toBeCloseTo(ttlHours * 60 * 60 * 1000, -2);
    });

    it('should handle storage errors gracefully', async () => {
      (db.aiCache.add as any).mockRejectedValueOnce(new Error('Storage failed'));

      const imageData = 'data:image/jpeg;base64,test';
      const result = { tasks: [], summary: '', confidence: 0, timestamp: new Date() };

      await expect(cacheService.store(imageData, result)).rejects.toThrow('Failed to cache');
    });
  });

  describe('Cache Retrieval', () => {
    it('should retrieve cached results for known images', async () => {
      const imageData = 'data:image/jpeg;base64,test';
      const cachedResult = {
        key: 'test-key',
        response: {
          tasks: [{ id: '1', description: 'Test task' }],
          summary: 'Test summary',
          confidence: 0.9,
          timestamp: new Date()
        },
        expiresAt: new Date(Date.now() + 86400000) // 1 day from now
      };

      (db.aiCache.where as any).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(cachedResult)
        })
      });

      const result = await cacheService.get(imageData);

      expect(result).toEqual(cachedResult.response);
    });

    it('should return null for uncached images', async () => {
      (db.aiCache.where as any).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined)
        })
      });

      const result = await cacheService.get('data:image/jpeg;base64,unknown');
      expect(result).toBeNull();
    });

    it('should ignore expired cache entries', async () => {
      const expiredEntry = {
        key: 'test-key',
        response: { tasks: [], summary: '', confidence: 0, timestamp: new Date() },
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };

      (db.aiCache.where as any).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(expiredEntry)
        })
      });

      const result = await cacheService.get('data:image/jpeg;base64,test');
      expect(result).toBeNull();
    });

    it('should delete expired entries when found', async () => {
      const mockDelete = vi.fn();
      const expiredEntry = {
        id: 1,
        key: 'test-key',
        response: { tasks: [], summary: '', confidence: 0, timestamp: new Date() },
        expiresAt: new Date(Date.now() - 1000)
      };

      (db.aiCache.where as any).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(expiredEntry),
          delete: mockDelete
        })
      });

      await cacheService.get('data:image/jpeg;base64,test');
      
      // Verify expired entry was deleted
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache entries', async () => {
      await cacheService.clearAll();
      expect(db.aiCache.clear).toHaveBeenCalled();
    });

    it('should clear expired entries only', async () => {
      const mockToArray = vi.fn().mockResolvedValue([
        { id: 1, expiresAt: new Date(Date.now() - 1000) },
        { id: 2, expiresAt: new Date(Date.now() - 2000) }
      ]);

      (db.aiCache.where as any).mockReturnValue({
        below: vi.fn(() => ({
          toArray: mockToArray
        }))
      });

      const deleted = await cacheService.clearExpired();

      expect(deleted).toBe(2);
      expect(db.aiCache.bulkDelete).toHaveBeenCalledWith([1, 2]);
    });

    it('should get cache statistics', async () => {
      (db.aiCache.toArray as any).mockResolvedValue([
        { size: 1024, expiresAt: new Date(Date.now() + 1000) },
        { size: 2048, expiresAt: new Date(Date.now() + 2000) },
        { size: 512, expiresAt: new Date(Date.now() - 1000) } // Expired
      ]);

      const stats = await cacheService.getStats();

      expect(stats.totalEntries).toBe(3);
      expect(stats.activeEntries).toBe(2);
      expect(stats.expiredEntries).toBe(1);
      expect(stats.totalSize).toBe(3584);
    });

    it('should implement cache size limits', async () => {
      const maxSizeMB = 50;
      cacheService = new AICacheService({ maxSizeMB });

      const mockToArray = vi.fn().mockResolvedValue([
        { id: 1, size: 10 * 1024 * 1024, createdAt: new Date(Date.now() - 3000) },
        { id: 2, size: 20 * 1024 * 1024, createdAt: new Date(Date.now() - 2000) },
        { id: 3, size: 25 * 1024 * 1024, createdAt: new Date(Date.now() - 1000) }
      ]);

      (db.aiCache.orderBy as any).mockReturnValue({
        toArray: mockToArray
      });

      await cacheService.enforcesSizeLimit();

      // Should delete oldest entry to stay under 50MB
      expect(db.aiCache.bulkDelete).toHaveBeenCalledWith([1]);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache for specific image', async () => {
      const mockDelete = vi.fn();
      (db.aiCache.where as any).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: mockDelete
        })
      });

      await cacheService.invalidate('data:image/jpeg;base64,test');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should invalidate cache based on age', async () => {
      const maxAgeHours = 12;
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

      // Only return items older than 12 hours
      const mockToArray = vi.fn().mockResolvedValue([
        { id: 1, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours old - should be deleted
      ]);

      (db.aiCache.where as any).mockReturnValue({
        below: vi.fn(() => ({
          toArray: mockToArray
        }))
      });

      const deleted = await cacheService.invalidateOlderThan(maxAgeHours);

      expect(deleted).toBe(1);
      expect(db.aiCache.bulkDelete).toHaveBeenCalledWith([1]);
    });

    it('should handle batch invalidation', async () => {
      const images = [
        'data:image/jpeg;base64,test1',
        'data:image/jpeg;base64,test2',
        'data:image/jpeg;base64,test3'
      ];

      await cacheService.invalidateBatch(images);

      expect(db.aiCache.where).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance Optimization', () => {
    it('should implement cache warming', async () => {
      const frequentImages = [
        'data:image/jpeg;base64,common1',
        'data:image/jpeg;base64,common2'
      ];

      const mockAnalyze = vi.fn().mockResolvedValue({
        tasks: [],
        summary: 'Warmed',
        confidence: 1,
        timestamp: new Date()
      });

      await cacheService.warmCache(frequentImages, mockAnalyze);

      expect(mockAnalyze).toHaveBeenCalledTimes(2);
      expect(db.aiCache.add).toHaveBeenCalledTimes(2);
    });

    it('should implement cache hit rate tracking', async () => {
      // Simulate some cache hits and misses
      await cacheService.recordHit();
      await cacheService.recordHit();
      await cacheService.recordMiss();

      const hitRate = cacheService.getHitRate();
      expect(hitRate).toBe(0.67); // 2 hits out of 3 total requests
    });
  });
});
