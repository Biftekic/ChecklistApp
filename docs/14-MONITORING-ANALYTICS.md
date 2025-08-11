# Monitoring & Analytics Guide

## Overview

This document outlines the comprehensive monitoring, analytics, and observability strategy for the ChecklistApp PWA, ensuring system health, performance tracking, user behavior insights, and proactive issue detection.

## Monitoring Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Monitoring Stack                           │
├────────────────────────────────────────────────────────────┤
│  Application     │  Infrastructure  │  Business            │
├────────────────────────────────────────────────────────────┤
│  • Error Tracking│  • Server Health │  • User Analytics    │
│  • Performance   │  • Database      │  • Conversion Rates  │
│  • User Sessions │  • Network       │  • Feature Usage     │
│  • API Metrics   │  • Storage       │  • Revenue Metrics   │
└────────────────────────────────────────────────────────────┘
```

## 1. Application Performance Monitoring (APM)

### Real User Monitoring (RUM)

```typescript
// lib/monitoring/rum.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

export class RealUserMonitoring {
  private static instance: RealUserMonitoring
  private metrics: Map<string, any> = new Map()
  private sessionId: string
  
  private constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeMonitoring()
  }
  
  static getInstance(): RealUserMonitoring {
    if (!this.instance) {
      this.instance = new RealUserMonitoring()
    }
    return this.instance
  }
  
  private initializeMonitoring(): void {
    // Core Web Vitals
    this.measureCoreWebVitals()
    
    // Custom metrics
    this.measureCustomMetrics()
    
    // User interactions
    this.trackUserInteractions()
    
    // Error tracking
    this.setupErrorTracking()
    
    // Send metrics periodically
    this.startMetricReporting()
  }
  
  private measureCoreWebVitals(): void {
    // Cumulative Layout Shift
    getCLS((metric) => {
      this.metrics.set('cls', {
        value: metric.value,
        rating: this.getRating('CLS', metric.value)
      })
    })
    
    // First Contentful Paint
    getFCP((metric) => {
      this.metrics.set('fcp', {
        value: metric.value,
        rating: this.getRating('FCP', metric.value)
      })
    })
    
    // First Input Delay
    getFID((metric) => {
      this.metrics.set('fid', {
        value: metric.value,
        rating: this.getRating('FID', metric.value)
      })
    })
    
    // Largest Contentful Paint
    getLCP((metric) => {
      this.metrics.set('lcp', {
        value: metric.value,
        rating: this.getRating('LCP', metric.value)
      })
    })
    
    // Time to First Byte
    getTTFB((metric) => {
      this.metrics.set('ttfb', {
        value: metric.value,
        rating: this.getRating('TTFB', metric.value)
      })
    })
  }
  
  private measureCustomMetrics(): void {
    // Time to Interactive
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            this.metrics.set('tti', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    }
    
    // JavaScript execution time
    this.metrics.set('jsExecutionTime', this.measureJSExecutionTime())
    
    // Memory usage
    if (performance.memory) {
      this.metrics.set('memory', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      })
    }
    
    // Network timing
    this.measureNetworkTiming()
  }
  
  private measureNetworkTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      this.metrics.set('network', {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.requestStart - navigation.secureConnectionStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParsing: navigation.domInteractive - navigation.responseEnd,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        onLoad: navigation.loadEventEnd - navigation.loadEventStart
      })
    }
  }
  
  private trackUserInteractions(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const interaction = {
        type: 'click',
        element: target.tagName,
        id: target.id,
        class: target.className,
        text: target.innerText?.substring(0, 50),
        timestamp: Date.now()
      }
      this.logInteraction(interaction)
    })
    
    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.logInteraction({
        type: 'form_submit',
        formId: form.id,
        formName: form.name,
        timestamp: Date.now()
      })
    })
    
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.logInteraction({
        type: 'visibility_change',
        hidden: document.hidden,
        timestamp: Date.now()
      })
    })
  }
  
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_rejection',
        reason: event.reason,
        promise: event.promise,
        timestamp: Date.now()
      })
    })
  }
  
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    }
    
    const threshold = thresholds[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }
  
  async sendMetrics(): Promise<void> {
    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection?.effectiveType,
      metrics: Object.fromEntries(this.metrics)
    }
    
    // Send to analytics endpoint
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}
```

### Synthetic Monitoring

```typescript
// lib/monitoring/synthetic.ts
import puppeteer from 'puppeteer'

