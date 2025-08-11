# Error Handling Guide

## Overview

This document provides comprehensive error handling patterns and strategies for the ChecklistApp PWA, ensuring robust error management across offline/online states, API failures, and user interactions while maintaining excellent user experience.

## Error Handling Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Error Handling Layers                    │
├────────────────────────────────────────────────────────────┤
│  UI Layer      │  Application Layer  │  Infrastructure     │
├────────────────────────────────────────────────────────────┤
│  • Error       │  • Try-Catch        │  • Network Errors   │
│    Boundaries  │  • Custom Errors    │  • DB Errors        │
│  • User        │  • Error Logging    │  • Service Worker   │
│    Feedback    │  • Recovery Logic   │  • API Errors       │
└────────────────────────────────────────────────────────────┘
```

## 1. Error Types & Classifications

### Error Categories

```typescript
// lib/errors/error-types.ts

export enum ErrorCategory {
  // User errors (4xx equivalent)
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  
  // System errors (5xx equivalent)
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
  
  // Client errors
  OFFLINE = 'OFFLINE',
  SYNC = 'SYNC',
  STORAGE = 'STORAGE',
  BROWSER = 'BROWSER'
}

export enum ErrorSeverity {
  LOW = 'low',        // Log only
  MEDIUM = 'medium',  // Notify user
  HIGH = 'high',      // Requires user action
  CRITICAL = 'critical' // Block operation
}

export interface ErrorMetadata {
  category: ErrorCategory
  severity: ErrorSeverity
  code: string
  timestamp: Date
  context?: Record<string, any>
  stackTrace?: string
  userId?: string
  sessionId?: string
  retryable?: boolean
  retryCount?: number
  userMessage?: string
  technicalMessage?: string
}
```

### Custom Error Classes

```typescript
// lib/errors/custom-errors.ts

export class AppError extends Error {
  public readonly metadata: ErrorMetadata
  
  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    code: string,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    
    this.metadata = {
      category,
      severity,
      code,
      timestamp: new Date(),
      context,
      stackTrace: this.stack,
      technicalMessage: message
    }
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      ...this.metadata
    }
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: any) {
    super(
      message,
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      'VALIDATION_ERROR',
      { field, value }
    )
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, url?: string, method?: string) {
    super(
      message,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      'NETWORK_ERROR',
      { url, method, retryable: true }
    )
    this.name = 'NetworkError'
  }
}

export class OfflineError extends AppError {
  constructor(operation: string) {
    super(
      `Operation "${operation}" requires internet connection`,
      ErrorCategory.OFFLINE,
      ErrorSeverity.MEDIUM,
      'OFFLINE_ERROR',
      { operation, retryable: true }
    )
    this.name = 'OfflineError'
  }
}

