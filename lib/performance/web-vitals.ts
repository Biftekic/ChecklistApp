import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  CLS?: number;
  FCP?: number;
  FID?: number;
  INP?: number;
  LCP?: number;
  TTFB?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private callbacks: Set<(metrics: PerformanceMetrics) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric) {
    this.metrics[metric.name as keyof PerformanceMetrics] = metric.value;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${metric.name}:`, metric.value.toFixed(2));
    }

    this.sendToAnalytics(metric);
    this.notifySubscribers();
  }

  private sendToAnalytics(metric: Metric) {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_delta: metric.delta,
      });
    }
  }

  private notifySubscribers() {
    this.callbacks.forEach(callback => callback(this.metrics));
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

declare global {
  interface Window {
    gtag: any;
  }
}
