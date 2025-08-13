import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceWorkerManager } from '../service-worker-manager';

// Mock Service Worker API
const mockServiceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({
    active: {
      postMessage: vi.fn()
    },
    update: vi.fn()
  }),
  controller: null,
  getRegistration: vi.fn()
};

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true
});

// Mock Notification API
const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn()
};

Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  writable: true
});

describe('Service Worker Manager', () => {
  let swManager: ServiceWorkerManager;

  beforeEach(() => {
    swManager = new ServiceWorkerManager();
    vi.clearAllMocks();
  });

  describe('Registration', () => {
    it('should register service worker', async () => {
      mockServiceWorker.register.mockResolvedValue({
        active: { state: 'activated' },
        installing: null,
        waiting: null,
        scope: '/'
      });
      
      const result = await swManager.register();
      
      expect(result.success).toBe(true);
      expect(mockServiceWorker.register).toHaveBeenCalledWith(
        '/sw.js',
        expect.objectContaining({ scope: '/' })
      );
    });

    it('should handle registration failure', async () => {
      mockServiceWorker.register.mockRejectedValue(
        new Error('Registration failed')
      );
      
      const result = await swManager.register();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Registration failed');
    });
  });

  describe('Offline Functionality', () => {
    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });
      
      const isOffline = swManager.isOffline();
      expect(isOffline).toBe(true);
    });

    it('should serve offline page when offline', async () => {
      const offlinePage = await swManager.getOfflinePage();
      expect(offlinePage).toContain('offline');
      expect(offlinePage).toContain('ChecklistApp');
    });
  });
});
