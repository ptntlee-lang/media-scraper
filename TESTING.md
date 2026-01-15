# Testing Guide

This project includes comprehensive testing setup for both frontend and backend with Jest.

## Backend Testing (NestJS)

### Test Types

- **Unit Tests** (`.spec.ts`): Test individual components in isolation
- **Integration Tests** (`.integration-spec.ts`): Test component interactions
- **E2E Tests** (`.e2e-spec.ts`): Test complete API workflows

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests only
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Debug tests
npm run test:debug
```

### Test Structure

```
backend/
├── src/
│   └── modules/
│       └── media/
│           ├── media.service.spec.ts              # Unit tests
│           ├── media.service.integration-spec.ts  # Integration tests
│           └── media-scraper.service.spec.ts      # Unit tests
└── test/
    ├── app.e2e-spec.ts                            # E2E tests
    └── jest-e2e.json                              # E2E Jest config
```

### Writing Tests

#### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaService /* mock dependencies */],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

#### E2E Test Example

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Media API (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/media (GET)', () => {
    return request(app.getHttpServer()).get('/media').expect(200);
  });
});
```

## Frontend Testing (Next.js + React)

### Test Types

- **Unit Tests** (`.test.tsx`): Test individual React components
- **Integration Tests** (`.integration.test.tsx`): Test hooks and API interactions
- **E2E Tests** (`.e2e.test.tsx`): Test complete page workflows

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests only
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Pagination.test.tsx                    # Unit tests
│   │   └── UrlForm.test.tsx                       # Unit tests
│   ├── hooks/
│   │   └── useMedia.integration.test.tsx          # Integration tests
│   └── __tests__/
│       └── page.e2e.test.tsx                      # E2E tests
├── jest.config.js                                  # Jest configuration
└── jest.setup.js                                   # Jest setup
```

### Writing Tests

#### Component Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Hook Integration Test Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMedia } from './useMedia';

describe('useMedia', () => {
  it('fetches media', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useMedia({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

## Testing Best Practices

### General

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Keep Tests Isolated**: Each test should be independent
3. **Use Descriptive Names**: Test names should clearly describe what they test
4. **Follow AAA Pattern**: Arrange, Act, Assert

### Backend

1. **Mock External Dependencies**: Use Jest mocks for external services
2. **Test Error Cases**: Always test error handling paths
3. **Use Test Databases**: Never use production databases for testing
4. **Clean Up**: Use `afterEach` and `afterAll` to clean up resources

### Frontend

1. **Query by Accessibility**: Use `getByRole`, `getByLabelText` over `getByTestId`
2. **Wait for Async Operations**: Use `waitFor` for async updates
3. **Mock API Calls**: Use Jest mocks for API functions
4. **Test User Interactions**: Use `@testing-library/user-event` for realistic interactions

## Coverage Goals

- **Unit Tests**: Aim for 80%+ coverage
- **Integration Tests**: Cover critical workflows
- **E2E Tests**: Cover main user journeys

## Continuous Integration

Tests run automatically on:

- Pull requests
- Commits to main branch

CI will fail if:

- Any test fails
- Coverage drops below threshold

## Troubleshooting

### Common Issues

**Backend**

- **"Cannot find module"**: Run `npm install` in backend directory
- **Database connection errors**: Ensure test database is running
- **Port already in use**: Stop other instances before running e2e tests

**Frontend**

- **"Not wrapped in QueryClientProvider"**: Ensure test components are wrapped
- **"Module not found '@testing-library/react'"**: Run `npm install` in frontend directory
- **Timeout errors**: Increase Jest timeout in test file with `jest.setTimeout(10000)`

### Debugging Tests

**Backend**

```bash
npm run test:debug
# Open chrome://inspect in Chrome
# Click "inspect" on the Node process
```

**Frontend**

```bash
npm test -- --watch
# Press 'o' to only run tests related to changed files
# Press 't' to filter by test name pattern
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)
