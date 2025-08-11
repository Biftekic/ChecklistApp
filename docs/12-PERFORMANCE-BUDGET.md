# Performance Budget

## Overview

This document defines the performance budget and optimization strategies for the ChecklistApp PWA, ensuring fast load times, smooth interactions, and excellent user experience across all devices, particularly on mobile networks.

## Performance Targets

### Core Web Vitals (Mobile)

| Metric | Target | Maximum | Description |
|--------|--------|---------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.0s | 2.5s | Main content visible |
| **FID** (First Input Delay) | < 50ms | 100ms | Time to interactivity |
| **CLS** (Cumulative Layout Shift) | < 0.05 | 0.1 | Visual stability |
| **FCP** (First Contentful Paint) | < 1.5s | 1.8s | First content visible |
| **TTI** (Time to Interactive) | < 3.5s | 3.8s | Fully interactive |
| **TBT** (Total Blocking Time) | < 200ms | 300ms | Main thread blocking |

### Network Performance

| Metric | 3G Target | 4G Target | WiFi Target |
|--------|-----------|-----------|-------------|
| Initial Load | < 4s | < 2s | < 1s |
| Route Change | < 1s | < 500ms | < 200ms |
| API Response | < 2s | < 1s | < 500ms |
| Image Load | < 3s | < 1.5s | < 500ms |

## Bundle Size Budget

### JavaScript Budget

```javascript
// Budget configuration
const jsBudget = {
  initial: {
    total: 200, // KB (gzipped)
    breakdown: {
      framework: 45,      // Next.js + React
      vendor: 60,         // Third-party libraries
      application: 60,    // Application code
      polyfills: 10,      // Browser compatibility
      analytics: 5,       // Analytics/monitoring
      reserve: 20         // Future growth
    }
  },
  routes: {
    dashboard: 50,      // KB per route
    checklist: 40,
    camera: 60,         // Includes camera libraries
    settings: 30,
    auth: 25
  },
  lazy: {
    aiFeatures: 80,     // Claude AI integration
    pdfExport: 40,      // PDF generation
    charts: 50,         // Data visualization
    advancedEditor: 60  // Rich text editing
  }
}
```

### CSS Budget

```javascript
const cssBudget = {
  critical: 14,         // KB - Inline critical CSS
  main: 40,            // KB - Main stylesheet
  components: 30,       // KB - Component styles
  utilities: 10,        // KB - Utility classes
  total: 94            // KB - Total CSS
}
```

### Asset Budget

```javascript
const assetBudget = {
  images: {
    hero: 100,          // KB - Hero images
    thumbnail: 20,      // KB - Thumbnails
    icon: 5,            // KB - Icons
    logo: 10            // KB - Logo
  },
  fonts: {
    subset: 20,         // KB - Latin subset
    full: 60,           // KB - Full character set
    variable: 30        // KB - Variable font
  },
  total: 245           // KB - Total assets
}
```

## Performance Optimization Strategies

### 1. Code Splitting & Lazy Loading

```typescript
// app/components/LazyComponents.tsx

// Route-based code splitting
const DashboardPage = dynamic(() => import('@/pages/dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false
})

// Component-based code splitting
const AIAnalyzer = dynamic(() => import('@/components/AIAnalyzer'), {
  loading: () => <Spinner />,
  ssr: false
})

// Conditional loading
const CameraModule = dynamic(
  () => import('@/components/CameraModule'),
  {
    loading: () => <CameraPlaceholder />,
    ssr: false,
    // Only load when needed
    suspense: true
  }
)

// Progressive enhancement
export function ProgressiveImage({ src, alt, ...props }) {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <>
      {!loaded && <ImageSkeleton />}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        placeholder="blur"
        {...props}
      />
    </>
  )
}
```

### 2. Bundle Optimization

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Chunk splitting strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          
          // Framework chunk
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
            reuseExistingChunk: true
          },
          
          // Common libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1]
              return `lib.${packageName.replace('@', '')}`
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          },
          
          // Shared components
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true
          }
        }
      }
      
      // Minimize JS
      config.optimization.minimize = true
      
      // Module concatenation
      config.optimization.concatenateModules = true
    }
    
    return config
  },
  
  // Compression
  compress: true,
  
  // Optimize for production
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  
  // SWC minification
  swcMinify: true
}
```

### 3. Critical CSS & Font Loading

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true
})

// Critical CSS inline
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS */
              :root {
                --primary: #007AFF;
                --background: #FFFFFF;
                --text: #000000;
              }
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: var(--font-inter);
                background: var(--background);
                color: var(--text);
              }
              
              .skeleton {
                background: linear-gradient(
                  90deg,
                  #f0f0f0 25%,
                  #e0e0e0 50%,
                  #f0f0f0 75%
                );
                animation: loading 1.5s infinite;
              }
              
              @keyframes loading {
                0% { background-position: -200px 0; }
                100% { background-position: 200px 0; }
              }
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Image Optimization

```typescript
// lib/image-optimization.ts

