import { EventEmitter } from 'events';
import type { DatabaseService } from './database';
import type { 
  SyncOperation, 
  SyncResult, 
  SyncStatus, 
  SyncMetrics,
  BatchSyncResult,
  ConflictResolution 
} from '@/lib/types/sync';

export class OfflineSyncService extends EventEmitter {
  private db: DatabaseService;
  private isSyncing: boolean = false;
  private lastSync: Date = new Date();
  private metrics: SyncMetrics = {
    totalOperations: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageSyncTime: 0
  };
  private syncTimes: number[] = [];
  private readonly MAX_RETRIES = 5;
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  constructor(database: DatabaseService) {
    super();
    this.db = database;
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkRecovery());
      window.addEventListener('offline', () => this.handleNetworkLoss());
    }
  }

  async queueOperation(operation: SyncOperation): Promise<SyncResult> {
    this.metrics.totalOperations++;
    
    // Check if online
    if (navigator.onLine) {
      // Try to execute immediately
      const result = await this.executeOperation(operation);
      if (result.success) {
        return { ...result, queued: false, executed: true };
      }
    }
    
    // Queue for later
    const queueResult = await this.db.addToSyncQueue({
      type: operation.type,
      entity: operation.entity,
      data: operation.data,
      timestamp: operation.timestamp,
      retryCount: operation.retryCount || 0,
      nextRetry: new Date(Date.now() + 1000) // Initial retry after 1 second
    });
    
    return {
      success: true,
      queued: true,
      willRetry: true,
      queueLength: queueResult.queueLength
    };
  }

  async executeOperation(operation: SyncOperation): Promise<SyncResult> {
    // Check retry limit
    if (operation.retryCount && operation.retryCount >= this.MAX_RETRIES) {
      this.metrics.failedSyncs++;
      return {
        success: false,
        shouldRetry: false,
        error: 'Max retries exceeded'
      };
    }
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: operation.type,
          entity: operation.entity,
          data: operation.data
        })
      });
      
      const syncTime = Date.now() - startTime;
      this.updateSyncMetrics(syncTime);
      
      if (response.ok) {
        this.metrics.successfulSyncs++;
        return { success: true };
      }
      
      // Handle conflict
      if (response.status === 409) {
        const conflictData = await response.json();
        const resolution = await this.resolveConflict(
          operation.data,
          conflictData.remote,
          'last-write-wins'
        );
        
        return {
          success: false,
          conflict: true,
          resolution
        };
      }
      
      throw new Error(`Sync failed with status: ${response.status}`);
      
    } catch (error) {
      this.metrics.failedSyncs++;
      const retryCount = (operation.retryCount || 0) + 1;
      const nextRetryDelay = Math.pow(2, retryCount - 1) * 1000; // Exponential backoff
      
      return {
        success: false,
        shouldRetry: retryCount < this.MAX_RETRIES,
        nextRetry: new Date(Date.now() + nextRetryDelay),
        error: (error as Error).message
      };
    }
  }

  async syncAll(options?: { batchSize?: number }): Promise<BatchSyncResult> {
    if (this.isSyncing) {
      return { total: 0, successful: 0, failed: 0 };
    }
    
    this.isSyncing = true;
    this.emit('syncStart');
    
    const batchSize = options?.batchSize || 50;
    const queue = await this.db.getSyncQueue();
    let successful = 0;
    let failed = 0;
    
    try {
      // Process in batches
      for (let i = 0; i < queue.length; i += batchSize) {
        const batch = queue.slice(i, i + batchSize);
        
        if (batchSize > 1 && batch.length > 1) {
          // Batch API call
          try {
            const response = await fetch(`${this.API_BASE_URL}/sync/batch`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operations: batch })
            });
            
            if (response.ok) {
              successful += batch.length;
              // Remove from queue
              for (const item of batch) {
                await this.db['processSyncQueue']();
              }
            } else {
              failed += batch.length;
            }
          } catch (error) {
            failed += batch.length;
          }
        } else {
          // Individual processing
          for (const item of batch) {
            const result = await this.executeOperation({
              type: item.type,
              entity: item.entity,
              data: item.data,
              timestamp: item.timestamp,
              retryCount: item.retryCount
            });
            
            if (result.success) {
              successful++;
              await this.db['processSyncQueue']();
            } else {
              failed++;
            }
          }
        }
      }
      
      this.lastSync = new Date();
      this.emit('syncComplete', { successful, failed });
      
    } catch (error) {
      this.emit('syncError', error);
    } finally {
      this.isSyncing = false;
    }
    
    return {
      total: queue.length,
      successful,
      failed
    };
  }

  async resolveConflict(
    local: any, 
    remote: any, 
    strategy: 'last-write-wins' | 'merge'
  ): Promise<ConflictResolution> {
    if (strategy === 'last-write-wins') {
      const localTime = new Date(local.updatedAt).getTime();
      const remoteTime = new Date(remote.updatedAt).getTime();
      
      if (remoteTime > localTime) {
        return { winner: 'remote', merged: remote };
      } else {
        return { winner: 'local', merged: local };
      }
    }
    
    // Merge strategy
    const merged = { ...local };
    
    // Merge arrays
    if (local.items && remote.items) {
      const allItems = [...(local.items || []), ...(remote.items || [])];
      merged.items = Array.from(new Set(allItems));
    }
    
    // Use latest updatedAt
    merged.updatedAt = new Date(Math.max(
      new Date(local.updatedAt).getTime(),
      new Date(remote.updatedAt).getTime()
    ));
    
    return { winner: 'local', merged };
  }

  async handleNetworkRecovery(): Promise<void> {
    if (!this.isSyncing) {
      await this.syncAll();
    }
  }

  async handleNetworkLoss(): Promise<void> {
    // Could emit an event or update UI
    this.emit('offline');
  }

  async getStatus(): Promise<SyncStatus> {
    const queue = await this.db.getSyncQueue();
    
    return {
      isOnline: navigator.onLine,
      queueLength: queue.length,
      lastSync: this.lastSync,
      isSyncing: this.isSyncing
    };
  }

  async getMetrics(): Promise<SyncMetrics> {
    return { ...this.metrics };
  }

  private updateSyncMetrics(syncTime: number): void {
    this.syncTimes.push(syncTime);
    
    // Keep only last 100 sync times
    if (this.syncTimes.length > 100) {
      this.syncTimes.shift();
    }
    
    // Calculate average
    const sum = this.syncTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageSyncTime = sum / this.syncTimes.length;
  }
}
