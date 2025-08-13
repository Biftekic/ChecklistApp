import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineSyncService } from '../offline-sync';
import { DatabaseService } from '../database';
import type { SyncOperation, SyncStatus } from '@/lib/types/sync';

// Mock network status
const mockNavigator = {
  onLine: true
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Offline Sync Service', () => {
  let syncService: OfflineSyncService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    dbService = new DatabaseService();
    await dbService.initialize();
    syncService = new OfflineSyncService(dbService);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await dbService.close();
  });

  describe('Queue Management', () => {
    it('should queue operations when offline', async () => {
      mockNavigator.onLine = false;
      
      const operation: SyncOperation = {
        type: 'create',
        entity: 'checklist',
        data: { id: 'test-1', name: 'Test Checklist' },
        timestamp: new Date()
      };
      
      const result = await syncService.queueOperation(operation);
      
      expect(result.queued).toBe(true);
      expect(result.willRetry).toBe(true);
      expect(result.queueLength).toBeGreaterThan(0);
    });

    it('should execute operations immediately when online', async () => {
      mockNavigator.onLine = true;
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
      
      const operation: SyncOperation = {
        type: 'create',
        entity: 'checklist',
        data: { id: 'test-2', name: 'Test Checklist' },
        timestamp: new Date()
      };
      
      const result = await syncService.queueOperation(operation);
      
      expect(result.queued).toBe(false);
      expect(result.executed).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle batch synchronization', async () => {
      mockNavigator.onLine = false;
      
      // Queue multiple operations
      const operations: SyncOperation[] = [
        { type: 'create', entity: 'checklist', data: { id: '1' }, timestamp: new Date() },
        { type: 'update', entity: 'checklist', data: { id: '2' }, timestamp: new Date() },
        { type: 'delete', entity: 'checklist', data: { id: '3' }, timestamp: new Date() }
      ];
      
      for (const op of operations) {
        await syncService.queueOperation(op);
      }
      
      // Go online and sync
      mockNavigator.onLine = true;
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
      
      const syncResult = await syncService.syncAll();
      
      expect(syncResult.total).toBe(3);
      expect(syncResult.successful).toBe(3);
      expect(syncResult.failed).toBe(0);
    });

    it('should respect operation order', async () => {
      const executionOrder: string[] = [];
      
      (global.fetch as any).mockImplementation(async (url: string, options: any) => {
        const body = JSON.parse(options.body);
        executionOrder.push(body.type);
        return { ok: true, json: async () => ({ success: true }) };
      });
      
      await syncService.queueOperation({ type: 'create', entity: 'checklist', data: { id: '1' }, timestamp: new Date() });
      await syncService.queueOperation({ type: 'update', entity: 'checklist', data: { id: '1' }, timestamp: new Date() });
      await syncService.queueOperation({ type: 'delete', entity: 'checklist', data: { id: '1' }, timestamp: new Date() });
      
      mockNavigator.onLine = true;
      await syncService.syncAll();
      
      expect(executionOrder).toEqual(['create', 'update', 'delete']);
    });
  });

  describe('Retry Logic', () => {
    it('should implement exponential backoff', async () => {
      const operation: SyncOperation = {
        type: 'create',
        entity: 'checklist',
        data: { id: 'test-retry' },
        timestamp: new Date()
      };
      
      // First attempt fails
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const result1 = await syncService.executeOperation(operation);
      expect(result1.success).toBe(false);
      expect(result1.nextRetry).toBeDefined();
      
      // Check backoff timing
      const delay1 = result1.nextRetry!.getTime() - Date.now();
      expect(delay1).toBeGreaterThan(900); // ~1 second
      expect(delay1).toBeLessThan(1100);
      
      // Second attempt fails
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      const result2 = await syncService.executeOperation(operation);
      
      const delay2 = result2.nextRetry!.getTime() - Date.now();
      expect(delay2).toBeGreaterThan(1900); // ~2 seconds
      expect(delay2).toBeLessThan(2100);
    });

    it('should have maximum retry limit', async () => {
      const operation: SyncOperation = {
        type: 'create',
        entity: 'checklist',
        data: { id: 'test-max-retry' },
        timestamp: new Date(),
        retryCount: 5 // Already at max
      };
      
      (global.fetch as any).mockRejectedValue(new Error('Persistent error'));
      
      const result = await syncService.executeOperation(operation);
      
      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
      expect(result.error).toContain('Max retries exceeded');
    });

    it('should handle network recovery', async () => {
      mockNavigator.onLine = false;
      
      // Queue operations while offline
      await syncService.queueOperation({
        type: 'create',
        entity: 'checklist',
        data: { id: 'offline-1' },
        timestamp: new Date()
      });
      
      // Simulate network recovery
      mockNavigator.onLine = true;
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
      
      // Trigger network recovery handler
      await syncService.handleNetworkRecovery();
      
      const queue = await dbService.getSyncQueue();
      expect(queue.length).toBe(0); // Queue should be empty after sync
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect conflicts', async () => {
      const localData = {
        id: 'conflict-1',
        name: 'Local Version',
        updatedAt: new Date('2025-01-01')
      };
      
      const remoteData = {
        id: 'conflict-1',
        name: 'Remote Version',
        updatedAt: new Date('2025-01-02')
      };
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ conflict: true, remote: remoteData })
      });
      
      const result = await syncService.executeOperation({
        type: 'update',
        entity: 'checklist',
        data: localData,
        timestamp: new Date()
      });
      
      expect(result.success).toBe(false);
      expect(result.conflict).toBe(true);
      expect(result.resolution).toBeDefined();
    });

    it('should resolve conflicts with last-write-wins strategy', async () => {
      const localData = {
        id: 'lww-1',
        name: 'Local Version',
        updatedAt: new Date('2025-01-01')
      };
      
      const remoteData = {
        id: 'lww-1',
        name: 'Remote Version',
        updatedAt: new Date('2025-01-02')
      };
      
      const resolution = await syncService.resolveConflict(
        localData,
        remoteData,
        'last-write-wins'
      );
      
      expect(resolution.winner).toBe('remote');
      expect(resolution.merged.name).toBe('Remote Version');
    });

    it('should support custom merge strategy', async () => {
      const localData = {
        id: 'merge-1',
        items: ['A', 'B'],
        updatedAt: new Date('2025-01-01')
      };
      
      const remoteData = {
        id: 'merge-1',
        items: ['B', 'C'],
        updatedAt: new Date('2025-01-02')
      };
      
      const resolution = await syncService.resolveConflict(
        localData,
        remoteData,
        'merge'
      );
      
      expect(resolution.merged.items).toContain('A');
      expect(resolution.merged.items).toContain('B');
      expect(resolution.merged.items).toContain('C');
    });
  });

  describe('Performance', () => {
    it('should handle large queues efficiently', async () => {
      const operations: SyncOperation[] = Array.from({ length: 1000 }, (_, i) => ({
        type: 'create' as const,
        entity: 'checklist' as const,
        data: { id: `bulk-${i}` },
        timestamp: new Date()
      }));
      
      const startTime = Date.now();
      
      for (const op of operations) {
        await syncService.queueOperation(op);
      }
      
      const queueTime = Date.now() - startTime;
      expect(queueTime).toBeLessThan(5000); // Should queue 1000 items in under 5 seconds
      
      const queue = await dbService.getSyncQueue();
      expect(queue.length).toBe(1000);
    });

    it('should batch API calls for efficiency', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, batchProcessed: true })
      });
      
      // Queue multiple operations
      for (let i = 0; i < 50; i++) {
        await syncService.queueOperation({
          type: 'create',
          entity: 'checklist',
          data: { id: `batch-${i}` },
          timestamp: new Date()
        });
      }
      
      mockNavigator.onLine = true;
      await syncService.syncAll({ batchSize: 10 });
      
      // Should make 5 batch calls instead of 50 individual calls
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('Status Tracking', () => {
    it('should provide sync status', async () => {
      const status = await syncService.getStatus();
      
      expect(status).toMatchObject({
        isOnline: expect.any(Boolean),
        queueLength: expect.any(Number),
        lastSync: expect.any(Date),
        isSyncing: expect.any(Boolean)
      });
    });

    it('should emit sync events', async () => {
      const events: string[] = [];
      
      syncService.on('syncStart', () => events.push('start'));
      syncService.on('syncComplete', () => events.push('complete'));
      syncService.on('syncError', () => events.push('error'));
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
      
      await syncService.queueOperation({
        type: 'create',
        entity: 'checklist',
        data: { id: 'event-test' },
        timestamp: new Date()
      });
      
      mockNavigator.onLine = true;
      await syncService.syncAll();
      
      expect(events).toContain('start');
      expect(events).toContain('complete');
    });

    it('should track sync metrics', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
      
      for (let i = 0; i < 3; i++) {
        await syncService.queueOperation({
          type: 'create',
          entity: 'checklist',
          data: { id: `metric-${i}` },
          timestamp: new Date()
        });
      }
      
      mockNavigator.onLine = true;
      await syncService.syncAll();
      
      const metrics = await syncService.getMetrics();
      
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.successfulSyncs).toBe(2);
      expect(metrics.failedSyncs).toBe(1);
      expect(metrics.averageSyncTime).toBeGreaterThan(0);
    });
  });
});
