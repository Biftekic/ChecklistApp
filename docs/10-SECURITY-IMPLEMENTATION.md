# Security Implementation Guide

## Overview

This document provides comprehensive security implementation guidelines for the ChecklistApp PWA, covering authentication, authorization, data protection, API security, and compliance requirements with special focus on mobile and offline security considerations.

## Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Security Layers                         │
├──────────────────────────────────────────────────────────┤
│  Application Layer  │  API Layer  │  Data Layer          │
├──────────────────────────────────────────────────────────┤
│  • Input Validation │  • Rate Limiting │ • Encryption    │
│  • XSS Prevention   │  • API Keys      │ • Hashing       │
│  • CSRF Protection  │  • JWT Tokens    │ • Secure Storage│
│  • CSP Headers      │  • CORS          │ • Backup        │
└──────────────────────────────────────────────────────────┘
```

## 1. Authentication & Authorization

### Authentication Flow

```typescript
// lib/auth/auth-service.ts
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || throw new Error('JWT_SECRET not set')
)

export class AuthService {
  // Password hashing with bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }
  
  // Password verification
  static async verifyPassword(
    password: string, 
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
  
  // JWT token generation
  static async generateToken(userId: string, role: string): Promise<string> {
    const token = await new SignJWT({
      userId,
      role,
      iat: Date.now(),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .setNotBefore('0s')
      .sign(JWT_SECRET)
    
    return token
  }
  
  // JWT token verification
  static async verifyToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
  
  // Session management
  static async createSession(userId: string): Promise<Session> {
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    const session = await db.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt,
        userAgent: headers().get('user-agent'),
        ipAddress: headers().get('x-forwarded-for'),
      }
    })
    
    return session
  }
  
  // Multi-factor authentication
  static async generateTOTP(secret: string): Promise<string> {
    const totp = new OTPAuth.TOTP({
      issuer: 'ChecklistApp',
      label: 'ChecklistApp',
      algorithm: 'SHA256',
      digits: 6,
      period: 30,
      secret,
    })
    
    return totp.generate()
  }
}
```

### Authorization Middleware

```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function authMiddleware(
  request: NextRequest,
  requiredRole?: string
) {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    const payload = await AuthService.verifyToken(token)
    
    // Check role-based access
    if (requiredRole && payload.role !== requiredRole) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Add user context to request
    request.headers.set('x-user-id', payload.userId)
    request.headers.set('x-user-role', payload.role)
    
    return NextResponse.next()
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
```

### Role-Based Access Control (RBAC)

```typescript
// lib/auth/rbac.ts
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  CLEANER = 'cleaner',
  VIEWER = 'viewer'
}

export const permissions = {
  [Role.ADMIN]: [
    'users:*',
    'checklists:*',
    'settings:*',
    'analytics:*'
  ],
  [Role.MANAGER]: [
    'users:read',
    'users:create',
    'users:update',
    'checklists:*',
    'analytics:read'
  ],
  [Role.SUPERVISOR]: [
    'users:read',
    'checklists:*',
    'analytics:read'
  ],
  [Role.CLEANER]: [
    'checklists:read',
    'checklists:update',
    'tasks:update'
  ],
  [Role.VIEWER]: [
    'checklists:read',
    'analytics:read'
  ]
}

export function hasPermission(
  role: Role,
  permission: string
): boolean {
  const rolePermissions = permissions[role] || []
  
  return rolePermissions.some(p => {
    if (p.includes('*')) {
      const prefix = p.split(':')[0]
      return permission.startsWith(prefix + ':')
    }
    return p === permission
  })
}
```

## 2. Data Protection

### Encryption at Rest

```typescript
// lib/crypto/encryption.ts
import { webcrypto } from 'crypto'

export class EncryptionService {
  private static algorithm = 'AES-GCM'
  private static keyLength = 256
  
  // Generate encryption key
  static async generateKey(): Promise<CryptoKey> {
    return webcrypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }
  
  // Encrypt data
  static async encrypt(
    data: string,
    key: CryptoKey
  ): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    
    const iv = webcrypto.getRandomValues(new Uint8Array(12))
    