export class ImageOptimizer {
  static getOptimalFormat(userAgent: string): string {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      return 'webp'
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'jpeg'
    }
    return 'webp' // Default to WebP
  }
  
  static generateSrcSet(src: string, sizes: number[]): string {
    return sizes
      .map(size => `${src}?w=${size} ${size}w`)
      .join(', ')
  }
  
  static calculateSizes(breakpoints: Record<string, number>): string {
    return Object.entries(breakpoints)
      .map(([bp, size]) => `(max-width: ${bp}) ${size}vw`)
      .join(', ') + ', 100vw'
  }
}

// Usage in component
export function OptimizedImage({ src, alt, priority = false }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={ImageOptimizer.calculateSizes({
        '640px': 100,
        '768px': 50,
        '1024px': 33
      })}
      quality={85}
      placeholder="blur"
      blurDataURL={generateBlurDataURL(src)}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
    />
  )
}
```

### 5. Service Worker Caching Strategy

```javascript
// public/sw.js

const CACHE_VERSION = 'v1'
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`
}

// Cache strategies
const cacheStrategies = {
  // Cache first for static assets
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAMES.static)
    const cached = await cache.match(request)
    
    if (cached) {
      // Update cache in background
      fetch(request).then(response => {
        cache.put(request, response.clone())
      })
      return cached
    }
    
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  },
  
  // Network first for API calls
  networkFirst: async (request) => {
    try {
      const response = await fetch(request)
      const cache = await caches.open(CACHE_NAMES.api)
      cache.put(request, response.clone())
      return response
    } catch (error) {
      const cached = await caches.match(request)
      if (cached) return cached
      throw error
    }
  },
  
  // Stale while revalidate for images
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAMES.images)
    const cached = await cache.match(request)
    
    const fetchPromise = fetch(request).then(response => {
      cache.put(request, response.clone())
      return response
    })
    
    return cached || fetchPromise
  }
}

// Apply strategies based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(cacheStrategies.networkFirst(request))
    return
  }
  
  // Images
  if (request.destination === 'image') {
    event.respondWith(cacheStrategies.staleWhileRevalidate(request))
    return
  }
  
  // Static assets
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheStrategies.cacheFirst(request))
    return
  }
})
```

### 6. Database Query Optimization

```typescript
// lib/db/query-optimizer.ts

export class QueryOptimizer {
  // Batch multiple queries
  static async batchQueries<T>(
    queries: (() => Promise<T>)[]
  ): Promise<T[]> {
    return Promise.all(queries.map(q => q()))
  }
  
  // Implement cursor-based pagination
  static async paginate<T>(
    query: any,
    cursor?: string,
    limit: number = 20
  ): Promise<{ items: T[], nextCursor?: string }> {
    const items = await query
      .take(limit + 1)
      .cursor(cursor ? { id: cursor } : undefined)
      .execute()
    
    const hasMore = items.length > limit
    const nextCursor = hasMore ? items[limit - 1].id : undefined
    
    return {
      items: items.slice(0, limit),
      nextCursor
    }
  }
  
  // Implement query result caching
  private static cache = new Map()
  
  static async cachedQuery<T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = 60000
  ): Promise<T> {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    
    const data = await query()
    this.cache.set(key, { data, timestamp: Date.now() })
    
    return data
  }
}
```

### 7. React Performance Optimization

```tsx
// hooks/usePerformance.ts

export function usePerformanceOptimization() {
  // Debounce expensive operations
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      performSearch(query)
    }, 300),
    []
  )
  
  // Virtualize long lists
  const virtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: useCallback(() => 50, []),
    overscan: 5
  })
  
  // Memoize expensive computations
  const expensiveResult = useMemo(() => {
    return computeExpensiveValue(data)
  }, [data])
  
  // Use transitions for non-urgent updates
  const [isPending, startTransition] = useTransition()
  
  const handleUpdate = (value: string) => {
    startTransition(() => {
      setSearchQuery(value)
    })
  }
  
  return {
    debouncedSearch,
    virtualizer,
    expensiveResult,
    handleUpdate,
    isPending
  }
}

// Optimize component re-renders
export const OptimizedComponent = memo(
  ({ data, onUpdate }: Props) => {
    // Use callback refs to avoid re-renders
    const handleClick = useCallback(() => {
      onUpdate(data.id)
    }, [data.id, onUpdate])
    
    return (
      <div onClick={handleClick}>
        {/* Component content */}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id &&
           prevProps.data.version === nextProps.data.version
  }
)
```