export class SyntheticMonitoring {
  private browser: puppeteer.Browser | null = null
  
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }
  
  async runHealthCheck(url: string): Promise<HealthCheckResult> {
    const page = await this.browser!.newPage()
    const startTime = Date.now()
    
    try {
      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      })
      
      // Check response status
      const status = response?.status() || 0
      
      // Measure performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        }
      })
      
      // Check for JavaScript errors
      const errors: string[] = []
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })
      
      // Test critical user flows
      const flowResults = await this.testCriticalFlows(page)
      
      return {
        success: status >= 200 && status < 400,
        responseTime: Date.now() - startTime,
        status,
        metrics,
        errors,
        flowResults,
        timestamp: new Date()
      }
    } finally {
      await page.close()
    }
  }
  
  private async testCriticalFlows(page: puppeteer.Page): Promise<FlowTestResult[]> {
    const flows: FlowTestResult[] = []
    
    // Test login flow
    flows.push(await this.testLoginFlow(page))
    
    // Test checklist creation
    flows.push(await this.testChecklistCreation(page))
    
    // Test camera functionality
    flows.push(await this.testCameraFlow(page))
    
    return flows
  }
  
  private async testLoginFlow(page: puppeteer.Page): Promise<FlowTestResult> {
    try {
      await page.click('[data-testid="login-button"]')
      await page.type('[name="email"]', 'test@example.com')
      await page.type('[name="password"]', 'testpassword')
      await page.click('[type="submit"]')
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 })
      
      return {
        name: 'login_flow',
        success: true,
        duration: 0 // Calculate actual duration
      }
    } catch (error) {
      return {
        name: 'login_flow',
        success: false,
        error: error.message,
        duration: 0
      }
    }
  }
}
```

## 2. Error Tracking & Logging

### Sentry Integration

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry(): void {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 0.1,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    
    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        // Navigation transactions
        routingInstrumentation: Sentry.nextRouterInstrumentation,
        
        // Trace propagation
        tracePropagationTargets: [
          'localhost',
          'checklistapp.com',
          /^\//
        ]
      }),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
        // Mask sensitive data
        mask: ['.sensitive', '[data-sensitive]'],
        // Block certain elements
        block: ['.credit-card', '[data-block]']
      })
    ],
    
    // Filtering
    beforeSend(event, hint) {
      // Filter out non-critical errors
      if (event.level === 'warning') {
        return null
      }
      
      // Sanitize sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies
      }
      
      return event
    },
    
    // Breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter sensitive breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null
      }
      
      return breadcrumb
    }
  })
}

// Error context enrichment
export function enrichErrorContext(error: Error, context: any): void {
  Sentry.withScope((scope) => {
    scope.setContext('additional_info', context)
    scope.setTag('feature_area', context.featureArea)
    scope.setUser({
      id: context.userId,
      email: context.userEmail
    })
    scope.setLevel('error')
    
    Sentry.captureException(error)
  })
}
```

### Structured Logging

