import { db } from '@/lib/db';
import type { VisionAnalysisResponse } from '@/lib/types/vision';

interface CacheEntry {
  id?: number;
  key: string;
  imageHash: string;
  response: VisionAnalysisResponse;
  size?: number;
  createdAt: Date;
  expiresAt: Date;
}

interface CacheOptions {
  ttl?: number; // Time to live in hours
  maxSizeMB?: number;
}

interface CacheStats {
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
  totalSize: number;
}

export class AICacheService {
  private hitCount = 0;
  private missCount = 0;
  private maxSizeMB: number;

  constructor(options: CacheOptions = {}) {
    this.maxSizeMB = options.maxSizeMB || 100;
  }

  generateCacheKey(imageData: string): string {
    // For browser compatibility, we'll use a simple hash function
    // In production, you'd use Web Crypto API
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  generateBatchKey(images: string[]): string {
    const combined = images.join('|');
    return 'batch_' + this.generateCacheKey(combined);
  }

  async store(
    imageData: string, 
    response: VisionAnalysisResponse, 
    options: CacheOptions = {}
  ): Promise<void> {
    const ttlHours = options.ttl || 24;
    const key = this.generateCacheKey(imageData);
    
    try {
      const entry: CacheEntry = {
        key,
        imageHash: key,
        response,
        size: JSON.stringify(response).length,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000)
      };

      // @ts-ignore - aiCache table will be added to db
      await db.aiCache.add(entry);
    } catch (error) {
      throw new Error('Failed to cache: ' + error);
    }
  }

  async get(imageData: string): Promise<VisionAnalysisResponse | null> {
    const key = this.generateCacheKey(imageData);
    
    try {
      // @ts-ignore - aiCache table will be added to db
      const entry = await db.aiCache
        .where('imageHash')
        .equals(key)
        .first();

      if (!entry) {
        this.recordMiss();
        return null;
      }

      // Check if expired
      if (new Date(entry.expiresAt) < new Date()) {
        // Delete expired entry
        // @ts-ignore
        await db.aiCache.where('imageHash').equals(key).delete();
        this.recordMiss();
        return null;
      }

      this.recordHit();
      return entry.response;
    } catch (error) {
      this.recordMiss();
      return null;
    }
  }

  async clearAll(): Promise<void> {
    // @ts-ignore
    await db.aiCache.clear();
  }

  async clearExpired(): Promise<number> {
    const now = new Date();
    
    // @ts-ignore
    const expired = await db.aiCache
      .where('expiresAt')
      .below(now)
      .toArray();

    const ids = expired.map((e: any) => e.id).filter(Boolean);
    
    if (ids.length > 0) {
      // @ts-ignore
      await db.aiCache.bulkDelete(ids);
    }

    return ids.length;
  }

  async getStats(): Promise<CacheStats> {
    // @ts-ignore
    const all = await db.aiCache.toArray();
    const now = new Date();
    
    const active = all.filter((e: any) => new Date(e.expiresAt) > now);
    const expired = all.filter((e: any) => new Date(e.expiresAt) <= now);
    const totalSize = all.reduce((sum: number, e: any) => sum + (e.size || 0), 0);

    return {
      totalEntries: all.length,
      activeEntries: active.length,
      expiredEntries: expired.length,
      totalSize
    };
  }

  async enforcesSizeLimit(): Promise<void> {
    const maxSizeBytes = this.maxSizeMB * 1024 * 1024;
    
    // @ts-ignore
    const all = await db.aiCache
      .orderBy('createdAt')
      .toArray();

    let totalSize = 0;
    const toDelete: number[] = [];

    // Calculate total size and find entries to delete
    for (let i = all.length - 1; i >= 0; i--) {
      totalSize += all[i].size || 0;
      
      if (totalSize > maxSizeBytes) {
        // Delete oldest entries to stay under limit
        for (let j = 0; j <= i; j++) {
          if (all[j].id) {
            toDelete.push(all[j].id);
          }
        }
        break;
      }
    }

    if (toDelete.length > 0) {
      // @ts-ignore
      await db.aiCache.bulkDelete(toDelete);
    }
  }

  async invalidate(imageData: string): Promise<void> {
    const key = this.generateCacheKey(imageData);
    
    // @ts-ignore
    await db.aiCache
      .where('imageHash')
      .equals(key)
      .delete();
  }

  async invalidateOlderThan(maxAgeHours: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    // @ts-ignore
    const old = await db.aiCache
      .where('createdAt')
      .below(cutoffTime)
      .toArray();

    const ids = old.map((e: any) => e.id).filter(Boolean);
    
    if (ids.length > 0) {
      // @ts-ignore
      await db.aiCache.bulkDelete(ids);
    }

    return ids.length;
  }

  async invalidateBatch(images: string[]): Promise<void> {
    for (const image of images) {
      await this.invalidate(image);
    }
  }

  async warmCache(
    images: string[], 
    analyzer: (image: string) => Promise<VisionAnalysisResponse>
  ): Promise<void> {
    for (const image of images) {
      const cached = await this.get(image);
      
      if (!cached) {
        const result = await analyzer(image);
        await this.store(image, result);
      }
    }
  }

  recordHit(): void {
    this.hitCount++;
  }

  recordMiss(): void {
    this.missCount++;
  }

  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    
    if (total === 0) return 0;
    
    return Number((this.hitCount / total).toFixed(2));
  }
}
