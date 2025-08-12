# Feature Implementation with TDD Checklist

## 📋 Pre-Implementation Planning

### Feature Analysis
- [ ] Read feature requirements thoroughly
- [ ] Break down into user stories
- [ ] Identify testable components
- [ ] List acceptance criteria
- [ ] Estimate number of tests needed

### Technical Planning
- [ ] Identify affected files/components
- [ ] Plan component structure
- [ ] Define interfaces/types needed
- [ ] Plan state management approach
- [ ] List external dependencies

## 🧪 TDD Implementation Steps

### Phase 1: Type Definitions & Interfaces

#### Test First
- [ ] Write test for type structure
- [ ] Test type properties exist
- [ ] Test optional vs required fields
- [ ] Run test - verify it fails

#### Implementation
- [ ] Create type definition file
- [ ] Add interfaces/types
- [ ] Run test - verify it passes
- [ ] Commit: `test: add types for [feature]`

Example:
```typescript
// types/__tests__/feature.test.ts
describe('Feature Types', () => {
  it('should have correct structure', () => {
    const item: FeatureItem = {
      id: '1',
      name: 'Test',
      isActive: true
    };
    expect(item.id).toBeDefined();
  });
});
```

### Phase 2: Business Logic / Services

#### Test First
- [ ] Write test for service initialization
- [ ] Test main functionality
- [ ] Test error handling
- [ ] Test edge cases
- [ ] Run tests - all should fail

#### Implementation
- [ ] Create service class/functions
- [ ] Implement core logic
- [ ] Add error handling
- [ ] Run tests - all should pass
- [ ] Refactor for clarity
- [ ] Commit: `test: add [feature] service with tests`

### Phase 3: State Management (Zustand Store)

#### Test First
- [ ] Test initial state
- [ ] Test state updates/actions
- [ ] Test computed values
- [ ] Test async actions
- [ ] Run tests - verify failure

#### Implementation  
- [ ] Create Zustand store
- [ ] Add state properties
- [ ] Implement actions
- [ ] Add selectors
- [ ] Run tests - verify passing
- [ ] Commit: `test: add [feature] store with tests`

### Phase 4: UI Components

#### Test First - Container Component
- [ ] Test component renders
- [ ] Test props passing
- [ ] Test state connection
- [ ] Test user interactions
- [ ] Run tests - should fail

#### Implementation
- [ ] Create container component
- [ ] Connect to store
- [ ] Handle business logic
- [ ] Run tests - should pass
- [ ] Commit: `test: add [feature] container`

#### Test First - Presentational Components
- [ ] Test component rendering
- [ ] Test prop handling
- [ ] Test conditional rendering
- [ ] Test accessibility
- [ ] Run tests - should fail

#### Implementation
- [ ] Create UI components
- [ ] Add styling
- [ ] Handle props
- [ ] Run tests - should pass
- [ ] Commit: `test: add [feature] UI components`

### Phase 5: Integration

#### Test First
- [ ] Test component integration
- [ ] Test data flow
- [ ] Test user workflows
- [ ] Test error scenarios
- [ ] Run tests - should fail

#### Implementation
- [ ] Wire components together
- [ ] Connect data flow
- [ ] Add error boundaries
- [ ] Run tests - should pass
- [ ] Commit: `test: complete [feature] integration`

## 🔄 Iteration Cycle

For each component/function:

### Mini RED-GREEN-REFACTOR Cycle
1. [ ] Write one test case
2. [ ] Run test - see it fail (RED)
3. [ ] Write minimal code to pass
4. [ ] Run test - see it pass (GREEN)
5. [ ] Refactor if needed (REFACTOR)
6. [ ] All tests still pass
7. [ ] Move to next test case

## 📊 Testing Checklist by Component Type

### React Component Testing
- [ ] **Rendering Tests**
  - [ ] Component renders without error
  - [ ] Correct elements displayed
  - [ ] Conditional rendering works
  
- [ ] **Props Tests**
  - [ ] Required props handled
  - [ ] Optional props have defaults
  - [ ] Props affect rendering correctly
  
- [ ] **Interaction Tests**
  - [ ] Click handlers work
  - [ ] Form inputs update
  - [ ] Keyboard navigation works
  
- [ ] **State Tests**
  - [ ] State initializes correctly
  - [ ] State updates on action
  - [ ] Side effects trigger properly

- [ ] **Error Tests**
  - [ ] Error states display
  - [ ] Error boundaries catch errors
  - [ ] Validation messages show

### Service/Utility Testing
- [ ] **Function Tests**
  - [ ] Correct return values
  - [ ] Parameter validation
  - [ ] Type checking works
  
- [ ] **Async Tests**
  - [ ] Promises resolve correctly
  - [ ] Async errors handled
  - [ ] Loading states work
  
- [ ] **Edge Cases**
  - [ ] Null/undefined handling
  - [ ] Empty arrays/objects
  - [ ] Maximum values
  - [ ] Minimum values

### Store Testing (Zustand)
- [ ] **State Tests**
  - [ ] Initial state correct
  - [ ] State shape matches types
  
- [ ] **Action Tests**
  - [ ] Actions update state
  - [ ] Multiple actions work together
  - [ ] Async actions complete
  
- [ ] **Selector Tests**
  - [ ] Computed values correct
  - [ ] Memoization works

## 🎯 Feature Completion Criteria

### Code Complete
- [ ] All planned tests written
- [ ] All tests passing
- [ ] Coverage > 80% for feature
- [ ] No skipped tests
- [ ] No console errors

### Quality Checks
- [ ] TypeScript - no errors
- [ ] ESLint - no warnings
- [ ] Prettier - formatted
- [ ] Accessibility - tested
- [ ] Performance - measured

### Documentation
- [ ] Component props documented
- [ ] Complex logic commented
- [ ] README updated if needed
- [ ] Storybook stories added (if applicable)

## 🚀 Ready for Review

### Self Review
- [ ] Code follows project standards
- [ ] Tests are comprehensive
- [ ] No commented out code
- [ ] No debug statements
- [ ] Naming is clear

### PR Preparation
- [ ] Branch up to date with main
- [ ] Commits are logical
- [ ] PR description complete
- [ ] Screenshots added (for UI)
- [ ] Test results included

## 📝 Example Feature Flow: Add Task Feature

```bash
# 1. Start test watcher
npm run test:watch

# 2. Create test file
touch lib/features/tasks/__tests__/add-task.test.ts

# 3. Write failing test
# 4. See it fail (RED)
# 5. Implement feature
# 6. See test pass (GREEN)
# 7. Refactor
# 8. Commit

git add .
git commit -m "test: implement add task feature with tests"
```

## ⚡ Quick TDD Commands

```bash
# Run tests for current feature
npm test -- --grep="FeatureName"

# Run tests in watch mode
npm run test:watch

# Check coverage for specific folder
npm run test:coverage -- lib/features/tasks

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration
```

## 🔴 When Tests Fail

### Debugging Steps
1. [ ] Read error message carefully
2. [ ] Check test expectations
3. [ ] Verify implementation logic
4. [ ] Check for typos
5. [ ] Verify mocks/stubs
6. [ ] Check async handling
7. [ ] Review recent changes

### Common Issues
- Async tests not awaited
- Incorrect mock data
- Missing test setup
- Race conditions
- Stale snapshots
- Import errors

---

**Remember: Test First, Code Second! 🧪**