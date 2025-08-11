# Developer Onboarding Guide

## 🎯 CRITICAL: Read Core Priorities First!

> ⚠️ **MANDATORY READING**: Before ANY development, read [00-CORE-PRIORITIES.md](00-CORE-PRIORITIES.md)
> 
> The 5 core features MUST be implemented FIRST:
> 1. Template-Based Generation
> 2. Interactive Customization
> 3. AI-Powered Intelligence (Claude API)
> 4. Professional Export (PerfexCRM GraphQL)
> 5. Mobile-Responsive Design
> 
> **DO NOT** work on any other features until these are 100% complete!

## Welcome to ChecklistApp Development Team! 🚀

This guide will help you get up and running with the ChecklistApp codebase quickly and efficiently.

## Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/checklistapp/checklistapp.git
cd checklistapp

# 2. Install dependencies
pnpm install

# 3. Set up environment variables (REQUIRED for core features)
cp .env.example .env.local
# Edit .env.local with:
#   - CLAUDE_API_KEY (Priority Feature #3)
#   - PERFEX_API_URL (Priority Feature #4)
#   - PERFEX_AUTH_TOKEN (Priority Feature #4)

# 4. Run database migrations
pnpm db:migrate

# 5. Start development server
pnpm dev

# 6. Open in browser
open http://localhost:3000
```

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Git Workflow](#git-workflow)
8. [Debugging Tips](#debugging-tips)
9. [Common Tasks](#common-tasks)
10. [Resources & Documentation](#resources--documentation)

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | 20.0+ | `nvm install 20` |
| pnpm | 8.0+ | `npm install -g pnpm` |
| Git | 2.30+ | [Download](https://git-scm.com/) |
| VS Code | Latest | [Download](https://code.visualstudio.com/) |
| Docker | 20.10+ | [Download](https://docker.com/) (optional) |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv",
    "usernamehw.errorlens",
    "eamodio.gitlens"
  ]
}
```

### System Requirements

- **OS**: macOS, Linux, or Windows (with WSL2)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space
- **Network**: Stable internet for API calls

## Environment Setup

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Install pre-commit hooks
pnpm prepare
```

### 2. Environment Variables

Create `.env.local` file in the root directory:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ChecklistApp
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development

# Database (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/checklistapp_dev

# Supabase (Create free account at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Claude AI (Get from anthropic.com)
CLAUDE_API_KEY=sk-ant-api03-xxx
NEXT_PUBLIC_CLAUDE_MODEL=claude-3-opus-20240229

# Optional: PerfexCRM Integration
PERFEX_API_URL=https://crm.example.com/api
PERFEX_API_KEY=your-perfex-key

# Development Tools
NEXT_PUBLIC_DEBUG=true
ANALYZE=false
```

### 3. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql # macOS
sudo apt-get install postgresql # Ubuntu

# Start PostgreSQL
brew services start postgresql # macOS
sudo systemctl start postgresql # Ubuntu

# Create database
createdb checklistapp_dev

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

### 4. Verify Setup

```bash
# Run all checks
pnpm verify

# This runs:
# - Type checking
# - Linting
# - Unit tests
# - Build test
```

## Project Structure

```
checklistapp/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── components/        # Page-specific components
│   └── layout.tsx         # Root layout
├── components/            # Shared components
│   ├── ui/               # UI primitives
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Utilities and libraries
│   ├── api/              # API clients
│   ├── auth/             # Authentication
│   ├── db/               # Database utilities
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── public/               # Static assets
│   ├── images/           # Images
│   ├── fonts/            # Fonts
│   └── sw.js             # Service Worker
├── styles/               # Global styles
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
└── plan/                 # Documentation
```

## Development Workflow

### 1. Starting a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Start development server
pnpm dev

# 3. Open in browser
open http://localhost:3000

# 4. Watch for TypeScript errors
pnpm type-check:watch