export class SyncError extends AppError {
  constructor(message: string, conflictData?: any) {
    super(
      message,
      ErrorCategory.SYNC,
      ErrorSeverity.HIGH,
      'SYNC_ERROR',
      { conflictData, retryable: true }
    )
    this.name = 'SyncError'
  }
}
```

## 2. Error Handling Patterns

### Global Error Handler

```typescript
// lib/errors/error-handler.ts

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: AppError[] = []
  private listeners: ((error: AppError) => void)[] = []
  
  static getInstance(): ErrorHandler {
    if (!this.instance) {
      this.instance = new ErrorHandler()
    }
    return this.instance
  }
  
  handle(error: Error | AppError): void {
    const appError = this.normalizeError(error)
    
    // Add to queue
    this.errorQueue.push(appError)
    
    // Log error
    this.logError(appError)
    
    // Notify listeners
    this.notifyListeners(appError)
    
    // Send to monitoring
    if (appError.metadata.severity === ErrorSeverity.HIGH ||
        appError.metadata.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoring(appError)
    }
    
    // Show user notification if needed
    if (appError.metadata.userMessage) {
      this.showUserNotification(appError)
    }
    
    // Attempt recovery
    if (appError.metadata.retryable) {
      this.attemptRecovery(appError)
    }
  }
  
  private normalizeError(error: Error | AppError): AppError {
    if (error instanceof AppError) {
      return error
    }
    
    // Convert standard errors to AppError
    return new AppError(
      error.message,
      ErrorCategory.INTERNAL,
      ErrorSeverity.HIGH,
      'UNKNOWN_ERROR',
      { originalError: error.toString() }
    )
  }
  
  private async logError(error: AppError): Promise<void> {
    const logEntry = {
      timestamp: error.metadata.timestamp,
      category: error.metadata.category,
      severity: error.metadata.severity,
      code: error.metadata.code,
      message: error.message,
      context: error.metadata.context,
      stack: error.metadata.stackTrace
    }
    
    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error:', logEntry)
    }
    
    // Store in IndexedDB for offline errors
    if (typeof window !== 'undefined') {
      await this.storeErrorOffline(logEntry)
    }
  }
  
  private async storeErrorOffline(error: any): Promise<void> {
    try {
      const db = await openDB('error-logs', 1, {
        upgrade(db) {
          db.createObjectStore('errors', { 
            keyPath: 'id',
            autoIncrement: true 
          })
        }
      })
      
      await db.add('errors', {
        ...error,
        synced: false
      })
    } catch (e) {
      console.error('Failed to store error offline:', e)
    }
  }
  
  private async sendToMonitoring(error: AppError): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      // Send to Sentry
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: {
            category: error.metadata.category,
            severity: error.metadata.severity,
            code: error.metadata.code
          },
          extra: error.metadata.context
        })
      }
      
      // Send to custom analytics
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error.toJSON())
      })
    } catch (e) {
      console.error('Failed to send error to monitoring:', e)
    }
  }
  
  private showUserNotification(error: AppError): void {
    const message = error.metadata.userMessage || 
                   this.getUserMessage(error)
    
    // Use toast notification system
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast({
        type: this.getToastType(error.metadata.severity),
        message,
        duration: 5000,
        action: error.metadata.retryable ? {
          label: 'Retry',
          onClick: () => this.retry(error)
        } : undefined
      })
    }
  }
  
  private getUserMessage(error: AppError): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please sign in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
      [ErrorCategory.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please try again later.',
      [ErrorCategory.NETWORK]: 'Network error. Please check your connection.',
      [ErrorCategory.DATABASE]: 'Unable to save data. Please try again.',
      [ErrorCategory.EXTERNAL_SERVICE]: 'External service is unavailable.',
      [ErrorCategory.INTERNAL]: 'Something went wrong. Please try again.',
      [ErrorCategory.OFFLINE]: 'This action requires an internet connection.',
      [ErrorCategory.SYNC]: 'Unable to sync data. Changes saved locally.',
      [ErrorCategory.STORAGE]: 'Storage error. Please free up some space.',
      [ErrorCategory.BROWSER]: 'Browser compatibility issue detected.'
    }
    
    return messages[error.metadata.category] || 'An unexpected error occurred.'
  }
  
  private async attemptRecovery(error: AppError): Promise<void> {
    const retryCount = error.metadata.retryCount || 0
    
    if (retryCount >= 3) {
      console.error('Max retry attempts reached for:', error)
      return
    }
    
    // Exponential backoff
    const delay = Math.pow(2, retryCount) * 1000
    
    setTimeout(async () => {
      try {
        await this.recoverFromError(error)
      } catch (retryError) {
        error.metadata.retryCount = retryCount + 1
        this.handle(error)
      }
    }, delay)
  }
  
  private async recoverFromError(error: AppError): Promise<void> {
    switch (error.metadata.category) {
      case ErrorCategory.NETWORK:
        // Wait for connection and retry
        await this.waitForConnection()
        break
        
      case ErrorCategory.OFFLINE:
        // Queue for sync when online
        await this.queueForSync(error.metadata.context)
        break
        
      case ErrorCategory.SYNC:
        // Attempt conflict resolution
        await this.resolveConflict(error.metadata.context)
        break
        
      default:
        throw new Error('Cannot recover from this error type')
    }
  }
}
```

## 3. React Error Boundaries

### Global Error Boundary

```tsx
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorHandler } from '@/lib/errors/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error handler
    ErrorHandler.getInstance().handle(
      new AppError(
        error.message,
        ErrorCategory.INTERNAL,
        ErrorSeverity.HIGH,
        'REACT_ERROR',
        {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      )
    )
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}