```typescript
// lib/monitoring/logger.ts
import winston from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'

export class Logger {
  private static instance: winston.Logger
  
  static getInstance(): winston.Logger {
    if (!this.instance) {
      this.instance = this.createLogger()
    }
    return this.instance
  }
  
  private static createLogger(): winston.Logger {
    const transports: winston.transport[] = []
    
    // Console transport for development
    if (process.env.NODE_ENV === 'development') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`
            })
          )
        })
      )
    }
    
    // Cloud logging for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(new LoggingWinston({
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: process.env.GCP_KEY_FILE,
        resource: {
          type: 'global',
          labels: {
            app: 'checklistapp',
            environment: process.env.NODE_ENV
          }
        }
      }))
    }
    
    // File transport for all environments
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename: 'logs/combined.log'
      })
    )
    
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'checklistapp',
        version: process.env.NEXT_PUBLIC_APP_VERSION
      },
      transports
    })
  }
  
  // Convenience methods
  static info(message: string, meta?: any): void {
    this.getInstance().info(message, meta)
  }
  
  static error(message: string, error?: Error, meta?: any): void {
    this.getInstance().error(message, {
      ...meta,
      error: error?.stack || error?.message
    })
  }
  
  static warn(message: string, meta?: any): void {
    this.getInstance().warn(message, meta)
  }
  
  static debug(message: string, meta?: any): void {
    this.getInstance().debug(message, meta)
  }
}
```

## 3. User Analytics

### Google Analytics 4 Integration

```typescript
// lib/analytics/google-analytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export class GoogleAnalytics {
  private static initialized = false
  
  static initialize(): void {
    if (this.initialized || !process.env.NEXT_PUBLIC_GA_ID) return
    
    // Load GA script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
    script.async = true
    document.head.appendChild(script)
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
    
    window.gtag('js', new Date())
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: window.location.pathname,
      send_page_view: true
    })
    
    this.initialized = true
  }
  
  static trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    if (!this.initialized) return
    
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
  
  static trackPageView(url: string): void {
    if (!this.initialized) return
    
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url
    })
  }
  
  static trackUserTiming(
    name: string,
    value: number,
    category?: string,
    label?: string
  ): void {
    if (!this.initialized) return
    
    window.gtag('event', 'timing_complete', {
      name,
      value,
      event_category: category || 'Performance',
      event_label: label
    })
  }
  
  static trackException(description: string, fatal: boolean = false): void {
    if (!this.initialized) return
    
    window.gtag('event', 'exception', {
      description,
      fatal
    })
  }
  
  static setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized) return
    
    window.gtag('set', 'user_properties', properties)
  }
}
```

### Custom Analytics Events

```typescript
// lib/analytics/events.ts

export class AnalyticsEvents {
  // User journey events
  static trackSignup(method: string): void {
    GoogleAnalytics.trackEvent('sign_up', 'User', method)
    MixpanelAnalytics.track('User Signup', { method })
  }
  
  static trackLogin(method: string): void {
    GoogleAnalytics.trackEvent('login', 'User', method)
    MixpanelAnalytics.track('User Login', { method })
  }
  
  // Feature usage events
  static trackChecklistCreated(source: 'manual' | 'camera' | 'ai'): void {
    GoogleAnalytics.trackEvent('checklist_created', 'Feature', source)
    MixpanelAnalytics.track('Checklist Created', { source })
  }
  
  static trackPhotoTaken(): void {
    GoogleAnalytics.trackEvent('photo_taken', 'Feature')
    MixpanelAnalytics.track('Photo Taken')
  }
  
  static trackAIAnalysis(roomType: string, taskCount: number): void {
    GoogleAnalytics.trackEvent('ai_analysis', 'Feature', roomType, taskCount)
    MixpanelAnalytics.track('AI Analysis', { roomType, taskCount })
  }
  
  // Conversion events
  static trackChecklistCompleted(checklistId: string, duration: number): void {
    GoogleAnalytics.trackEvent('checklist_completed', 'Conversion', checklistId, duration)
    MixpanelAnalytics.track('Checklist Completed', { checklistId, duration })
  }
  
  // Error events
  static trackError(error: string, context: any): void {
    GoogleAnalytics.trackException(error, false)
    MixpanelAnalytics.track('Error Occurred', { error, context })
  }
}
```

## 4. Infrastructure Monitoring

### Server Monitoring

```typescript
// lib/monitoring/server-monitor.ts
import os from 'os'
import { performance } from 'perf_hooks'

export class ServerMonitor {
  private static metrics: ServerMetrics = {}
  private static interval: NodeJS.Timer | null = null
  
  static start(): void {
    this.interval = setInterval(() => {
      this.collectMetrics()
      this.reportMetrics()
    }, 60000) // Every minute
  }
  
  static stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
  
  private static collectMetrics(): void {
    // CPU usage
    const cpus = os.cpus()
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
      const idle = cpu.times.idle
      return acc + ((total - idle) / total) * 100
    }, 0) / cpus.length
    
    // Memory usage
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    
    // Process metrics
    const processMemory = process.memoryUsage()
    
    this.metrics = {
      cpu: {
        usage: cpuUsage,
        cores: cpus.length
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: (usedMem / totalMem) * 100
      },
      process: {
        rss: processMemory.rss,
        heapTotal: processMemory.heapTotal,
        heapUsed: processMemory.heapUsed,
        external: processMemory.external,
        pid: process.pid,
        uptime: process.uptime()
      },
      system: {
        loadAverage: os.loadavg(),
        uptime: os.uptime(),
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname()
      },
      timestamp: new Date()
    }
  }
  
  private static async reportMetrics(): Promise<void> {
    try {
      await fetch(process.env.METRICS_ENDPOINT!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.metrics)
      })
    } catch (error) {
      console.error('Failed to report server metrics:', error)
    }
  }
}
```

### Database Monitoring

```typescript
// lib/monitoring/database-monitor.ts
import { PrismaClient } from '@prisma/client'

