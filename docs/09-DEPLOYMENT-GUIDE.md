# Deployment Guide

## 🎯 Core Priority Deployment Requirements

> **CRITICAL**: Deployment MUST support all 5 core priority features from Day 1:
> 1. Template-Based Generation - JSON template deployment
> 2. Interactive Customization - Dynamic Q&A deployment
> 3. AI-Powered Intelligence - Claude API keys configured
> 4. Professional Export - PerfexCRM credentials set up
> 5. Mobile-Responsive Design - CDN optimization for mobile

## Overview

This guide provides instructions for deploying ChecklistApp, with MVP focusing on simple Vercel deployment.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Development Flow                        │
├─────────────────────────────────────────────────────────┤
│  Local Dev → Git Push → CI/CD → Staging → Production    │
└─────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Supabase   │     │  Claude AI   │
│   (Hosting)  │────▶│  (Database)  │────▶│    (API)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

## 1. Environment Setup

### Environment Variables

#### .env.local (Development)
```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ChecklistApp
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/checklistapp_dev
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Claude AI
CLAUDE_API_KEY=sk-ant-api03-xxx
NEXT_PUBLIC_CLAUDE_MODEL=claude-3-opus-20240229

# PerfexCRM
PERFEX_API_URL=https://crm.example.com/api
PERFEX_API_KEY=your-perfex-key

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_CAMERA=true
```

#### .env.staging
```bash
# Staging-specific overrides
NEXT_PUBLIC_APP_URL=https://staging.checklistapp.com
DATABASE_URL=postgresql://user:password@staging-db.supabase.co:5432/checklistapp_staging
NEXT_PUBLIC_ENVIRONMENT=staging
```

#### .env.production
```bash
# Production-specific overrides
NEXT_PUBLIC_APP_URL=https://checklistapp.com
DATABASE_URL=postgresql://user:password@prod-db.supabase.co:5432/checklistapp_prod
NEXT_PUBLIC_ENVIRONMENT=production
```

### Secret Management

```bash
# Using Vercel CLI for secrets
vercel secrets add claude-api-key "sk-ant-api03-xxx"
vercel secrets add database-url "postgresql://..."
vercel secrets add supabase-service-key "xxx"

# Link secrets to environment variables
vercel env add CLAUDE_API_KEY production --secret claude-api-key
vercel env add DATABASE_URL production --secret database-url
```

## 2. Local Development Setup

### Prerequisites Installation

```bash
# Install Node.js 20+ and pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
nvm install 20
nvm use 20

# Clone repository
git clone https://github.com/your-org/checklistapp.git
cd checklistapp

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https",
    "dev:mobile": "next dev --hostname 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx scripts/seed.ts",
    "analyze": "ANALYZE=true next build"
  }
}
```

## 3. Build Process

### Production Build

```bash
# Clean previous builds
rm -rf .next out

# Run pre-build checks
pnpm lint
pnpm type-check
pnpm test

# Build application
pnpm build

# Output analysis
# - .next/          - Next.js build output
# - .next/static/   - Static assets
# - .next/server/   - Server-side code
# - public/         - Public static files
```

### Build Optimization

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: ['storage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
  },
  
  webpack: (config, { isServer }) => {
    // Optimizations
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000
            },
            name(module) {
              const hash = crypto.createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').substring(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
}
```

## 4. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run unit tests
        run: pnpm test:unit --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
        env:
          NEXT_TELEMETRY_DISABLED: 1
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging.checklistapp.com
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Staging
        run: |
          npm i -g vercel
          vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://checklistapp.com
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Production
        run: |
          npm i -g vercel
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Purge CDN Cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CF_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'
      
      - name: Notify Deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 5. Vercel Deployment

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "app/api/*": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url",
    "DATABASE_URL": "@database-url",
    "CLAUDE_API_KEY": "@claude-api-key"
  }
}
```

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Initial setup
vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --env production
vercel --env staging
```

## 6. Database Migration

### Migration Strategy

```bash
# Development migrations
pnpm prisma migrate dev --name add_user_table

# Generate migration SQL for review
pnpm prisma migrate dev --create-only

# Deploy migrations to staging
DATABASE_URL=$STAGING_DB_URL pnpm prisma migrate deploy

# Deploy migrations to production
DATABASE_URL=$PROD_DB_URL pnpm prisma migrate deploy
```

### Rollback Procedure

```sql
-- Backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

-- Rollback migration
pnpm prisma migrate resolve --rolled-back 20240101120000_migration_name

