# Code Patterns

## Const Service Pattern (核心パターン)

Organize related functions into const service objects for discoverability and minimal imports.

```typescript
// ❌ Bad: Individual exports
export function getUser() { ... }
export function updateUser() { ... }

// ✅ Good: Const service wrapper
export const UserService = {
  get(id: string) { ... },
  update(id: string, data: UserUpdate) { ... },
  delete(id: string) { ... },
}

// Usage
import { UserService } from '@/lib/user'
UserService.get(id)
```

**Benefits**: Single import, IDE autocomplete, clear boundaries

---

## File Structure for Services

```
src/lib/{domain}/
├── {domain}-service.ts    # Main service const
├── types.ts               # Type definitions (if needed)
└── index.ts               # Barrel export
```

---

## Data Flow

1. **Server-Side Rendering**
   - Pages fetch data in Server Components
   - Use Supabase server client

2. **Client-Side Mutations**
   - Forms submit to API routes
   - API routes validate with Zod, return JSON

3. **Auth Check Pattern**
   ```typescript
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
   ```

---

## Supabase Client Usage

| Context | Import | Note |
|---------|--------|------|
| Server Components/API | `@/lib/supabase/server` | async - use `await createClient()` |
| Client Components | `@/lib/supabase/client` | sync |