// Error fallback component
function ErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="error-fallback">
      <h2>Oops! Something went wrong</h2>
      <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
      {process.env.NODE_ENV === 'development' && error && (
        <details>
          <summary>Error details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  )
}
```

### Async Error Boundary

```tsx
// components/AsyncErrorBoundary.tsx
import { useEffect } from 'react'
import { useErrorHandler } from 'react-error-boundary'

export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = useErrorHandler()
  
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason))
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [handleError])
  
  return <>{children}</>
}
```

## 4. API Error Handling

### API Client with Error Handling

```typescript
// lib/api/api-client.ts

export class APIClient {
  private baseURL: string
  private timeout: number = 30000
  
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(
        `${this.baseURL}${endpoint}`,
        {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        }
      )
      
      clearTimeout(timeoutId)
      
      // Handle HTTP errors
      if (!response.ok) {
        await this.handleHTTPError(response)
      }
      
      // Parse response
      const data = await response.json()
      return data as T
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout', endpoint)
        }
        
        if (error.message === 'Failed to fetch') {
          // Check if offline
          if (!navigator.onLine) {
            throw new OfflineError(endpoint)
          }
          throw new NetworkError('Network request failed', endpoint)
        }
      }
      
      throw error
    }
  }
  
  private async handleHTTPError(response: Response): Promise<never> {
    let errorData: any = {}
    
    try {
      errorData = await response.json()
    } catch {
      // Response might not be JSON
    }
    
    switch (response.status) {
      case 400:
        throw new ValidationError(
          errorData.message || 'Invalid request',
          errorData.field
        )
        
      case 401:
        throw new AppError(
          'Authentication required',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.HIGH,
          'AUTH_REQUIRED'
        )
        
      case 403:
        throw new AppError(
          'Access denied',
          ErrorCategory.AUTHORIZATION,
          ErrorSeverity.HIGH,
          'ACCESS_DENIED'
        )
        
      case 404:
        throw new AppError(
          'Resource not found',
          ErrorCategory.NOT_FOUND,
          ErrorSeverity.MEDIUM,
          'NOT_FOUND'
        )
        
      case 429:
        throw new AppError(
          'Too many requests',
          ErrorCategory.RATE_LIMIT,
          ErrorSeverity.MEDIUM,
          'RATE_LIMITED',
          {
            retryAfter: response.headers.get('Retry-After')
          }
        )
        
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AppError(
          'Server error',
          ErrorCategory.EXTERNAL_SERVICE,
          ErrorSeverity.HIGH,
          `SERVER_ERROR_${response.status}`,
          { retryable: true }
        )
        
      default:
        throw new AppError(
          `HTTP Error ${response.status}`,
          ErrorCategory.NETWORK,
          ErrorSeverity.HIGH,
          `HTTP_${response.status}`
        )
    }
  }
}
```

## 5. Offline Error Handling

### Offline Queue Manager

```typescript
// lib/offline/offline-queue.ts

export class OfflineQueue {
  private queue: QueuedOperation[] = []
  private processing = false
  
  async add(operation: QueuedOperation): Promise<void> {
    // Add to queue
    this.queue.push({
      ...operation,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      retryCount: 0
    })
    
    // Store in IndexedDB
    await this.persistQueue()
    
    // Try to process if online
    if (navigator.onLine) {
      this.process()
    }
  }
  
