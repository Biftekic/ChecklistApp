# Testing Strategy

## 🎯 Core Priority Testing Requirements

> **CRITICAL**: Testing MUST cover all 5 core priority features in Phase 1:
> 1. Template-Based Generation - Full template engine testing
> 2. Interactive Customization - Q&A flow and logic testing
> 3. AI-Powered Intelligence - Claude API integration tests
> 4. Professional Export - PerfexCRM GraphQL and PDF testing
> 5. Mobile-Responsive Design - Cross-device compatibility tests

## Overview

This document outlines the testing strategy for ChecklistApp, with MVP focusing on essential tests for template generation and export functionality.

## Testing Philosophy

- **Test-Driven Development (TDD)** for critical business logic
- **Behavior-Driven Development (BDD)** for user scenarios
- **Continuous Testing** integrated into CI/CD pipeline
- **Shift-Left Testing** with early quality gates
- **Mobile-First Testing** prioritizing mobile experiences

## Testing Pyramid

```
         /\
        /E2E\        5% - Critical user journeys
       /-----\
      /Integration\   25% - API, Database, Services
     /------------\
    /   Unit Tests  \ 70% - Components, Functions, Utils
   /-----------------\
```

## 1. Unit Testing

### Framework & Tools
- **Test Runner**: Vitest (optimized for Vite/Next.js)
- **React Testing**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Istanbul/c8

### Coverage Requirements
- **Minimum**: 80% overall coverage
- **Critical Paths**: 95% coverage required
- **New Code**: 90% coverage required

### What to Test

#### Components
```typescript
// Example: TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItem } from '@/components/TaskItem'

describe('TaskItem', () => {
  it('should toggle completion status', async () => {
    const onToggle = vi.fn()
    render(<TaskItem task={mockTask} onToggle={onToggle} />)
    
    const checkbox = screen.getByRole('checkbox')
    await fireEvent.click(checkbox)
    
    expect(onToggle).toHaveBeenCalledWith(mockTask.id, true)
  })
  
  it('should handle offline mode', () => {
    render(<TaskItem task={mockTask} isOffline={true} />)
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument()
  })
})
```

#### Hooks
```typescript
// Example: useOfflineSync.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useOfflineSync } from '@/hooks/useOfflineSync'

describe('useOfflineSync', () => {
  it('should queue operations when offline', async () => {
    const { result } = renderHook(() => useOfflineSync())
    
    // Simulate offline
    window.dispatchEvent(new Event('offline'))
    
    await result.current.saveOperation({ type: 'UPDATE', data: {} })
    expect(result.current.queue).toHaveLength(1)
  })
})
```

#### Utilities
```typescript
// Example: validation.test.ts
describe('Validation Utilities', () => {
  it('should validate email format', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('invalid')).toBe(false)
  })
})
```

### Testing Patterns

#### Mocking IndexedDB
```typescript
import 'fake-indexeddb/auto'
import { Dexie } from 'dexie'

beforeEach(() => {
  // Reset IndexedDB for each test
  indexedDB = new IDBFactory()
})
```

