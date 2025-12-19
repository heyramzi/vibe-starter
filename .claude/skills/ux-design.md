---
name: ux-design
description: Use when designing new pages, features, or user flows. Analyzes existing patterns in the codebase before proposing layouts, ensuring consistent user experience and proper state handling.
---

# UX Design

**Philosophy**: 調和 (Chōwa) - Harmony. Every new page should feel like it belongs, following established rhythms while serving its unique purpose.

---

## When to Use

**Trigger conditions:**
- "Design a new page for..."
- "Create the UI for..."
- "How should [feature] flow work?"
- "Build the [feature] page"
- Starting any new route or feature

**Not for:**
- Fixing existing UI issues (use `ui-audit` skill)
- Styling tweaks or CSS changes
- Bug fixes in existing pages

---

## Execution Flow

```
1. RESEARCH   → Analyze similar pages/components, understand context
2. DEFINE     → Identify pattern type, user journey, required states
3. DESIGN     → Propose layout structure and component choices
4. VALIDATE   → Check against design system, get user confirmation
5. IMPLEMENT  → Build using shadcn primitives, follow conventions
6. VERIFY     → Ensure all states handled, type check passes
```

---

## Layout Patterns

### Pattern A: List → Detail

```
List Page:
├── Header (title + "Create" action)
└── Content (p-4, gap-4)
    └── Data Table OR Empty State

Detail Page:
├── Header (title + back link + actions)
└── Content (p-4, gap-4)
    └── Card sections with data
```

### Pattern B: Tool Input/Output

```
├── Header (title)
└── Content (p-4)
    ├── Title block (mb-4)
    └── Grid (gap-6, lg:grid-cols-2)
        ├── Left: Input form (space-y-6)
        └── Right: Results (space-y-6)
```

### Pattern C: Multi-step Wizard

```
├── Header (with step indicator)
└── Content (p-4, max-w-2xl, mx-auto)
    └── Step content with prev/next actions
```

### Pattern D: Browse + Action

```
├── Header
└── Content (flex, h-full)
    ├── Main browse area (flex-1)
    └── Sidebar/Sheet for actions
```

---

## State Handling

### Required States

Every page must handle:

| State | Implementation |
|-------|----------------|
| Loading | Skeleton components, never blank screen |
| Empty | Empty state with icon, message, action |
| Error | Alert or error card with retry option |
| Success | Data displayed with proper hierarchy |

### User Flow Checkpoints

```
Entry Point:
├── How does user arrive here?
├── What context do they carry?
└── Is there a loading state on entry?

Core Action:
├── What's the primary task?
├── What feedback during action?
└── What happens on success/failure?

Exit Points:
├── Where does user go after success?
├── Can they cancel/go back?
└── Is state preserved if they leave?
```

---

## Framework-Specific Patterns

### SvelteKit Route Structure

```
src/routes/(app)/portals/
├── +page.svelte          # List view
├── +page.server.ts       # Data loading
├── [id]/
│   ├── +page.svelte      # Detail view
│   └── +page.server.ts
└── new/
    ├── +page.svelte      # Create form
    └── +page.server.ts
```

**Load Function Pattern:**
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, user } = locals
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { items: data }
}
```

**Page Component:**
```svelte
<script lang="ts">
  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()
</script>
```

### Next.js Route Structure

```
src/app/(app)/portals/
├── page.tsx              # List view
├── loading.tsx           # Loading UI
├── [id]/
│   └── page.tsx          # Detail view
└── new/
    └── page.tsx          # Create form
```

**Server Component Pattern:**
```tsx
// page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'

export default async function PortalsPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  return <ItemList items={items ?? []} />
}
```

**Client Component:**
```tsx
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState(false)
  // ...
}
```

---

## Component Selection

### Hierarchy of Choices

```
1. Reuse existing component  → Check src/lib/components/ or src/components/
2. Use shadcn primitive      → Button, Card, Table, Dialog, etc.
3. Compose primitives        → Combine existing for specific need
4. Create new component      → Only when pattern repeats 2+ times
```

### When to Create New Component

| Signal | Action |
|--------|--------|
| Same 3+ components grouped repeatedly | Extract to component |
| Complex state logic reused | Extract with hooks/runes |
| Feature-specific but reusable | Place in `components/{domain}/` |
| Truly generic | Place in `components/ui/` |

---

## Typography & Spacing

### Typography Scale

| Use Case | Classes |
|----------|---------|
| Page title | `text-3xl font-bold tracking-tight` |
| Section title | `text-2xl font-semibold` |
| Card title | `text-lg font-semibold` |
| Body | `text-sm font-medium` |
| Caption | `text-xs text-muted-foreground` |

### Standard Spacing

| Token | Value | Use Case |
|-------|-------|----------|
| `gap-1` | 4px | Icon + text |
| `gap-2` | 8px | Related items |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Major sections |
| `p-4` | 16px | Page/card padding |

---

## Verification Checklist

### Layout
- [ ] Follows one of the pattern types
- [ ] Consistent padding
- [ ] Responsive breakpoints considered

### States
- [ ] Empty state with icon, message, action
- [ ] Loading state (skeletons, not spinners)
- [ ] Error state with retry option

### Components
- [ ] Checked existing components first
- [ ] Uses shadcn primitives as foundation

### Final
- [ ] Type check passes
- [ ] No unused imports or code

---

**Remember**: Design the empty state first. If you don't know what "nothing" looks like, you don't understand the feature.

空から始める - "Start from emptiness"