    const encrypted = await webcrypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv,
      },
      key,
      dataBuffer
    )
    
    return { encrypted, iv }
  }
  
  // Decrypt data
  static async decrypt(
    encrypted: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> {
    const decrypted = await webcrypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv,
      },
      key,
      encrypted
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }
  
  // Encrypt sensitive fields in IndexedDB
  static async encryptForStorage(
    data: any,
    sensitiveFields: string[]
  ): Promise<any> {
    const key = await this.getStorageKey()
    const encrypted = { ...data }
    
    for (const field of sensitiveFields) {
      if (data[field]) {
        const { encrypted: enc, iv } = await this.encrypt(
          JSON.stringify(data[field]),
          key
        )
        encrypted[field] = {
          data: Buffer.from(enc).toString('base64'),
          iv: Buffer.from(iv).toString('base64')
        }
      }
    }
    
    return encrypted
  }
}
```

### Secure Local Storage

```typescript
// lib/storage/secure-storage.ts
export class SecureStorage {
  private static encryptionKey: CryptoKey | null = null
  
  // Initialize secure storage with user key
  static async initialize(userPassword: string): Promise<void> {
    const salt = await this.getSalt()
    const key = await this.deriveKey(userPassword, salt)
    this.encryptionKey = key
  }
  
  // Derive key from password
  private static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await webcrypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )
    
    return webcrypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }
  
  // Store encrypted data
  static async setItem(key: string, value: any): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized')
    }
    
    const encrypted = await EncryptionService.encrypt(
      JSON.stringify(value),
      this.encryptionKey
    )
    
    localStorage.setItem(key, JSON.stringify({
      data: Buffer.from(encrypted.encrypted).toString('base64'),
      iv: Buffer.from(encrypted.iv).toString('base64')
    }))
  }
  
  // Retrieve and decrypt data
  static async getItem(key: string): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized')
    }
    
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    const { data, iv } = JSON.parse(stored)
    
    const decrypted = await EncryptionService.decrypt(
      Buffer.from(data, 'base64'),
      this.encryptionKey,
      Buffer.from(iv, 'base64')
    )
    
    return JSON.parse(decrypted)
  }
}
```

## 3. Input Validation & Sanitization

### Input Validation Schemas

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// User input schemas
export const userSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number and special character'),
  name: z.string().min(2).max(50),
  role: z.enum(['admin', 'manager', 'supervisor', 'cleaner', 'viewer'])
})

// Checklist schemas
export const checklistSchema = z.object({
  name: z.string().min(1).max(100).transform(val => 
    DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })
  ),
  description: z.string().max(500).transform(val =>
    DOMPurify.sanitize(val, { ALLOWED_TAGS: ['b', 'i', 'u'] })
  ),
  roomType: z.enum(['bedroom', 'bathroom', 'kitchen', 'living_room', 'other']),
  tasks: z.array(z.object({
    title: z.string().max(200).transform(val =>
      DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })
    ),
    priority: z.enum(['low', 'medium', 'high']),
    estimatedTime: z.number().min(1).max(480)
  }))
})

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().regex(/^[\w\-. ]+$/),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(10 * 1024 * 1024) // 10MB max
})

// SQL injection prevention
export function sanitizeSQL(input: string): string {
  return input.replace(/['";\\]/g, '')
}

// XSS prevention
export function sanitizeHTML(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}
```

### Request Validation Middleware

```typescript
// middleware/validation.ts
export function validateRequest(schema: z.ZodSchema) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()
      const validated = schema.parse(body)
      
      // Add validated data to request
      req.headers.set('x-validated-body', JSON.stringify(validated))
      
      return NextResponse.next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: error.errors 
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }
  }
}
```

## 4. API Security

### Rate Limiting

```typescript
// lib/security/rate-limiter.ts
import { LRUCache } from 'lru-cache'

export class RateLimiter {
  private cache: LRUCache<string, number[]>
  
  constructor(
    private windowMs: number = 60000, // 1 minute
    private maxRequests: number = 100
  ) {
    this.cache = new LRUCache({
      max: 10000,
      ttl: windowMs
    })
  }
  
  async limit(identifier: string): Promise<boolean> {
    const now = Date.now()
    const requests = this.cache.get(identifier) || []
    
    // Remove old requests outside window
    const validRequests = requests.filter(
      time => now - time < this.windowMs
    )
    
    if (validRequests.length >= this.maxRequests) {
      return false // Rate limit exceeded
    }
    
    validRequests.push(now)
    this.cache.set(identifier, validRequests)
    
    return true
  }
}

// API route rate limiting
export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const limiter = new RateLimiter(60000, 100) // 100 requests per minute
  const allowed = await limiter.limit(ip)
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      }
    )
  }
  
  return null
}
```

### API Key Management