## Performance Monitoring

### Real User Monitoring (RUM)

```typescript
// lib/monitoring/performance-monitor.ts

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {}
  
  static init() {
    if (typeof window === 'undefined') return
    
    // Core Web Vitals
    this.observeCoreWebVitals()
    
    // Custom metrics
    this.observeCustomMetrics()
    
    // Send metrics to analytics
    this.reportMetrics()
  }
  
  private static observeCoreWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    
    // FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime
      })
    }).observe({ type: 'first-input', buffered: true })
    
    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          this.metrics.cls = clsValue
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  }
  
  private static observeCustomMetrics() {
    // Time to Interactive
    this.metrics.tti = performance.timing.domInteractive - 
                      performance.timing.navigationStart
    
    // First Contentful Paint
    const fcp = performance.getEntriesByType('paint')
      .find(entry => entry.name === 'first-contentful-paint')
    if (fcp) {
      this.metrics.fcp = fcp.startTime
    }
    
    // JavaScript execution time
    this.metrics.jsExecutionTime = 
      performance.timing.domContentLoadedEventEnd -
      performance.timing.domContentLoadedEventStart
    
    // Total bundle size
    const resources = performance.getEntriesByType('resource')
    this.metrics.totalTransferSize = resources.reduce(
      (total, resource) => total + (resource.transferSize || 0),
      0
    )
  }
  
  private static reportMetrics() {
    // Send to analytics endpoint
    if (this.metrics.lcp && this.metrics.fid && this.metrics.cls) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.metrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType
        })
      })
    }
  }
}
```

### Performance Testing

```typescript
// tests/performance.test.ts

describe('Performance Tests', () => {
  test('Bundle size is within budget', async () => {
    const stats = await getWebpackStats()
    
    const jsSize = stats.assets
      .filter(asset => asset.name.endsWith('.js'))
      .reduce((total, asset) => total + asset.size, 0)
    
    expect(jsSize).toBeLessThan(200 * 1024) // 200KB budget
  })
  
  test('Initial load performance', async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    // Simulate 3G network
    await page.emulateNetworkConditions({
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      latency: 40
    })
    
    const metrics = await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {}
      
      new PerformanceObserver((list) => {
        const entry = list.getEntries()[0]
        window.performanceMetrics.lcp = entry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    
    await page.goto('http://localhost:3000')
    
    const performanceMetrics = await page.evaluate(() => 
      window.performanceMetrics
    )
    
    expect(performanceMetrics.lcp).toBeLessThan(4000) // 4s on 3G
    
    await browser.close()
  })
})
```

## Performance Checklist

### Pre-Launch Performance Checklist

- [ ] **Core Web Vitals**
  - [ ] LCP < 2.5s on mobile
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
  
- [ ] **Bundle Size**
  - [ ] Initial JS < 200KB (gzipped)
  - [ ] Initial CSS < 14KB (critical)
  - [ ] Route chunks < 50KB each
  
- [ ] **Loading Optimization**
  - [ ] Code splitting implemented
  - [ ] Lazy loading for images
  - [ ] Fonts optimized with font-display: swap
  - [ ] Critical CSS inlined
  
- [ ] **Caching**
  - [ ] Service Worker implemented
  - [ ] Cache headers configured
  - [ ] Static assets cached
  - [ ] API responses cached appropriately
  
- [ ] **Images**
  - [ ] Next-gen formats (WebP/AVIF)
  - [ ] Responsive images with srcset
  - [ ] Lazy loading implemented
  - [ ] Blur placeholders for above-fold images
  
- [ ] **Third-party Scripts**
  - [ ] Analytics loaded asynchronously
  - [ ] Non-critical scripts deferred
  - [ ] Third-party domains preconnected
  
- [ ] **Database**
  - [ ] Queries optimized with indexes
  - [ ] N+1 queries eliminated
  - [ ] Pagination implemented
  - [ ] Query results cached
  
- [ ] **Monitoring**
  - [ ] RUM implemented
  - [ ] Performance budgets enforced
  - [ ] Alerts configured for regressions
  - [ ] Regular performance audits scheduled

---

*Last Updated: December 2024*
*Version: 1.0.0*