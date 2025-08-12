# TDD Guard Workflow Guide for ChecklistApp

## What is TDD Guard?

TDD Guard is a tool that enforces Test-Driven Development (TDD) by preventing you from writing implementation code before writing tests. It monitors your test coverage and blocks commits if tests are failing or coverage drops.

## How TDD Guard Works in This Project

### 1. **Automatic Test Running**
- TDD Guard integrates with Vitest via the `VitestReporter` in `vitest.config.ts`
- It monitors test results and coverage in real-time
- Prevents commits when tests fail or coverage drops

### 2. **Git Hooks Integration**
- Works with Husky and lint-staged (already configured)
- Runs tests before commits automatically
- Blocks commits if TDD rules are violated

## Proper TDD Workflow

### Step 1: Write a Failing Test First (RED)

```bash
# Start test watcher
npm run test:watch

# Or use UI mode for better experience
npm run test:ui
```

Example test file structure:
```typescript
// components/qa/__tests__/question-renderer.test.tsx
import { render, screen } from '@testing-library/react';
import { QuestionRenderer } from '../question-renderer';

describe('QuestionRenderer', () => {
  it('should render a text question', () => {
    // This test will fail initially - that's good!
    const question = {
      id: 'q1',
      type: 'text',
      question: 'What is your name?'
    };
    
    render(<QuestionRenderer question={question} />);
    
    expect(screen.getByText('What is your name?')).toBeInTheDocument();
  });
});
```

### Step 2: Write Minimal Code to Pass (GREEN)

```typescript
// components/qa/question-renderer.tsx
export function QuestionRenderer({ question }) {
  return <div>{question.question}</div>;
}
```

### Step 3: Refactor (REFACTOR)

```typescript
// Improve the implementation while keeping tests green
export function QuestionRenderer({ question }: QuestionRendererProps) {
  return (
    <div className="question-container">
      <label className="text-lg font-medium">
        {question.question}
      </label>
      {/* Add more UI elements */}
    </div>
  );
}
```

## TDD Commands

### Essential Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended for TDD)
npm run test:watch

# Run tests with UI (best for TDD workflow)
npm run test:ui

# Check coverage
npm run test:coverage

# Run only tests related to changed files
vitest related --run
```

### TDD Guard Specific Features

1. **Coverage Enforcement**
   - Set minimum coverage thresholds
   - Blocks commits if coverage drops below threshold

2. **Test-First Enforcement**
   - Detects if implementation exists without tests
   - Warns when modifying code without updating tests

3. **Smart Test Running**
   - Only runs tests affected by your changes
   - Provides instant feedback

## Best Practices for TDD with Guards

### 1. Start with Test Structure

```typescript
describe('Feature: Interactive Q&A', () => {
  describe('Question Flow', () => {
    it.todo('should start with service type question');
    it.todo('should show property type after service selection');
    it.todo('should display rooms based on property type');
  });
  
  describe('Task Selection', () => {
    it.todo('should allow selecting/deselecting tasks');
    it.todo('should enable inline editing of tasks');
    it.todo('should support adding custom tasks');
  });
});
```

### 2. Write One Test at a Time

```typescript
// Bad: Writing multiple tests at once
it('should handle all question types', () => {
  // Too much in one test
});

// Good: Focused single-purpose tests
it('should render text input for text questions', () => {
  // Single responsibility
});

it('should render checkboxes for multi-select questions', () => {
  // Another single responsibility
});
```

### 3. Use AAA Pattern

```typescript
it('should update answer when user types', () => {
  // Arrange
  const question = { id: 'q1', type: 'text', question: 'Name?' };
  const onAnswer = jest.fn();
  
  // Act
  render(<QuestionRenderer question={question} onAnswer={onAnswer} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'John Doe' } });
  
  // Assert
  expect(onAnswer).toHaveBeenCalledWith('q1', 'John Doe');
});
```

## Setting Up TDD Guard Hooks

### Pre-commit Hook (Already configured via lint-staged)

```json
// package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "vitest related --run"  // This runs tests for changed files
  ]
}
```

### Pre-push Hook

Create `.husky/pre-push`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite before push
npm test

# Check coverage
npm run test:coverage
```

## TDD Workflow Example: Adding a New Feature

### Example: Adding Photo Upload to Q&A

1. **Write Test Skeleton**
```typescript
// lib/services/__tests__/photo-analyzer.test.ts
describe('PhotoAnalyzer', () => {
  it.todo('should accept image file');
  it.todo('should validate file type');
  it.todo('should compress image if needed');
  it.todo('should analyze with Claude Vision API');
  it.todo('should return room suggestions');
});
```

2. **Implement First Test**
```typescript
it('should accept image file', () => {
  const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
  const analyzer = new PhotoAnalyzer();
  
  expect(() => analyzer.analyze(file)).not.toThrow();
});
```

3. **Write Minimal Implementation**
```typescript
export class PhotoAnalyzer {
  analyze(file: File) {
    // Minimal implementation to pass test
    return true;
  }
}
```

4. **Add More Tests, Then Implementation**
```typescript
it('should validate file type', () => {
  const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
  const analyzer = new PhotoAnalyzer();
  
  expect(() => analyzer.analyze(invalidFile)).toThrow('Invalid file type');
});
```

## Coverage Configuration

### Set Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

## Debugging TDD Guard Issues

### Common Issues and Solutions

1. **Tests Not Running on Commit**
   - Check if husky is installed: `npm run prepare`
   - Verify git hooks: `ls -la .husky/`

2. **Coverage Dropping**
   - Run `npm run test:coverage` to see uncovered lines
   - Focus on testing business logic first

3. **Tests Running Too Slow**
   - Use `vitest related` for targeted testing
   - Consider using `it.concurrent()` for parallel tests

## TDD Guard Dashboard

Access the TDD Guard dashboard:
```bash
# Start the test UI
npm run test:ui

# This opens a browser with:
# - Real-time test results
# - Coverage visualization
# - Test history
# - Performance metrics
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Tips for Effective TDD

1. **Write the test name first** - Clarifies what you're building
2. **Keep tests fast** - Under 100ms per test ideally
3. **Test behavior, not implementation** - Focus on what, not how
4. **One assertion per test** - Makes failures clear
5. **Use descriptive test names** - Should read like documentation

## Quick Reference

```bash
# TDD Cycle Commands
npm run test:watch    # Start TDD mode
npm run test:ui       # Visual TDD mode
npm test             # Run once
npm run test:coverage # Check coverage

# During Development
# 1. Write failing test
# 2. See red in terminal
# 3. Write code to pass
# 4. See green
# 5. Refactor if needed
# 6. Commit (auto-runs tests)
```

---

Remember: **Red → Green → Refactor** - This is the way!