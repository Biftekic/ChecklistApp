# TDD Development Workflow Checklist

## 🚨 Pre-Development Setup

### Environment Preparation
- [ ] Open terminal and start test watcher: `npm run test:watch`
- [ ] Open second terminal for running commands
- [ ] Verify TDD Guard is active: `git status` (should show .claude/tdd-guard)
- [ ] Check current test coverage: `npm run test:coverage`

## 📝 Feature Development Checklist

### 1. RED Phase - Write Failing Test First

#### Planning
- [ ] Identify the feature/component to implement
- [ ] Break down into smallest testable unit
- [ ] Write test file name: `[component].test.tsx` or `[service].test.ts`

#### Write Test
- [ ] Create test file in `__tests__` folder
- [ ] Write describe block for feature
- [ ] Write first test case (it/test block)
- [ ] Run test to verify it FAILS (Red)
- [ ] Commit message ready: "test: add failing test for [feature]"

Example:
```typescript
// ❌ This test MUST fail first
describe('FeatureName', () => {
  it('should do expected behavior', () => {
    // Arrange
    // Act  
    // Assert
    expect(result).toBe(expected);
  });
});
```

### 2. GREEN Phase - Make Test Pass

#### Implementation
- [ ] Write MINIMAL code to make test pass
- [ ] No extra features or optimizations
- [ ] Import and use in test file
- [ ] Run test to verify it PASSES (Green)
- [ ] All other tests still pass

#### Verification
- [ ] Test is green in terminal
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Coverage not decreased

### 3. REFACTOR Phase - Improve Code

#### Code Quality
- [ ] Refactor implementation for clarity
- [ ] Extract magic numbers to constants
- [ ] Improve variable/function names
- [ ] Add TypeScript types if needed
- [ ] Remove code duplication

#### Test Quality
- [ ] Refactor test for readability
- [ ] Extract test helpers if needed
- [ ] Add edge case tests
- [ ] Verify all tests still pass

### 4. COMMIT Phase - Save Progress

#### Pre-Commit Checks
- [ ] Run all tests: `npm test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting issues
- [ ] Verify TDD Guard allows commit

#### Git Commands
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: implement [feature] with tests"

# If commit blocked by TDD Guard:
# - Fix failing tests
# - Improve coverage
# - Try commit again
```

## 🔄 Iteration Checklist

For each new test case:

### Add Next Test
- [ ] Write next failing test
- [ ] Run to verify failure
- [ ] Implement to pass
- [ ] Refactor if needed
- [ ] All tests green
- [ ] Commit progress

## 📊 Coverage Maintenance

### Coverage Checks
- [ ] Run coverage before starting: `npm run test:coverage`
- [ ] Monitor coverage during development
- [ ] Ensure coverage doesn't drop below 80%
- [ ] Add tests for uncovered branches
- [ ] Focus on critical paths first

### Coverage Report Review
- [ ] Check coverage report in `coverage/index.html`
- [ ] Identify uncovered lines (red)
- [ ] Identify partially covered branches (yellow)
- [ ] Write tests for uncovered code
- [ ] Aim for 100% on critical features

## 🎯 Component Development Checklist

### React Component TDD
- [ ] Test renders without crashing
- [ ] Test props are displayed correctly
- [ ] Test user interactions (click, type, etc.)
- [ ] Test state changes
- [ ] Test error states
- [ ] Test loading states
- [ ] Test accessibility (ARIA, roles)

### Service/Utility TDD
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases (null, undefined, empty)
- [ ] Test async operations
- [ ] Test error handling
- [ ] Test return values
- [ ] Test side effects

## 🚀 Feature Complete Checklist

### Final Verification
- [ ] All tests passing
- [ ] Coverage meets threshold (80%+)
- [ ] No skipped tests
- [ ] No .only() tests
- [ ] Integration tests added
- [ ] Documentation updated

### Ready for PR
- [ ] Feature branch up to date with main
- [ ] All commits follow convention
- [ ] PR description references tests
- [ ] Coverage report included
- [ ] No merge conflicts
- [ ] CI/CD pipeline passing

## ⚠️ Common TDD Pitfalls to Avoid

### Don't Do This
- ❌ Write implementation first
- ❌ Write multiple tests at once
- ❌ Skip the failing test phase
- ❌ Write tests after implementation
- ❌ Ignore failing tests
- ❌ Comment out failing tests
- ❌ Use .skip() or .only() in commits

### Do This Instead
- ✅ One test at a time
- ✅ See test fail first
- ✅ Minimal code to pass
- ✅ Refactor with green tests
- ✅ Commit frequently
- ✅ Keep tests fast (<100ms)
- ✅ Test behavior, not implementation

## 📝 Quick Commands Reference

```bash
# Development
npm run test:watch     # TDD mode
npm run test:ui        # Visual test UI
npm test              # Run all tests once
npm run test:coverage  # Check coverage

# Specific tests
npm test -- --grep="ComponentName"  # Test specific component
npm test -- path/to/test.spec.ts   # Run specific file

# Git with TDD Guard
git add .
git commit -m "test: message"  # Blocked if tests fail
git push                        # Only after tests pass
```

## 🔍 Test Writing Templates

### Unit Test Template
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should handle expected behavior', async () => {
    // Arrange
    const props = { /* ... */ };
    
    // Act
    render(<Component {...props} />);
    
    // Assert
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

### Service Test Template
```typescript
describe('ServiceName', () => {
  it('should perform expected operation', async () => {
    // Arrange
    const input = 'test-data';
    const service = new ServiceName();
    
    // Act
    const result = await service.operation(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

## ✅ Daily TDD Checklist

### Start of Day
- [ ] Pull latest changes
- [ ] Run tests to ensure clean start
- [ ] Check coverage baseline
- [ ] Start test watcher

### During Development
- [ ] Write test first (RED)
- [ ] Make it pass (GREEN)
- [ ] Improve code (REFACTOR)
- [ ] Commit progress (COMMIT)

### End of Day
- [ ] All tests passing
- [ ] Coverage maintained/improved
- [ ] Committed all completed work
- [ ] Push to remote branch

---

Remember: **No Code Without Tests!** 🧪