# 5. Run tests in watch mode
pnpm test:watch
```

### 2. Available Scripts

```json
{
  "scripts": {
    // Development
    "dev": "next dev",                  // Start dev server
    "dev:https": "next dev --experimental-https", // HTTPS dev server
    "dev:mobile": "next dev --hostname 0.0.0.0",  // Mobile testing
    
    // Building
    "build": "next build",               // Production build
    "start": "next start",               // Start production server
    "analyze": "ANALYZE=true next build", // Bundle analysis
    
    // Testing
    "test": "vitest",                    // Run tests
    "test:watch": "vitest --watch",      // Watch mode
    "test:coverage": "vitest --coverage", // Coverage report
    "test:e2e": "playwright test",       // E2E tests
    
    // Code Quality
    "lint": "eslint . --ext .ts,.tsx",   // Lint code
    "lint:fix": "eslint . --fix",        // Auto-fix issues
    "type-check": "tsc --noEmit",        // Type checking
    "format": "prettier --write .",       // Format code
    
    // Database
    "db:migrate": "prisma migrate dev",   // Run migrations
    "db:seed": "tsx prisma/seed.ts",      // Seed database
    "db:studio": "prisma studio",         // Database GUI
    "db:reset": "prisma migrate reset",   // Reset database
    
    // Utilities
    "clean": "rm -rf .next node_modules", // Clean build
    "verify": "pnpm lint && pnpm type-check && pnpm test"
  }
}
```

### 3. Component Development

```tsx
// Example: Creating a new component

// 1. Create component file: components/ui/Button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          // Variant styles
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          // Size styles
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 2. Create test file: components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(handleClick).toHaveBeenCalled()
  })
})

// 3. Create story file: components/ui/Button.stories.tsx (optional)
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
}

export default meta

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}
```

## Coding Standards

### TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types
interface UserProps {
  name: string
  age: number
  email?: string // Optional properties
}

// ❌ DON'T: Use 'any' type
const data: any = fetchData() // Avoid

// ✅ DO: Use type inference when obvious
const name = 'John' // Type inferred as string

// ✅ DO: Use enums for constants
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// ✅ DO: Use utility types
type PartialUser = Partial<User>
type RequiredUser = Required<User>
type ReadonlyUser = Readonly<User>
```

### React Best Practices

```tsx
// ✅ DO: Use functional components with hooks
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
  
  return <div>{user?.name}</div>
}

// ✅ DO: Use custom hooks for logic reuse
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false))
  }, [userId])
  
  return { user, loading }
}

// ✅ DO: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ DO: Use error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

### CSS/Tailwind Guidelines

```tsx
// ✅ DO: Use Tailwind utilities
<div className="flex items-center justify-between p-4">

// ✅ DO: Extract repeated styles to components
const Card = ({ children }) => (
  <div className="rounded-lg border bg-white p-6 shadow-sm">
    {children}
  </div>
)

// ✅ DO: Use CSS modules for complex styles
import styles from './Component.module.css'
<div className={styles.complexAnimation}>

// ❌ DON'T: Use inline styles except for dynamic values
<div style={{ color: 'red' }}> // Avoid
<div style={{ transform: `translateX(${offset}px)` }}> // OK for dynamic
```

## Testing Guidelines

### Unit Testing

```typescript
// tests/unit/utils.test.ts
import { formatDate, calculateTotal } from '@/lib/utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-01')
      expect(formatDate(date)).toBe('January 1, 2024')
    })
  })
  
  describe('calculateTotal', () => {
    it('calculates sum correctly', () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 }
      ]
      expect(calculateTotal(items)).toBe(35)
    })
  })
})
```

### Integration Testing

```typescript
// tests/integration/api.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/checklists/route'

describe('/api/checklists', () => {
  it('creates a checklist', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Checklist',
        tasks: ['Task 1', 'Task 2']
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toHaveProperty('id')
  })
})
```

### E2E Testing

```typescript
// tests/e2e/checklist.spec.ts
import { test, expect } from '@playwright/test'