#### Mocking Service Worker
```typescript
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 2. Integration Testing

### Framework & Tools
- **API Testing**: Supertest + MSW
- **Database Testing**: Dexie + fake-indexeddb
- **Service Worker**: Playwright Service Worker API

### Test Categories

#### API Integration
```typescript
// Example: api.integration.test.ts
describe('API Integration', () => {
  it('should sync local changes to server', async () => {
    // Create local changes
    await db.tasks.add({ title: 'Test Task', synced: false })
    
    // Trigger sync
    await syncManager.sync()
    
    // Verify server received changes
    const serverTasks = await api.getTasks()
    expect(serverTasks).toContainEqual(
      expect.objectContaining({ title: 'Test Task' })
    )
  })
})
```

#### Offline/Online Transitions
```typescript
describe('Offline/Online Transitions', () => {
  it('should handle network state changes', async () => {
    // Start online
    expect(await networkStatus.isOnline()).toBe(true)
    
    // Go offline
    await page.context().setOffline(true)
    
    // Make changes
    await createTask({ title: 'Offline Task' })
    
    // Go online
    await page.context().setOffline(false)
    
    // Verify sync
    await waitFor(() => {
      expect(getSyncStatus()).toBe('completed')
    })
  })
})
```

#### Claude AI Integration
```typescript
describe('Claude AI Integration', () => {
  it('should generate checklist from image', async () => {
    const image = await loadTestImage('room.jpg')
    const result = await claudeService.analyzeImage(image)
    
    expect(result.checklist).toBeDefined()
    expect(result.checklist.items).toBeInstanceOf(Array)
    expect(result.confidence).toBeGreaterThan(0.8)
  })
})
```

## 3. End-to-End Testing

### Framework & Tools
- **Test Framework**: Playwright
- **Visual Testing**: Percy/Chromatic
- **Device Testing**: BrowserStack/Sauce Labs
- **Performance**: Lighthouse CI

### Test Scenarios

#### Critical User Journeys
```typescript
// Example: checklist-creation.e2e.ts
test('Complete checklist creation flow', async ({ page, context }) => {
  // 1. Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // 2. Take photo
  await page.click('[data-testid="new-checklist"]')
  await page.click('[data-testid="camera-button"]')
  
  // Grant camera permission
  await context.grantPermissions(['camera'])
  
  // 3. AI Analysis
  await page.waitForSelector('[data-testid="ai-suggestions"]')
  
  // 4. Edit checklist
  await page.fill('[name="checklist-name"]', 'Master Bedroom')
  await page.click('[data-testid="add-task"]')
  
  // 5. Save and verify
  await page.click('[data-testid="save-checklist"]')
  await expect(page).toHaveURL('/checklists')
  await expect(page.locator('text=Master Bedroom')).toBeVisible()
})
```

#### Mobile-Specific Testing
```typescript
test.describe('Mobile Experience', () => {
  test.use({ 
    ...devices['iPhone 13'],
    permissions: ['camera', 'geolocation']
  })
  
  test('Touch gestures work correctly', async ({ page }) => {
    await page.goto('/checklists')
    
    // Swipe to delete
    await page.locator('[data-testid="checklist-item"]').first().swipe('left')
    await expect(page.locator('[data-testid="delete-button"]')).toBeVisible()
    
    // Pull to refresh
    await page.locator('body').swipe('down', { distance: 100 })
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible()
  })
})
```

#### PWA Installation
```typescript
test('PWA installation flow', async ({ page, context }) => {
  // Navigate to app
  await page.goto('/')
  
  // Wait for install prompt
  const installPrompt = await page.waitForEvent('beforeinstallprompt')
  
  // Trigger installation
  await page.click('[data-testid="install-button"]')
  
  // Verify installation
  const manifest = await page.evaluate(() => navigator.getInstalledRelatedApps())
  expect(manifest).toContainEqual(
    expect.objectContaining({ platform: 'webapp' })
  )
})
```

## 4. Performance Testing

### Metrics & Thresholds

#### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s

#### Mobile Performance
```typescript
test('Mobile performance budget', async ({ page }) => {
  const metrics = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('navigation')[0])
  })
  
  expect(metrics.domContentLoadedEventEnd).toBeLessThan(1500)
  expect(metrics.loadEventEnd).toBeLessThan(3000)
})
```

#### Offline Performance
```typescript
test('Offline page load performance', async ({ page, context }) => {
  // Load page online first
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  // Go offline
  await context.setOffline(true)
  
  // Measure offline reload
  const startTime = Date.now()
  await page.reload()
  const loadTime = Date.now() - startTime
  
  expect(loadTime).toBeLessThan(500) // Should load from cache quickly
})
```

## 5. Accessibility Testing

### Automated Testing
```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test('Accessibility compliance', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  
  // Check WCAG 2.1 AA compliance
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    },
    axeOptions: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    }
  })
})
```

### Manual Testing Checklist
- [ ] Keyboard navigation through all interactive elements
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] Focus indicators visible
- [ ] Touch target sizes (minimum 48x48px)
- [ ] Form labels and error messages
- [ ] Alternative text for images
- [ ] ARIA labels and roles

## 6. Security Testing

### Static Analysis
```bash
# Dependency scanning
npm audit
npm run security:check

