# Testing Strategy - Apptivity

## Overview
Comprehensive testing strategy covering unit tests, integration tests, end-to-end (E2E) tests, and accessibility testing to ensure code quality and user experience.

## Required Test Types

### Unit Tests
**Purpose**: Test individual components and functions in isolation.

**Coverage Areas**:
- React components with various props and states
- Utility functions and helper methods
- Custom hooks and context providers
- Data validation and transformation functions
- API route handlers (business logic)

**Tools & Framework**:
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/jest-dom**: Custom matchers

**Example Test Structure**:
```typescript
// components/bookmarks/BookmarkCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BookmarkCard } from './BookmarkCard';

describe('BookmarkCard', () => {
  const mockBookmark = {
    id: '1',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'Test description',
    priority: 'high' as const,
    visitCount: 5,
    isFavorite: false
  };

  it('renders bookmark information correctly', () => {
    render(<BookmarkCard bookmark={mockBookmark} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('handles favorite toggle', () => {
    const onToggleFavorite = jest.fn();
    render(
      <BookmarkCard 
        bookmark={mockBookmark} 
        onToggleFavorite={onToggleFavorite} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith('1');
  });
});
```

### Integration Tests
**Purpose**: Test interactions between components and external services.

**Coverage Areas**:
- Database operations with Supabase
- Authentication flows with Clerk
- API endpoints with request/response cycles
- Component integration with real data
- State management across component trees

**Example Integration Test**:
```typescript
// tests/integration/bookmark-management.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { TestProviders } from '../utils/test-providers';
import { BookmarkManager } from '@/components/bookmarks/BookmarkManager';

describe('Bookmark Management Integration', () => {
  it('creates and displays new bookmark', async () => {
    render(
      <TestProviders>
        <BookmarkManager />
      </TestProviders>
    );

    // Add bookmark through UI
    fireEvent.click(screen.getByText('Add Bookmark'));
    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://example.com' }
    });
    fireEvent.click(screen.getByText('Save'));

    // Verify bookmark appears in list
    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });
  });
});
```

### End-to-End (E2E) Tests
**Purpose**: Test complete user workflows from browser perspective.

**Coverage Areas**:
- User authentication flow
- Bookmark creation and management
- Search and filtering functionality
- Category and tag management
- Dashboard navigation and interactions
- Responsive design across devices

**Tools & Framework**:
- **Playwright**: Cross-browser E2E testing
- **Custom fixtures**: Reusable test setup
- **Page Object Model**: Maintainable test structure

**Example E2E Test**:
```typescript
// tests/e2e/bookmark-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bookmark Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    // Assume user is logged in via test setup
  });

  test('complete bookmark lifecycle', async ({ page }) => {
    // Create bookmark
    await page.click('[data-testid="add-bookmark-btn"]');
    await page.fill('[data-testid="url-input"]', 'https://example.com');
    await page.fill('[data-testid="title-input"]', 'Example Site');
    await page.click('[data-testid="save-bookmark-btn"]');

    // Verify bookmark appears
    await expect(page.locator('[data-testid="bookmark-card"]')).toContainText('Example Site');

    // Edit bookmark
    await page.click('[data-testid="edit-bookmark-btn"]');
    await page.fill('[data-testid="title-input"]', 'Updated Example Site');
    await page.click('[data-testid="save-bookmark-btn"]');

    // Verify update
    await expect(page.locator('[data-testid="bookmark-card"]')).toContainText('Updated Example Site');

    // Delete bookmark
    await page.click('[data-testid="delete-bookmark-btn"]');
    await page.click('[data-testid="confirm-delete-btn"]');

    // Verify deletion
    await expect(page.locator('[data-testid="bookmark-card"]')).not.toBeVisible();
  });
});
```

### Accessibility Tests
**Purpose**: Ensure application is accessible to users with disabilities.

**Coverage Areas**:
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance
- Focus management

**Tools & Framework**:
- **@axe-core/playwright**: Automated accessibility testing
- **Jest-axe**: Unit-level accessibility testing
- **Manual testing**: Keyboard and screen reader testing

**Example Accessibility Test**:
```typescript
// tests/accessibility/bookmark-card.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';

expect.extend(toHaveNoViolations);

describe('BookmarkCard Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<BookmarkCard bookmark={mockBookmark} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<BookmarkCard bookmark={mockBookmark} />);
    
    const card = screen.getByRole('article');
    card.focus();
    expect(card).toHaveFocus();
    
    // Test tab navigation through interactive elements
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(screen.getByRole('button', { name: /favorite/i })).toHaveFocus();
  });
});
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Documentation Standards

### Test Naming Conventions
- **Describe blocks**: Feature or component name
- **Test cases**: Behavior being tested in plain English
- **File names**: `[ComponentName].test.tsx` or `[feature-name].spec.ts`

### Test Organization
```
tests/
├── setup.ts                 # Global test setup
├── utils/                   # Test utilities and helpers
│   ├── test-providers.tsx   # Wrapper components for tests
│   ├── mock-data.ts         # Shared mock data
│   └── test-helpers.ts      # Helper functions
├── unit/                    # Unit tests
│   ├── components/          # Component tests
│   ├── hooks/               # Custom hook tests
│   └── lib/                 # Utility function tests
├── integration/             # Integration tests
│   ├── api/                 # API integration tests
│   └── features/            # Feature integration tests
├── e2e/                     # End-to-end tests
│   ├── auth.spec.ts         # Authentication flows
│   ├── bookmarks.spec.ts    # Bookmark management
│   └── dashboard.spec.ts    # Dashboard functionality
└── accessibility/           # Accessibility tests
    ├── components/          # Component accessibility
    └── pages/               # Page-level accessibility
```

## CI Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Mocking Strategy

### API Mocking
```typescript
// tests/utils/msw-handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/bookmarks', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          title: 'Test Bookmark',
          url: 'https://example.com',
          description: 'Test description',
        },
      ])
    );
  }),
  
  rest.post('/api/bookmarks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: '2', ...req.body })
    );
  }),
];
```

### Database Mocking
```typescript
// tests/utils/mock-supabase.ts
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      data: mockBookmarks,
      error: null,
    })),
    insert: jest.fn(() => ({
      data: { id: 'new-id' },
      error: null,
    })),
    update: jest.fn(() => ({
      data: { id: 'updated-id' },
      error: null,
    })),
  })),
};
```

## Quality Gates

### Coverage Requirements
- **Minimum Coverage**: 80% for all metrics
- **Critical Components**: 90% coverage required
- **New Features**: Must include comprehensive tests
- **Bug Fixes**: Must include regression tests

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run type-check",
      "pre-push": "npm run test && npm run test:e2e"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
``` 