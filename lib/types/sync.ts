export interface SyncQueueItem {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: 'checklist' | 'template' | 'session';
  data: any;
  timestamp: number;
  synced?: boolean;
  syncedAt?: number;
  error?: string;
  retryCount?: number;
  nextRetryAt?: number;
}

export interface SyncProgress {
  processed: number;
  total: number;
  percentage: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncConflict {
  localVersion: any;
  serverVersion: any;
  resolved?: any;
}

export type ConflictHandler = (conflict: SyncConflict) => Promise<any>;