```typescript
// lib/security/api-keys.ts
import { randomBytes } from 'crypto'

export class APIKeyService {
  // Generate secure API key
  static generateAPIKey(): string {
    const prefix = 'sk-'
    const randomPart = randomBytes(32).toString('base64url')
    return `${prefix}${randomPart}`
  }
  
  // Hash API key for storage
  static async hashAPIKey(apiKey: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await webcrypto.subtle.digest('SHA-256', data)
    return Buffer.from(hashBuffer).toString('hex')
  }
  
  // Validate API key
  static async validateAPIKey(
    apiKey: string
  ): Promise<{ valid: boolean; userId?: string }> {
    const hashedKey = await this.hashAPIKey(apiKey)
    
    const keyRecord = await db.apiKey.findUnique({
      where: { hashedKey },
      include: { user: true }
    })
    
    if (!keyRecord || keyRecord.expiresAt < new Date()) {
      return { valid: false }
    }
    
    // Update last used timestamp
    await db.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    })
    
    return { 
      valid: true, 
      userId: keyRecord.userId 
    }
  }
}
```

### CORS Configuration

```typescript
// lib/security/cors.ts
import { NextRequest, NextResponse } from 'next/server'

const allowedOrigins = [
  'https://checklistapp.com',
  'https://staging.checklistapp.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000'
].filter(Boolean) as string[]

export function corsMiddleware(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  const response = NextResponse.next()
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-API-Key'
    )
    response.headers.set('Access-Control-Max-Age', '86400')
  }
  
  return response
}
```

## 5. Security Headers

### Content Security Policy (CSP)

```typescript
// middleware/security-headers.ts
export function securityHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next()
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.anthropic.com https://*.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 
    'camera=(self), microphone=(), geolocation=(self)'
  )
  
  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}
```

## 6. Mobile & PWA Security

### Service Worker Security

```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Only cache same-origin requests
  if (url.origin !== self.location.origin) {
    return
  }
  
  // Don't cache API requests with sensitive data
  if (url.pathname.startsWith('/api/')) {
    return
  }
  
  // Implement cache security
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Check cache integrity
      if (response && response.headers.get('x-cache-integrity')) {
        const integrity = response.headers.get('x-cache-integrity')
        if (!verifyIntegrity(response, integrity)) {
          // Cache tampered, fetch fresh
          return fetch(event.request)
        }
      }
      
      return response || fetch(event.request)
    })
  )
})

// Clear sensitive data on logout
self.addEventListener('message', (event) => {
  if (event.data === 'logout') {
    // Clear all caches
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name))
    })
    
    // Clear IndexedDB
    indexedDB.deleteDatabase('app-db')
  }
})
```

### Biometric Authentication

```typescript
// lib/auth/biometric.ts
export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    if (!navigator.credentials) return false
    
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch {
      return false
    }
  }
  
  static async register(userId: string): Promise<any> {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)
    
    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "ChecklistApp",
        id: "checklistapp.com",
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userId,
        displayName: "User",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    }
    
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    })
    
    return credential
  }
  
  static async authenticate(credentialId: string): Promise<boolean> {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)
    
    const publicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: Buffer.from(credentialId, 'base64'),
        type: 'public-key',
        transports: ['internal']
      }],
      userVerification: "required",
      timeout: 60000
    }
    
    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      })
      
      // Verify assertion on server
      return true
    } catch {
      return false
    }
  }
}
```

## 7. GDPR Compliance

### Data Privacy Implementation

