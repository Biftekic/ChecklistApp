export interface SyncOperation {
  type: 'create' | 'update' | 'delete';
  entity: 'checklist' | 'template' | 'session';
  data: any;
  timestamp: Date;
  retryCount?: number;
}

export interface SyncResult {
  success: boolean;
  executed?: boolean;
  queued?: boolean;
  willRetry?: boolean;
  queueLength?: number;
  nextRetry?: Date;
  shouldRetry?: boolean;
  error?: string;
  conflict?: boolean;
  resolution?: ConflictResolution;
}

export interface ConflictResolution {
  winner: 'local' | 'remote';
  merged: any;
}

export interface SyncStatus {
  isOnline: boolean;
  queueLength: number;
  lastSync: Date;
  isSyncing: boolean;
}

export interface SyncMetrics {
  totalOperations: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
}

export interface BatchSyncResult {
  total: number;
  successful: number;
  failed: number;
}
