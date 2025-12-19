---
name: ui-audit
description: Use when reviewing, auditing, or refactoring existing UI code. Identifies design system violations, missing states, inconsistent patterns, and legacy UI debt.
---

# UI Audit

**Philosophy**: 整頓 (Seiton) - Put things in order. Audit to reveal, refactor to align, delete to simplify.

---

## When to Use

**Trigger conditions:**
- "Audit the UI for [page/feature]"
- "Review this page against design system"
- "Fix the UI inconsistencies in..."
- Before major releases or after feature completion
- Part of `/cleanup` orchestrator workflow

**Not for:**
- Designing new pages (use `ux-design` skill)
- Adding new features
- Fixing business logic bugs

---

## Execution Flow

```
1. SCAN      → Read target files, list all violations
2. CATEGORIZE → Group by severity: Critical | Major | Minor
3. PRIORITIZE → Order by impact and effort
4. FIX       → Atomic changes, type check each
5. VERIFY    → Visual check, ensure no regressions
```

---

## Violation Checklist

### Layout Violations

- [ ] **Wrong page structure** - Not using standard route patterns
- [ ] **Missing breadcrumbs** - No navigation context for nested pages
- [ ] **Incorrect content wrapper** - Not using consistent `p-4` or `p-6` padding
- [ ] **Hardcoded widths** - Using pixel widths instead of responsive classes
- [ ] **Missing responsive breakpoints** - No `lg:`, `md:` considerations

### State Violations

- [ ] **No empty state** - Blank screen when no data
- [ ] **No loading state** - No skeletons or loading indicators
- [ ] **No error state** - Errors not handled gracefully
- [ ] **Spinner instead of skeleton** - Tables/lists using spinners
- [ ] **Layout shift on load** - Content jumping when data arrives

### Component Violations

- [ ] **Raw HTML instead of primitives** - Using `<button>` instead of `Button`
- [ ] **Duplicate component patterns** - Recreating existing components
- [ ] **Wrong component choice** - Using Dialog when Sheet is appropriate
- [ ] **Missing loading button** - Async actions without loading state
- [ ] **Incorrect icon size** - Not using `size-4` for inline, `size-12` for empty states

### Typography Violations

- [ ] **Wrong heading hierarchy** - Skipping levels or inconsistent sizes
- [ ] **Missing font-medium** - Body text too thin (using default weight)
- [ ] **Wrong title classes** - Not using `text-3xl font-bold tracking-tight` for page titles
- [ ] **Hardcoded font sizes** - Using arbitrary values instead of scale

### Color Violations

- [ ] **Hardcoded hex/rgb** - Not using CSS variables
- [ ] **Wrong semantic color** - Using brand color for errors
- [ ] **Missing dark mode support** - Colors that break in dark mode
- [ ] **Inconsistent muted text** - Not using `text-muted-foreground`

### Spacing Violations

- [ ] **Arbitrary spacing** - Using values outside Tailwind scale
- [ ] **Inconsistent gaps** - Mixing spacing tokens without reason
- [ ] **Wrong section spacing** - Not using `gap-6` between major sections
- [ ] **Missing padding** - Cards or containers without proper `p-4` or `p-6`

---

## Framework-Specific Violations

### SvelteKit

- [ ] **Svelte 4 patterns** - Using `$:` or `export let` instead of runes
- [ ] **Non-reactive derived state** - Manual state sync instead of `$derived`
- [ ] **Missing type safety** - Props without `interface Props`
- [ ] **Wrong event syntax** - Using `on:click` instead of `onclick`

```svelte
<!-- VIOLATION -->
<script>
  export let items = []
  $: total = items.length
</script>
<button on:click={handle}>

<!-- CORRECT -->
<script lang="ts">
  interface Props { items?: Item[] }
  let { items = [] }: Props = $props()
  const total = $derived(items.length)
</script>
<button onclick={handle}>
```

### Next.js

- [ ] **Missing 'use client'** - Client hooks in server component
- [ ] **Unnecessary 'use client'** - Server-compatible code marked client
- [ ] **Wrong import paths** - Not using `@/` alias
- [ ] **Legacy patterns** - Using pages/ patterns in app/

```tsx
// VIOLATION
import { useState } from 'react'  // Missing 'use client'
import Component from '../../components/x'  // Relative import

// CORRECT
'use client'
import { useState } from 'react'
import { Component } from '@/components/x'
```

---

## Common Fixes

### Fix: Add Empty State

```tsx
// BEFORE
{data.items.length > 0 && <ItemList items={data.items} />}

// AFTER
{data.items.length > 0 ? (
  <ItemList items={data.items} />
) : (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileText className="size-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold">No items yet</h3>
    <p className="text-sm text-muted-foreground mb-4">Create your first item.</p>
    <Button variant="outline">Create Item</Button>
  </div>
)}
```

### Fix: Replace Spinner with Skeleton

```tsx
// BEFORE
{isLoading && <Loader2 className="animate-spin" />}

// AFTER
{isLoading && (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)}
```

### Fix: Hardcoded Colors

```tsx
// BEFORE
<div style={{ color: '#6366f1' }}>
<div className="text-[#6366f1]">

// AFTER
<div className="text-primary">
```

### Fix: Raw HTML Elements

```tsx
// BEFORE
<button onClick={handleClick} className="...">
<input type="text" className="..." />

// AFTER
<Button onClick={handleClick}>
<Input />
```

---

## Anti-Patterns to Flag

| Pattern | Problem | Fix |
|---------|---------|-----|
| `class="text-[14px]"` | Arbitrary value | Use `text-sm` |
| `style={{ color: '...' }}` | Inline style | Use Tailwind class |
| `<button>` raw | Missing primitives | Use `<Button>` |
| `<Spinner />` for lists | Wrong loading pattern | Use `<Skeleton>` |
| `text-gray-500` | Hardcoded gray | Use `text-muted-foreground` |
| `bg-white dark:bg-gray-900` | Manual dark mode | Use `bg-background` |
| `gap-[20px]` | Arbitrary spacing | Use `gap-5` |

---

## Verification Steps

After completing fixes:

```bash
# Type check (Next.js)
pnpm exec tsc --noEmit

# Type check (SvelteKit)
pnpm check

# Visual check
# - Light mode appearance
# - Dark mode appearance
# - Responsive at mobile/tablet/desktop

# State check
# - Empty state renders correctly
# - Loading state shows skeletons
# - Error state is graceful
```

---

**Remember**: Audit is not about perfection. It's about consistency.

一貫性は完璧より重要 - "Consistency is more important than perfection"
