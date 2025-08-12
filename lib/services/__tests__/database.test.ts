import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../database';
import type { Checklist, Template } from '../../types/checklist';
import type { QASession } from '../../types/qa';

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(async () => {
    dbService = new DatabaseService();
    // Wait for initialization
    await dbService.initialize();
  });

  afterEach(async () => {
    await dbService.close();
  });

  describe('Database Initialization', () => {
    it('should initialize IndexedDB with correct schema', async () => {
      expect(dbService).toBeDefined();
      expect(dbService.isReady()).toBe(true);
    });

    it('should create all required tables', () => {
      const tables = dbService.getTables();
      expect(tables).toContain('checklists');
      expect(tables).toContain('templates');
      expect(tables).toContain('sessions');
      expect(tables).toContain('syncQueue');
      expect(tables).toContain('aiCache');
    });

    it('should handle database version migration', async () => {
      const migrationResult = await dbService.migrate(2);
      expect(migrationResult.success).toBe(true);
      expect(migrationResult.version).toBe(2);
    });

    it('should handle quota exceeded errors', async () => {
      const largeData = new Array(1000000).fill({ data: 'test' });
      const result = await dbService.storeChecklist({
        id: 'test-1',
        name: 'Large Checklist',
        items: largeData,
        serviceType: 'regular',
        propertyType: 'apartment',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Checklist);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('quota');
    });
  });

  describe('Checklist CRUD Operations', () => {
    const mockChecklist: Checklist = {
      id: 'checklist-1',
      name: 'Test Checklist',
      items: [],
      serviceType: 'regular',
      propertyType: 'apartment',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create a new checklist', async () => {
      const result = await dbService.createChecklist(mockChecklist);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockChecklist.id);
    });

    it('should read a checklist by id', async () => {
      await dbService.createChecklist(mockChecklist);
      const result = await dbService.getChecklist(mockChecklist.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe(mockChecklist.name);
    });

    it('should update a checklist', async () => {
      await dbService.createChecklist(mockChecklist);
      const updated = { ...mockChecklist, name: 'Updated Checklist' };
      const result = await dbService.updateChecklist(updated);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Checklist');
    });

    it('should delete a checklist', async () => {
      await dbService.createChecklist(mockChecklist);
      const result = await dbService.deleteChecklist(mockChecklist.id);
      expect(result.success).toBe(true);
      
      const deleted = await dbService.getChecklist(mockChecklist.id);
      expect(deleted).toBeUndefined();
    });

    it('should handle concurrent modifications', async () => {
      await dbService.createChecklist(mockChecklist);
      
      const update1 = dbService.updateChecklist({ ...mockChecklist, name: 'Update 1' });
      const update2 = dbService.updateChecklist({ ...mockChecklist, name: 'Update 2' });
      
      const results = await Promise.all([update1, update2]);
      expect(results.every(r => r.success)).toBe(true);
      
      const final = await dbService.getChecklist(mockChecklist.id);
      expect(['Update 1', 'Update 2']).toContain(final?.name);
    });
  });

  describe('Offline Sync Queue', () => {
    it('should add operations to sync queue', async () => {
      const operation = {
        type: 'create' as const,
        entity: 'checklist' as const,
        data: { id: 'test-1', name: 'Test' },
        timestamp: new Date()
      };
      
      const result = await dbService.addToSyncQueue(operation);
      expect(result.success).toBe(true);
      expect(result.queueLength).toBeGreaterThan(0);
    });

    it('should process sync queue when online', async () => {
      await dbService.addToSyncQueue({
        type: 'create' as const,
        entity: 'checklist' as const,
        data: { id: 'test-1' },
        timestamp: new Date()
      });
      
      const result = await dbService.processSyncQueue();
      expect(result.processed).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it('should handle conflict resolution', async () => {
      const localChecklist = {
        id: 'conflict-1',
        name: 'Local Version',
        updatedAt: new Date('2024-01-01')
      };
      
      const remoteChecklist = {
        id: 'conflict-1',
        name: 'Remote Version',
        updatedAt: new Date('2024-01-02')
      };
      
      const resolved = await dbService.resolveConflict(localChecklist, remoteChecklist);
      expect(resolved.name).toBe('Remote Version');
    });
  });

  describe('AI Response Caching', () => {
    it('should cache AI responses', async () => {
      const aiResponse = {
        id: 'ai-1',
        prompt: 'Analyze this room',
        response: 'Room analysis results',
        imageHash: 'abc123',
        timestamp: new Date()
      };
      
      const result = await dbService.cacheAIResponse(aiResponse);
      expect(result.success).toBe(true);
    });

    it('should retrieve cached AI responses', async () => {
      const aiResponse = {
        id: 'ai-2',
        prompt: 'Analyze this room',
        response: 'Cached analysis',
        imageHash: 'def456',
        timestamp: new Date()
      };
      
      await dbService.cacheAIResponse(aiResponse);
      const cached = await dbService.getCachedAIResponse('def456');
      
      expect(cached).toBeDefined();
      expect(cached?.response).toBe('Cached analysis');
    });
  });
});
