---
name: code-commenting
description: Use when writing or reviewing code files. Ensures consistent section comments and organization across SvelteKit and React/Next.js projects.
---

# Code Commenting Standards

**Philosophy**: 整理 (Seiri) - Organization. Clear sections make code scannable and maintainable.

---

## When to Use

**Apply section comments when:**
- File has 3+ logical sections
- File exceeds 50 lines
- Multiple developers will read the code
- Writing new components or services

**Skip section comments for:**
- Small utility files (< 30 lines)
- Single-function files
- Type-only files (just interfaces/types)
- Config files

---

## Framework Detection

| Extension | Framework | Separator Length |
|-----------|-----------|------------------|
| `.svelte` | SvelteKit | 25 `=` characters |
| `.tsx`, `.jsx` | React/Next.js | 77 `=` characters |
| `.ts`, `.js` | TypeScript/JS | 77 `=` characters |

---

## SvelteKit Pattern (.svelte)

### Section Order

```svelte
<script lang="ts">
// =========================
// IMPORTS
// =========================

// External libraries
import { onMount } from 'svelte'

// Components
import { Button } from '$lib/components/ui/button'

// Services
import { UserService } from '$lib/services/user'

// Types
import type { User } from '$lib/types'

// =========================
// PROPS
// =========================

interface Props {
  user: User
  onSave?: (user: User) => void
}

let { user, onSave = () => {} }: Props = $props()

// =========================
// STATE
// =========================

let isLoading = $state(false)
let error = $state<string | null>(null)

// =========================
// DERIVED VALUES
// =========================

const isValid = $derived(user.name.length > 0)
const displayName = $derived(user.name || 'Anonymous')

// =========================
// CONSTANTS
// =========================

const MAX_NAME_LENGTH = 100

// =========================
// FUNCTIONS
// =========================

async function handleSave() {
  isLoading = true
  try {
    await UserService.save(user)
    onSave(user)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to save'
  } finally {
    isLoading = false
  }
}

// =========================
// EFFECTS
// =========================

$effect(() => {
  console.log('User changed:', user.id)
})
</script>

<!-- =========================== -->
<!-- HTML CONTENT -->
<!-- =========================== -->

<div class="container">
  <!-- Content here -->
</div>

<!-- =========================== -->
<!-- STYLES -->
<!-- =========================== -->

<style>
.container {
  @apply p-4;
}
</style>
```

### Section Rules

| Section | Required | Notes |
|---------|----------|-------|
| IMPORTS | Yes | Always first, with sub-categories |
| PROPS | If component has props | Interface + destructuring |
| STATE | If using `$state` | Group related state together |
| DERIVED VALUES | If using `$derived` | After STATE |
| CONSTANTS | If needed | Static values only |
| FUNCTIONS | If any functions | Event handlers, helpers |
| EFFECTS | If using `$effect` | Always last in script |
| HTML CONTENT | Yes | Template section |
| STYLES | If scoped styles | Style section |

### Import Sub-categories Order

1. **External libraries** - Third-party packages (svelte, lucide, etc.)
2. **Components** - UI components from $lib/components
3. **Services** - Business logic from $lib/services
4. **Types** - Type imports (use `import type`)

---

## React/Next.js Pattern (.tsx/.jsx)

### Section Order

```tsx
'use client'

// =============================================================================
// IMPORTS
// =============================================================================

// External libraries
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Components
import { Button } from '@/components/ui/button'
import { UserCard } from '@/components/user/user-card'

// Services
import { UserService } from '@/lib/services/user'

// Types
import type { User } from '@/types/user'

// =============================================================================
// TYPES
// =============================================================================

interface UserProfileProps {
  userId: string
  onUpdate?: (user: User) => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_NAME_LENGTH = 100
const DEBOUNCE_MS = 300

// =============================================================================
// HELPERS
// =============================================================================

function formatUserName(user: User): string {
  return user.name || 'Anonymous'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    UserService.get(userId).then(setUser).finally(() => setIsLoading(false))
  }, [userId])

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <div className="container">
      <UserCard user={user} />
      <Button onClick={() => onUpdate?.(user)}>Update</Button>
    </div>
  )
}
```

### Section Rules

| Section | Required | Notes |
|---------|----------|-------|
| IMPORTS | Yes | Always first, with sub-categories |
| TYPES | If local types/interfaces | Props interfaces, local types |
| CONSTANTS | If needed | Static values, config |
| HELPERS | If pure functions | Functions used by component |
| COMPONENT | Yes | Main export, always last |