  async process(): Promise<void> {
    if (this.processing || !navigator.onLine) return
    
    this.processing = true
    
    while (this.queue.length > 0 && navigator.onLine) {
      const operation = this.queue[0]
      
      try {
        await this.executeOperation(operation)
        
        // Remove from queue on success
        this.queue.shift()
        await this.persistQueue()
        
      } catch (error) {
        operation.retryCount++
        
        if (operation.retryCount >= 3) {
          // Move to failed queue
          await this.moveToFailed(operation, error)
          this.queue.shift()
        } else {
          // Move to end of queue
          this.queue.push(this.queue.shift()!)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    this.processing = false
  }
  
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case 'API_CALL':
        await fetch(operation.url, operation.options)
        break
        
      case 'DB_SYNC':
        await this.syncDatabase(operation.data)
        break
        
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }
  
  private async moveToFailed(
    operation: QueuedOperation,
    error: any
  ): Promise<void> {
    await db.failedOperations.add({
      ...operation,
      error: error.toString(),
      failedAt: new Date()
    })
    
    // Notify user
    ErrorHandler.getInstance().handle(
      new SyncError(
        `Failed to sync operation: ${operation.type}`,
        operation
      )
    )
  }
}
```

## 6. Form Error Handling

### Form Validation with Error Display

```tsx
// components/forms/FormField.tsx

interface FormFieldProps {
  name: string
  label: string
  error?: string
  children: ReactNode
}

export function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <div className="error-message" role="alert">
          <Icon name="error" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Usage with React Hook Form
export function ChecklistForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema)
  })
  
  const onSubmit = async (data: ChecklistFormData) => {
    try {
      await createChecklist(data)
    } catch (error) {
      if (error instanceof ValidationError) {
        // Set field-specific errors
        if (error.metadata.context?.field) {
          setError(error.metadata.context.field, {
            message: error.message
          })
        } else {
          // Set general form error
          setError('root', {
            message: error.message
          })
        }
      } else {
        // Handle other errors
        ErrorHandler.getInstance().handle(error)
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name="name"
        label="Checklist Name"
        error={errors.name?.message}
      >
        <input {...register('name')} />
      </FormField>
      
      {errors.root && (
        <div className="form-error">
          {errors.root.message}
        </div>
      )}
      
      <button type="submit">Create Checklist</button>
    </form>
  )
}
```

## 7. Error Recovery Strategies

### Automatic Retry with Exponential Backoff

```typescript
// lib/utils/retry.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    factor?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry
  } = options
  
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt - 1),
        maxDelay
      )
      
      // Call retry callback
      onRetry?.(attempt, lastError)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Usage example