export class DatabaseMonitor {
  private prisma: PrismaClient
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.setupMonitoring()
  }
  
  private setupMonitoring(): void {
    // Query logging
    this.prisma.$use(async (params, next) => {
      const before = Date.now()
      const result = await next(params)
      const after = Date.now()
      
      const duration = after - before
      
      // Log slow queries
      if (duration > 1000) {
        Logger.warn('Slow query detected', {
          model: params.model,
          action: params.action,
          duration,
          args: params.args
        })
      }
      
      // Track query metrics
      this.trackQueryMetrics({
        model: params.model,
        action: params.action,
        duration
      })
      
      return result
    })
  }
  
  async getConnectionPoolStats(): Promise<ConnectionPoolStats> {
    const stats = await this.prisma.$metrics.json()
    
    return {
      counters: stats.counters,
      gauges: stats.gauges,
      histograms: stats.histograms
    }
  }
  
  async checkDatabaseHealth(): Promise<HealthStatus> {
    try {
      const startTime = Date.now()
      await this.prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - startTime
      
      return {
        healthy: true,
        responseTime,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      }
    }
  }
  
  private trackQueryMetrics(metrics: QueryMetrics): void {
    // Send to monitoring service
    MetricsCollector.record('database.query', metrics)
  }
}
```

## 5. Business Metrics & KPIs

### Business Analytics Dashboard

```typescript
// lib/analytics/business-metrics.ts

