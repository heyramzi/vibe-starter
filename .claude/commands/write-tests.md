# Write Tests: $ARGUMENTS

Execute the unit-testing skill to write comprehensive tests for a target.

## Usage

`/write-tests {target}`

## Target Types

- File path: `src/lib/utils/format.ts`
- Component: `src/components/counter.svelte` or `src/components/counter.tsx`
- Service: `src/lib/server/api.ts`
- API route: `src/routes/api/items/+server.ts` or `src/app/api/items/route.ts`

## Examples

```bash
# Test a utility file
/write-tests src/lib/utils/format.ts

# Test a Svelte component
/write-tests src/lib/components/counter.svelte

# Test a React component
/write-tests src/components/counter.tsx

# Test a server service
/write-tests src/lib/server/clickup/api.ts

# Test a SvelteKit API route
/write-tests src/routes/api/items/+server.ts

# Test a Next.js API route
/write-tests src/app/api/items/route.ts
```

---

## Workflow

### 1. Analyze Target

Read the target file completely to understand:
- What functions/components it exports
- What behavior needs testing
- What dependencies it has

### 2. Identify Test Cases

List testable behaviors:
- Happy path (normal operation)
- Edge cases (empty input, boundary values)
- Error cases (invalid input, failures)

### 3. Create Test File

Create co-located test file: `{filename}.test.ts`

### 4. Write Tests

Follow the `unit-testing` skill patterns:
- Test behavior, not implementation
- Mock only at boundaries
- Cover error cases

### 5. Verify

```bash
# Run tests
pnpm test:run

# Run specific test file
pnpm test {filename}
```

---

## Test Patterns Quick Reference

### Utility Functions

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './my-function'

describe('myFunction', () => {
  it('handles normal input', () => {
    expect(myFunction('input')).toBe('expected')
  })

  it('handles edge case', () => {
    expect(myFunction('')).toBe('default')
  })

  it('throws on invalid input', () => {
    expect(() => myFunction(null)).toThrow()
  })
})
```

### Components (Svelte)

```typescript
import { render, screen, fireEvent } from '@testing-library/svelte'
import Component from './component.svelte'

it('renders correctly', () => {
  render(Component, { props: { value: 'test' } })
  expect(screen.getByText('test')).toBeInTheDocument()
})
```

### Components (React)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Component } from './component'

it('renders correctly', () => {
  render(<Component value="test" />)
  expect(screen.getByText('test')).toBeInTheDocument()
})
```

---

## Invokes Skill

This command follows the methodology in `.claude/skills/unit-testing.md`.

Read the skill for:
- Framework-specific mocking patterns
- Supabase mocking helpers
- Common mistakes to avoid

---

## Coverage Goals

| Type | Target |
|------|--------|
| Utilities and business logic | 80%+ |
| API integration code | 60%+ |
| UI components | 40%+ |

Focus on critical paths: auth, payments, data security.