const data = await retryWithBackoff(
  () => fetchDataFromAPI(),
  {
    maxAttempts: 5,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt} after error:`, error)
    }
  }
)
```

### Circuit Breaker Pattern

```typescript
// lib/utils/circuit-breaker.ts

export class CircuitBreaker {
  private failures = 0
  private lastFailureTime?: Date
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN'
      } else {
        throw new AppError(
          'Service temporarily unavailable',
          ErrorCategory.EXTERNAL_SERVICE,
          ErrorSeverity.HIGH,
          'CIRCUIT_OPEN'
        )
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = new Date()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }
  
  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime.getTime() >= this.timeout
    )
  }
}
```

## 8. Error Monitoring & Analytics

### Error Analytics Tracker

```typescript
// lib/analytics/error-analytics.ts

export class ErrorAnalytics {
  private static errors: Map<string, ErrorMetrics> = new Map()
  
  static track(error: AppError): void {
    const key = `${error.metadata.category}-${error.metadata.code}`
    
    const metrics = this.errors.get(key) || {
      count: 0,
      firstOccurrence: new Date(),
      lastOccurrence: new Date(),
      affectedUsers: new Set(),
      contexts: []
    }
    
    metrics.count++
    metrics.lastOccurrence = new Date()
    
    if (error.metadata.userId) {
      metrics.affectedUsers.add(error.metadata.userId)
    }
    
    metrics.contexts.push(error.metadata.context)
    
    this.errors.set(key, metrics)
    
    // Send to analytics service
    this.sendToAnalytics(key, metrics)
  }
  
  static getTopErrors(limit: number = 10): ErrorSummary[] {
    return Array.from(this.errors.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([key, metrics]) => ({
        errorKey: key,
        count: metrics.count,
        affectedUsers: metrics.affectedUsers.size,
        lastOccurrence: metrics.lastOccurrence
      }))
  }
  
  private static sendToAnalytics(key: string, metrics: ErrorMetrics): void {
    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: key,
        fatal: metrics.count > 10,
        error_count: metrics.count,
        affected_users: metrics.affectedUsers.size
      })
    }
  }
}
```

## 9. User-Friendly Error Messages

### Error Message Localization

```typescript
// lib/i18n/error-messages.ts

const errorMessages = {
  en: {
    VALIDATION_ERROR: 'Please check your input and try again.',
    NETWORK_ERROR: 'Connection problem. Please check your internet.',
    OFFLINE_ERROR: 'You\'re offline. This will sync when you\'re back online.',
    AUTH_REQUIRED: 'Please sign in to continue.',
    RATE_LIMITED: 'Too many requests. Please wait a moment.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again.',
    SYNC_CONFLICT: 'There was a conflict syncing your data. Please review.',
    STORAGE_FULL: 'Your device storage is full. Please free up some space.',
    CAMERA_PERMISSION: 'Camera access is required for this feature.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
  },
  es: {
    VALIDATION_ERROR: 'Por favor, verifica tu entrada e intenta de nuevo.',
    NETWORK_ERROR: 'Problema de conexión. Verifica tu internet.',
    // ... other translations
  }
}

export function getErrorMessage(
  code: string,
  locale: string = 'en'
): string {
  return errorMessages[locale]?.[code] || errorMessages.en.GENERIC_ERROR
}
```

## 10. Error Testing

### Error Handling Tests

```typescript
// tests/error-handling.test.ts

describe('Error Handling', () => {
  describe('ErrorHandler', () => {
    it('should handle and log errors', async () => {
      const handler = ErrorHandler.getInstance()
      const error = new NetworkError('Test error', '/api/test')
      
      const logSpy = jest.spyOn(console, 'error')
      handler.handle(error)
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      )
    })
    
    it('should retry retryable errors', async () => {
      const handler = ErrorHandler.getInstance()
      const error = new NetworkError('Retry test', '/api/test')
      
      const retrySpy = jest.spyOn(handler, 'attemptRecovery')
      handler.handle(error)
      
      await waitFor(() => {
        expect(retrySpy).toHaveBeenCalled()
      })
    })
  })
  
  describe('Error Boundaries', () => {
    it('should catch and display errors', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }
      
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(getByText(/Something went wrong/)).toBeInTheDocument()
    })
  })
})
```

## Error Codes Reference

### Standard Error Codes

| Code | Category | Description | User Action |
|------|----------|-------------|-------------|
| VAL_001 | Validation | Required field missing | Fill in required fields |
| VAL_002 | Validation | Invalid format | Check input format |
| AUTH_001 | Authentication | Invalid credentials | Check username/password |
| AUTH_002 | Authentication | Session expired | Sign in again |
| NET_001 | Network | Connection timeout | Check internet connection |
| NET_002 | Network | Server unreachable | Try again later |
| SYNC_001 | Sync | Conflict detected | Review changes |
| SYNC_002 | Sync | Sync failed | Will retry automatically |
| OFF_001 | Offline | Operation requires connection | Connect to internet |
| STOR_001 | Storage | Storage full | Free up space |

---

*Last Updated: December 2024*
*Version: 1.0.0*