export class BusinessMetrics {
  static async getDailyActiveUsers(): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return await db.session.count({
      where: {
        createdAt: {
          gte: today
        }
      },
      distinct: ['userId']
    })
  }
  
  static async getMonthlyActiveUsers(): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return await db.session.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      distinct: ['userId']
    })
  }
  
  static async getChecklistMetrics(): Promise<ChecklistMetrics> {
    const [total, completed, avgTasks, avgCompletionTime] = await Promise.all([
      db.checklist.count(),
      db.checklist.count({ where: { status: 'completed' } }),
      db.task.groupBy({
        by: ['checklistId'],
        _count: true
      }),
      db.checklist.aggregate({
        where: { status: 'completed' },
        _avg: {
          completionTime: true
        }
      })
    ])
    
    return {
      totalChecklists: total,
      completedChecklists: completed,
      completionRate: (completed / total) * 100,
      averageTasksPerChecklist: avgTasks.length / total,
      averageCompletionTime: avgCompletionTime._avg.completionTime
    }
  }
  
  static async getFeatureAdoption(): Promise<FeatureAdoption> {
    const [totalUsers, aiUsers, cameraUsers, offlineUsers] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: {
          aiAnalyses: {
            some: {}
          }
        }
      }),
      db.user.count({
        where: {
          photos: {
            some: {}
          }
        }
      }),
      db.user.count({
        where: {
          offlineSyncs: {
            some: {}
          }
        }
      })
    ])
    
    return {
      aiAdoption: (aiUsers / totalUsers) * 100,
      cameraAdoption: (cameraUsers / totalUsers) * 100,
      offlineAdoption: (offlineUsers / totalUsers) * 100
    }
  }
  
  static async getUserRetention(cohortDate: Date): Promise<RetentionMetrics> {
    const cohortUsers = await db.user.findMany({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { id: true }
    })
    
    const retentionDays = [1, 7, 30, 90]
    const retention: Record<number, number> = {}
    
    for (const days of retentionDays) {
      const retainedDate = new Date(cohortDate)
      retainedDate.setDate(retainedDate.getDate() + days)
      
      const retainedUsers = await db.session.count({
        where: {
          userId: {
            in: cohortUsers.map(u => u.id)
          },
          createdAt: {
            gte: retainedDate,
            lt: new Date(retainedDate.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        distinct: ['userId']
      })
      
      retention[days] = (retainedUsers / cohortUsers.length) * 100
    }
    
    return {
      cohortSize: cohortUsers.length,
      retention
    }
  }
}
```

## 6. Alerting & Notifications

### Alert Configuration

```typescript
// lib/monitoring/alerts.ts

export class AlertManager {
  private static rules: AlertRule[] = [
    {
      name: 'High Error Rate',
      condition: (metrics) => metrics.errorRate > 5,
      severity: 'critical',
      channels: ['email', 'slack', 'pagerduty']
    },
    {
      name: 'Slow Response Time',
      condition: (metrics) => metrics.p95ResponseTime > 3000,
      severity: 'warning',
      channels: ['email', 'slack']
    },
    {
      name: 'Low Disk Space',
      condition: (metrics) => metrics.diskUsagePercent > 90,
      severity: 'critical',
      channels: ['email', 'pagerduty']
    },
    {
      name: 'Database Connection Pool Exhausted',
      condition: (metrics) => metrics.dbConnectionsAvailable === 0,
      severity: 'critical',
      channels: ['email', 'slack', 'pagerduty']
    },
    {
      name: 'Memory Usage High',
      condition: (metrics) => metrics.memoryUsagePercent > 85,
      severity: 'warning',
      channels: ['email']
    }
  ]
  
  static async checkAlerts(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.rules) {
      if (rule.condition(metrics)) {
        await this.fireAlert(rule, metrics)
      }
    }
  }
  
  private static async fireAlert(
    rule: AlertRule,
    metrics: SystemMetrics
  ): Promise<void> {
    const alert: Alert = {
      id: crypto.randomUUID(),
      name: rule.name,
      severity: rule.severity,
      timestamp: new Date(),
      metrics,
      message: this.generateAlertMessage(rule, metrics)
    }
    
    // Send to configured channels
    await Promise.all(
      rule.channels.map(channel => 
        this.sendToChannel(channel, alert)
      )
    )
    
    // Log alert
    Logger.error(`Alert fired: ${rule.name}`, null, { alert })
  }
  
  private static async sendToChannel(
    channel: string,
    alert: Alert
  ): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(alert)
        break
      case 'slack':
        await this.sendSlack(alert)
        break
      case 'pagerduty':
        await this.sendPagerDuty(alert)
        break
    }
  }
  
  private static async sendSlack(alert: Alert): Promise<void> {
    const webhook = process.env.SLACK_WEBHOOK_URL
    if (!webhook) return
    
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *${alert.severity.toUpperCase()}: ${alert.name}*`,
        attachments: [{
          color: alert.severity === 'critical' ? 'danger' : 'warning',
          fields: [
            {
              title: 'Message',
              value: alert.message,
              short: false
            },
            {
              title: 'Timestamp',
              value: alert.timestamp.toISOString(),
              short: true
            }
          ]
        }]
      })
    })
  }
}
```

## 7. Dashboards & Visualization

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "ChecklistApp Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.50, http_request_duration_seconds_bucket)",
            "legendFormat": "p50"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m]))",
            "legendFormat": "5xx Errors"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"4..\"}[5m]))",
            "legendFormat": "4xx Errors"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "count(distinct(user_sessions_active))",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Connections"
          }
        ]
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU %"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory %"
          }
        ]
      },
      {
        "title": "Core Web Vitals",
        "type": "table",
        "targets": [
          {
            "expr": "web_vitals_lcp_seconds",
            "legendFormat": "LCP"
          },
          {
            "expr": "web_vitals_fid_seconds",
            "legendFormat": "FID"
          },
          {
            "expr": "web_vitals_cls_score",
            "legendFormat": "CLS"
          }
        ]
      }
    ]
  }
}
```

## 8. Monitoring Checklist

### Daily Monitoring Tasks
- [ ] Check error rates and investigate anomalies
- [ ] Review performance metrics (response times, throughput)
- [ ] Monitor active user count
- [ ] Check disk space and memory usage
- [ ] Review security alerts
- [ ] Verify backup completion

### Weekly Monitoring Tasks
- [ ] Review weekly trends and patterns
- [ ] Analyze user behavior analytics
- [ ] Check feature adoption rates
- [ ] Review and optimize slow queries
- [ ] Update monitoring thresholds if needed
- [ ] Conduct synthetic monitoring tests

### Monthly Monitoring Tasks
- [ ] Generate monthly performance report
- [ ] Review and update alerting rules
- [ ] Analyze user retention metrics
- [ ] Conduct capacity planning review
- [ ] Review security logs and access patterns
- [ ] Update monitoring documentation

---

*Last Updated: December 2024*
*Version: 1.0.0*