-- Restore from backup if needed
psql $DATABASE_URL < backup_20240101_120000.sql
```

## 7. Monitoring & Health Checks

### Health Check Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    app: 'healthy',
    database: 'unknown',
    cache: 'unknown',
    storage: 'unknown'
  }
  
  try {
    // Check database
    await db.$queryRaw`SELECT 1`
    checks.database = 'healthy'
  } catch {
    checks.database = 'unhealthy'
  }
  
  try {
    // Check cache
    await redis.ping()
    checks.cache = 'healthy'
  } catch {
    checks.cache = 'unhealthy'
  }
  
  const allHealthy = Object.values(checks).every(v => v === 'healthy')
  
  return Response.json(checks, {
    status: allHealthy ? 200 : 503
  })
}
```

### Monitoring Setup

```javascript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
})

// Custom error boundary
export function logError(error: Error, errorInfo?: any) {
  console.error('Application error:', error)
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: errorInfo
    })
  }
}
```

## 8. SSL & Domain Configuration

### SSL Certificate Setup

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --webroot -w /var/www/checklistapp -d checklistapp.com -d www.checklistapp.com

# Auto-renewal
sudo certbot renew --dry-run
```

### DNS Configuration

```
Type    Name    Value                   TTL
A       @       76.76.21.21            Auto
A       www     76.76.21.21            Auto
CNAME   staging staging.vercel.app     Auto
TXT     @       "v=spf1 include:..."   Auto
```

## 9. Performance Optimization

### CDN Configuration

```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.CDN_URL || '',
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud/',
  },
}
```

### Edge Functions

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Geolocation-based routing
  const country = request.geo?.country || 'US'
  
  // Cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/static')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 10. Rollback Procedures

### Application Rollback

```bash
# List recent deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or using Git
git revert HEAD
git push origin main

# Emergency rollback script
#!/bin/bash
PREVIOUS_DEPLOYMENT=$(vercel list --json | jq -r '.[1].url')
vercel alias set $PREVIOUS_DEPLOYMENT checklistapp.com
```

### Database Rollback

```sql
-- Create restore point before deployment
BEGIN;
SAVEPOINT before_deployment;

-- If issues occur
ROLLBACK TO SAVEPOINT before_deployment;

-- Or full restoration
pg_restore -d checklistapp_prod backup_20240101.dump
```

## 11. Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Security scan completed
- [ ] Performance budget met
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured

### Deployment

- [ ] Create deployment tag in Git
- [ ] Run deployment pipeline
- [ ] Verify health checks passing
- [ ] Check application logs
- [ ] Verify critical user journeys
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-Deployment

- [ ] Send deployment notification
- [ ] Update status page
- [ ] Monitor for 30 minutes
- [ ] Document any issues
- [ ] Update deployment log
- [ ] Clear CDN cache if needed
- [ ] Verify analytics tracking
- [ ] Check PWA installation

## 12. Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build

# Check for type errors
pnpm type-check

# Analyze bundle size
ANALYZE=true pnpm build
```

#### Deployment Failures
```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --filter=functions

# Redeploy with verbose output
vercel --debug
```

#### Database Connection Issues
```bash
# Test connection
pnpm prisma db pull

# Reset connection pool
pnpm prisma generate

# Check connection string
echo $DATABASE_URL | sed 's/:[^:]*@/:***@/'
```

### Emergency Contacts

- **DevOps Lead**: devops@checklistapp.com
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Vercel Support**: support.vercel.com
- **Status Page**: status.checklistapp.com

## Appendix

### Environment Variable Reference

| Variable | Description | Required | Environment |
|----------|-------------|----------|-------------|
| DATABASE_URL | PostgreSQL connection string | Yes | All |
| CLAUDE_API_KEY | Claude AI API key | Yes | All |
| NEXT_PUBLIC_APP_URL | Application URL | Yes | All |
| SENTRY_DSN | Error tracking DSN | No | Staging, Production |
| VERCEL_TOKEN | Vercel deployment token | Yes | CI/CD |

### Deployment Scripts

```bash
# scripts/deploy.sh
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Run tests
echo "🧪 Running tests..."
pnpm test

# Build application
echo "🔨 Building application..."
pnpm build

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

# Purge CDN
echo "🧹 Purging CDN cache..."
./scripts/purge-cdn.sh

echo "✅ Deployment complete!"
```

---

*Last Updated: December 2024*
*Version: 1.0.0*