### Import Sub-categories Order

1. **External libraries** - React, Next.js, third-party
2. **Components** - UI components from @/components
3. **Hooks** - Custom hooks from @/hooks
4. **Services** - Business logic from @/lib
5. **Utils** - Utilities from @/lib/utils
6. **Types** - Type imports (use `import type`)

---

## TypeScript Files (.ts)

### Service/Utility Pattern

```typescript
// =============================================================================
// IMPORTS
// =============================================================================

import { createClient } from '@/lib/supabase/server'
import type { User, UserUpdate } from '@/types/user'

// =============================================================================
// TYPES
// =============================================================================

interface ServiceOptions {
  cache?: boolean
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_OPTIONS: ServiceOptions = {
  cache: true,
}

// =============================================================================
// SERVICE
// =============================================================================

export const UserService = {
  async get(id: string): Promise<User | null> {
    const supabase = await createClient()
    const { data } = await supabase.from('users').select('*').eq('id', id).single()
    return data
  },

  async update(id: string, data: UserUpdate): Promise<User> {
    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return user
  },
}
```

---

## Inline Comments: Why, Not What

**Golden Rule**: Comments explain the WHY, not the WHAT or HOW.

The code already shows WHAT it does. Comments should explain:
- **Business context** - Why this decision matters
- **Non-obvious constraints** - Why it's done this way
- **Trade-offs** - What was considered and rejected

### Good vs Bad Comments

```typescript
// ❌ BAD: Describes WHAT (the code already shows this)
// Loop through users and filter active ones
const activeUsers = users.filter(u => u.isActive)

// ❌ BAD: Describes HOW (obvious from code)
// Use reduce to sum the values
const total = items.reduce((sum, i) => sum + i.price, 0)

// ✅ GOOD: Explains WHY (business context)
// Free trial users see limited data - sales requirement for conversion
const visibleProjects = user.isPaid ? allProjects : allProjects.slice(0, 3)

// ✅ GOOD: Explains constraint (non-obvious reason)
// ClickUp API rate limits require 100ms delay between requests
await sleep(100)

// ✅ GOOD: Documents trade-off (decision context)
// Using client-side filtering - dataset small enough, avoids extra API call
const filtered = data.filter(item => item.status === 'active')
```

### Comment Rules

1. **One line only** - If you need more, the code needs refactoring
2. **Business value** - Why does this matter to users/business?
3. **No obvious comments** - Don't describe what code clearly shows
4. **Update or delete** - Outdated comments are worse than none

### When to Comment

| Situation | Comment? | Example |
|-----------|----------|---------|
| Complex regex | Yes | `// Matches ISO dates with optional timezone` |
| Business rule | Yes | `// Discount only applies to first purchase` |
| API quirk | Yes | `// Stripe requires amount in cents` |
| Simple CRUD | No | Code is self-explanatory |
| Standard patterns | No | Everyone knows what `useState` does |
| Magic numbers | Yes, or use const | `// 86400000ms = 24 hours` |

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Inconsistent separators | Hard to scan | Use exact character counts |
| Missing import sub-categories | Imports become messy | Group with comments |
| Sections out of order | Confusing structure | Follow section order |
| Over-commenting small files | Clutter | Skip for < 30 lines |
| Comments without separators | Inconsistent | Always use full separator |
| Describing WHAT not WHY | Useless noise | Focus on business context |
| Multi-line inline comments | Code smell | Refactor or simplify |

---

## Quick Reference

### Svelte Separator (25 chars)
```
// =========================
// SECTION NAME
// =========================
```

### Svelte HTML Comment (27 chars)
```
<!-- =========================== -->
<!-- SECTION NAME -->
<!-- =========================== -->
```

### React/TS Separator (77 chars)
```
// =============================================================================
// SECTION NAME
// =============================================================================
```

---

## Verification Checklist

When reviewing code, check:

- [ ] Correct separator length for framework
- [ ] Sections in correct order
- [ ] Imports grouped with sub-categories
- [ ] No sections for files < 30 lines
- [ ] All functions under FUNCTIONS section
- [ ] Effects/useEffect last in script (Svelte) or inside component (React)

---

**Remember**: Comments are for humans. Make code scannable, not cluttered.

読みやすさは正義 - "Readability is justice"
