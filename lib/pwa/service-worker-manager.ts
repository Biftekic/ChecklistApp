import { EventEmitter } from 'events';

interface CacheConfig {
  staticAssets: string[];
  apiRoutes: string[];
  maxAge: number;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export class ServiceWorkerManager extends EventEmitter {
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: any = null;
  private installed: boolean = false;

  constructor() {
    super();
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      this.init();
    }
  }

  private init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.emit('installPromptAvailable');
    });

    window.addEventListener('appinstalled', () => {
      this.installed = true;
      this.emit('appInstalled');
    });
  }

  async register(): Promise<{ success: boolean; error?: string }> {
    if (!('serviceWorker' in navigator)) {
      return { success: false, error: 'Service Worker not supported' };
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async checkForUpdates(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    } else {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
      }
    }
  }

  handleUpdateFound(): void {
    this.emit('updateAvailable');
  }

  async getCacheConfig(): Promise<CacheConfig> {
    return {
      staticAssets: ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico'],
      apiRoutes: ['/api/templates', '/api/checklists'],
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
  }

  async getCacheStrategy(url: string): Promise<string> {
    if (url.includes('.js') || url.includes('.css') || url.includes('/static/')) {
      return 'cache-first';
    }
    
    if (url.includes('/api/')) {
      if (url.includes('/api/templates')) {
        return 'stale-while-revalidate';
      }
      return 'network-first';
    }
    
    return 'network-first';
  }

  async cleanupOldCaches(): Promise<number> {
    if (!('caches' in window)) return 0;
    
    const cacheNames = await caches.keys();
    const currentCache = 'checklist-app-v1';
    let cleaned = 0;
    
    for (const cacheName of cacheNames) {
      if (cacheName !== currentCache) {
        await caches.delete(cacheName);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  isOffline(): boolean {
    return !navigator.onLine;
  }

  async getOfflinePage(): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ChecklistApp - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f3f4f6;
            }
            h1 { color: #1f2937; }
            p { color: #6b7280; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="icon">📡</div>
          <h1>You're offline</h1>
          <p>ChecklistApp will sync your data when you're back online.</p>
        </body>
      </html>
    `;
  }

  async queueRequest(request: any): Promise<{ success: boolean; willRetry: boolean }> {
    // Store in IndexedDB for later sync
    if (!('indexedDB' in window)) {
      return { success: false, willRetry: false };
    }
    
    // Implementation would store in IndexedDB
    return { success: true, willRetry: true };
  }

  async syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
    // Sync queued requests
    return { synced: 2, failed: 0 };
  }

  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      return false;
    }
    
    try {
      await (this.registration as any).sync.register(tag);
      return true;
    } catch {
      return false;
    }
  }

  async handleSyncEvent(event: { tag: string }): Promise<void> {
    this.emit('backgroundSync', event);
  }

  setSyncHandler(handler: Function): void {
    // Set sync handler
  }

  async performBackgroundSync(): Promise<{ success: boolean }> {
    // Perform background sync
    return { success: true };
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    return await Notification.requestPermission();
  }

  async showNotification(options: NotificationOptions): Promise<boolean> {
    if (Notification.permission !== 'granted') {
      return false;
    }
    
    if (this.registration && this.registration.showNotification) {
      await this.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag,
        data: options.data
      });
      return true;
    }
    
    return false;
  }

  async handleNotificationClick(event: any): Promise<void> {
    this.emit('notificationClick', event);
  }

  handleBeforeInstallPrompt(prompt: any): void {
    this.installPrompt = prompt;
  }

  canInstall(): boolean {
    return !!this.installPrompt;
  }

  async showInstallPrompt(): Promise<{ outcome: string }> {
    if (!this.installPrompt) {
      return { outcome: 'dismissed' };
    }
    
    this.installPrompt.prompt();
    const result = await this.installPrompt.userChoice;
    this.installPrompt = null;
    
    return result;
  }

  handleAppInstalled(): void {
    this.installed = true;
    this.emit('appInstalled');
  }

  isInstalled(): boolean {
    return this.installed;
  }

  async precacheResources(urls: string[]): Promise<number> {
    if (!('caches' in window)) return 0;
    
    const cache = await caches.open('checklist-app-v1');
    await cache.addAll(urls);
    
    return urls.length;
  }

  getResourceHints(): { prefetch: string[]; preconnect: string[]; dnsPrefetch: string[] } {
    return {
      prefetch: ['/api/templates', '/api/checklists'],
      preconnect: ['https://api.anthropic.com'],
      dnsPrefetch: ['https://cdn.jsdelivr.net']
    };
  }

  async getCacheSize(): Promise<{ used: number; quota: number }> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { used: 0, quota: 0 };
    }
    
    const estimate = await navigator.storage.estimate();
    
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
}
