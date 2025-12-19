---
name: unit-testing
description: Use when writing tests for utilities, components, services, or API handlers. Provides patterns for Vitest with framework-specific rendering libraries.
---

# Unit Testing

**Philosophy**: Test behavior, not implementation. Tests should give confidence to refactor.

---

## When to Use

**Trigger conditions:**
- Creating new utility functions
- Building components with logic
- Writing server-side services
- Adding API route handlers
- After fixing a bug (prevent regression)
- User requests tests

**Not for:**
- Simple presentational components (pure UI, no logic)
- Third-party library wrappers with no custom logic
- Type-only files

---

## Test Structure

### File Naming

**Co-located tests:** `{filename}.test.ts`

```
src/lib/utils/
├── format.ts
└── format.test.ts
```

### Basic Pattern (Vitest)

```typescript
import { describe, it, expect } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('formats whole numbers without decimals', () => {
    expect(formatPrice(100)).toBe('$100')
  })

  it('formats decimals to 2 places', () => {
    expect(formatPrice(99.9)).toBe('$99.90')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })

  it('throws for negative values', () => {
    expect(() => formatPrice(-1)).toThrow()
  })
})
```

---

## Framework-Specific Patterns

### SvelteKit (Svelte Testing Library)

**Component Testing:**

```typescript
// src/lib/components/counter.test.ts
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Counter from './counter.svelte'

describe('Counter', () => {
  it('renders initial count', () => {
    render(Counter, { props: { initialCount: 5 } })
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('increments on click', async () => {
    render(Counter, { props: { initialCount: 0 } })

    await fireEvent.click(screen.getByRole('button', { name: /increment/i }))

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

**Mocking SvelteKit:**

```typescript
import { vi } from 'vitest'

// Mock environment variables
vi.mock('$env/static/private', () => ({
  SECRET_KEY: 'test-secret',
}))

vi.mock('$env/static/public', () => ({
  PUBLIC_APP_URL: 'http://localhost:5173',
}))

// Mock navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
}))
```

**Server Route Testing:**

```typescript
// src/routes/api/items/+server.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from './+server'

describe('GET /api/items', () => {
  it('returns items for authenticated user', async () => {
    const mockSupabase = createMockSupabase([{ id: '1', name: 'Item' }])

    const request = new Request('http://localhost/api/items')
    const response = await GET({
      request,
      locals: { supabase: mockSupabase }
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.items).toHaveLength(1)
  })
})
```

### Next.js (React Testing Library)

**Component Testing:**

```typescript
// src/components/counter.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from './counter'

describe('Counter', () => {
  it('renders initial count', () => {
    render(<Counter initialCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('increments on click', async () => {
    render(<Counter initialCount={0} />)

    await fireEvent.click(screen.getByRole('button', { name: /increment/i }))

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

**Mocking Next.js:**

```typescript
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock server actions
vi.mock('@/app/actions', () => ({
  createItem: vi.fn(),
}))
```

**API Route Testing:**

```typescript
// src/app/api/items/route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/items', () => {
  it('returns items', async () => {
    const request = new NextRequest('http://localhost/api/items')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.items).toBeDefined()
  })
})
```

---

## Mocking Supabase

```typescript
import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

function createMockSupabase(data: unknown, error: Error | null = null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
          order: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error }),
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      }),
    },
  } as unknown as SupabaseClient
}
```

---

## Test Execution

```bash
# Run all tests
pnpm test

# Run tests once (CI)
pnpm test:run

# Run specific file
pnpm test src/lib/utils/format.test.ts

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm test:ui
```

---

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Testing implementation | Breaks on refactor | Test inputs/outputs |
| Mocking everything | Tests mock, not code | Mock only boundaries |
| No error cases | False confidence | Test failure paths |
| Async without await | Tests pass incorrectly | Always await async |
| Snapshot overuse | Meaningless diffs | Use for stable UI only |

---

## Workflow

### Before Writing Tests

1. Read the code you're testing
2. Identify the **behavior** to test (not implementation)
3. List edge cases and error conditions

### Writing Tests

1. Start with the happy path
2. Add error/edge cases
3. Verify with `pnpm test:run`

### After Writing Tests

1. Run full test suite
2. Run type check
3. Verify tests fail when implementation breaks

---

## Verification Checklist

- [ ] Tests describe behavior, not implementation
- [ ] Error cases are covered
- [ ] Async operations are properly awaited
- [ ] Mocks are minimal and targeted
- [ ] Test names explain what is being tested
- [ ] Tests run with `pnpm test:run`
- [ ] Co-located with source file

---

**Remember**: A test that never fails is worthless. A test that always fails is worse.

テストは保険、実装は投資 - "Tests are insurance, implementation is investment"