# Code scanning
npm run lint:security
```

### Dynamic Testing
```typescript
describe('Security Tests', () => {
  test('XSS prevention', async ({ page }) => {
    const maliciousInput = '<script>alert("XSS")</script>'
    await page.fill('[name="task-name"]', maliciousInput)
    await page.click('button[type="submit"]')
    
    // Verify script is not executed
    const alerts = []
    page.on('dialog', dialog => alerts.push(dialog))
    await page.waitForTimeout(1000)
    expect(alerts).toHaveLength(0)
  })
  
  test('SQL injection prevention', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      data: {
        name: "'; DROP TABLE tasks; --"
      }
    })
    
    expect(response.status()).toBe(400) // Should reject malicious input
  })
})
```

## 7. Testing Environments

### Local Development
```json
{
  "test:unit": "vitest",
  "test:unit:watch": "vitest --watch",
  "test:unit:coverage": "vitest --coverage",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Device Testing Matrix

| Platform | Devices | Browsers | Versions |
|----------|---------|----------|----------|
| iOS | iPhone 12-15, iPad | Safari, Chrome | iOS 15+ |
| Android | Pixel, Samsung Galaxy | Chrome, Firefox | Android 10+ |
| Desktop | Windows, Mac, Linux | Chrome, Firefox, Safari, Edge | Latest 2 versions |

## 8. Test Data Management

### Test Data Strategy
```typescript
// test/fixtures/data.ts
export const testData = {
  users: [
    { id: 1, email: 'maria@hotel.com', role: 'manager' },
    { id: 2, email: 'john@cleaning.com', role: 'supervisor' },
    { id: 3, email: 'sarah@staff.com', role: 'cleaner' }
  ],
  checklists: [
    { id: 1, name: 'Master Bedroom', tasks: 15 },
    { id: 2, name: 'Bathroom', tasks: 12 }
  ]
}

// Seed function
export async function seedTestData() {
  await db.users.bulkAdd(testData.users)
  await db.checklists.bulkAdd(testData.checklists)
}
```

## 9. Continuous Testing

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ]
  }
}
```

### Monitoring & Alerting
- **Test Flakiness**: Track and fix flaky tests
- **Coverage Trends**: Monitor coverage over time
- **Performance Regression**: Alert on performance degradation
- **Error Rates**: Monitor production error rates

## 10. Testing Documentation

### Test Case Template
```markdown
## Test Case: [TC-001]
**Feature**: User Authentication
**Scenario**: User login with valid credentials
**Priority**: High

### Pre-conditions
- User account exists
- User is on login page

### Test Steps
1. Enter valid email
2. Enter valid password
3. Click login button

### Expected Results
- User is redirected to dashboard
- Session is created
- Welcome message appears

### Post-conditions
- User session is active
- User data is loaded
```

## Success Metrics

### Quality Gates
- ✅ Unit test coverage > 80%
- ✅ Zero critical security vulnerabilities
- ✅ All E2E tests passing
- ✅ Performance budgets met
- ✅ Accessibility score > 95
- ✅ Zero high-priority bugs in production

### Testing KPIs
- **Test Execution Time**: < 10 minutes for full suite
- **Test Reliability**: < 1% flaky test rate
- **Bug Detection Rate**: > 90% before production
- **Test Automation Coverage**: > 85%
- **Mean Time to Detect (MTTD)**: < 1 hour
- **Mean Time to Resolve (MTTR)**: < 4 hours

## Appendix

### Testing Tools Configuration

#### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '*.config.ts'
      ]
    }
  }
})
```

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

*Last Updated: December 2024*
*Version: 1.0.0*