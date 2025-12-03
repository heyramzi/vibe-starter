# Common Mistakes to Avoid

**Philosophy**: 断捨離 (Danshari - Marie Kondo) - Fix root causes, not symptoms

This document tracks common mistakes and their root cause solutions to prevent repetition.

---

## Database Schema Issues

### ❌ Mistake: Using TypeScript workarounds for missing database columns

**Symptom**: TypeScript errors when accessing properties that should exist based on service layer code.

**Band-aid Solution**: Using type assertions, `as any`, optional chaining, or `in` operators to work around missing properties.

**Root Cause**: Database schema is missing required columns that the application code expects.

**Correct Solution**:
1. Add the missing columns to the database schema first
2. Then update the application code to use them

**Example**:
```typescript
// ❌ Band-aid approach
if ('data' in record && record.data) {
  // ...
}

// ✅ Root cause fix
// 1. Add columns via Supabase migration
// 2. Update types in src/types/
// 3. TypeScript will now properly type the response
```

---

## Type Safety

### ❌ Mistake: Ignoring TypeScript errors

**Root Cause**: Schema and code are out of sync.

**Correct Solution**: Fix the schema first, then the code will type-check naturally.

---

## Feature Implementation Order

### ✅ Correct Order

1. **Schema** - Add database columns/tables via migrations
2. **Types** - Update TypeScript types in `src/types/`
3. **Server** - Update API routes or server components to fetch/return data
4. **UI** - Add components to render the data

### ❌ Wrong Order

Starting with UI components before schema exists leads to type errors and workarounds.

---

## Component Props & Defaults

### ❌ Mistake: Redundant Fallbacks in JSX

**Symptom**: Adding fallback values in JSX when props already have defaults.

**Over-engineered Solution**:
```tsx
interface Props {
  fontFamily?: string
}

function Card({ fontFamily = 'ui-sans-serif, system-ui' }: Props) {
  // ❌ Redundant fallback
  return <div style={{ fontFamily: fontFamily || 'ui-sans-serif, system-ui' }}>
}
```

**Correct Solution**:
```tsx
interface Props {
  fontFamily?: string
}

function Card({ fontFamily = 'ui-sans-serif, system-ui' }: Props) {
  // ✅ Clean - default is already set
  return <div style={{ fontFamily }}>
}
```

**Rule**: Set defaults in ONE place only - in the prop destructuring.

---

## API Route Patterns

### ❌ Mistake: Inconsistent error handling

**Symptom**: Different API routes handle errors differently, making debugging harder.

**Correct Pattern**:
```typescript
// ✅ Consistent API route structure
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = mySchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.message }, { status: 400 })
    }

    // ... business logic

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
```

---

## Folder Structure

### ❌ Mistake: Creating redundant folders

**Symptom**: Multiple folders for similar purposes (`utils/`, `helpers/`, `services/`, `lib/`).

**Root Cause**: Not checking existing folder structure before creating new files.

**Correct Solution**:
- **Always check existing structure first** - run `ls src/` before creating folders
- Use `src/lib/` as the single location for shared utilities
- Organize by domain: `lib/supabase/`, `lib/schemas/`
- Each domain folder has an `index.ts` barrel export

**Never**:
- Create `src/utils/` - use `src/lib/` instead
- Create `src/services/` - use `src/lib/[domain]/` instead
- Create `src/config/` - put config in relevant `src/lib/[domain]/config.ts`
- Create `src/helpers/` - use `src/lib/` for helpers

---

## Service Organization: Const Wrapper Pattern

### ✅ Pattern: Wrap related functions in a const service object

**Why**:
- Minimizes imports (import one service, access all methods)
- Clear service boundaries and responsibilities
- Self-documenting code structure
- Easier to discover available methods via IDE autocomplete

**Example**:
```typescript
// ❌ Individual function exports - many imports needed
export function validateEmail(email: string) { ... }
export function formatEmail(email: string) { ... }
export function isValidDomain(email: string) { ... }

// ✅ Const service wrapper - single import
export const EmailUtils = {
  validate(email: string) { ... },
  format(email: string) { ... },
  isValidDomain(email: string) { ... },
}

// Usage is cleaner:
import { EmailUtils } from '@/lib/email'
EmailUtils.validate(email)
```

---

## Import Paths

### ❌ Mistake: Using relative imports

**Symptom**: Import paths like `./api`, `../utils`, `../../lib/`.

**Root Cause**: Not using TypeScript path aliases.

**Correct Solution**: Always use `@/` alias for absolute imports.

**Example**:
```typescript
// ❌ Relative imports - fragile, hard to refactor
import { createClient } from '../../supabase/server'

// ✅ Absolute imports with @ alias - consistent, refactor-safe
import { createClient } from '@/lib/supabase/server'
```

**Rule**: Never use `./` or `../` - always use `@/`.

---

## Comment Style

### ❌ Mistake: Verbose multi-line JSDoc comments for simple utilities

**Symptom**: Creating elaborate documentation blocks for obvious code.

**Correct Solution**:
```typescript
// ✅ Simple single-line comment
// Fetch user by ID
export async function getUser(id: string) { ... }
```

**Rules**:
- Use single-line comments (`//`) for most documentation
- Comment the "why", not the "what" - code should be self-documenting
- Skip file-level comments entirely for obvious utility files
- JSDoc only when IDE tooling benefits (exported public APIs)

---

## Module Organization: Separation of Concerns

### ❌ Mistake: Mixing types with implementation in client files

**Symptom**: Type definitions, error classes, and implementation logic all in one file.

**Correct Solution**:
```typescript
// ✅ types.ts - type definitions only
export interface User { ... }
export class ValidationError extends Error { ... }

// ✅ client.ts - implementation only
import { type User, ValidationError } from '@/lib/user/types'
export async function getUser() { ... }

// ✅ index.ts - barrel exports organized by category
export { type User, ValidationError } from '@/lib/user/types'
export { getUser } from '@/lib/user/client'
```

**File Organization Pattern**:
```
src/lib/{domain}/
├── types.ts      # Type definitions, interfaces, error classes
├── client.ts     # Core implementation
└── index.ts      # Barrel exports organized by category
```

---

## Data Migration: Clean Refactors

### ❌ Mistake: Creating backward compatibility layers during refactors

**Symptom**: Keeping old field names as aliases, adding migration shims, or maintaining two versions of data structures.

**Bad Pattern**:
```typescript
// ❌ Keeping legacy aliases "for backward compatibility"
export { NewComponent as OldComponent }  // Legacy alias

// ❌ Maintaining dual field access in types
interface Data {
  newField: string
  oldField?: string  // "Keep for migration"
}
```

**Correct Solution**: Clean migration in one atomic operation:

1. **Database**: Write migration that transforms ALL existing data
2. **Code**: Update all references to use new names
3. **Delete**: Remove all legacy code, aliases, and old field references
4. **Verify**: Run type checking to ensure no orphaned references

**Rules**:
- Never keep "temporary" backward compatibility - it becomes permanent
- Migrate ALL data in the same commit as code changes
- Delete old files entirely (rename, don't copy)
- Run `pnpm exec tsc --noEmit` to verify no orphaned references

---

**Remember**: Do it right the first time. Cutting corners creates technical debt.
