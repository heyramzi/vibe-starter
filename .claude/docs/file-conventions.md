# File Conventions

## Types Organization

| Category | Location | When to Use |
|----------|----------|-------------|
| Domain types | `src/types/` | Shared across 2+ lib folders |
| Library-internal | `src/lib/{lib}/types.ts` | Within one lib module |
| Single-file | Inline | Props, local state |

## Import Rules

```typescript
// ✅ Always use @ alias
import { createClient } from '@/lib/supabase/server'

// ❌ Never use relative paths
import { createClient } from '../../supabase/server'
```

## Folder Rules

**Never create**:
- `src/utils/` → use `src/lib/`
- `src/services/` → use `src/lib/[domain]/`
- `src/config/` → use `src/lib/[domain]/config.ts`
- `src/helpers/` → use `src/lib/`

## Styling

- TailwindCSS utilities only
- CSS variables in globals.css
- Mobile-first responsive
- Dark mode via `dark:` classes

## Comment Style

```typescript
// ✅ Simple single-line comment
// Fetch user by ID
export async function getUser(id: string) { ... }

// ❌ Verbose JSDoc for obvious code
```

Comment the "why", not the "what".
