# Git Workflow with TDD Guard Checklist

## 🔍 Pre-Commit Checklist

### Before Starting Work
- [ ] Pull latest from main: `git pull origin main`
- [ ] Create feature branch: `git checkout -b feature/[name]`
- [ ] Run tests to ensure clean start: `npm test`
- [ ] Check initial coverage: `npm run test:coverage`
- [ ] Start test watcher: `npm run test:watch`

## 🧪 During Development (TDD Cycle)

### After Writing Each Test
```bash
# 1. Write failing test
# 2. Check test fails
npm test -- [test-file]

# 3. Stage test file
git add [test-file]

# 4. Commit failing test (optional but recommended)
git commit -m "test: add failing test for [feature]"
```

### After Making Test Pass
```bash
# 1. Implement minimal code
# 2. Verify test passes
npm test -- [test-file]

# 3. Stage implementation
git add [implementation-file]

# 4. Commit passing test
git commit -m "feat: implement [feature] to pass test"
```

### After Refactoring
```bash
# 1. Refactor code
# 2. Ensure tests still pass
npm test

# 3. Stage refactored files
git add .

# 4. Commit refactoring
git commit -m "refactor: improve [feature] implementation"
```

## 📝 Commit Message Checklist

### Commit Types
- [ ] `test:` - Adding or modifying tests
- [ ] `feat:` - New feature implementation
- [ ] `fix:` - Bug fixes with tests
- [ ] `refactor:` - Code improvements (tests still pass)
- [ ] `docs:` - Documentation only
- [ ] `style:` - Code style changes (formatting)
- [ ] `perf:` - Performance improvements with tests
- [ ] `ci:` - CI/CD configuration

### Good Commit Messages
```bash
# Test commits
git commit -m "test: add unit tests for task creation"
git commit -m "test: add integration test for Q&A flow"
git commit -m "test: improve coverage for template service"

# Feature commits (after tests)
git commit -m "feat: implement task creation with validation"
git commit -m "feat: add Q&A navigation logic"

# Fix commits (with tests)
git commit -m "fix: resolve task duplication issue with test"
git commit -m "fix: correct validation logic for empty inputs"
```

## 🚫 TDD Guard Blocks

### When Commit is Blocked

#### Tests Failing
- [ ] Check test output for errors
- [ ] Fix implementation issues
- [ ] Ensure all tests pass
- [ ] Try commit again

#### Coverage Dropped
- [ ] Run coverage report: `npm run test:coverage`
- [ ] Identify uncovered lines
- [ ] Add tests for uncovered code
- [ ] Verify coverage increased
- [ ] Try commit again

#### Linting Errors
- [ ] Run linter: `npm run lint`
- [ ] Fix linting issues
- [ ] Run prettier: `npm run format`
- [ ] Try commit again

## 🔄 Git Flow with TDD

### Feature Branch Workflow

#### 1. Start Feature
```bash
# Create branch from main
git checkout main
git pull origin main
git checkout -b feature/add-photo-upload

# Initial commit with test structure
npm run test:watch
# Write first test...
git add .
git commit -m "test: setup test structure for photo upload"
```

#### 2. Develop Feature (Multiple Commits)
```bash
# Test-Implementation cycle
git add tests/
git commit -m "test: add photo validation tests"

git add src/
git commit -m "feat: implement photo validation"

git add tests/
git commit -m "test: add upload progress tests"

git add src/
git commit -m "feat: add upload progress tracking"
```

#### 3. Finish Feature
```bash
# Ensure all tests pass
npm test

# Check coverage
npm run test:coverage

# Final cleanup commit
git add .
git commit -m "test: complete photo upload feature with 90% coverage"

# Push branch
git push origin feature/add-photo-upload
```

## 📊 Coverage Management

### Before Committing
- [ ] Check current coverage: `npm run test:coverage`
- [ ] Coverage >= 80% overall
- [ ] New code coverage >= 90%
- [ ] Critical paths 100% covered

### Coverage Report Review
```bash
# Generate HTML report
npm run test:coverage

# Open report
open coverage/index.html

# Check:
# - Red lines (uncovered)
# - Yellow lines (partially covered)
# - Coverage percentages
```

## 🎯 Pull Request Checklist

### Before Creating PR
- [ ] All tests passing locally
- [ ] Coverage meets requirements
- [ ] Branch up to date with main
- [ ] Commits are logical and clean
- [ ] No WIP or temp commits

### PR Description Template
```markdown
## Description
Brief description of feature

## Tests Added
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]
- [ ] E2E tests for [scenario]

## Coverage
- Before: X%
- After: Y%
- New code coverage: Z%

## Testing Instructions
1. Run `npm test`
2. Run `npm run test:coverage`
3. Verify all tests pass

## Screenshots
[If applicable]
```

## 🔀 Merge Checklist

### Before Merging
- [ ] CI/CD pipeline passing
- [ ] All tests green
- [ ] Coverage maintained/improved
- [ ] Code review approved
- [ ] No merge conflicts

### After Merging
```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Delete local feature branch
git branch -d feature/[name]

# Delete remote feature branch
git push origin --delete feature/[name]
```

## 🚨 Emergency Procedures

### If You Accidentally Committed Without Tests

#### Option 1: Amend Last Commit
```bash
# Add tests to last commit
# Write tests first
git add tests/
git commit --amend --no-edit
```

#### Option 2: Revert and Redo
```bash
# Soft reset to uncommit
git reset --soft HEAD~1

# Now write tests first
# Then commit properly
```

### If Coverage Drops on Main
```bash
# Create hotfix branch
git checkout -b hotfix/improve-coverage

# Add missing tests
# Write tests...

# Commit and push
git add .
git commit -m "test: improve coverage to meet threshold"
git push origin hotfix/improve-coverage

# Create urgent PR
```

## 📋 Daily Git-TDD Routine

### Morning
- [ ] `git pull origin main`
- [ ] `npm test` - ensure clean state
- [ ] `git checkout -b feature/today-work`
- [ ] `npm run test:watch`

### During Development
- [ ] Write test → Commit test
- [ ] Write code → Commit code
- [ ] Refactor → Commit refactor
- [ ] Repeat cycle

### End of Day
- [ ] All tests passing
- [ ] Coverage checked
- [ ] Commits are clean
- [ ] Push feature branch
- [ ] Create PR if ready

## 🎖️ Git Best Practices with TDD

### Do's ✅
- Commit after each test-implementation cycle
- Keep commits small and focused
- Write clear commit messages
- Push regularly to backup work
- Rebase feature branches frequently

### Don'ts ❌
- Don't commit failing tests to main
- Don't skip tests to commit faster
- Don't use --no-verify flag
- Don't merge without tests
- Don't decrease coverage

## 🔧 Useful Git Aliases for TDD

Add to `.gitconfig`:
```bash
[alias]
  # Test and commit
  tc = "!f() { npm test && git commit -m \"$1\"; }; f"
  
  # Test, add all, and commit
  tac = "!f() { npm test && git add . && git commit -m \"$1\"; }; f"
  
  # Coverage check
  cov = "!npm run test:coverage"
  
  # Test and push
  tp = "!npm test && git push"
```

Usage:
```bash
git tc "feat: add validation with tests"
git tac "test: complete feature with full coverage"
git cov
git tp
```

---

**Remember: TDD Guard is your friend - it ensures quality! 🛡️**