test('create and complete checklist', async ({ page }) => {
  // Navigate to app
  await page.goto('/')
  
  // Create checklist
  await page.click('[data-testid="new-checklist"]')
  await page.fill('[name="name"]', 'Test Checklist')
  await page.click('[type="submit"]')
  
  // Verify creation
  await expect(page.locator('text=Test Checklist')).toBeVisible()
  
  // Complete task
  await page.click('[data-testid="task-checkbox-0"]')
  await expect(page.locator('[data-testid="task-0"]')).toHaveClass(/completed/)
})
```

## Git Workflow

### Branch Naming Convention

```bash
feature/add-user-authentication    # New features
bugfix/fix-login-error             # Bug fixes
hotfix/critical-security-patch     # Urgent fixes
refactor/improve-performance       # Code refactoring
docs/update-readme                 # Documentation
test/add-unit-tests                # Testing
```

### Commit Message Format

```bash
# Format: <type>(<scope>): <subject>

feat(auth): add social login support
fix(ui): resolve button alignment issue
docs(api): update endpoint documentation
test(utils): add unit tests for formatters
refactor(db): optimize query performance
style(components): fix indentation
chore(deps): update dependencies
```

### Pull Request Process

1. **Create PR with description**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.logs left
```

2. **Code Review Checklist**
- Functionality works as expected
- Code is readable and maintainable
- Tests are comprehensive
- No security vulnerabilities
- Performance considerations addressed

## Debugging Tips

### 1. Browser DevTools

```typescript
// Add debug points
console.log('🔍 Debug:', { user, data })
console.table(arrayData)
console.time('Operation')
// ... code
console.timeEnd('Operation')

// Conditional debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Dev only log')
}
```

### 2. React DevTools

```bash
# Install React DevTools extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools
```

### 3. VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "skipFiles": ["<node_internals>/**"],
      "port": 9229
    }
  ]
}
```

### 4. Network Debugging

```typescript
// Intercept fetch requests
if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    console.log('📡 Fetch:', args[0])
    const response = await originalFetch(...args)
    console.log('✅ Response:', response.status)
    return response
  }
}
```

## Common Tasks

### Adding a New Page

```bash
# 1. Create page file
touch app/(dashboard)/new-page/page.tsx

# 2. Add route content
echo "export default function NewPage() {
  return <div>New Page</div>
}" > app/(dashboard)/new-page/page.tsx

# 3. Add to navigation
# Edit: components/layouts/Navigation.tsx
```

### Adding a New API Endpoint

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Your logic here
  return NextResponse.json({ message: 'Success' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Your logic here
  return NextResponse.json({ id: '123', ...body })
}
```

### Database Changes

```bash
# 1. Modify schema
# Edit: prisma/schema.prisma

# 2. Create migration
pnpm prisma migrate dev --name add_new_field

# 3. Generate types
pnpm prisma generate

# 4. Update seed if needed
# Edit: prisma/seed.ts
```

### Deployment

```bash
# Build for production
pnpm build

# Run production build locally
pnpm start

# Deploy to staging
git push origin staging

# Deploy to production
git push origin main
```

## Resources & Documentation

### Internal Documentation
- [Project Overview](./01-PROJECT-OVERVIEW.md)
- [System Architecture](./02-SYSTEM-ARCHITECTURE.md)
- [API Design](./03-API-DESIGN.md)
- [Database Schema](./06-DATABASE-SCHEMA.md)
- [Testing Strategy](./08-TESTING-STRATEGY.md)
- [Security Guide](./10-SECURITY-IMPLEMENTATION.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Team Contacts
- **Tech Lead**: tech.lead@checklistapp.com
- **DevOps**: devops@checklistapp.com
- **Product Manager**: pm@checklistapp.com
- **Slack Channel**: #checklistapp-dev
- **Emergency Hotline**: +1-XXX-XXX-XXXX

## Troubleshooting

### Common Issues

**Issue: Dependencies not installing**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue: Database connection errors**
```bash
# Check PostgreSQL is running
pg_isready

# Reset database
pnpm db:reset
```

**Issue: TypeScript errors**
```bash
# Clear TypeScript cache
rm -rf .next
pnpm type-check
```

**Issue: Port already in use**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

## Welcome Aboard! 🎉

You're now ready to start contributing to ChecklistApp! If you have any questions:

1. Check the documentation
2. Ask in #checklistapp-dev Slack channel
3. Schedule a pairing session with a team member

Remember: **No question is too small!** We're here to help you succeed.

Happy coding! 🚀

---

*Last Updated: December 2024*
*Version: 1.0.0*