```typescript
// lib/privacy/gdpr.ts
export class GDPRCompliance {
  // User consent management
  static async recordConsent(
    userId: string,
    consentTypes: string[]
  ): Promise<void> {
    await db.consent.create({
      data: {
        userId,
        consentTypes,
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    })
  }
  
  // Data export (GDPR Article 20)
  static async exportUserData(userId: string): Promise<any> {
    const userData = await db.user.findUnique({
      where: { id: userId },
      include: {
        checklists: true,
        tasks: true,
        photos: true,
        sessions: true,
        auditLogs: true
      }
    })
    
    // Remove internal fields
    const sanitized = this.sanitizeForExport(userData)
    
    return {
      exportDate: new Date(),
      data: sanitized
    }
  }
  
  // Right to erasure (GDPR Article 17)
  static async deleteUserData(userId: string): Promise<void> {
    // Soft delete with anonymization
    await db.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@deleted.com`,
        name: 'Deleted User',
        deletedAt: new Date(),
        // Retain for legal requirements
        retainUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000)
      }
    })
    
    // Delete sensitive data immediately
    await db.photo.deleteMany({ where: { userId } })
    await db.session.deleteMany({ where: { userId } })
  }
  
  // Data retention policy
  static async enforceRetention(): Promise<void> {
    const retentionPeriod = 365 * 24 * 60 * 60 * 1000 // 1 year
    const cutoffDate = new Date(Date.now() - retentionPeriod)
    
    // Delete old audit logs
    await db.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    })
    
    // Delete old sessions
    await db.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
  }
}
```

## 8. Audit Logging

### Security Audit Trail

```typescript
// lib/security/audit.ts
export class AuditLogger {
  static async log(event: {
    userId?: string
    action: string
    resource: string
    result: 'success' | 'failure'
    metadata?: any
  }): Promise<void> {
    await db.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        result: event.result,
        metadata: event.metadata,
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date()
      }
    })
    
    // Alert on suspicious activity
    if (event.result === 'failure') {
      await this.checkSuspiciousActivity(event.userId)
    }
  }
  
  static async checkSuspiciousActivity(userId?: string): Promise<void> {
    if (!userId) return
    
    const recentFailures = await db.auditLog.count({
      where: {
        userId,
        result: 'failure',
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    })
    
    if (recentFailures >= 5) {
      // Lock account temporarily
      await db.user.update({
        where: { id: userId },
        data: {
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      })
      
      // Send alert
      await this.sendSecurityAlert(userId, 'Account locked due to suspicious activity')
    }
  }
}
```

## 9. Security Testing

### Security Test Suite

```typescript
// tests/security/security.test.ts
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('prevents brute force attacks', async () => {
      const attempts = Array(10).fill(null).map(() =>
        request.post('/api/auth/login', {
          data: { email: 'test@example.com', password: 'wrong' }
        })
      )
      
      const results = await Promise.all(attempts)
      const rateLimited = results.filter(r => r.status() === 429)
      
      expect(rateLimited.length).toBeGreaterThan(0)
    })
    
    test('validates JWT tokens', async () => {
      const invalidToken = 'invalid.token.here'
      
      const response = await request.get('/api/protected', {
        headers: {
          'Authorization': `Bearer ${invalidToken}`
        }
      })
      
      expect(response.status()).toBe(401)
    })
  })
  
  describe('Input Validation', () => {
    test('prevents SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --"
      
      const response = await request.post('/api/checklists', {
        data: { name: maliciousInput }
      })
      
      expect(response.status()).toBe(400)
      
      // Verify table still exists
      const users = await db.user.findMany()
      expect(users).toBeDefined()
    })
    
    test('prevents XSS attacks', async () => {
      const xssPayload = '<script>alert("XSS")</script>'
      
      const response = await request.post('/api/tasks', {
        data: { title: xssPayload }
      })
      
      const task = await response.json()
      expect(task.title).not.toContain('<script>')
    })
  })
})
```

## 10. Security Monitoring

### Real-time Security Monitoring

```typescript
// lib/monitoring/security-monitor.ts
export class SecurityMonitor {
  static async detectAnomalies(): Promise<void> {
    // Monitor failed login attempts
    const failedLogins = await db.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        action: 'login',
        result: 'failure',
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      _count: true
    })
    
    failedLogins.forEach(async (group) => {
      if (group._count > 10) {
        // Block IP address
        await this.blockIP(group.ipAddress)
      }
    })
    
    // Monitor unusual data access patterns
    const dataAccess = await db.auditLog.groupBy({
      by: ['userId'],
      where: {
        action: 'data_export',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _count: true
    })
    
    dataAccess.forEach(async (group) => {
      if (group._count > 5) {
        await this.flagSuspiciousUser(group.userId)
      }
    })
  }
  
  static async blockIP(ipAddress: string): Promise<void> {
    await db.blockedIP.create({
      data: {
        ipAddress,
        reason: 'Excessive failed login attempts',
        blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })
  }
}
```

## Security Checklist

### Pre-Deployment Security Checklist

- [ ] All dependencies updated and vulnerability-free (`npm audit`)
- [ ] Environment variables properly configured and secrets secured
- [ ] SSL/TLS certificates installed and configured
- [ ] Security headers implemented (CSP, HSTS, etc.)
- [ ] Rate limiting configured for all API endpoints
- [ ] Input validation on all user inputs
- [ ] Authentication and authorization properly implemented
- [ ] Sensitive data encryption at rest and in transit
- [ ] GDPR compliance measures in place
- [ ] Security logging and monitoring active
- [ ] Penetration testing completed
- [ ] Security incident response plan documented
- [ ] Backup and recovery procedures tested
- [ ] Access controls and permissions reviewed
- [ ] Third-party dependencies security reviewed

---

*Last Updated: December 2024*
*Version: 1.0.0*